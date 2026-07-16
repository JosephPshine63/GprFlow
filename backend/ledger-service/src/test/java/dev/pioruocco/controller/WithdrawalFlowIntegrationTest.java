package dev.pioruocco.controller;

import dev.pioruocco.AbstractIntegrationTest;
import dev.pioruocco.domain.WithdrawalStatus;
import dev.pioruocco.model.Wallet;
import dev.pioruocco.model.Withdrawal;
import dev.pioruocco.repository.WalletRepository;
import dev.pioruocco.repository.WithdrawalRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
class WithdrawalFlowIntegrationTest extends AbstractIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private WalletRepository walletRepository;

    @Autowired
    private WithdrawalRepository withdrawalRepository;

    private long userId;

    @BeforeEach
    void setUp() {
        userId = System.nanoTime();

        Wallet wallet = new Wallet();
        wallet.setUserId(userId);
        wallet.setBalance(BigDecimal.valueOf(500));
        walletRepository.save(wallet);
    }

    @Test
    void withdrawalRequest_debitsWalletExactlyOnce() throws Exception {
        mockMvc.perform(post("/api/withdrawal/200")
                        .header("X-User-Id", userId))
                .andExpect(status().isOk());

        Wallet walletAfter = walletRepository.findByUserId(userId);
        assertEquals(0, BigDecimal.valueOf(300).compareTo(walletAfter.getBalance()));

        List<Withdrawal> history = withdrawalRepository.findByUserId(userId);
        assertEquals(1, history.size());
        assertEquals(WithdrawalStatus.PENDING, history.get(0).getStatus());
    }

    @Test
    void withdrawalRequest_insufficientBalance_rejectedAndWalletUnchanged() throws Exception {
        mockMvc.perform(post("/api/withdrawal/1000")
                        .header("X-User-Id", userId))
                .andExpect(status().isBadRequest());

        Wallet walletAfter = walletRepository.findByUserId(userId);
        assertEquals(0, BigDecimal.valueOf(500).compareTo(walletAfter.getBalance()));
        assertTrue(withdrawalRepository.findByUserId(userId).isEmpty());
    }

    @Test
    void proceedWithdrawal_decline_refundsWallet() throws Exception {
        mockMvc.perform(post("/api/withdrawal/200")
                        .header("X-User-Id", userId))
                .andExpect(status().isOk());

        Long withdrawalId = withdrawalRepository.findByUserId(userId).get(0).getId();

        mockMvc.perform(patch("/api/admin/withdrawal/{id}/proceed/{accept}", withdrawalId, false)
                        .header("X-User-Role", "ROLE_ADMIN"))
                .andExpect(status().isOk());

        Wallet walletAfter = walletRepository.findByUserId(userId);
        assertEquals(0, BigDecimal.valueOf(500).compareTo(walletAfter.getBalance()));

        Withdrawal withdrawal = withdrawalRepository.findById(withdrawalId).orElseThrow();
        assertEquals(WithdrawalStatus.DECLINE, withdrawal.getStatus());
    }

    @Test
    void proceedWithdrawal_accept_doesNotDoubleDebit() throws Exception {
        mockMvc.perform(post("/api/withdrawal/200")
                        .header("X-User-Id", userId))
                .andExpect(status().isOk());

        Long withdrawalId = withdrawalRepository.findByUserId(userId).get(0).getId();

        mockMvc.perform(patch("/api/admin/withdrawal/{id}/proceed/{accept}", withdrawalId, true)
                        .header("X-User-Role", "ROLE_ADMIN"))
                .andExpect(status().isOk());

        Wallet walletAfter = walletRepository.findByUserId(userId);
        assertEquals(0, BigDecimal.valueOf(300).compareTo(walletAfter.getBalance()));

        Withdrawal withdrawal = withdrawalRepository.findById(withdrawalId).orElseThrow();
        assertEquals(WithdrawalStatus.SUCCESS, withdrawal.getStatus());
    }

    @Test
    void nonAdmin_cannotProceedWithdrawal() throws Exception {
        mockMvc.perform(post("/api/withdrawal/200")
                        .header("X-User-Id", userId))
                .andExpect(status().isOk());

        Long withdrawalId = withdrawalRepository.findByUserId(userId).get(0).getId();

        mockMvc.perform(patch("/api/admin/withdrawal/{id}/proceed/{accept}", withdrawalId, true)
                        .header("X-User-Role", "ROLE_USER"))
                .andExpect(status().isForbidden());
    }
}
