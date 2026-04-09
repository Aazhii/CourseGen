package com.aicourse.groqConnection;

import org.junit.jupiter.api.Test;

import java.time.Clock;
import java.time.Instant;
import java.time.ZoneId;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class GroqApiKeyManagerTest {

    @Test
    void acquireAvailableKeyRotatesInRoundRobinOrder() {
        GroqApiKeyManager manager = new GroqApiKeyManager(List.of("k1", "k2", "k3"), 24, Clock.systemUTC());

        assertEquals("k1", manager.acquireAvailableKey());
        assertEquals("k2", manager.acquireAvailableKey());
        assertEquals("k3", manager.acquireAvailableKey());
        assertEquals("k1", manager.acquireAvailableKey());
    }

    @Test
    void acquireAvailableKeySkipsCoolingKey() {
        MutableClock clock = new MutableClock(Instant.parse("2026-04-09T10:00:00Z"));
        GroqApiKeyManager manager = new GroqApiKeyManager(List.of("k1", "k2"), 24, clock);

        manager.markKeyOnCooldown("k1");

        assertEquals("k2", manager.acquireAvailableKey());
    }

    @Test
    void acquireAvailableKeyThrowsWhenAllKeysAreCoolingDown() {
        MutableClock clock = new MutableClock(Instant.parse("2026-04-09T10:00:00Z"));
        GroqApiKeyManager manager = new GroqApiKeyManager(List.of("k1", "k2"), 24, clock);

        manager.markKeyOnCooldown("k1");
        manager.markKeyOnCooldown("k2");

        assertThrows(IllegalStateException.class, manager::acquireAvailableKey);
    }

    @Test
    void isQuotaOrRateLimitErrorDetectsQuotaMessages() {
        GroqApiKeyManager manager = new GroqApiKeyManager(List.of("k1"), 24, Clock.systemUTC());

        assertTrue(manager.isQuotaOrRateLimitError(new RuntimeException("RESOURCE_EXHAUSTED: Quota exceeded")));
        assertTrue(manager.isQuotaOrRateLimitError(new RuntimeException("HTTP 429 Too Many Requests")));
        assertFalse(manager.isQuotaOrRateLimitError(new RuntimeException("Invalid API key")));
    }

    private static final class MutableClock extends Clock {
        private final Instant now;

        private MutableClock(Instant now) {
            this.now = now;
        }

        @Override
        public ZoneId getZone() {
            return ZoneId.of("UTC");
        }

        @Override
        public Clock withZone(ZoneId zone) {
            return this;
        }

        @Override
        public Instant instant() {
            return now;
        }
    }
}

