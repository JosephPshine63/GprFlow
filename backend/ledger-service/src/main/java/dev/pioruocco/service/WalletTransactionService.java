package dev.pioruocco.service;

import dev.pioruocco.domain.WalletTransactionType;
import dev.pioruocco.model.Wallet;
import dev.pioruocco.model.WalletTransaction;

import java.math.BigDecimal;
import java.util.List;

public interface WalletTransactionService {
    WalletTransaction createTransaction(Wallet wallet,
                                        WalletTransactionType type,
                                        String transferId,
                                        String purpose,
                                        BigDecimal amount
    );

    List<WalletTransaction> getTransactions(Wallet wallet, WalletTransactionType type);

}
