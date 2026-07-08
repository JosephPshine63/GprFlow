package dev.pioruocco.model;

import dev.pioruocco.domain.VerificationType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Table(name = "forgot_password_token")
@Data
public class ForgotPasswordToken {
    @Id
    private String id;

    @OneToOne
    private User user;

    private String otp;

    private VerificationType verificationType;

    private String sendTo;

    @Column(nullable = false)
    private LocalDateTime expiresAt = LocalDateTime.now().plusMinutes(10);
}

