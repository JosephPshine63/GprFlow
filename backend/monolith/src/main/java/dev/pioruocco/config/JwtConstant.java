package dev.pioruocco.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class JwtConstant {

    @Value("${jwt.secret}")
    private String secretKey;

    @Value("${jwt.expiration.ms}")
    private long jwtExpirationMs;

    public static final String JWT_HEADER = "Authorization";

    public String getSecretKey() {
        return secretKey;
    }

    public long getJwtExpirationMs() {
        return jwtExpirationMs;
    }
}
