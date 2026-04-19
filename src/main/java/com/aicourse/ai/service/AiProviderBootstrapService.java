package com.aicourse.ai.service;

import com.aicourse.ai.AiProviderType;
import com.aicourse.ai.AiWorkload;
import com.aicourse.ai.model.AiLlmApiKey;
import com.aicourse.ai.model.AiLlmProvider;
import com.aicourse.ai.model.AiLlmRoute;
import com.aicourse.ai.repo.AiLlmApiKeyRepo;
import com.aicourse.ai.repo.AiLlmProviderRepo;
import com.aicourse.ai.repo.AiLlmRouteRepo;
import com.aicourse.geminiConnection.GeminiApiKeyProperties;
import com.aicourse.groqConnection.GroqApiKeyProperties;
import jakarta.annotation.PostConstruct;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class AiProviderBootstrapService {

    private final AiLlmProviderRepo providerRepo;
    private final AiLlmApiKeyRepo apiKeyRepo;
    private final AiLlmRouteRepo routeRepo;
    private final GeminiApiKeyProperties geminiApiKeyProperties;
    private final GroqApiKeyProperties groqApiKeyProperties;

    @Value("${spring.ai.google.genai.chat.options.model:gemini-2.5-flash}")
    private String geminiModel;

    public AiProviderBootstrapService(AiLlmProviderRepo providerRepo,
                                      AiLlmApiKeyRepo apiKeyRepo,
                                      AiLlmRouteRepo routeRepo,
                                      GeminiApiKeyProperties geminiApiKeyProperties,
                                      GroqApiKeyProperties groqApiKeyProperties) {
        this.providerRepo = providerRepo;
        this.apiKeyRepo = apiKeyRepo;
        this.routeRepo = routeRepo;
        this.geminiApiKeyProperties = geminiApiKeyProperties;
        this.groqApiKeyProperties = groqApiKeyProperties;
    }

    @PostConstruct
    @Transactional
    public void initialize() {
        AiLlmProvider gemini = ensureProvider(
                "gemini",
                "Google Gemini",
                AiProviderType.GEMINI,
                geminiModel,
                null,
                Math.toIntExact(Math.max(1, geminiApiKeyProperties.getKeyCooldownHours()))
        );

        AiLlmProvider groq = ensureProvider(
                "groq",
                "Groq",
                AiProviderType.GROQ,
                groqApiKeyProperties.getModel(),
                "https://api.groq.com/openai/v1/chat/completions",
                Math.toIntExact(Math.max(1, groqApiKeyProperties.getKeyCooldownHours()))
        );

        ensureKeys(gemini, geminiApiKeyProperties.resolveApiKeys());
        ensureKeys(groq, groqApiKeyProperties.resolveApiKeys());

        ensureRoute(AiWorkload.COURSE_GENERATION, gemini);
        ensureRoute(AiWorkload.LESSON_GENERATION, gemini);
        ensureRoute(AiWorkload.AI_COACH, gemini);
    }

    private AiLlmProvider ensureProvider(String code,
                                         String displayName,
                                         AiProviderType providerType,
                                         String model,
                                         String baseUrl,
                                         int cooldownHours) {
        var existing = providerRepo.findByCodeIgnoreCase(code);
        if (existing.isPresent()) {
            return existing.get();
        }

        AiLlmProvider provider = new AiLlmProvider();
        provider.setCode(code);
        provider.setDisplayName(displayName);
        provider.setProviderType(providerType);
        provider.setModelName(model);
        provider.setBaseUrl(baseUrl);
        provider.setEnabled(true);
        provider.setKeyCooldownHours(cooldownHours);
        return providerRepo.save(provider);
    }

    private void ensureKeys(AiLlmProvider provider, List<String> configuredKeys) {
        if (!apiKeyRepo.findByProviderAndEnabledTrueOrderByIdAsc(provider).isEmpty()) {
            return;
        }

        for (String key : configuredKeys) {
            if (key == null || key.isBlank()) {
                continue;
            }
            AiLlmApiKey row = new AiLlmApiKey();
            row.setProvider(provider);
            row.setApiKey(key.trim());
            row.setEnabled(true);
            apiKeyRepo.save(row);
        }
    }

    private void ensureRoute(AiWorkload workload, AiLlmProvider provider) {
        if (routeRepo.findByWorkload(workload).isPresent()) {
            return;
        }
        AiLlmRoute route = new AiLlmRoute();
        route.setWorkload(workload);
        route.setProvider(provider);
        routeRepo.save(route);
    }
}


