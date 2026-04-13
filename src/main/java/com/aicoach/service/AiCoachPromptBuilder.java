package com.aicoach.service;

import java.util.Locale;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class AiCoachPromptBuilder {

    private static final Pattern NUMBER_PATTERN = Pattern.compile("\\b(\\d{1,2})\\b");

    private String courseTitle;
    private String lessonTitle;
    private String lessonContext;
    private String userMessage;

    public AiCoachPromptBuilder courseTitle(String courseTitle) {
        this.courseTitle = courseTitle;
        return this;
    }

    public AiCoachPromptBuilder lessonTitle(String lessonTitle) {
        this.lessonTitle = lessonTitle;
        return this;
    }

    public AiCoachPromptBuilder lessonContext(String lessonContext) {
        this.lessonContext = lessonContext;
        return this;
    }

    public AiCoachPromptBuilder userMessage(String userMessage) {
        this.userMessage = userMessage;
        return this;
    }

    public String build() {
        String safeCourse = courseTitle == null ? "General course" : courseTitle;
        String safeLesson = lessonTitle == null ? "N/A" : lessonTitle;
        String safeContext = lessonContext == null ? "" : lessonContext;
        String safeMessage = userMessage == null ? "" : userMessage;
        int requestedQuizCount = extractRequestedQuizCount(safeMessage);
        boolean asksQuiz = isQuizRequest(safeMessage);
        boolean asksHarder = asksForHarderDifficulty(safeMessage);

        String quizConstraint = "";
        if (asksQuiz) {
            int exactCount = Math.max(1, requestedQuizCount);
            String difficultyHint = asksHarder
                    ? "Use harder conceptual and application-level questions."
                    : "Use mixed easy-to-medium conceptual questions.";
            quizConstraint = "- User requested quiz questions. Return exactly " + exactCount + " quiz_card blocks. " + difficultyHint + "\\n";
        }

        String sb = "You are an AI study coach inside a learning platform.\\n" +
                "Be fast, specific, and practical.\\n\\n" +
                "## CONTEXT\\n" +
                "- Course: " + safeCourse + "\\n" +
                "- Lesson: " + safeLesson + "\\n" +
                "- User Request: " + safeMessage + "\\n\\n" +
                "## LESSON SNAPSHOT\\n" +
                safeContext + "\\n\\n" +
                "## TASK\\n" +
                "Respond with structured study blocks. If user asks for quiz/study-related activities, include quiz_card and/or flashcard blocks.\\n" +
                "If user asks for plan or preparation, include one study_plan block.\\n" +
                "Always include at least one text block.\\n" +
                "When visuals/examples/resources would improve the answer, include citations with real public links.\\n" +
                "Citations count must be dynamic based on need (can be 0, 1, or many) and never forced.\\n\\n" +
                "## OUTPUT FORMAT (STRICT)\\n" +
                "Return ONLY valid JSON object with this schema: \\\n" +
                "{\\n" +
                "  \"intent\": \"quiz|study_plan|flashcards|explanation\",\\n" +
                "  \"blocks\": [\\n" +
                "    { \"type\": \"text\", \"content\": { \"title\": \"...\", \"body\": \"...\" } },\\n" +
                "    { \"type\": \"quiz_card\", \"content\": { \"question\": \"...\", \"options\": [\"...\",\"...\",\"...\",\"...\"], \"correctIndex\": 0, \"explanation\": \"...\" } },\\n" +
                "    { \"type\": \"flashcard\", \"content\": { \"front\": \"...\", \"back\": \"...\" } },\\n" +
                "    { \"type\": \"study_plan\", \"content\": { \"goal\": \"...\", \"duration\": \"...\", \"steps\": [{ \"title\": \"...\", \"task\": \"...\", \"time\": \"...\" }] } }\\n" +
                "  ],\\n" +
                "  \"citations\": [{ \"title\": \"...\", \"url\": \"https://...\", \"description\": \"...\", \"source\": \"...\" }],\\n" +
                "  \"suggestions\": [\"...\", \"...\", \"...\"]\\n" +
                "}\\n\\n" +
                "Rules:\\n" +
                "- No markdown code fences.\\n" +
                "- quiz_card must always have exactly 4 options.\\n" +
                quizConstraint +
                "- Keep text concise and high quality.\\n" +
                "- suggestions should be quick follow-up prompts.\\n" +
                "- citations URLs must be https and from trusted educational/reference sources only.\\n";

        return sb;
    }

    private boolean isQuizRequest(String message) {
        String lower = message == null ? "" : message.toLowerCase(Locale.ROOT);
        return lower.contains("quiz") || lower.contains("question") || lower.contains("test me");
    }

    private boolean asksForHarderDifficulty(String message) {
        String lower = message == null ? "" : message.toLowerCase(Locale.ROOT);
        return lower.contains("hard") || lower.contains("harder") || lower.contains("advanced");
    }

    private int extractRequestedQuizCount(String message) {
        if (!isQuizRequest(message)) {
            return 0;
        }
        Matcher matcher = NUMBER_PATTERN.matcher(message == null ? "" : message);
        if (matcher.find()) {
            int parsed = Integer.parseInt(matcher.group(1));
            return Math.max(1, Math.min(parsed, 15));
        }

        String lower = message == null ? "" : message.toLowerCase(Locale.ROOT);
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
}

