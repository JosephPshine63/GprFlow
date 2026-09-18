package dev.pioruocco.service;

import dev.pioruocco.request.CreateUserProfileRequest;
import dev.pioruocco.response.InternalUserProfileResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

/**
 * Talks to user-service's internal-only endpoints (never routed through the gateway) so that
 * auth-service — which no longer stores fullName — can create the matching profile row on
 * signup/OAuth2-first-login/seed, and look fullName back up before signing a JWT or serving
 * GET /api/users/profile. Same hand-rolled RestTemplate pattern as CoinClient.
 */
@Component
public class UserServiceClient {

    @Value("${user.service.url}")
    private String userServiceUrl;

    private final RestTemplate restTemplate = new RestTemplate();

    public void createProfile(Long id, String fullName, String email) {
        CreateUserProfileRequest request = new CreateUserProfileRequest(id, fullName, email);
        restTemplate.postForEntity(userServiceUrl + "/internal/users", request, Void.class);
    }

    public String findFullNameById(Long id) {
        String url = userServiceUrl + "/internal/users/" + id;
        InternalUserProfileResponse response = restTemplate.getForObject(url, InternalUserProfileResponse.class);
        return response != null ? response.fullName() : null;
    }
}
