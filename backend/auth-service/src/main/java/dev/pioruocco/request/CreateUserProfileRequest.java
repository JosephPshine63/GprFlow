package dev.pioruocco.request;

/**
 * Sent to user-service's internal POST /internal/users right after auth-service persists a
 * new credentials row (signup or the seeded admin), so user-service can
 * create the matching profile row (and its initial empty Watchlist) under the same id.
 */
public record CreateUserProfileRequest(Long id, String fullName, String email) {
}
