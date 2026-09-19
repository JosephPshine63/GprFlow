package dev.pioruocco.gateway.ratelimit;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

class TokenBucketLimiterTest {

    private static final long SECOND = 1_000_000_000L;

    @Test
    void allowsUpToTheLimitThenRejects() {
        TokenBucketLimiter limiter = new TokenBucketLimiter();
        for (int i = 0; i < 5; i++) {
            assertEquals(0, limiter.tryAcquire("ip", 5, 0));
        }
        assertTrue(limiter.tryAcquire("ip", 5, 0) > 0);
    }

    @Test
    void refillsOverTime() {
        TokenBucketLimiter limiter = new TokenBucketLimiter();
        for (int i = 0; i < 60; i++) {
            limiter.tryAcquire("ip", 60, 0);
        }
        assertTrue(limiter.tryAcquire("ip", 60, 0) > 0);
        // 60 per minute is one token per second
        assertEquals(0, limiter.tryAcquire("ip", 60, 2 * SECOND));
    }

    @Test
    void keysDoNotShareABudget() {
        TokenBucketLimiter limiter = new TokenBucketLimiter();
        assertEquals(0, limiter.tryAcquire("a", 1, 0));
        assertTrue(limiter.tryAcquire("a", 1, 0) > 0);
        assertEquals(0, limiter.tryAcquire("b", 1, 0));
    }
}
