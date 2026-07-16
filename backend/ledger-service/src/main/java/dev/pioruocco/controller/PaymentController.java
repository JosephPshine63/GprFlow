package dev.pioruocco.controller;

import com.razorpay.RazorpayException;
import com.stripe.exception.StripeException;
import dev.pioruocco.domain.PaymentMethod;
import dev.pioruocco.model.PaymentOrder;
import dev.pioruocco.response.PaymentResponse;
import dev.pioruocco.service.PaymentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class PaymentController {

    @Autowired
    private PaymentService paymentService;


    @PostMapping("/api/payment/{paymentMethod}/amount/{amount}")
    public ResponseEntity<PaymentResponse> paymentHandler(
            @PathVariable PaymentMethod paymentMethod,
            @PathVariable Long amount,
            @RequestHeader("X-User-Id") Long userId,
            @RequestHeader("X-User-Full-Name") String fullName,
            @RequestHeader("X-User-Email") String email) throws RazorpayException, StripeException {

        PaymentResponse paymentResponse;

        PaymentOrder order = paymentService.createOrder(userId, amount, paymentMethod);

        if (paymentMethod.equals(PaymentMethod.RAZORPAY)) {
            paymentResponse = paymentService.createRazorpayPaymentLink(userId, fullName, email, amount,
                    order.getId());
        } else {
            paymentResponse = paymentService.createStripePaymentLink(amount, order.getId());
        }

        return new ResponseEntity<>(paymentResponse, HttpStatus.CREATED);
    }


}
