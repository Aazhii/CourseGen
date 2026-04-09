package com.aicoach.service;

public class AiCoachPromptBuilder {

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
                "- Keep text concise and high quality.\\n" +
                "- suggestions should be quick follow-up prompts.\\n" +
                "- citations URLs must be https and from trusted educational/reference sources only.\\n";

        return sb;
    }
}

