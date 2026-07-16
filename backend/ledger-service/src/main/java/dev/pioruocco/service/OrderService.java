package dev.pioruocco.service;

import dev.pioruocco.domain.OrderType;
import dev.pioruocco.model.Coin;
import dev.pioruocco.model.Order;
import dev.pioruocco.model.OrderItem;

import java.util.List;

public interface OrderService {

    Order createOrder(Long userId, OrderItem orderItem, OrderType orderType);

    Order getOrderById(Long orderId);

    List<Order> getAllOrdersForUser(Long userId, String orderType, String assetSymbol);

    void cancelOrder(Long orderId);

    Order processOrder(Coin coin, double quantity, OrderType orderType, Long userId) throws Exception;


}
