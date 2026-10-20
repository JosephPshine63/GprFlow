package dev.pioruocco.repository;

import dev.pioruocco.domain.WalletTransactionType;
import dev.pioruocco.model.Wallet;
import dev.pioruocco.model.WalletTransaction;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.Collection;
import java.util.List;

public interface WalletTransactionRepository extends JpaRepository<WalletTransaction, Long> {

    List<WalletTransaction> findByWalletOrderByDateDesc(Wallet wallet);

    List<WalletTransaction> findByWalletAndTypeInAndDateGreaterThanEqual(Wallet wallet, Collection<WalletTransactionType> types, LocalDate from);

}
