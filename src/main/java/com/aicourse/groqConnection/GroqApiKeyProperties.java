package com.aicourse.groqConnection;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

@Component
@ConfigurationProperties(prefix = "spring.ai.groq")
public class GroqApiKeyProperties {

    private String apiKey;
    private List<String> apiKeys = new ArrayList<>();
    private long keyCooldownHours = 24;
    private String model = "llama-3.1-8b-instant";

    public String getApiKey() {
        return apiKey;
    }

    public void setApiKey(String apiKey) {
        this.apiKey = apiKey;
    }

    public List<String> getApiKeys() {
        return apiKeys;
    }

    public void setApiKeys(List<String> apiKeys) {
        this.apiKeys = apiKeys;
    }

    public long getKeyCooldownHours() {
        return keyCooldownHours;
    }

    public void setKeyCooldownHours(long keyCooldownHours) {
        this.keyCooldownHours = keyCooldownHours;
    }

    public String getModel() {
        return model;
    }

    public void setModel(String model) {
        this.model = model;
    }

    public List<String> resolveApiKeys() {
        Set<String> resolved = new LinkedHashSet<>();

        for (String key : apiKeys) {
            if (StringUtils.hasText(key)) {
                resolved.add(key.trim());
            }
        }

        if (StringUtils.hasText(apiKey)) {
            resolved.add(apiKey.trim());
        }

        return new ArrayList<>(resolved);
    }
}

