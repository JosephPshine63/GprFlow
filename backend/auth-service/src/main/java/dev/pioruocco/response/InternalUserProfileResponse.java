package dev.pioruocco.response;

/**
 * Deserializes user-service's internal GET /internal/users/{id} response — the source of
 * truth for fullName once profile data no longer lives on auth-service's User entity.
 */
public record InternalUserProfileResponse(Long id, String fullName, String email) {
}
