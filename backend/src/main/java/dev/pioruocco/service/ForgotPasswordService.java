package dev.pioruocco.service;

import dev.pioruocco.domain.VerificationType;
import dev.pioruocco.model.ForgotPasswordToken;
import dev.pioruocco.model.User;

public interface ForgotPasswordService {

    ForgotPasswordToken createToken(User user, String id, String otp,
                                    VerificationType verificationType, String sendTo);

    ForgotPasswordToken findById(String id);

    ForgotPasswordToken findByUser(Long userId);

    void deleteToken(ForgotPasswordToken token);

    boolean verifyToken(ForgotPasswordToken token, String otp);
}
