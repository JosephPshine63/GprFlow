package dev.pioruocco.service;

import dev.pioruocco.AbstractIntegrationTest;
import dev.pioruocco.domain.USER_ROLE;
import dev.pioruocco.model.User;
import dev.pioruocco.model.Wallet;
import dev.pioruocco.repository.UserRepository;
import dev.pioruocco.repository.WalletRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.orm.ObjectOptimisticLockingFailureException;

import java.math.BigDecimal;
import java.util.List;
import java.util.concurrent.Callable;
import java.util.concurrent.CyclicBarrier;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

/**
 * Validates the Fase 0 fix: Wallet carries @Version, so two concurrent updates on the
 * same row cannot silently overwrite each other. Exactly one of two racing top-ups must
 * win; the other must surface an optimistic-locking failure instead of a lost update.
 */
class WalletConcurrencyIntegrationTest extends AbstractIntegrationTest {

    @Autowired
    private WalletService walletService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private WalletRepository walletRepository;

    private Long walletId;

    @BeforeEach
    void setUp() {
        User user = new User();
        user.setEmail("concurrent-" + System.nanoTime() + "@example.com");
        user.setFullName("Concurrent Topper-Upper");
        user.setPassword("irrelevant");
        user.setRole(USER_ROLE.ROLE_USER);
        user = userRepository.save(user);

        Wallet wallet = new Wallet();
        wallet.setUser(user);
        wallet.setBalance(BigDecimal.ZERO);
        walletId = walletRepository.save(wallet).getId();
    }

    @Test
    void concurrentTopUps_doNotLoseAnUpdate() throws Exception {
        int threadCount = 2;
        long amountPerThread = 100L;

        ExecutorService pool = Executors.newFixedThreadPool(threadCount);
        CyclicBarrier bothReadBarrier = new CyclicBarrier(threadCount);

        Callable<Boolean> task = () -> {
            Wallet wallet = walletService.findWalletById(walletId);
            bothReadBarrier.await(5, TimeUnit.SECONDS);
            try {
                walletService.addBalanceToWallet(wallet, amountPerThread);
                return true;
            } catch (ObjectOptimisticLockingFailureException e) {
                return false;
            }
        };

        List<Future<Boolean>> futures = IntStream.range(0, threadCount)
                .mapToObj(i -> pool.submit(task))
                .collect(Collectors.toList());

        long successCount = 0;
        for (Future<Boolean> future : futures) {
            if (future.get(10, TimeUnit.SECONDS)) {
                successCount++;
            }
        }
        pool.shutdown();

        assertEquals(1, successCount, "exactly one of the two racing top-ups should win");

        Wallet finalWallet = walletRepository.findById(walletId).orElseThrow();
        assertTrue(BigDecimal.valueOf(amountPerThread).compareTo(finalWallet.getBalance()) == 0,
                "final balance must reflect only the winning update, not both or neither");
    }
}
