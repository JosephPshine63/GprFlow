package dev.pioruocco.controller;

import dev.pioruocco.domain.WalletTransactionType;
import dev.pioruocco.model.Wallet;
import dev.pioruocco.model.Withdrawal;
import dev.pioruocco.service.WalletService;
import dev.pioruocco.service.WalletTransactionService;
import dev.pioruocco.service.WithdrawalService;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.List;

@RestController
public class WithdrawalController {

    @Autowired
    private WithdrawalService withdrawalService;

    @Autowired
    private WalletService walletService;

    @Autowired
    private WalletTransactionService walletTransactionService;

    // ledger-service has no Spring Security filter chain (Step 2 decision), so this is
    // the only place ROLE_ADMIN is enforced — the monolith got its 403 for free from
    // AppConfig's /api/admin/** matcher, which doesn't exist here.
    private ResponseEntity<?> requireAdmin(String role) {
        if (role == null || Arrays.asList(role.split(",")).stream().noneMatch("ROLE_ADMIN"::equals)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        return null;
    }

    @PostMapping("/api/withdrawal/{amount}")
    @Transactional(rollbackOn = Exception.class)
    public ResponseEntity<?> withdrawalRequest(
            @PathVariable Long amount,
            @RequestHeader("X-User-Id") Long userId) throws Exception {
        if (amount == null || amount <= 0) {
            return ResponseEntity.badRequest().body("Amount must be positive");
        }
        Wallet userWallet = walletService.getUserWallet(userId);

        if (userWallet.getBalance().longValue() < amount) {
            return ResponseEntity.badRequest().body("Insufficient balance");
        }

        Withdrawal withdrawal = withdrawalService.requestWithdrawal(amount, userId);
        walletService.addBalanceToWallet(userWallet, -withdrawal.getAmount());

        walletTransactionService.createTransaction(
                userWallet,
                WalletTransactionType.WITHDRAWAL, null,
                "bank account withdrawal",
                withdrawal.getAmount()
        );

        return new ResponseEntity<>(withdrawal, HttpStatus.OK);
    }

    @PatchMapping("/api/admin/withdrawal/{id}/proceed/{accept}")
    @Transactional(rollbackOn = Exception.class)
    public ResponseEntity<?> proceedWithdrawal(
            @PathVariable Long id,
            @PathVariable boolean accept,
            @RequestHeader(value = "X-User-Role", required = false) String role) throws Exception {
        ResponseEntity<?> forbidden = requireAdmin(role);
        if (forbidden != null) {
            return forbidden;
        }

        Withdrawal withdrawal = withdrawalService.procedWithdrawal(id, accept);

        if (!accept) {
            Wallet requestorWallet = walletService.getUserWallet(withdrawal.getUserId());
            walletService.addBalanceToWallet(requestorWallet, withdrawal.getAmount());
        }

        return new ResponseEntity<>(withdrawal, HttpStatus.OK);
    }

    @GetMapping("/api/withdrawal")
    public ResponseEntity<List<Withdrawal>> getWithdrawalHistory(
            @RequestHeader("X-User-Id") Long userId) throws Exception {
        List<Withdrawal> withdrawal = withdrawalService.getUsersWithdrawalHistory(userId);
        return new ResponseEntity<>(withdrawal, HttpStatus.OK);
    }

    @GetMapping("/api/admin/withdrawal")
    public ResponseEntity<?> getAllWithdrawalRequest(
            @RequestHeader(value = "X-User-Role", required = false) String role) throws Exception {
        ResponseEntity<?> forbidden = requireAdmin(role);
        if (forbidden != null) {
            return forbidden;
        }
        List<Withdrawal> withdrawal = withdrawalService.getAllWithdrawalRequest();
        return new ResponseEntity<>(withdrawal, HttpStatus.OK);
    }
}
