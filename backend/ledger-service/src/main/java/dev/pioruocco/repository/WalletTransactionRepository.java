package dev.pioruocco.repository;

import dev.pioruocco.model.Wallet;
import dev.pioruocco.model.WalletTransaction;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface WalletTransactionRepository extends JpaRepository<WalletTransaction, Long> {

    List<WalletTransaction> findByWalletOrderByDateDesc(Wallet wallet);

}
