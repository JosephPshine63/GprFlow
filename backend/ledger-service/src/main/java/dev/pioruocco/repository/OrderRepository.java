package dev.pioruocco.repository;

import dev.pioruocco.domain.OrderStatus;
import dev.pioruocco.model.Order;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Long> {

    List<Order> findByUserId(Long userId);

    List<Order> findByUserIdAndStatusAndTimestampGreaterThanEqual(Long userId, OrderStatus status, LocalDateTime from);
}
