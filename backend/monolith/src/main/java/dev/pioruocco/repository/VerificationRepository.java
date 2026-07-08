package dev.pioruocco.repository;

import dev.pioruocco.model.VerificationCode;
import org.springframework.data.jpa.repository.JpaRepository;

public interface VerificationRepository extends JpaRepository<VerificationCode, Long> {
    VerificationCode findByUserId(Long userId);
}
