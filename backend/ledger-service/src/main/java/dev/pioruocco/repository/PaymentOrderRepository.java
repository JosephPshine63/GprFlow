package dev.pioruocco.repository;

import dev.pioruocco.domain.PaymentOrderStatus;
import dev.pioruocco.model.PaymentOrder;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PaymentOrderRepository extends JpaRepository<PaymentOrder, Long> {

    boolean existsByPaymentIdAndStatus(String paymentId, PaymentOrderStatus status);
}
