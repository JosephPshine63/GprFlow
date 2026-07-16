package dev.pioruocco.config;

import dev.pioruocco.model.User;
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

    public SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(jwtConstant.getSecretKey().getBytes());
    }

    // userId/fullName/email are sourced from the User entity, not the Authentication,
    // so the gateway can forward identity as trusted headers without a DB lookup (Fase 6).
    public String generateToken(Authentication auth, User user) {
        Collection<? extends GrantedAuthority> authorities = auth.getAuthorities();
        String roles = populateAuthorities(authorities);

        return Jwts.builder()
                .setIssuedAt(new Date())
                .setExpiration(new Date(new Date().getTime() + jwtConstant.getJwtExpirationMs()))
                .claim("email", user.getEmail())
                .claim("authorities", roles)
                .claim("userId", user.getId())
                .claim("fullName", user.getFullName())
                .signWith(getSigningKey())
                .compact();
    }

    public String getEmailFromJwtToken(String jwt) {
        jwt = jwt.substring(7);
        Claims claims = Jwts.parserBuilder().setSigningKey(getSigningKey()).build().parseClaimsJws(jwt).getBody();
        return String.valueOf(claims.get("email"));
    }

    private static String populateAuthorities(Collection<? extends GrantedAuthority> collection) {
        Set<String> auths = new HashSet<>();
        for (GrantedAuthority authority : collection) {
            auths.add(authority.getAuthority());
        }
        return String.join(",", auths);
    }
}
