package dev.pioruocco.controller;

import dev.pioruocco.domain.WalletTransactionType;
import dev.pioruocco.model.*;
import dev.pioruocco.response.PaymentResponse;
import dev.pioruocco.service.*;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController

public class WalletController {

    @Autowired
    private WalletService walleteService;

    @Autowired
    private WalletTransactionService walletTransactionService;

    @Autowired
    private PaymentService paymentService;


    @GetMapping("/api/wallet")
    public ResponseEntity<?> getUserWallet(@RequestHeader("X-User-Id") Long userId) throws Exception {
        Wallet wallet = walleteService.getUserWallet(userId);

        return new ResponseEntity<>(wallet, HttpStatus.OK);
    }

    @GetMapping("/api/wallet/transactions")
    public ResponseEntity<List<WalletTransaction>> getWalletTransaction(
            @RequestHeader("X-User-Id") Long userId) throws Exception {
        Wallet wallet = walleteService.getUserWallet(userId);

        List<WalletTransaction> transactions = walletTransactionService.getTransactions(wallet, null);

        return new ResponseEntity<>(transactions, HttpStatus.OK);
    }

    @PutMapping("/api/wallet/deposit")
    @Transactional(rollbackOn = Exception.class)
    public ResponseEntity<Wallet> addMoneyToWallet(
            @RequestHeader("X-User-Id") Long userId,
            @RequestParam(name = "order_id") Long orderId,
            @RequestParam(name = "payment_id") String paymentId
    ) throws Exception {
        Wallet wallet = walleteService.getUserWallet(userId);

        PaymentOrder order = paymentService.getPaymentOrderById(orderId);
        if (!order.getUserId().equals(userId)) {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }

        Boolean status = paymentService.ProccedPaymentOrder(order, paymentId);
        PaymentResponse res = new PaymentResponse();
        res.setPayment_url("deposite success");

        if (status) {
            wallet = walleteService.addBalanceToWallet(wallet, order.getAmount());
        }


        return new ResponseEntity<>(wallet, HttpStatus.OK);

    }

    @PutMapping("/api/wallet/{walletId}/transfer")
    public ResponseEntity<?> walletToWalletTransfer(@RequestHeader("X-User-Id") Long senderId,
                                                         @PathVariable Long walletId,
                                                         @RequestBody WalletTransaction req
    ) throws Exception {
        if (req.getAmount() == null || req.getAmount().compareTo(BigDecimal.ZERO) <= 0) {
            return ResponseEntity.badRequest().body("Amount must be positive");
        }

        Wallet reciverWallet = walleteService.findWalletById(walletId);

        Long transferAmount = req.getAmount().longValueExact();
        Wallet wallet = walleteService.walletToWalletTransfer(senderId, reciverWallet, transferAmount);
        WalletTransaction walletTransaction = walletTransactionService.createTransaction(
                wallet,
                WalletTransactionType.WALLET_TRANSFER, reciverWallet.getId().toString(),
                req.getPurpose(),
                req.getAmount().negate()
        );

        return new ResponseEntity<>(wallet, HttpStatus.OK);

    }


}
