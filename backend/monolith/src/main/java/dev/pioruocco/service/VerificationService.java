package dev.pioruocco.service;

import dev.pioruocco.domain.VerificationType;
import dev.pioruocco.model.User;
import dev.pioruocco.model.VerificationCode;

public interface VerificationService {
    VerificationCode sendVerificationOTP(User user, VerificationType verificationType);

    VerificationCode findVerificationById(Long id) throws Exception;

    VerificationCode findUsersVerification(User user) throws Exception;

    Boolean VerifyOtp(String opt, VerificationCode verificationCode) throws Exception;

    void deleteVerification(VerificationCode verificationCode);
}
