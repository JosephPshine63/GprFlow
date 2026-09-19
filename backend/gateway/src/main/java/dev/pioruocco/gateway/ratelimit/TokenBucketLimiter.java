package dev.pioruocco.gateway.ratelimit;

import java.util.concurrent.ConcurrentHashMap;

/**
 * In-memory token bucket per key. Fine for a single gateway instance; with more than
 * one replica each keeps its own counters and the effective limit multiplies.
 */
public class TokenBucketLimiter {

    private static final long IDLE_EVICT_NANOS = 10L * 60 * 1_000_000_000L;
    private static final int EVICT_ABOVE_SIZE = 10_000;

    private static final class Bucket {
        double tokens;
        long lastRefill;
        long lastSeen;
    }

    private final ConcurrentHashMap<String, Bucket> buckets = new ConcurrentHashMap<>();

    /**
     * @return 0 if the request is allowed, otherwise the seconds to wait before retrying
     */
    public long tryAcquire(String key, int perMinute, long nowNanos) {
        if (buckets.size() > EVICT_ABOVE_SIZE) {
            buckets.entrySet().removeIf(e -> nowNanos - e.getValue().lastSeen > IDLE_EVICT_NANOS);
        }

        Bucket bucket = buckets.computeIfAbsent(key, k -> {
            Bucket b = new Bucket();
            b.tokens = perMinute;
            b.lastRefill = nowNanos;
            return b;
        });

        double refillPerNano = perMinute / 60.0 / 1_000_000_000L;
        synchronized (bucket) {
            bucket.tokens = Math.min(perMinute, bucket.tokens + (nowNanos - bucket.lastRefill) * refillPerNano);
            bucket.lastRefill = nowNanos;
            bucket.lastSeen = nowNanos;
            if (bucket.tokens >= 1) {
                bucket.tokens -= 1;
                return 0;
            }
            return (long) Math.ceil((1 - bucket.tokens) / (refillPerNano * 1_000_000_000L));
        }
    }
}
