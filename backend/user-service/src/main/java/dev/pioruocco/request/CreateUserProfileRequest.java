package dev.pioruocco.request;

/**
 * Sent by auth-service to POST /internal/users right after it persists a new credentials row
 * (signup, OAuth2 first login, or the seeded admin). id is explicit — never auto-generated here
 * — so the profile row shares the same primary key as auth-service's User row.
 */
public record CreateUserProfileRequest(Long id, String fullName, String email) {
}
