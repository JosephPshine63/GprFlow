package dev.pioruocco.service;

import dev.pioruocco.AbstractIntegrationTest;
import dev.pioruocco.domain.OrderStatus;
import dev.pioruocco.domain.OrderType;
import dev.pioruocco.model.Asset;
import dev.pioruocco.model.Coin;
import dev.pioruocco.model.Order;
import dev.pioruocco.model.Wallet;
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
    private WalletRepository walletRepository;

    private long userId;
    private Coin coin;

    @BeforeEach
    void setUp() {
        userId = System.nanoTime();

        Wallet wallet = new Wallet();
        wallet.setUserId(userId);
        wallet.setBalance(BigDecimal.valueOf(1000));
        walletRepository.save(wallet);

        coin = new Coin();
        coin.setId("bitcoin-" + System.nanoTime());
        coin.setSymbol("btc");
        coin.setName("Bitcoin");
        coin.setCurrentPrice(100.0);
    }

    @Test
    void buyAsset_debitsWalletAndCreatesAsset() throws Exception {
        Order order = orderService.processOrder(coin, 2.0, OrderType.BUY, userId);

        assertEquals(OrderStatus.SUCCESS, order.getStatus());

        Wallet walletAfter = walletRepository.findByUserId(userId);
        assertEquals(0, BigDecimal.valueOf(800).compareTo(walletAfter.getBalance()));

        Asset asset = assetService.findAssetByUserIdAndCoinId(userId, coin.getId());
        assertNotNull(asset);
        assertEquals(2.0, asset.getQuantity());
    }

    @Test
    void sellAsset_creditsWalletAndReducesAsset() throws Exception {
        orderService.processOrder(coin, 2.0, OrderType.BUY, userId);

        Order sellOrder = orderService.processOrder(coin, 1.0, OrderType.SELL, userId);
        assertNotNull(sellOrder);

        Wallet walletAfter = walletRepository.findByUserId(userId);
        // 1000 - (2 * 100) + (1 * 100) = 900
        assertEquals(0, BigDecimal.valueOf(900).compareTo(walletAfter.getBalance()));

        Asset asset = assetService.findAssetByUserIdAndCoinId(userId, coin.getId());
        assertNotNull(asset);
        assertEquals(1.0, asset.getQuantity());
    }

    @Test
    void sellAsset_dustResidual_deletesAsset() throws Exception {
        orderService.processOrder(coin, 2.0, OrderType.BUY, userId);

        // Selling everything leaves 0 quantity * price = 0 <= 1 -> dust cleanup deletes the asset
        orderService.processOrder(coin, 2.0, OrderType.SELL, userId);

        Asset asset = assetService.findAssetByUserIdAndCoinId(userId, coin.getId());
        assertNull(asset);
    }

    @Test
    void sellAsset_insufficientQuantity_walletAndAssetUnchanged() throws Exception {
        orderService.processOrder(coin, 1.0, OrderType.BUY, userId);
        Wallet walletBeforeAttempt = walletRepository.findByUserId(userId);
        BigDecimal balanceBeforeAttempt = walletBeforeAttempt.getBalance();

        assertThrows(Exception.class,
                () -> orderService.processOrder(coin, 5.0, OrderType.SELL, userId));

        Wallet walletAfter = walletRepository.findByUserId(userId);
        assertEquals(0, balanceBeforeAttempt.compareTo(walletAfter.getBalance()));

        Asset asset = assetService.findAssetByUserIdAndCoinId(userId, coin.getId());
        assertNotNull(asset);
        assertEquals(1.0, asset.getQuantity());
    }
}
