package dev.pioruocco.gateway.filter;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

/**
 * Rejects requests that declare a body over the limit. Only Content-Length is checked,
 * so it stops honest oversized uploads, not a client that streams chunked.
 */
@Component
public class BodySizeGlobalFilter implements GlobalFilter, Ordered {

    @Value("${rate-limit.max-body-bytes:1048576}")
    private long maxBodyBytes;

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        long declared = exchange.getRequest().getHeaders().getContentLength();
        if (declared > maxBodyBytes) {
            exchange.getResponse().setStatusCode(HttpStatus.PAYLOAD_TOO_LARGE);
            return exchange.getResponse().setComplete();
        }
        return chain.filter(exchange);
    }

    @Override
    public int getOrder() {
        return Ordered.HIGHEST_PRECEDENCE + 11;
    }
}
