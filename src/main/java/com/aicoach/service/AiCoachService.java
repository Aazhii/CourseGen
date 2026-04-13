package com.aicoach.service;

import com.aicoach.dto.AiCoachRequest;
import com.aicoach.dto.AiCoachResponse;
import com.aicourse.ai.AiWorkload;
import com.aicourse.ai.service.AiDynamicGateway;
import com.aicourse.model.Course;
import com.aicourse.model.Lesson;
import com.aicourse.repo.CourseRepo;
import com.aicourse.repo.LessonRepo;
import com.auth.enums.UserRole;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.features.Feature;
import com.features.FeatureGuard;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.net.URI;
import java.util.*;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class AiCoachService {

    private static final int LESSON_CONTEXT_LIMIT = 3000;
    private static final int MAX_CITATIONS = 8;
    private static final Pattern NUMBER_PATTERN = Pattern.compile("\\b(\\d{1,2})\\b");
    private static final Set<String> TRUSTED_DOMAINS = Set.of(
            "khanacademy.org",
            "openstax.org",
            "wikipedia.org",
            "wikimedia.org",
            "visualgo.net",
            "cs.usfca.edu",
            "geeksforgeeks.org",
            "leetcode.com",
            "cses.fi",
            "projecteuler.net",
            "hackerrank.com",
            "coursera.org",
            "edx.org",
            "ocw.mit.edu"
    );

    @Autowired
    private AiDynamicGateway aiDynamicGateway;

    @Autowired
    private CourseRepo courseRepo;

    @Autowired
    private LessonRepo lessonRepo;

    @Autowired
    private FeatureGuard featureGuard;

    @Autowired
    private ObjectMapper objectMapper;

    public AiCoachResponse respond(Long userId, UserRole role, AiCoachRequest request) throws Exception {
        if (request == null || request.getCourseId() == null) {
            throw new IllegalArgumentException("courseId is required");
        }
        if (request.getMessage() == null || request.getMessage().isBlank()) {
            throw new IllegalArgumentException("message is required");
        }

        featureGuard.requireAccess(Feature.AI_COACH, role);

        Course course = courseRepo.findById(request.getCourseId())
                .orElseThrow(() -> new IllegalArgumentException("Course not found"));

        if (!course.getCreator().equals(userId)) {
            throw new IllegalArgumentException("You do not have access to this course");
        }

        Lesson lesson = null;
        if (request.getLessonId() != null) {
            lesson = lessonRepo.findById(request.getLessonId())
                    .orElseThrow(() -> new IllegalArgumentException("Lesson not found"));
            if (lesson.getModule() == null || lesson.getModule().getCourse() == null ||
                    !Objects.equals(lesson.getModule().getCourse().getId(), course.getId())) {
                throw new IllegalArgumentException("Lesson does not belong to course");
            }
        }

        String context = lesson == null ? "" : truncate(lesson.getContent() == null ? "" : lesson.getContent().toString());

        String prompt = new AiCoachPromptBuilder()
                .courseTitle(course.getTitle())
                .lessonTitle(lesson == null ? null : lesson.getTitle())
                .lessonContext(context)
                .userMessage(request.getMessage())
                .previousQuizQuestions(request.getPreviousQuizQuestions())
                .chatHistory(request.getChatHistory())
                .build();

        String raw;
        try {
            raw = aiDynamicGateway.getResponse(AiWorkload.AI_COACH, prompt);
        } catch (Exception ex) {
            return fallbackResponse(request.getMessage(), fallbackNoticeFor(ex, true));
        }

        try {
            AiCoachResponse parsed = parseModelResponse(raw, request.getMessage());
            AiCoachResponse counted = enforceRequestedQuizCount(parsed, request.getMessage());
            return deduplicateQuizCards(counted, request.getMessage(), request.getPreviousQuizQuestions());
        } catch (Exception ex) {
            return fallbackResponse(request.getMessage(), fallbackNoticeFor(ex, false));
        }
    }

    public SseEmitter streamRespond(Long userId, UserRole role, AiCoachRequest request) throws Exception {
        if (request == null || request.getCourseId() == null) {
            throw new IllegalArgumentException("courseId is required");
        }
        if (request.getMessage() == null || request.getMessage().isBlank()) {
            throw new IllegalArgumentException("message is required");
        }

        featureGuard.requireAccess(Feature.AI_COACH, role);

        Course course = courseRepo.findById(request.getCourseId())
                .orElseThrow(() -> new IllegalArgumentException("Course not found"));

        if (!course.getCreator().equals(userId)) {
            throw new IllegalArgumentException("You do not have access to this course");
        }

        Lesson lesson = null;
        if (request.getLessonId() != null) {
            lesson = lessonRepo.findById(request.getLessonId())
                    .orElseThrow(() -> new IllegalArgumentException("Lesson not found"));
            if (lesson.getModule() == null || lesson.getModule().getCourse() == null ||
                    !Objects.equals(lesson.getModule().getCourse().getId(), course.getId())) {
                throw new IllegalArgumentException("Lesson does not belong to course");
            }
        }

        String context = lesson == null ? "" : truncate(lesson.getContent() == null ? "" : lesson.getContent().toString());

        String prompt = new AiCoachPromptBuilder()
                .courseTitle(course.getTitle())
                .lessonTitle(lesson == null ? null : lesson.getTitle())
                .lessonContext(context)
                .userMessage(request.getMessage())
                .previousQuizQuestions(request.getPreviousQuizQuestions())
                .chatHistory(request.getChatHistory())
                .build();

        SseEmitter emitter = new SseEmitter(180_000L); // 3-minute timeout
        ExecutorService sseMvcExecutor = Executors.newSingleThreadExecutor();

        sseMvcExecutor.execute(() -> {
            try {
                Iterable<String> stream = aiDynamicGateway.getResponseStream(AiWorkload.AI_COACH, prompt);
                for (String chunk : stream) {
                    if (chunk != null) {
                        emitter.send(SseEmitter.event().data(chunk));
                    }
                }
                emitter.complete();
            } catch (Exception ex) {
                try {
                    // Send fallback JSON on generic failure
                    AiCoachResponse fallback = fallbackResponse(request.getMessage(), fallbackNoticeFor(ex, true));
                    String fbJson = objectMapper.writeValueAsString(fallback);
                    emitter.send(SseEmitter.event().data(fbJson));
                    emitter.complete();
                } catch (Exception internal) {
                    emitter.completeWithError(internal);
                }
            }
        });

        return emitter;
    }

    private AiCoachResponse parseModelResponse(String raw, String userMessage) throws Exception {
        String sanitized = sanitizeJson(raw);
        JsonNode root = objectMapper.readTree(sanitized);

        if (!root.isObject()) {
            return fallbackResponse(userMessage);
        }

        AiCoachResponse response = new AiCoachResponse();
        response.setIntent(root.path("intent").asText("explanation"));

        List<AiCoachResponse.CoachBlock> blocks = new ArrayList<>();
        JsonNode blocksNode = root.path("blocks");
        if (blocksNode.isArray()) {
            for (JsonNode node : blocksNode) {
                if (!node.isObject()) {
                    continue;
                }
                String type = node.path("type").asText();
                JsonNode content = node.path("content");
                if (type == null || type.isBlank() || content.isMissingNode() || content.isNull()) {
                    continue;
                }
                AiCoachResponse.CoachBlock block = new AiCoachResponse.CoachBlock();
                block.setType(type);
                block.setContent(content);
                blocks.add(block);
            }
        }

        if (blocks.isEmpty()) {
            return fallbackResponse(userMessage);
        }

        List<String> suggestions = new ArrayList<>();
        JsonNode suggestionsNode = root.path("suggestions");
        if (suggestionsNode.isArray()) {
            for (JsonNode suggestionNode : suggestionsNode) {
                String suggestion = suggestionNode.asText("").trim();
                if (!suggestion.isEmpty()) {
                    suggestions.add(suggestion);
                }
            }
        }

        if (suggestions.isEmpty()) {
            suggestions = List.of("Give me a quick quiz", "Explain this in simpler words", "Create a 20-minute study plan");
        }

        List<AiCoachResponse.Citation> citations = parseTrustedCitations(root.path("citations"));

        response.setBlocks(blocks);
        response.setSuggestions(suggestions);
        response.setCitations(citations);
        return response;
    }

    private AiCoachResponse fallbackResponse(String message) throws Exception {
        return fallbackResponse(message, null);
    }

    private AiCoachResponse fallbackResponse(String message, String notice) throws Exception {
        String lower = message == null ? "" : message.toLowerCase(Locale.ROOT);
        boolean wantsQuiz = lower.contains("quiz") || lower.contains("question") || lower.contains("test me");
        boolean wantsPlan = lower.contains("plan") || lower.contains("schedule");
        int requestedQuizCount = extractRequestedQuizCount(message);
        int quizCount = Math.max(1, requestedQuizCount);

        AiCoachResponse response = new AiCoachResponse();
        response.setIntent(wantsPlan ? "study_plan" : (wantsQuiz ? "quiz" : "explanation"));

        List<AiCoachResponse.CoachBlock> blocks = new ArrayList<>();

        AiCoachResponse.CoachBlock intro = new AiCoachResponse.CoachBlock();
        intro.setType("text");
        String introBody = "I can help with explanations, quizzes, flashcards, and study plans for this course.";
        if (notice != null && !notice.isBlank()) {
            introBody = introBody + "\n\n" + notice;
        }
        intro.setContent(objectMapper.readTree(objectMapper.writeValueAsString(
                new TextBlockPayload("AI Coach", introBody)
        )));
        blocks.add(intro);

        if (wantsPlan) {
            AiCoachResponse.CoachBlock plan = new AiCoachResponse.CoachBlock();
            plan.setType("study_plan");
            plan.setContent(objectMapper.readTree("{\"goal\":\"Understand this lesson deeply\",\"duration\":\"30 minutes\",\"steps\":[{\"title\":\"Review\",\"task\":\"Read the key points and summarize in your own words\",\"time\":\"10 min\"},{\"title\":\"Practice\",\"task\":\"Answer one quiz and explain each option\",\"time\":\"10 min\"},{\"title\":\"Recall\",\"task\":\"Teach the concept out loud without notes\",\"time\":\"10 min\"}]}"));
            blocks.add(plan);
        }

        if (wantsQuiz || !wantsPlan) {
            boolean harder = asksForHarderDifficulty(message);
            for (int i = 1; i <= quizCount; i++) {
                blocks.add(buildFallbackQuizCard(i, harder));
            }
        }

        response.setBlocks(blocks);
        response.setSuggestions(List.of("Give me 5 harder quiz questions", "Create flashcards from this topic", "Explain this with a real-world analogy"));
        response.setCitations(List.of());
        return response;
    }

    private AiCoachResponse enforceRequestedQuizCount(AiCoachResponse response, String userMessage) throws Exception {
        if (response == null) {
            return fallbackResponse(userMessage);
        }

        // Removed rigid padding logic: It's better UX to show slightly fewer, highly-contextual AI-generated quizzes 
        // than to pad the response with identical, unhelpful fallback templates.
        
        if (response.getIntent() == null || response.getIntent().isBlank()) {
            response.setIntent(isQuizRequest(userMessage) ? "quiz" : "explanation");
        }
        return response;
    }

    private AiCoachResponse deduplicateQuizCards(AiCoachResponse response,
                                                 String userMessage,
                                                 List<String> previousQuizQuestions) throws Exception {
        if (response == null || response.getBlocks() == null || response.getBlocks().isEmpty()) {
            return response;
        }

        Set<String> seen = new HashSet<>();
        if (previousQuizQuestions != null) {
            for (String oldQuestion : previousQuizQuestions) {
                String key = fingerprintQuestion(oldQuestion);
                if (!key.isEmpty()) {
                    seen.add(key);
                }
            }
        }

        List<AiCoachResponse.CoachBlock> retained = new ArrayList<>();
        for (AiCoachResponse.CoachBlock block : response.getBlocks()) {
            if (block == null || block.getType() == null) {
                continue;
            }

            if (!"quiz_card".equals(block.getType())) {
                retained.add(block);
                continue;
            }

            String question = block.getContent() == null ? "" : block.getContent().path("question").asText("");
            String key = fingerprintQuestion(question);
            // If it's a new unique question, keep it! If it's a duplicate of past session, skip it.
            if (key.isEmpty() || seen.add(key)) {
                retained.add(block);
            }
        }

        // Removed padding logic that replaced skipped questions with duplicate fallback templates.
        response.setBlocks(retained);
        return response;
    }

    private AiCoachResponse.CoachBlock buildFallbackQuizCard(int sequence, boolean harder) throws Exception {
        String difficulty = harder ? "hard" : "moderate";
        String question = "Quiz " + sequence + ": Which study strategy best helps long-term understanding in " + difficulty + " topics?";
        String explanation = harder
                ? "For harder topics, combining active recall with spaced repetition and error review improves deep understanding."
                : "Active recall and spaced repetition improve retention and understanding better than passive review.";

        String payload = objectMapper.writeValueAsString(Map.of(
                "question", question,
                "options", List.of(
                        "Read notes repeatedly without practice",
                        "Use active recall with spaced repetition",
                        "Skip practice and watch summaries only",
                        "Memorize definitions without examples"
                ),
                "correctIndex", 1,
                "explanation", explanation
        ));

        AiCoachResponse.CoachBlock quiz = new AiCoachResponse.CoachBlock();
        quiz.setType("quiz_card");
        quiz.setContent(objectMapper.readTree(payload));
        return quiz;
    }

    private boolean isQuizRequest(String message) {
        if (message == null) {
            return false;
        }
        String lower = message.toLowerCase(Locale.ROOT);
        return lower.contains("quiz") || lower.contains("question") || lower.contains("test me");
    }

    private boolean asksForHarderDifficulty(String message) {
        if (message == null) {
            return false;
        }
        String lower = message.toLowerCase(Locale.ROOT);
        return lower.contains("hard") || lower.contains("harder") || lower.contains("advanced");
    }

    private int extractRequestedQuizCount(String message) {
        if (!isQuizRequest(message)) {
            return 0;
        }
        if (message == null || message.isBlank()) {
            return 1;
        }

        Matcher matcher = NUMBER_PATTERN.matcher(message);
        if (matcher.find()) {
            int parsed = Integer.parseInt(matcher.group(1));
            return Math.max(1, Math.min(parsed, 15));
        }

        String lower = message.toLowerCase(Locale.ROOT);
        Map<String, Integer> words = Map.ofEntries(
                Map.entry("one", 1),
                Map.entry("two", 2),
                Map.entry("three", 3),
                Map.entry("four", 4),
                Map.entry("five", 5),
                Map.entry("six", 6),
                Map.entry("seven", 7),
                Map.entry("eight", 8),
                Map.entry("nine", 9),
                Map.entry("ten", 10)
        );
        for (Map.Entry<String, Integer> entry : words.entrySet()) {
            if (lower.contains(entry.getKey())) {
                return entry.getValue();
            }
        }
        return 1;
    }

    private String fingerprintQuestion(String question) {
        if (question == null) {
            return "";
        }
        return question.toLowerCase(Locale.ROOT)
                .replaceAll("[^a-z0-9]+", " ")
                .trim();
    }

    private String fallbackNoticeFor(Exception ex, boolean transportError) {
        String message = ex == null || ex.getMessage() == null ? "" : ex.getMessage().toLowerCase(Locale.ROOT);

        if (transportError) {
            if (message.contains("429") || message.contains("quota") || message.contains("rate")) {
                return "AI service is temporarily rate-limited (quota reached). Please try again in a few minutes.";
            }
            if (message.contains("503") || message.contains("high demand") || message.contains("unavailable")) {
                return "AI service is currently busy. Please retry shortly.";
            }
            return "AI service is temporarily unavailable. Please try again.";
        }

        return "I received a response, but it had an invalid format. Please try again.";
    }

    private List<AiCoachResponse.Citation> parseTrustedCitations(JsonNode citationsNode) {
        if (!citationsNode.isArray()) {
            return List.of();
        }

        List<AiCoachResponse.Citation> citations = new ArrayList<>();
        Set<String> seenUrls = new HashSet<>();

        for (JsonNode node : citationsNode) {
            if (!node.isObject() || citations.size() >= MAX_CITATIONS) {
                continue;
            }

            String rawUrl = node.path("url").asText("").trim();
            String normalizedUrl = normalizeTrustedUrl(rawUrl);
            if (normalizedUrl == null || !seenUrls.add(normalizedUrl)) {
                continue;
            }

            String title = node.path("title").asText("").trim();
            String description = node.path("description").asText("").trim();
            String source = node.path("source").asText("").trim();

            AiCoachResponse.Citation citation = new AiCoachResponse.Citation();
            citation.setUrl(normalizedUrl);
            citation.setTitle(title.isEmpty() ? "Learning resource" : trimToLimit(title, 120));
            citation.setDescription(trimToLimit(description, 220));
            citation.setSource(source.isEmpty() ? extractHost(normalizedUrl) : trimToLimit(source, 80));
            citations.add(citation);
        }

        return citations;
    }

    private String normalizeTrustedUrl(String rawUrl) {
        if (rawUrl == null || rawUrl.isBlank()) {
            return null;
        }

        try {
            URI uri = URI.create(rawUrl.trim());
            if (uri.getScheme() == null || !"https".equalsIgnoreCase(uri.getScheme())) {
                return null;
            }
            String host = uri.getHost();
            if (host == null || host.isBlank()) {
                return null;
            }

            String normalizedHost = host.toLowerCase(Locale.ROOT);
            if (normalizedHost.startsWith("www.")) {
                normalizedHost = normalizedHost.substring(4);
            }
            final String trustedHost = normalizedHost;

            boolean trusted = TRUSTED_DOMAINS.stream().anyMatch(domain ->
                    trustedHost.equals(domain) || trustedHost.endsWith("." + domain));
            if (!trusted) {
                return null;
            }

            return uri.normalize().toString();
        } catch (IllegalArgumentException ex) {
            return null;
        }
    }

    private String extractHost(String url) {
        try {
            URI uri = URI.create(url);
            String host = uri.getHost();
            if (host == null) {
                return "source";
            }
            return host.startsWith("www.") ? host.substring(4) : host;
        } catch (IllegalArgumentException ex) {
            return "source";
        }
    }

    private String trimToLimit(String value, int limit) {
        if (value == null) {
            return "";
        }
        String normalized = value.trim();
        if (normalized.length() <= limit) {
            return normalized;
        }
        return normalized.substring(0, limit - 3) + "...";
    }

    private record TextBlockPayload(String title, String body) {
    }

    private String sanitizeJson(String raw) {
        if (raw == null) {
            return "{}";
        }

        String trimmed = raw.trim();
        if (trimmed.startsWith("```")) {
            int firstBrace = trimmed.indexOf('{');
            int lastBrace = trimmed.lastIndexOf('}');
            if (firstBrace >= 0 && lastBrace > firstBrace) {
                return trimmed.substring(firstBrace, lastBrace + 1);
            }
        }

        int firstBrace = trimmed.indexOf('{');
        int lastBrace = trimmed.lastIndexOf('}');
        if (firstBrace >= 0 && lastBrace > firstBrace) {
            return trimmed.substring(firstBrace, lastBrace + 1);
        }
        return trimmed;
    }

    private String truncate(String content) {
        if (content == null || content.length() <= LESSON_CONTEXT_LIMIT) {
            return content;
        }
        return content.substring(0, LESSON_CONTEXT_LIMIT);
    }
}

