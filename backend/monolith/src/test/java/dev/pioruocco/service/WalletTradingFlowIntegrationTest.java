package dev.pioruocco.service;

import dev.pioruocco.AbstractIntegrationTest;
import dev.pioruocco.domain.OrderStatus;
import dev.pioruocco.domain.OrderType;
import dev.pioruocco.domain.USER_ROLE;
import dev.pioruocco.model.Asset;
import dev.pioruocco.model.Coin;
import dev.pioruocco.model.Order;
import dev.pioruocco.model.User;
import dev.pioruocco.model.Wallet;
import dev.pioruocco.repository.CoinRepository;
import dev.pioruocco.repository.UserRepository;
import dev.pioruocco.repository.WalletRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertNull;

class WalletTradingFlowIntegrationTest extends AbstractIntegrationTest {

    @Autowired
    private OrderService orderService;

    @Autowired
    private AssetService assetService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private WalletRepository walletRepository;

    @Autowired
    private CoinRepository coinRepository;

    private User user;
    private Coin coin;

    @BeforeEach
    void setUp() {
        user = new User();
        user.setEmail("trader-" + System.nanoTime() + "@example.com");
        user.setFullName("Trader");
        user.setPassword("irrelevant");
        user.setRole(USER_ROLE.ROLE_USER);
        user = userRepository.save(user);

        Wallet wallet = new Wallet();
        wallet.setUser(user);
        wallet.setBalance(BigDecimal.valueOf(1000));
        walletRepository.save(wallet);

        coin = new Coin();
        coin.setId("bitcoin-" + System.nanoTime());
        coin.setSymbol("btc");
        coin.setName("Bitcoin");
        coin.setCurrentPrice(100.0);
        coin = coinRepository.save(coin);
    }

    @Test
    void buyAsset_debitsWalletAndCreatesAsset() throws Exception {
        Order order = orderService.processOrder(coin, 2.0, OrderType.BUY, user);

        assertEquals(OrderStatus.SUCCESS, order.getStatus());

        Wallet walletAfter = walletRepository.findByUserId(user.getId());
        assertEquals(0, BigDecimal.valueOf(800).compareTo(walletAfter.getBalance()));

        Asset asset = assetService.findAssetByUserIdAndCoinId(user.getId(), coin.getId());
        assertNotNull(asset);
        assertEquals(2.0, asset.getQuantity());
    }

    @Test
    void sellAsset_creditsWalletAndReducesAsset() throws Exception {
        orderService.processOrder(coin, 2.0, OrderType.BUY, user);

        Order sellOrder = orderService.processOrder(coin, 1.0, OrderType.SELL, user);
        assertNotNull(sellOrder);

        Wallet walletAfter = walletRepository.findByUserId(user.getId());
        // 1000 - (2 * 100) + (1 * 100) = 900
        assertEquals(0, BigDecimal.valueOf(900).compareTo(walletAfter.getBalance()));

        Asset asset = assetService.findAssetByUserIdAndCoinId(user.getId(), coin.getId());
        assertNotNull(asset);
        assertEquals(1.0, asset.getQuantity());
    }

    @Test
    void sellAsset_dustResidual_deletesAsset() throws Exception {
        orderService.processOrder(coin, 2.0, OrderType.BUY, user);

        // Selling everything leaves 0 quantity * price = 0 <= 1 -> dust cleanup deletes the asset
        orderService.processOrder(coin, 2.0, OrderType.SELL, user);

        Asset asset = assetService.findAssetByUserIdAndCoinId(user.getId(), coin.getId());
        assertNull(asset);
    }

    @Test
    void sellAsset_insufficientQuantity_walletAndAssetUnchanged() throws Exception {
        orderService.processOrder(coin, 1.0, OrderType.BUY, user);
        Wallet walletBeforeAttempt = walletRepository.findByUserId(user.getId());
        BigDecimal balanceBeforeAttempt = walletBeforeAttempt.getBalance();

        assertThrows(Exception.class,
                () -> orderService.processOrder(coin, 5.0, OrderType.SELL, user));

        Wallet walletAfter = walletRepository.findByUserId(user.getId());
        assertEquals(0, balanceBeforeAttempt.compareTo(walletAfter.getBalance()));

        Asset asset = assetService.findAssetByUserIdAndCoinId(user.getId(), coin.getId());
        assertNotNull(asset);
        assertEquals(1.0, asset.getQuantity());
    }
}
