package dev.pioruocco.gateway.filter;

import dev.pioruocco.gateway.captcha.TurnstileVerifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.core.io.buffer.DataBuffer;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.nio.charset.StandardCharsets;
import java.util.Set;

/**
 * Requires a valid Turnstile token (X-Turnstile-Token) on the endpoints anonymous
 * clients can hammer: signup, signin and the password reset code request. The steps
 * that follow (OTP checks) already need something obtained through one of these.
 */
@Component
public class TurnstileGlobalFilter implements GlobalFilter, Ordered {

    static final String HEADER = "X-Turnstile-Token";

    private static final Set<String> PROTECTED_PATHS = Set.of(
            "/auth/signup", "/auth/signin", "/auth/users/reset-password/send-otp");

    private static final byte[] DENIED =
            "{\"error\":\"Verifica anti-bot non superata, riprova.\"}".getBytes(StandardCharsets.UTF_8);

    private final TurnstileVerifier verifier;

    @Value("${turnstile.enabled:true}")
    private boolean enabled;

    public TurnstileGlobalFilter(TurnstileVerifier verifier) {
        this.verifier = verifier;
    }

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        if (!enabled
                || !HttpMethod.POST.equals(exchange.getRequest().getMethod())
                || !PROTECTED_PATHS.contains(exchange.getRequest().getURI().getPath())) {
            return chain.filter(exchange);
        }

        String token = exchange.getRequest().getHeaders().getFirst(HEADER);
        if (token == null || token.isBlank()) {
            return deny(exchange);
        }

        return verifier.verify(token.trim(), RateLimitGlobalFilter.clientIp(exchange))
                .flatMap(ok -> {
                    if (!ok) {
                        return deny(exchange);
                    }
                    // downstream services have no use for it
                    ServerWebExchange stripped = exchange.mutate()
                            .request(r -> r.headers(h -> h.remove(HEADER)))
                            .build();
                    return chain.filter(stripped);
                });
    }

    private Mono<Void> deny(ServerWebExchange exchange) {
        exchange.getResponse().setStatusCode(HttpStatus.FORBIDDEN);
        exchange.getResponse().getHeaders().setContentType(MediaType.APPLICATION_JSON);
        DataBuffer body = exchange.getResponse().bufferFactory().wrap(DENIED);
        return exchange.getResponse().writeWith(Mono.just(body));
    }

    // after rate limiting, so blocked clients don't cost a call to Cloudflare
    @Override
    public int getOrder() {
        return Ordered.HIGHEST_PRECEDENCE + 12;
    }
}
