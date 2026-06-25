package dev.pioruocco.config;

import dev.pioruocco.model.User;
import dev.pioruocco.repository.UserRepository;
import dev.pioruocco.service.WatchlistService;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.AuthorityUtils;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
public class OAuth2LoginSuccessHandler implements AuthenticationSuccessHandler {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private WatchlistService watchlistService;

    @Value("${app.frontend.url:http://localhost:5173}")
    private String frontendUrl;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
                                        HttpServletResponse response,
                                        Authentication authentication) throws IOException, ServletException {
        DefaultOAuth2User oauth2User = (DefaultOAuth2User) authentication.getPrincipal();

        String email = oauth2User.getAttribute("email");
        String fullName = oauth2User.getAttribute("name");
        String picture = oauth2User.getAttribute("picture");
        boolean emailVerified = Boolean.TRUE.equals(oauth2User.getAttribute("email_verified"));

        User user = userRepository.findByEmail(email);
        if (user == null) {
            user = new User();
            user.setEmail(email);
            user.setFullName(fullName);
            user.setPicture(picture);
            user.setVerified(emailVerified);
            userRepository.save(user);
            watchlistService.createWatchList(user);
        }

        UsernamePasswordAuthenticationToken authToken =
                new UsernamePasswordAuthenticationToken(email, null,
                        AuthorityUtils.createAuthorityList(user.getRole().name()));
        String jwt = JwtProvider.generateToken(authToken);

        int maxAge = 7 * 24 * 60 * 60;
        response.addHeader("Set-Cookie",
                "jwt=" + jwt + "; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=" + maxAge);
        response.sendRedirect(frontendUrl + "/login-with-google");
    }
}
