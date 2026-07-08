package dev.pioruocco.controller;

import dev.pioruocco.AbstractIntegrationTest;
import dev.pioruocco.config.JwtProvider;
import dev.pioruocco.domain.USER_ROLE;
import dev.pioruocco.domain.WithdrawalStatus;
import dev.pioruocco.model.User;
import dev.pioruocco.model.Wallet;
import dev.pioruocco.model.Withdrawal;
import dev.pioruocco.repository.UserRepository;
import dev.pioruocco.repository.WalletRepository;
import dev.pioruocco.repository.WithdrawalRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
class WithdrawalFlowIntegrationTest extends AbstractIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JwtProvider jwtProvider;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private WalletRepository walletRepository;

    @Autowired
    private WithdrawalRepository withdrawalRepository;

    private User user;
    private User admin;
    private String userToken;
    private String adminToken;

    @BeforeEach
    void setUp() {
        user = new User();
        user.setEmail("withdrawer-" + System.nanoTime() + "@example.com");
        user.setFullName("Withdrawer");
        user.setPassword("irrelevant");
        user.setRole(USER_ROLE.ROLE_USER);
        user = userRepository.save(user);

        admin = new User();
        admin.setEmail("admin-" + System.nanoTime() + "@example.com");
        admin.setFullName("Admin");
        admin.setPassword("irrelevant");
        admin.setRole(USER_ROLE.ROLE_ADMIN);
        admin = userRepository.save(admin);

        Wallet wallet = new Wallet();
        wallet.setUser(user);
        wallet.setBalance(BigDecimal.valueOf(500));
        walletRepository.save(wallet);

        userToken = tokenFor(user.getEmail(), "ROLE_USER");
        adminToken = tokenFor(admin.getEmail(), "ROLE_ADMIN");
    }

    private String tokenFor(String email, String role) {
        var auth = new UsernamePasswordAuthenticationToken(
                email, null, List.of(new SimpleGrantedAuthority(role)));
        return jwtProvider.generateToken(auth);
    }

    @Test
    void withdrawalRequest_debitsWalletExactlyOnce() throws Exception {
        mockMvc.perform(post("/api/withdrawal/200")
                        .header("Authorization", "Bearer " + userToken))
                .andExpect(status().isOk());

        Wallet walletAfter = walletRepository.findByUserId(user.getId());
        assertEquals(0, BigDecimal.valueOf(300).compareTo(walletAfter.getBalance()));

        List<Withdrawal> history = withdrawalRepository.findByUserId(user.getId());
        assertEquals(1, history.size());
        assertEquals(WithdrawalStatus.PENDING, history.get(0).getStatus());
    }

    @Test
    void withdrawalRequest_insufficientBalance_rejectedAndWalletUnchanged() throws Exception {
        mockMvc.perform(post("/api/withdrawal/1000")
                        .header("Authorization", "Bearer " + userToken))
                .andExpect(status().isBadRequest());

        Wallet walletAfter = walletRepository.findByUserId(user.getId());
        assertEquals(0, BigDecimal.valueOf(500).compareTo(walletAfter.getBalance()));
        assertTrue(withdrawalRepository.findByUserId(user.getId()).isEmpty());
    }

    @Test
    void proceedWithdrawal_decline_refundsWallet() throws Exception {
        mockMvc.perform(post("/api/withdrawal/200")
                        .header("Authorization", "Bearer " + userToken))
                .andExpect(status().isOk());

        Long withdrawalId = withdrawalRepository.findByUserId(user.getId()).get(0).getId();

        mockMvc.perform(patch("/api/admin/withdrawal/{id}/proceed/{accept}", withdrawalId, false)
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk());

        Wallet walletAfter = walletRepository.findByUserId(user.getId());
        assertEquals(0, BigDecimal.valueOf(500).compareTo(walletAfter.getBalance()));

        Withdrawal withdrawal = withdrawalRepository.findById(withdrawalId).orElseThrow();
        assertEquals(WithdrawalStatus.DECLINE, withdrawal.getStatus());
    }

    @Test
    void proceedWithdrawal_accept_doesNotDoubleDebit() throws Exception {
        mockMvc.perform(post("/api/withdrawal/200")
                        .header("Authorization", "Bearer " + userToken))
                .andExpect(status().isOk());

        Long withdrawalId = withdrawalRepository.findByUserId(user.getId()).get(0).getId();

        mockMvc.perform(patch("/api/admin/withdrawal/{id}/proceed/{accept}", withdrawalId, true)
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk());

        Wallet walletAfter = walletRepository.findByUserId(user.getId());
        assertEquals(0, BigDecimal.valueOf(300).compareTo(walletAfter.getBalance()));

        Withdrawal withdrawal = withdrawalRepository.findById(withdrawalId).orElseThrow();
        assertEquals(WithdrawalStatus.SUCCESS, withdrawal.getStatus());
    }

    @Test
    void nonAdmin_cannotProceedWithdrawal() throws Exception {
        mockMvc.perform(post("/api/withdrawal/200")
                        .header("Authorization", "Bearer " + userToken))
                .andExpect(status().isOk());

        Long withdrawalId = withdrawalRepository.findByUserId(user.getId()).get(0).getId();

        mockMvc.perform(patch("/api/admin/withdrawal/{id}/proceed/{accept}", withdrawalId, true)
                        .header("Authorization", "Bearer " + userToken))
                .andExpect(status().isForbidden());
    }
}
