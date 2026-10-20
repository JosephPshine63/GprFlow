package dev.pioruocco.controller;

import dev.pioruocco.AbstractIntegrationTest;
import dev.pioruocco.domain.OrderStatus;
import dev.pioruocco.domain.OrderType;
import dev.pioruocco.domain.WalletTransactionType;
import dev.pioruocco.domain.WithdrawalStatus;
import dev.pioruocco.model.Coin;
import dev.pioruocco.model.Order;
import dev.pioruocco.model.Wallet;
import dev.pioruocco.model.Withdrawal;
import dev.pioruocco.repository.OrderRepository;
import dev.pioruocco.repository.WalletRepository;
import dev.pioruocco.repository.WithdrawalRepository;
import dev.pioruocco.service.OrderService;
import dev.pioruocco.service.WalletTransactionService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@AutoConfigureMockMvc
class StatsIntegrationTest extends AbstractIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private OrderService orderService;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private WalletRepository walletRepository;

    @Autowired
    private WithdrawalRepository withdrawalRepository;

    @Autowired
    private WalletTransactionService walletTransactionService;

    private long userId;
    private Wallet wallet;
    private Coin coin;

    @BeforeEach
    void setUp() {
        userId = System.nanoTime();

        wallet = new Wallet();
        wallet.setUserId(userId);
        wallet.setBalance(BigDecimal.valueOf(1000));
        wallet = walletRepository.save(wallet);

        coin = new Coin();
        coin.setId("bitcoin-" + System.nanoTime());
        coin.setSymbol("btc");
        coin.setName("Bitcoin");
        coin.setCurrentPrice(100.0);
    }

    @Test
    void emptyAccount_returnsZeroFilledDailySeries() throws Exception {
        mockMvc.perform(get("/api/wallet/stats").param("period", "7d").header("X-User-Id", userId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.bucket").value("DAY"))
                .andExpect(jsonPath("$.tradeCount").value(0))
                .andExpect(jsonPath("$.balance").value(1000.00))
                .andExpect(jsonPath("$.series", hasSize(7)))
                .andExpect(jsonPath("$.series[6].date").value(LocalDate.now().toString()))
                .andExpect(jsonPath("$.series[6].buyVolume").value(0));
    }

    @Test
    void invalidPeriod_isBadRequest() throws Exception {
        mockMvc.perform(get("/api/wallet/stats").param("period", "1y").header("X-User-Id", userId))
                .andExpect(status().isBadRequest());
    }

    @Test
    void trades_areSummedWithRealizedPnl() throws Exception {
        orderService.processOrder(coin, 2.0, OrderType.BUY, userId);
        coin.setCurrentPrice(150.0);
        orderService.processOrder(coin, 1.0, OrderType.SELL, userId);

        mockMvc.perform(get("/api/wallet/stats").param("period", "30d").header("X-User-Id", userId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.tradeCount").value(2))
                .andExpect(jsonPath("$.buyCount").value(1))
                .andExpect(jsonPath("$.sellCount").value(1))
                .andExpect(jsonPath("$.buyVolume").value(200.00))
                .andExpect(jsonPath("$.sellVolume").value(150.00))
                .andExpect(jsonPath("$.realizedPnl").value(50.00))
                .andExpect(jsonPath("$.series", hasSize(30)))
                .andExpect(jsonPath("$.series[29].realizedPnl").value(50.00));
    }

    @Test
    void ordersOutsidePeriodOrNotSuccessful_areIgnored() throws Exception {
        saveOrder(OrderType.BUY, OrderStatus.SUCCESS, LocalDateTime.now().minusDays(40));
        saveOrder(OrderType.BUY, OrderStatus.CANCELLED, LocalDateTime.now());

        mockMvc.perform(get("/api/wallet/stats").param("period", "30d").header("X-User-Id", userId))
                .andExpect(jsonPath("$.tradeCount").value(0))
                .andExpect(jsonPath("$.buyVolume").value(0));

        mockMvc.perform(get("/api/wallet/stats").param("period", "all").header("X-User-Id", userId))
                .andExpect(jsonPath("$.bucket").value("MONTH"))
                .andExpect(jsonPath("$.tradeCount").value(1))
                .andExpect(jsonPath("$.buyVolume").value(10.00));
    }

    @Test
    void declinedWithdrawals_areNotCounted() throws Exception {
        saveWithdrawal(200L, WithdrawalStatus.SUCCESS);
        saveWithdrawal(50L, WithdrawalStatus.PENDING);
        saveWithdrawal(300L, WithdrawalStatus.DECLINE);
        walletTransactionService.createTransaction(wallet, WalletTransactionType.ADD_MONEY, null,
                "wallet top-up", BigDecimal.valueOf(500));
        walletTransactionService.createTransaction(wallet, WalletTransactionType.WALLET_TRANSFER, "1",
                "rent", BigDecimal.valueOf(-75));

        mockMvc.perform(get("/api/wallet/stats").param("period", "90d").header("X-User-Id", userId))
                .andExpect(jsonPath("$.bucket").value("WEEK"))
                .andExpect(jsonPath("$.withdrawals").value(250.00))
                .andExpect(jsonPath("$.deposits").value(500.00))
                .andExpect(jsonPath("$.transfersOut").value(75.00));
    }

    private void saveOrder(OrderType type, OrderStatus status, LocalDateTime timestamp) {
        Order order = new Order();
        order.setUserId(userId);
        order.setOrderType(type);
        order.setStatus(status);
        order.setPrice(BigDecimal.TEN);
        order.setTimestamp(timestamp);
        orderRepository.save(order);
    }

    private void saveWithdrawal(Long amount, WithdrawalStatus status) {
        Withdrawal withdrawal = new Withdrawal();
        withdrawal.setUserId(userId);
        withdrawal.setAmount(amount);
        withdrawal.setStatus(status);
        withdrawal.setDate(LocalDateTime.now());
        withdrawalRepository.save(withdrawal);
    }
}
