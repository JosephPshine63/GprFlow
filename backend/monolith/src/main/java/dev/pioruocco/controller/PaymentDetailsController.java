package dev.pioruocco.controller;

import dev.pioruocco.exception.UserException;
import dev.pioruocco.model.PaymentDetails;
import dev.pioruocco.model.User;
import dev.pioruocco.service.PaymentDetailsService;
import dev.pioruocco.service.UserService;
import dev.pioruocco.util.AuthHeaderResolver;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class PaymentDetailsController {

    @Autowired
    private UserService userService;

    @Autowired
    private PaymentDetailsService paymentDetailsService;

    @PostMapping("/payment-details")
    public ResponseEntity<PaymentDetails> addPaymentDetails(
            @RequestBody PaymentDetails paymentDetailsRequest,
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @CookieValue(value = "jwt", required = false) String jwtCookie) throws UserException {

        String jwt = AuthHeaderResolver.resolveBearerToken(authHeader, jwtCookie);
        User user = userService.findUserProfileByJwt(jwt);

        PaymentDetails paymentDetails = paymentDetailsService.addPaymentDetails(
                paymentDetailsRequest.getAccountNumber(),
                paymentDetailsRequest.getAccountHolderName(),
                paymentDetailsRequest.getIfsc(),
                paymentDetailsRequest.getBankName(),
                user
        );
        return new ResponseEntity<>(paymentDetails, HttpStatus.CREATED);
    }

    @GetMapping("/payment-details")
    public ResponseEntity<PaymentDetails> getUsersPaymentDetails(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @CookieValue(value = "jwt", required = false) String jwtCookie) throws UserException {

        String jwt = AuthHeaderResolver.resolveBearerToken(authHeader, jwtCookie);
        User user = userService.findUserProfileByJwt(jwt);

        PaymentDetails paymentDetails = paymentDetailsService.getUsersPaymentDetails(user);
        return new ResponseEntity<>(paymentDetails, HttpStatus.CREATED);
    }
}
