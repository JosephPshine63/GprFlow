package dev.pioruocco.gateway.filter;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import javax.crypto.SecretKey;
import java.util.List;

/**
 * The gateway validates the JWT once here and forwards trusted identity headers
 * downstream; ledger-service and coin-service's own filter never see the raw token
 * for this purpose (coin-service keeps re-validating independently, out of scope —
 * see Fase 6 of the migration plan). Path prefixes not in PROTECTED_PREFIXES pass
 * through unchanged (public routes, or routes still enforced by the monolith itself).
 */
@Component
public class JwtAuthGlobalFilter implements GlobalFilter, Ordered {

    // No trailing slash: matched against both the exact path (e.g. "/api/wallet")
    // and any sub-path (e.g. "/api/wallet/transactions"), see isProtected().
    private static final List<String> PROTECTED_PREFIXES = List.of(
            "/api/coins",
            "/api/wallet",
            "/api/orders",
            "/api/payment",
            "/api/admin/withdrawal",
            "/api/withdrawal",
            "/api/assets",
            "/api/users",
            "/api/watchlist",
            "/api/payment-details"
    );

    @Value("${jwt.secret}")
    private String jwtSecret;

    private SecretKey signingKey() {
        return Keys.hmacShaKeyFor(jwtSecret.getBytes());
    }

    private static boolean isProtected(String path) {
        return PROTECTED_PREFIXES.stream()
                .anyMatch(prefix -> path.equals(prefix) || path.startsWith(prefix + "/"));
    }

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        String path = exchange.getRequest().getURI().getPath();

        if (!isProtected(path)) {
            return chain.filter(exchange);
        }

        String authHeader = exchange.getRequest().getHeaders().getFirst("Authorization");
        String jwt = null;
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            jwt = authHeader.substring(7);
        } else if (exchange.getRequest().getCookies().containsKey("jwt")) {
            jwt = exchange.getRequest().getCookies().getFirst("jwt").getValue();
        }

        if (jwt == null) {
            return unauthorized(exchange);
        }

        try {
            Claims claims = Jwts.parserBuilder()
                    .setSigningKey(signingKey())
                    .build()
                    .parseClaimsJws(jwt)
                    .getBody();

            String userId = String.valueOf(claims.get("userId"));
            String role = String.valueOf(claims.get("authorities"));
            String email = String.valueOf(claims.get("email"));
            String fullName = String.valueOf(claims.get("fullName"));

            ServerHttpRequest mutatedRequest = exchange.getRequest().mutate()
                    .header("X-User-Id", userId)
                    .header("X-User-Role", role)
                    .header("X-User-Email", email)
                    .header("X-User-Full-Name", fullName)
                    .build();

            return chain.filter(exchange.mutate().request(mutatedRequest).build());
        } catch (JwtException | IllegalArgumentException e) {
            return unauthorized(exchange);
        }
    }

    private Mono<Void> unauthorized(ServerWebExchange exchange) {
        exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
        return exchange.getResponse().setComplete();
    }

    @Override
    public int getOrder() {
        return -1;
    }
}
