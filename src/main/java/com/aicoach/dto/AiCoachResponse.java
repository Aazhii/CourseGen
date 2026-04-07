package com.aicoach.dto;

import com.fasterxml.jackson.databind.JsonNode;

import java.util.ArrayList;
import java.util.List;

public class AiCoachResponse {

    private String intent;
    private List<CoachBlock> blocks = new ArrayList<>();
    private List<String> suggestions = new ArrayList<>();

    public String getIntent() {
        return intent;
    }

    public void setIntent(String intent) {
        this.intent = intent;
    }

    public List<CoachBlock> getBlocks() {
        return blocks;
    }

    public void setBlocks(List<CoachBlock> blocks) {
        this.blocks = blocks;
    }

    public List<String> getSuggestions() {
        return suggestions;
    }

    public void setSuggestions(List<String> suggestions) {
        this.suggestions = suggestions;
    }

    public static class CoachBlock {
        private String type;
        private JsonNode content;

        public String getType() {
            return type;
        }

        public void setType(String type) {
            this.type = type;
        }

        public JsonNode getContent() {
            return content;
        }

        public void setContent(JsonNode content) {
            this.content = content;
        }
    }
}

