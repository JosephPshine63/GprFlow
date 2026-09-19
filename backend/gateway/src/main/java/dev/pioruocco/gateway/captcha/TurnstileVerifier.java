package dev.pioruocco.gateway.captcha;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.BodyInserters;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.time.Duration;
import java.util.Map;

/** Server-side check of a Cloudflare Turnstile token (siteverify). */
@Component
public class TurnstileVerifier {

    private final WebClient client = WebClient.create();

    @Value("${turnstile.secret}")
    private String secret;

    @Value("${turnstile.verify-url}")
    private String verifyUrl;

    // Any failure (timeout, Cloudflare down, malformed answer) counts as not verified.
    public Mono<Boolean> verify(String token, String remoteIp) {
        var form = BodyInserters.fromFormData("secret", secret)
                .with("response", token)
                .with("remoteip", remoteIp);
        return client.post()
                .uri(verifyUrl)
                .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                .body(form)
                .retrieve()
                .bodyToMono(Map.class)
                .map(body -> Boolean.TRUE.equals(body.get("success")))
                .timeout(Duration.ofSeconds(3))
                .onErrorReturn(false);
    }
}
