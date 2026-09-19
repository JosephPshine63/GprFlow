package dev.pioruocco.gateway.captcha;

import dev.pioruocco.gateway.filter.TurnstileGlobalFilter;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.mock.http.server.reactive.MockServerHttpRequest;
import org.springframework.mock.web.server.MockServerWebExchange;
import org.springframework.test.util.ReflectionTestUtils;
import reactor.core.publisher.Mono;

import java.util.concurrent.atomic.AtomicReference;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class TurnstileGlobalFilterTest {

    private TurnstileVerifier verifier;
    private TurnstileGlobalFilter filter;
    private final GatewayFilterChain chain = ex -> Mono.empty();

    @BeforeEach
    void setUp() {
        verifier = mock(TurnstileVerifier.class);
        filter = new TurnstileGlobalFilter(verifier);
        ReflectionTestUtils.setField(filter, "enabled", true);
    }

    private MockServerWebExchange post(String path, String token) {
        var req = MockServerHttpRequest.method(HttpMethod.POST, path);
        if (token != null) {
            req.header("X-Turnstile-Token", token);
        }
        return MockServerWebExchange.from(req);
    }

    @Test
    void rejectsProtectedPathWithoutToken() {
        MockServerWebExchange ex = post("/auth/signin", null);
        filter.filter(ex, chain).block();
        assertEquals(HttpStatus.FORBIDDEN, ex.getResponse().getStatusCode());
        verify(verifier, never()).verify(any(), any());
    }

    @Test
    void rejectsWhenVerificationFails() {
        when(verifier.verify(any(), any())).thenReturn(Mono.just(false));
        MockServerWebExchange ex = post("/auth/signup", "bad");
        filter.filter(ex, chain).block();
        assertEquals(HttpStatus.FORBIDDEN, ex.getResponse().getStatusCode());
    }

    @Test
    void forwardsWithoutTheTokenHeaderWhenValid() {
        when(verifier.verify(any(), any())).thenReturn(Mono.just(true));
        AtomicReference<String> seen = new AtomicReference<>("unset");
        GatewayFilterChain capture = e -> {
            seen.set(e.getRequest().getHeaders().getFirst("X-Turnstile-Token"));
            return Mono.empty();
        };
        MockServerWebExchange ex = post("/auth/users/reset-password/send-otp", "good");
        filter.filter(ex, capture).block();
        assertNull(seen.get());
        assertTrue(ex.getResponse().getStatusCode() == null
                || ex.getResponse().getStatusCode().is2xxSuccessful());
    }

    @Test
    void ignoresOtherPathsAndMethods() {
        AtomicReference<Boolean> called = new AtomicReference<>(false);
        GatewayFilterChain capture = e -> {
            called.set(true);
            return Mono.empty();
        };
        filter.filter(post("/api/coins/list", null), capture).block();
        assertTrue(called.get());

        called.set(false);
        var get = MockServerWebExchange.from(MockServerHttpRequest.get("/auth/signin"));
        filter.filter(get, capture).block();
        assertTrue(called.get());
    }
}
