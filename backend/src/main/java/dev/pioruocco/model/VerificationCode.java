package dev.pioruocco.model;

import dev.pioruocco.domain.VerificationType;
import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Table(name = "verification_code")
@Data
public class VerificationCode {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    private String otp;

    @OneToOne
    private User user;

    private String email;

    private String mobile;

    private VerificationType verificationType;

    @Column(nullable = false)
    private LocalDateTime expiresAt = LocalDateTime.now().plusMinutes(10);

}

