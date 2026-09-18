package dev.pioruocco.controller;

import dev.pioruocco.exception.UserException;
import dev.pioruocco.model.User;
import dev.pioruocco.service.UserService;
import dev.pioruocco.service.UserServiceClient;
import dev.pioruocco.util.AuthHeaderResolver;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RestController;

/**
 * GET /api/users/profile stays in auth-service (not user-service) even though "profile" sounds
 * like it belongs there: the frontend (App.jsx, Navbar.jsx, Profile.jsx, Home.jsx,
 * AccountVarificationForm.jsx) reads role, twoFactorAuth.enabled, verified and email from this
 * single response — all credential-side fields that only exist here. fullName is the one field
 * that moved to user-service, so it's fetched via UserServiceClient before returning, keeping
 * the exact same JSON shape the frontend already expects.
 */
@RestController
public class UserProfileController {

    @Autowired
    private UserService userService;

    @Autowired
    private UserServiceClient userServiceClient;

    @GetMapping("/api/users/profile")
    public ResponseEntity<User> getUserProfileHandler(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @CookieValue(value = "jwt", required = false) String jwtCookie) throws UserException {

        String jwt = AuthHeaderResolver.resolveBearerToken(authHeader, jwtCookie);
        User user = userService.findUserProfileByJwt(jwt);
        user.setFullName(userServiceClient.findFullNameById(user.getId()));
        user.setPassword(null);

        return new ResponseEntity<>(user, HttpStatus.ACCEPTED);
    }
}
