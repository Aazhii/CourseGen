package com.aicourse.geminiConnection;

import com.google.genai.Client;
import com.google.genai.types.GenerateContentConfig;
import com.google.genai.types.GenerateContentResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.logging.Level;
import java.util.logging.Logger;

@Component
public class GeminiConnection {

    private static final Logger LOGGER = Logger.getLogger(GeminiConnection.class.getName());

    @Value("${spring.ai.google.genai.api-key}")
    private String apiKey;

    public String getResponse(String prompt) {

        LOGGER.log(Level.FINE, "Prompt sent to Gemini ({0}) chars", new Object[]{prompt.length()});
        // Build client WITH API KEY
        Client client = Client.builder()
                .apiKey(apiKey)
                .build();

        try {
            GenerateContentConfig config = GenerateContentConfig.builder()
                    .responseMimeType("application/json")
                    .build();

            GenerateContentResponse response = client.models.generateContent(
                    "gemini-2.5-flash", // model name
                    prompt,
                    config);

            LOGGER.log(Level.FINE, "Gemini Response received. Length: {0}", new Object[]{response.text().length()});
            return response.text();
        } catch (Exception e) {
            LOGGER.log(Level.SEVERE, "Error communicating with Gemini API: {0}", new Object[]{e.getMessage()});
            throw e;
        }
    }

    public Iterable<GenerateContentResponse> getResponseStream(String prompt) {
        LOGGER.log(Level.FINE, "Streaming Prompt sent to Gemini ({0}) chars", new Object[]{prompt.length()});
        Client client = Client.builder()
                .apiKey(apiKey)
                .build();

        try {
            GenerateContentConfig config = GenerateContentConfig.builder()
                    .responseMimeType("application/json")
                    .build();

            return client.models.generateContentStream(
                    "gemini-2.5-flash", // model name
                    prompt,
                    config);
        } catch (Exception e) {
            LOGGER.log(Level.SEVERE, "Error streaming from Gemini API: {0}", new Object[]{e.getMessage()});
            throw e;
        }
    }

}
