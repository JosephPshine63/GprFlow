package dev.pioruocco.controller;

import dev.pioruocco.model.Coin;
import dev.pioruocco.model.Order;
import dev.pioruocco.request.CreateOrderRequest;
import dev.pioruocco.service.CoinClient;
import dev.pioruocco.service.OrderService;
import dev.pioruocco.service.WalletTransactionService;
import dev.pioruocco.util.AuthHeaderResolver;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
public class OrderController {
    private final OrderService orderService;

    @Autowired
    private CoinClient coinClient;

    @Autowired
    private WalletTransactionService walletTransactionService;

    @Autowired
    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @PostMapping("/pay")
    public ResponseEntity<Order> payOrderPayment(
            @RequestHeader("X-User-Id") Long userId,
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @CookieValue(value = "jwt", required = false) String jwtCookie,
            @RequestBody CreateOrderRequest req

    ) throws Exception {
        String jwt = AuthHeaderResolver.resolveBearerToken(authHeader, jwtCookie);
        Coin coin = coinClient.findById(req.getCoinId(), jwt);


        Order order = orderService.processOrder(coin, req.getQuantity(), req.getOrderType(), userId);
        order.getOrderItem().setCoin(coin);

        return ResponseEntity.ok(order);

    }

    @GetMapping("/{orderId}")
    public ResponseEntity<Order> getOrderById(
            @RequestHeader("X-User-Id") Long userId,
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @CookieValue(value = "jwt", required = false) String jwtCookie,
            @PathVariable Long orderId
    ) throws Exception {
        String jwt = AuthHeaderResolver.resolveBearerToken(authHeader, jwtCookie);
        Order order = orderService.getOrderById(orderId);
        if (order.getUserId().equals(userId)) {
            order.getOrderItem().setCoin(coinClient.findById(order.getOrderItem().getCoinId(), jwt));
            return ResponseEntity.ok(order);
        } else {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
    }

    @GetMapping()
    public ResponseEntity<List<Order>> getAllOrdersForUser(
            @RequestHeader("X-User-Id") Long userId,
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @CookieValue(value = "jwt", required = false) String jwtCookie,
            @RequestParam(required = false) String order_type,
            @RequestParam(required = false) String asset_symbol
    ) throws Exception {
        String jwt = AuthHeaderResolver.resolveBearerToken(authHeader, jwtCookie);
        List<Order> userOrders = orderService.getAllOrdersForUser(userId, order_type, asset_symbol);
        for (Order order : userOrders) {
            order.getOrderItem().setCoin(coinClient.findById(order.getOrderItem().getCoinId(), jwt));
        }
        return ResponseEntity.ok(userOrders);
    }


}
