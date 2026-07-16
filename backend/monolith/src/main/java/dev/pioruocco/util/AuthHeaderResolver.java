package dev.pioruocco.util;

/**
 * The frontend authenticates via an httpOnly "jwt" cookie only (withCredentials, no
 * explicit Authorization header) — a pre-existing gap that surfaces once a controller
 * is exercised with cookie-based requests instead of curl calls that always set
 * Authorization manually.
 */
public final class AuthHeaderResolver {

    private AuthHeaderResolver() {
    }

    public static String resolveBearerToken(String authorizationHeader, String jwtCookie) {
        if (authorizationHeader != null && !authorizationHeader.isBlank()) {
            return authorizationHeader;
        }
        if (jwtCookie != null && !jwtCookie.isBlank()) {
            return "Bearer " + jwtCookie;
        }
        return null;
    }
}
