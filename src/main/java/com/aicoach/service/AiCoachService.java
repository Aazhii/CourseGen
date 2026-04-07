package com.aicoach.service;

import com.aicoach.dto.AiCoachRequest;
import com.aicoach.dto.AiCoachResponse;
import com.aicourse.geminiConnection.GeminiConnection;
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

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

@Service
public class AiCoachService {

    private static final int LESSON_CONTEXT_LIMIT = 3000;

    @Autowired
    private GeminiConnection geminiConnection;

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
                    !lesson.getModule().getCourse().getId().equals(course.getId())) {
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

        try {
            String raw = geminiConnection.getResponse(prompt);
            return parseModelResponse(raw, request.getMessage());
        } catch (Exception ex) {
            return fallbackResponse(request.getMessage());
        }
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

        response.setBlocks(blocks);
        response.setSuggestions(suggestions);
        return response;
    }

    private AiCoachResponse fallbackResponse(String message) throws Exception {
        String lower = message == null ? "" : message.toLowerCase(Locale.ROOT);
        boolean wantsQuiz = lower.contains("quiz") || lower.contains("question") || lower.contains("test me");
        boolean wantsPlan = lower.contains("plan") || lower.contains("schedule");

        AiCoachResponse response = new AiCoachResponse();
        response.setIntent(wantsPlan ? "study_plan" : (wantsQuiz ? "quiz" : "explanation"));

        List<AiCoachResponse.CoachBlock> blocks = new ArrayList<>();

        AiCoachResponse.CoachBlock intro = new AiCoachResponse.CoachBlock();
        intro.setType("text");
        intro.setContent(objectMapper.readTree("{\"title\":\"AI Coach\",\"body\":\"I can help with explanations, quizzes, flashcards, and study plans for this course.\"}"));
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
        return response;
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

