package dev.pioruocco.response;

/**
 * Response body for GET /internal/users/{id}, consumed by auth-service's UserServiceClient
 * before signing a JWT or serving GET /api/users/profile.
 */
public record InternalUserProfileResponse(Long id, String fullName, String email) {
}
