package dev.pioruocco.repository;

import dev.pioruocco.domain.WithdrawalStatus;
import dev.pioruocco.model.Withdrawal;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;

public interface WithdrawalRepository extends JpaRepository<Withdrawal, Long> {
    List<Withdrawal> findByUserId(Long userId);

    List<Withdrawal> findByUserIdAndStatusInAndDateGreaterThanEqual(Long userId, Collection<WithdrawalStatus> statuses, LocalDateTime from);
}
