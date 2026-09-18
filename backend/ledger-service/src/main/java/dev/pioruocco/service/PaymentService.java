package dev.pioruocco.service;

import com.stripe.exception.StripeException;
import dev.pioruocco.domain.PaymentMethod;
import dev.pioruocco.model.PaymentOrder;
import dev.pioruocco.response.PaymentResponse;

public interface PaymentService {

    PaymentOrder createOrder(Long userId, Long amount, PaymentMethod paymentMethod);

    PaymentOrder getPaymentOrderById(Long id) throws Exception;

    Boolean ProccedPaymentOrder(PaymentOrder paymentOrder,
                                String paymentId) throws StripeException;

    PaymentResponse createStripePaymentLink(Long Amount,
                                            Long orderId) throws StripeException;
}
