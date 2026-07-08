package dev.pioruocco.service;

import dev.pioruocco.domain.WalletTransactionType;
import dev.pioruocco.model.Wallet;
import dev.pioruocco.model.WalletTransaction;

import java.util.List;

public interface WalletTransactionService {
    WalletTransaction createTransaction(Wallet wallet,
                                        WalletTransactionType type,
                                        String transferId,
                                        String purpose,
                                        Long amount
    );

    List<WalletTransaction> getTransactions(Wallet wallet, WalletTransactionType type);

}
