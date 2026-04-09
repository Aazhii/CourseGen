package com.aicoach.service;

import com.aicoach.dto.AiCoachRequest;
import com.aicoach.dto.AiCoachResponse;
import com.aicourse.ai.AiTextClientRouter;
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

@Service
public class AiCoachService {

    private static final int LESSON_CONTEXT_LIMIT = 3000;
    private static final int MAX_CITATIONS = 8;
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
    private AiTextClientRouter aiTextClient;

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
                .build();

        String raw;
        try {
            raw = aiTextClient.getResponse(prompt);
        } catch (Exception ex) {
            return fallbackResponse(request.getMessage(), fallbackNoticeFor(ex, true));
        }

        try {
            return parseModelResponse(raw, request.getMessage());
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
                .build();

        SseEmitter emitter = new SseEmitter(180_000L); // 3-minute timeout
        ExecutorService sseMvcExecutor = Executors.newSingleThreadExecutor();

        sseMvcExecutor.execute(() -> {
            try {
                Iterable<String> stream = aiTextClient.getResponseStream(prompt);
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
            AiCoachResponse.CoachBlock quiz = new AiCoachResponse.CoachBlock();
            quiz.setType("quiz_card");
            quiz.setContent(objectMapper.readTree("{\"question\":\"Which approach best improves retention after studying?\",\"options\":[\"Passive rereading\",\"Active recall\",\"Skipping examples\",\"Memorizing without understanding\"],\"correctIndex\":1,\"explanation\":\"Active recall is consistently more effective because it strengthens retrieval pathways.\"}"));
            blocks.add(quiz);
        }

        response.setBlocks(blocks);
        response.setSuggestions(List.of("Give me 5 harder quiz questions", "Create flashcards from this topic", "Explain this with a real-world analogy"));
        response.setCitations(List.of());
        return response;
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

