package dev.pioruocco.util;

/**
 * The frontend authenticates via an httpOnly "jwt" cookie only (withCredentials, no
 * explicit Authorization header) — a pre-existing gap that surfaced once these
 * controllers were exercised with cookie-based requests instead of curl calls that
 * always set Authorization manually. CoinClient needs a "Bearer <token>" string
 * regardless of which transport carried it in.
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
