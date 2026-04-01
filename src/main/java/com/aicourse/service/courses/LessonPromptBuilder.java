package com.aicourse.service.courses;

/**
 * Dynamic, type-safe prompt builder for AI lesson content generation.
 * Produces structured JSON that maps 1:1 to the frontend LessonBlock types.
 */
public class LessonPromptBuilder {

    // Required
    private String lessonTitle;
    private String courseTitle;
    private String moduleTitle;

    // Optional with defaults
    private int quizCount = 2;
    private int youtubeCount = 1;
    private boolean includeCodeExamples = true;
    private boolean includeReferences = true;
    private boolean includeTable = true;
    private String difficultyLevel = "beginner"; // beginner | intermediate | advanced
    private String targetAudience = "college students";
    private String language = "English";

    // --- Fluent Setters ---

    public LessonPromptBuilder lessonTitle(String lessonTitle) {
        this.lessonTitle = lessonTitle;
        return this;
    }

    public LessonPromptBuilder courseTitle(String courseTitle) {
        this.courseTitle = courseTitle;
        return this;
    }

    public LessonPromptBuilder moduleTitle(String moduleTitle) {
        this.moduleTitle = moduleTitle;
        return this;
    }

    public LessonPromptBuilder quizCount(int quizCount) {
        this.quizCount = Math.max(0, Math.min(quizCount, 10));
        return this;
    }

    public LessonPromptBuilder youtubeCount(int youtubeCount) {
        this.youtubeCount = Math.max(0, Math.min(youtubeCount, 5));
        return this;
    }

    public LessonPromptBuilder includeCodeExamples(boolean includeCodeExamples) {
        this.includeCodeExamples = includeCodeExamples;
        return this;
    }

    public LessonPromptBuilder includeReferences(boolean includeReferences) {
        this.includeReferences = includeReferences;
        return this;
    }

    public LessonPromptBuilder includeTable(boolean includeTable) {
        this.includeTable = includeTable;
        return this;
    }

    public LessonPromptBuilder difficultyLevel(String difficultyLevel) {
        this.difficultyLevel = difficultyLevel;
        return this;
    }

    public LessonPromptBuilder targetAudience(String targetAudience) {
        this.targetAudience = targetAudience;
        return this;
    }

    public LessonPromptBuilder language(String language) {
        this.language = language;
        return this;
    }

    // --- Build ---

    public String build() {
        if (lessonTitle == null || courseTitle == null || moduleTitle == null) {
            throw new IllegalStateException("lessonTitle, courseTitle, and moduleTitle are required");
        }

        StringBuilder sb = new StringBuilder();

        // ---- ROLE ----
        sb.append("You are an expert educational content creator specializing in structured, interactive digital lessons.\n\n");

        // ---- CONTEXT ----
        sb.append("## CONTEXT\n");
        sb.append("- Lesson Title: \"").append(lessonTitle).append("\"\n");
        sb.append("- Course: \"").append(courseTitle).append("\"\n");
        sb.append("- Module: \"").append(moduleTitle).append("\"\n");
        sb.append("- Difficulty: ").append(difficultyLevel).append("\n");
        sb.append("- Target Audience: ").append(targetAudience).append("\n");
        sb.append("- Language: ").append(language).append("\n\n");

        // ---- TASK ----
        sb.append("## TASK\n");
        sb.append("Generate a comprehensive, engaging lesson as a JSON array of content blocks.\n\n");

        // ---- STRUCTURE REQUIREMENTS ----
        sb.append("## REQUIRED LESSON STRUCTURE\n");
        sb.append("Follow this order strictly:\n");
        sb.append("1. A \"heading\" block with the lesson title\n");
        sb.append("2. 1-2 \"text\" blocks as introduction/overview\n");
        sb.append("3. For each major concept:\n");
        sb.append("   a. A \"heading\" block for the concept name\n");
        sb.append("   b. 1-2 \"text\" blocks explaining the concept\n");
        sb.append("   c. A \"list\" block for key features/points (if applicable)\n");
        if (includeCodeExamples) {
            sb.append("   d. A \"code\" block with a practical example (if applicable to the topic)\n");
        }
        if (includeTable) {
            sb.append("4. A \"table\" block comparing/summarizing key concepts\n");
        }
        if (youtubeCount > 0) {
            sb.append("5. Exactly ").append(youtubeCount).append(" \"youtube\" block(s) with REAL, existing, popular YouTube video URLs related to the topic. ");
            sb.append("Use well-known educational channels (e.g., freeCodeCamp, Fireship, Traversy Media, CS50, MIT OpenCourseWare, etc.). ");
            sb.append("The URL must be a valid youtube.com/watch?v= link.\n");
        }
        if (quizCount > 0) {
            sb.append("6. Exactly ").append(quizCount).append(" \"quiz\" block(s) to test understanding, placed near the end\n");
        }
        if (includeReferences) {
            sb.append("7. A \"reference\" block at the very end with 3-5 real, authoritative external links (official docs, Wikipedia, reputable tutorials)\n");
        }
        sb.append("8. A \"heading\" block titled \"Conclusion\" followed by 1-2 summary \"text\" blocks\n\n");

        // ---- STRICT JSON SCHEMA ----
        sb.append("## BLOCK TYPE SCHEMAS (follow EXACTLY)\n\n");

        sb.append("### heading\n");
        sb.append("```json\n{ \"type\": \"heading\", \"content\": \"Section Title Here\" }\n```\n\n");

        sb.append("### text\n");
        sb.append("Supports inline markdown: **bold**, *italic*, `code`\n");
        sb.append("```json\n{ \"type\": \"text\", \"content\": \"Paragraph text here with **bold** and `inline code`.\" }\n```\n\n");

        sb.append("### list\n");
        sb.append("content is a JSON array of strings. Supports **bold** markdown in items.\n");
        sb.append("```json\n{ \"type\": \"list\", \"content\": [\"**Item 1:** Description\", \"**Item 2:** Description\"] }\n```\n\n");

        if (includeCodeExamples) {
            sb.append("### code\n");
            sb.append("content is an object with \"language\" (string) and \"code\" (string).\n");
            sb.append("```json\n{ \"type\": \"code\", \"content\": { \"language\": \"python\", \"code\": \"print('Hello')\" } }\n```\n\n");
        }

        sb.append("### table\n");
        sb.append("content is an object with \"headers\" (string[]) and \"rows\" (string[][]). Supports **bold** in cells.\n");
        sb.append("```json\n{ \"type\": \"table\", \"content\": { \"headers\": [\"Col1\", \"Col2\"], \"rows\": [[\"val1\", \"val2\"]] } }\n```\n\n");

        if (quizCount > 0) {
            sb.append("### quiz\n");
            sb.append("content is an object. \"options\" must have exactly 4 items. \"correctIndex\" is 0-based. \"explanation\" is required.\n");
            sb.append("```json\n{ \"type\": \"quiz\", \"content\": { \"question\": \"What is X?\", \"options\": [\"A\", \"B\", \"C\", \"D\"], \"correctIndex\": 1, \"explanation\": \"B is correct because...\" } }\n```\n\n");
        }

        if (youtubeCount > 0) {
            sb.append("### youtube\n");
            sb.append("content is an object with \"url\" (must be a real YouTube URL) and \"title\" (string).\n");
            sb.append("```json\n{ \"type\": \"youtube\", \"content\": { \"url\": \"https://www.youtube.com/watch?v=VIDEO_ID\", \"title\": \"Video Title\" } }\n```\n\n");
        }

        if (includeReferences) {
            sb.append("### reference\n");
            sb.append("content is an array of objects with \"title\", \"url\", and optional \"description\".\n");
            sb.append("```json\n{ \"type\": \"reference\", \"content\": [{ \"title\": \"Official Docs\", \"url\": \"https://example.com\", \"description\": \"Comprehensive guide\" }] }\n```\n\n");
        }

        // ---- QUALITY RULES ----
        sb.append("## QUALITY RULES\n");
        sb.append("- Content must be factually accurate and up-to-date\n");
        sb.append("- Use clear, engaging language appropriate for ").append(targetAudience).append("\n");
        sb.append("- Each quiz question must test a different concept from the lesson\n");
        sb.append("- Quiz options must be plausible (no obviously wrong answers)\n");
        sb.append("- Code examples must be syntactically correct and runnable\n");
        sb.append("- YouTube URLs must be real videos from well-known channels (do NOT invent URLs)\n");
        sb.append("- References must link to real, existing websites\n");
        if (difficultyLevel.equals("advanced")) {
            sb.append("- Include advanced concepts, edge cases, and real-world production considerations\n");
            sb.append("- Add more references to research papers and official documentation\n");
        } else if (difficultyLevel.equals("intermediate")) {
            sb.append("- Balance theory with practical examples\n");
            sb.append("- Include common pitfalls and best practices\n");
        } else {
            sb.append("- Use simple analogies and real-world comparisons\n");
            sb.append("- Avoid jargon without explanation\n");
        }
        sb.append("\n");

        // ---- OUTPUT FORMAT ----
        sb.append("## OUTPUT FORMAT (CRITICAL!)\n");
        sb.append("YOU MUST respond with ONLY a raw JSON array.\n");
        sb.append("Do NOT include:\n");
        sb.append("- Markdown code fences (```json or ```)\n");
        sb.append("- Explanatory text before or after the JSON\n");
        sb.append("- A wrapping object\n");
        sb.append("- Any whitespace before the first [ or after the last ]\n\n");
        sb.append("VALID RESPONSE FORMAT:\n");
        sb.append("[{\"type\":\"heading\",\"content\":\"Title\"},{\"type\":\"text\",\"content\":\"Paragraph\"}]\n\n");
        sb.append("INVALID RESPONSE FORMAT:\n");
        sb.append("```json\n[...]\n```\n");
        sb.append("\"Here is the lesson: [...]\" \n\n");
        sb.append("The response must:\n");
        sb.append("- Start with exactly [ (no spaces, no preamble)\n");
        sb.append("- End with exactly ] (no spaces, no explanation)\n");
        sb.append("- Contain ONLY valid JSON\n");
        sb.append("- Have every block with exactly two keys: \"type\" and \"content\" (no extra keys like \"description\")\n");
        sb.append("- Be minified or properly formatted but containing only the array\n\n");
        sb.append("Allowed block types: ");

        StringBuilder types = new StringBuilder("\"heading\", \"text\", \"list\", \"table\"");
        if (includeCodeExamples) types.append(", \"code\"");
        if (quizCount > 0) types.append(", \"quiz\"");
        if (youtubeCount > 0) types.append(", \"youtube\"");
        if (includeReferences) types.append(", \"reference\"");
        sb.append(types).append("\n");

        return sb.toString();
    }
}

