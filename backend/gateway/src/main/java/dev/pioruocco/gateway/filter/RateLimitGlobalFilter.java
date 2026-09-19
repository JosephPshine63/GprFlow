package dev.pioruocco.gateway.filter;

import dev.pioruocco.gateway.ratelimit.TokenBucketLimiter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.net.InetAddress;
import java.net.InetSocketAddress;
import java.util.List;

/**
 * Per-client-IP limits, tighter on the endpoints worth brute-forcing (login, signup,
 * OTP, password reset) and on the chatbot, which costs money per call.
 */
@Component
public class RateLimitGlobalFilter implements GlobalFilter, Ordered {

    private static final List<String> AUTH_PREFIXES = List.of(
            "/auth", "/api/users/verification", "/api/users/enable-two-factor");

    private final TokenBucketLimiter limiter = new TokenBucketLimiter();

    @Value("${rate-limit.enabled:true}")
    private boolean enabled;

    @Value("${rate-limit.auth-per-minute:20}")
    private int authPerMinute;

    @Value("${rate-limit.chat-per-minute:15}")
    private int chatPerMinute;

    @Value("${rate-limit.api-per-minute:300}")
    private int apiPerMinute;

    private static boolean matches(String path, String prefix) {
        return path.equals(prefix) || path.startsWith(prefix + "/");
    }

    // Behind the Cloudflare tunnel the peer is a private Docker address and the real
    // client is in CF-Connecting-IP. The header is only trusted from private peers, so
    // someone hitting the gateway directly can't pick their own bucket.
    static String clientIp(ServerWebExchange exchange) {
        InetSocketAddress remote = exchange.getRequest().getRemoteAddress();
        InetAddress peer = remote == null ? null : remote.getAddress();
        if (peer != null && (peer.isSiteLocalAddress() || peer.isLoopbackAddress())) {
            String forwarded = exchange.getRequest().getHeaders().getFirst("CF-Connecting-IP");
            if (forwarded != null && !forwarded.isBlank()) {
                return forwarded.trim();
            }
        }
        return peer == null ? "unknown" : peer.getHostAddress();
    }

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        // preflights are answered by the CORS handling and must not eat into the budget
        if (!enabled || HttpMethod.OPTIONS.equals(exchange.getRequest().getMethod())) {
            return chain.filter(exchange);
        }

        String path = exchange.getRequest().getURI().getPath();
        String tier;
        int perMinute;
        if (AUTH_PREFIXES.stream().anyMatch(p -> matches(path, p))) {
            tier = "auth";
            perMinute = authPerMinute;
        } else if (matches(path, "/chat")) {
            tier = "chat";
            perMinute = chatPerMinute;
        } else {
            tier = "api";
            perMinute = apiPerMinute;
        }

        long retryAfter = limiter.tryAcquire(tier + ":" + clientIp(exchange), perMinute, System.nanoTime());
        if (retryAfter == 0) {
            return chain.filter(exchange);
        }

        exchange.getResponse().setStatusCode(HttpStatus.TOO_MANY_REQUESTS);
        exchange.getResponse().getHeaders().set("Retry-After", String.valueOf(retryAfter));
        return exchange.getResponse().setComplete();
    }

    @Override
    public int getOrder() {
        return Ordered.HIGHEST_PRECEDENCE + 10;
    }
}
