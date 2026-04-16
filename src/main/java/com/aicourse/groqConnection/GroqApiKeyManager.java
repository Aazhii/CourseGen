package com.aicourse.groqConnection;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

@Component
@ConditionalOnProperty(name = "app.ai.provider", havingValue = "groq")
public class GroqApiKeyManager {

    private static final List<String> QUOTA_ERROR_TOKENS = List.of(
            "resource_exhausted",
            "quota",
            "rate limit",
            "rate_limit",
            "too many requests",
            "status code 429",
            "http 429"
    );

    private final List<String> apiKeys;
    private final Duration cooldownDuration;
    private final Clock clock;
    private final AtomicInteger roundRobinIndex = new AtomicInteger(0);
    private final Map<String, Instant> keyCooldownUntil = new ConcurrentHashMap<>();

    @Autowired
    public GroqApiKeyManager(GroqApiKeyProperties properties) {
        this(properties.resolveApiKeys(), properties.getKeyCooldownHours(), Clock.systemUTC());
    }

    // Secondary constructor used by unit tests.
    GroqApiKeyManager(List<String> apiKeys, long keyCooldownHours, Clock clock) {
        this.apiKeys = List.copyOf(apiKeys);
        this.cooldownDuration = Duration.ofHours(Math.max(1, keyCooldownHours));
        this.clock = Objects.requireNonNull(clock, "clock is required");

        if (this.apiKeys.isEmpty()) {
            throw new IllegalStateException("No Groq API keys configured. Set spring.ai.groq.api-keys or api-key.");
        }
    }

    public synchronized String acquireAvailableKey() {
        Instant now = clock.instant();

        for (int attempt = 0; attempt < apiKeys.size(); attempt++) {
            int index = Math.floorMod(roundRobinIndex.getAndIncrement(), apiKeys.size());
            String candidate = apiKeys.get(index);
            Instant cooldownUntil = keyCooldownUntil.get(candidate);

            if (cooldownUntil == null || !cooldownUntil.isAfter(now)) {
                keyCooldownUntil.remove(candidate);
                return candidate;
            }
        }

        Instant earliestReadyAt = keyCooldownUntil.values().stream()
                .min(Comparator.naturalOrder())
                .orElse(now.plus(cooldownDuration));
        long waitSeconds = Math.max(1, Duration.between(now, earliestReadyAt).getSeconds());

        throw new IllegalStateException("All Groq API keys are on cooldown. Retry in about " + waitSeconds + " seconds.");
    }

    public void markKeyOnCooldown(String key) {
        keyCooldownUntil.put(key, clock.instant().plus(cooldownDuration));
    }

    public boolean isQuotaOrRateLimitError(Throwable error) {
        String combinedMessage = buildErrorMessage(error).toLowerCase(Locale.ROOT);
        return QUOTA_ERROR_TOKENS.stream().anyMatch(combinedMessage::contains);
    }

    public int totalKeyCount() {
        return apiKeys.size();
    }

    private String buildErrorMessage(Throwable error) {
        StringBuilder message = new StringBuilder();
        Throwable cursor = error;

        while (cursor != null) {
            if (cursor.getMessage() != null) {
                message.append(cursor.getMessage()).append(' ');
            }
            cursor = cursor.getCause();
        }

        return message.toString();
    }
}

