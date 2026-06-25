package dev.pioruocco.config;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Collection;
import java.util.Date;
import java.util.HashSet;
import java.util.Set;

@Component
public class JwtProvider {

    @Autowired
    private JwtConstant jwtConstant;

    private static JwtProvider instance;

    @Autowired
    private void setInstance(JwtProvider self) {
        instance = self;
    }

    private SecretKey getKey() {
        return Keys.hmacShaKeyFor(jwtConstant.getSecretKey().getBytes());
    }

    public static String generateToken(Authentication auth) {
        return instance.generate(auth);
    }

    private String generate(Authentication auth) {
        Collection<? extends GrantedAuthority> authorities = auth.getAuthorities();
        String roles = populateAuthorities(authorities);

        return Jwts.builder()
                .setIssuedAt(new Date())
                .setExpiration(new Date(new Date().getTime() + 86400000))
                .claim("email", auth.getName())
                .claim("authorities", roles)
                .signWith(getKey())
                .compact();
    }

    public static String getEmailFromJwtToken(String jwt) {
        return instance.extractEmail(jwt);
    }

    private String extractEmail(String jwt) {
        jwt = jwt.substring(7);
        Claims claims = Jwts.parserBuilder().setSigningKey(getKey()).build().parseClaimsJws(jwt).getBody();
        return String.valueOf(claims.get("email"));
    }

    public static SecretKey getSigningKey() {
        return instance.getKey();
    }

    private static String populateAuthorities(Collection<? extends GrantedAuthority> collection) {
        Set<String> auths = new HashSet<>();
        for (GrantedAuthority authority : collection) {
            auths.add(authority.getAuthority());
        }
        return String.join(",", auths);
    }
}
