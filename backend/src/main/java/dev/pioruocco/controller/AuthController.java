package dev.pioruocco.controller;


import dev.pioruocco.config.JwtProvider;
import dev.pioruocco.exception.UserException;
import dev.pioruocco.model.TwoFactorOTP;
import dev.pioruocco.model.User;
import dev.pioruocco.repository.UserRepository;
import dev.pioruocco.request.LoginRequest;
import dev.pioruocco.request.SignupRequest;
import jakarta.validation.Valid;
import dev.pioruocco.response.AuthResponse;
import dev.pioruocco.service.*;
import dev.pioruocco.utils.OtpUtils;
import jakarta.mail.MessagingException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;


@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    private UserRepository userRepository;
    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private CustomeUserServiceImplementation customUserDetails;

    @Autowired
    private UserService userService;

    @Autowired
    private WatchlistService watchlistService;

    @Autowired
    private WalletService walletService;

    @Autowired
    private VerificationService verificationService;

    @Autowired
    private TwoFactorOtpService twoFactorOtpService;

    @Autowired
    private EmailService emailService;


    private static final int JWT_COOKIE_MAX_AGE = 7 * 24 * 60 * 60;

    private void setJwtCookie(HttpServletResponse response, String jwt) {
        response.addHeader("Set-Cookie",
                "jwt=" + jwt + "; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=" + JWT_COOKIE_MAX_AGE);
    }

    @PostMapping("/signup")
    public ResponseEntity<AuthResponse> createUserHandler(
            @Valid @RequestBody SignupRequest user,
            HttpServletResponse response) throws UserException {

        String email = user.getEmail();
        String password = user.getPassword();
        String fullName = user.getFullName();
        String mobile = user.getMobile();


        User isEmailExist = userRepository.findByEmail(email);

        if (isEmailExist != null) {
            throw new UserException("Email Is Already Used With Another Account");
        }

        User createdUser = new User();
        createdUser.setEmail(email);
        createdUser.setFullName(fullName);
        createdUser.setMobile(mobile);
        createdUser.setPassword(passwordEncoder.encode(password));

        User savedUser = userRepository.save(createdUser);

        watchlistService.createWatchList(savedUser);

        Authentication authentication = new UsernamePasswordAuthenticationToken(email, password);
        SecurityContextHolder.getContext().setAuthentication(authentication);

        String token = JwtProvider.generateToken(authentication);
        setJwtCookie(response, token);

        AuthResponse authResponse = new AuthResponse();
        authResponse.setMessage("Register Success");

        return new ResponseEntity<>(authResponse, HttpStatus.OK);
    }

    @PostMapping("/signin")
    public ResponseEntity<AuthResponse> signing(
            @RequestBody LoginRequest loginRequest,
            HttpServletResponse response) throws UserException, MessagingException {

        String username = loginRequest.getEmail();
        String password = loginRequest.getPassword();

        Authentication authentication = authenticate(username, password);

        User user = userService.findUserByEmail(username);

        SecurityContextHolder.getContext().setAuthentication(authentication);

        String token = JwtProvider.generateToken(authentication);

        if (user.getTwoFactorAuth().isEnabled()) {
            AuthResponse authResponse = new AuthResponse();
            authResponse.setMessage("Two factor authentication enabled");
            authResponse.setTwoFactorAuthEnabled(true);

            String otp = OtpUtils.generateOTP();

            TwoFactorOTP oldTwoFactorOTP = twoFactorOtpService.findByUser(user.getId());
            if (oldTwoFactorOTP != null) {
                twoFactorOtpService.deleteTwoFactorOtp(oldTwoFactorOTP);
            }

            TwoFactorOTP twoFactorOTP = twoFactorOtpService.createTwoFactorOtp(user, otp, token);

            emailService.sendVerificationOtpEmail(user.getEmail(), otp);

            authResponse.setSession(twoFactorOTP.getId());
            return new ResponseEntity<>(authResponse, HttpStatus.OK);
        }

        setJwtCookie(response, token);

        AuthResponse authResponse = new AuthResponse();
        authResponse.setMessage("Login Success");

        return new ResponseEntity<>(authResponse, HttpStatus.OK);
    }

    private Authentication authenticate(String username, String password) {
        UserDetails userDetails = customUserDetails.loadUserByUsername(username);

        if (userDetails == null) {
            throw new BadCredentialsException("Invalid username or password");
        }
        if (!passwordEncoder.matches(password, userDetails.getPassword())) {
            throw new BadCredentialsException("Invalid username or password");
        }
        return new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
    }


    @GetMapping("/login/google")
    public void redirectToGoogle(HttpServletRequest request, HttpServletResponse response)
            throws IOException {
        // Redirect to the Google OAuth2 authorization URI
        response.sendRedirect("/login/oauth2/authorization/google");
    }

    @PostMapping("/two-factor/otp/{otp}")
    public ResponseEntity<AuthResponse> verifySigningOtp(
            @PathVariable String otp,
            @RequestParam String id,
            HttpServletResponse response
    ) throws Exception {

        TwoFactorOTP twoFactorOTP = twoFactorOtpService.findById(id);

        if (twoFactorOtpService.verifyTwoFactorOtp(twoFactorOTP, otp)) {
            setJwtCookie(response, twoFactorOTP.getJwt());
            AuthResponse authResponse = new AuthResponse();
            authResponse.setMessage("Two factor authentication verified");
            authResponse.setTwoFactorAuthEnabled(true);
            return new ResponseEntity<>(authResponse, HttpStatus.OK);
        }
        throw new Exception("invalid otp");
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(HttpServletResponse response) {
        response.addHeader("Set-Cookie",
                "jwt=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0");
        return ResponseEntity.ok().build();
    }


}
