package dev.pioruocco.service;

import com.razorpay.RazorpayException;
import com.stripe.exception.StripeException;
import dev.pioruocco.domain.PaymentMethod;
import dev.pioruocco.model.PaymentOrder;
import dev.pioruocco.model.User;
import dev.pioruocco.response.PaymentResponse;

public interface PaymentService {

    PaymentOrder createOrder(User user, Long amount, PaymentMethod paymentMethod);

    PaymentOrder getPaymentOrderById(Long id) throws Exception;

    Boolean ProccedPaymentOrder(PaymentOrder paymentOrder,
                                String paymentId) throws RazorpayException;

    PaymentResponse createRazorpayPaymentLink(User user,
                                              Long Amount,
                                              Long orderId) throws RazorpayException;

    PaymentResponse createStripePaymentLink(User user, Long Amount,
                                            Long orderId) throws StripeException;
}
