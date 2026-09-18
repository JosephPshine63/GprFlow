package dev.pioruocco.service;

import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import com.stripe.model.checkout.Session;
import com.stripe.param.checkout.SessionCreateParams;
import dev.pioruocco.domain.PaymentMethod;
import dev.pioruocco.domain.PaymentOrderStatus;
import dev.pioruocco.model.PaymentOrder;
import dev.pioruocco.repository.PaymentOrderRepository;
import dev.pioruocco.response.PaymentResponse;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class PaymentServiceImpl implements PaymentService {

    @Value("${stripe.api.key}")
    private String stripeSecretKey;

    @Value("${app.frontend.url}")
    private String frontendUrl;

    @Autowired
    private PaymentOrderRepository paymentOrderRepository;


    @Override
    public PaymentOrder createOrder(Long userId, Long amount, PaymentMethod paymentMethod) {
        PaymentOrder order = new PaymentOrder();
        order.setUserId(userId);
        order.setAmount(amount);
        order.setPaymentMethod(paymentMethod);
        return paymentOrderRepository.save(order);
    }

    @Override
    public PaymentOrder getPaymentOrderById(Long id) throws Exception {
        Optional<PaymentOrder> optionalPaymentOrder = paymentOrderRepository.findById(id);
        if (optionalPaymentOrder.isEmpty()) {
            throw new Exception("payment order not found with id " + id);
        }
        return optionalPaymentOrder.get();
    }

    @Override
    @Transactional(rollbackOn = Exception.class)
    public Boolean ProccedPaymentOrder(PaymentOrder paymentOrder, String paymentId) throws StripeException {
        if (!paymentOrder.getStatus().equals(PaymentOrderStatus.PENDING)) {
            return false;
        }

        // Same gateway paymentId cannot fulfill two different PaymentOrder rows —
        // without this a single real payment could be replayed to credit any
        // number of pending orders of the same amount.
        if (paymentOrderRepository.existsByPaymentIdAndStatus(paymentId, PaymentOrderStatus.SUCCESS)) {
            paymentOrder.setStatus(PaymentOrderStatus.FAILED);
            paymentOrderRepository.save(paymentOrder);
            return false;
        }

        // Gateway amounts are in the smallest currency unit (paise/cents); paymentOrder.amount
        // is whole units, matching how the payment link was created (amount * 100 below).
        long expectedMinorUnits = paymentOrder.getAmount() * 100;

        if (paymentOrder.getPaymentMethod().equals(PaymentMethod.STRIPE)) {
            Stripe.apiKey = stripeSecretKey;
            com.stripe.model.checkout.Session session =
                com.stripe.model.checkout.Session.retrieve(paymentId);
            Long amountTotal = session.getAmountTotal();
            if ("paid".equals(session.getPaymentStatus()) && amountTotal != null && amountTotal == expectedMinorUnits) {
                paymentOrder.setStatus(PaymentOrderStatus.SUCCESS);
                paymentOrder.setPaymentId(paymentId);
                paymentOrderRepository.save(paymentOrder);
                return true;
            }
            paymentOrder.setStatus(PaymentOrderStatus.FAILED);
            paymentOrderRepository.save(paymentOrder);
            return false;
        }

        return false;
    }

    @Override
    public PaymentResponse createStripePaymentLink(Long amount, Long orderId) throws StripeException {
        Stripe.apiKey = stripeSecretKey;

        SessionCreateParams params = SessionCreateParams.builder()
                .addPaymentMethodType(SessionCreateParams.PaymentMethodType.CARD)
                .setMode(SessionCreateParams.Mode.PAYMENT)
                .setSuccessUrl(frontendUrl + "/wallet?order_id=" + orderId + "&session_id={CHECKOUT_SESSION_ID}")
                .setCancelUrl(frontendUrl + "/payment/cancel")
                .addLineItem(SessionCreateParams.LineItem.builder()
                        .setQuantity(1L)
                        .setPriceData(SessionCreateParams.LineItem.PriceData.builder()
                                .setCurrency("usd")
                                .setUnitAmount(amount * 100)
                                .setProductData(SessionCreateParams
                                        .LineItem
                                        .PriceData
                                        .ProductData
                                        .builder()
                                        .setName("Top up wallet")
                                        .build()
                                ).build()
                        ).build()
                ).build();

        Session session = Session.create(params);

        PaymentResponse res = new PaymentResponse();
        res.setPayment_url(session.getUrl());

        return res;
    }
}
