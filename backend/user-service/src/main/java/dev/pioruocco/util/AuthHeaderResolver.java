package dev.pioruocco.util;

/**
 * Not used for identity here — the gateway already injects X-User-Id/X-User-Full-Name/
 * X-User-Email for that (see WatchlistController/PaymentDetailsController). This is only used
 * to recover the raw bearer token (from cookie or header) to forward to coin-service via
 * CoinClient, which still validates JWTs independently. Same use ledger-service already makes
 * of this exact utility.
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
