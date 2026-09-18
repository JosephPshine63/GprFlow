package dev.pioruocco.service;

import dev.pioruocco.domain.VerificationType;
import dev.pioruocco.model.ForgotPasswordToken;
import dev.pioruocco.model.User;
import dev.pioruocco.repository.ForgotPasswordRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class ForgotPasswordServiceImpl implements ForgotPasswordService {

    private static final int MAX_ATTEMPTS = 5;

    @Autowired
    private ForgotPasswordRepository forgotPasswordRepository;

    @Override
    public ForgotPasswordToken createToken(User user,
                                           String id,
                                           String otp,
                                           VerificationType verificationType,
                                           String sendTo
    ) {
        ForgotPasswordToken forgotPasswordToken = new ForgotPasswordToken();
        forgotPasswordToken.setUser(user);
        forgotPasswordToken.setId(id);
        forgotPasswordToken.setOtp(otp);
        forgotPasswordToken.setVerificationType(verificationType);
        forgotPasswordToken.setSendTo(sendTo);

        return forgotPasswordRepository.save(forgotPasswordToken);
    }

    @Override
    public ForgotPasswordToken findById(String id) {
        Optional<ForgotPasswordToken> opt = forgotPasswordRepository.findById(id);
        return opt.orElse(null);
    }

    @Override
    public ForgotPasswordToken findByUser(Long userId) {
        return forgotPasswordRepository.findByUserId(userId);
    }

    @Override
    public void deleteToken(ForgotPasswordToken token) {

        forgotPasswordRepository.delete(token);

    }

    @Override
    public boolean verifyToken(ForgotPasswordToken token, String otp) throws Exception {
        if (token.getExpiresAt().isBefore(LocalDateTime.now())) {
            forgotPasswordRepository.delete(token);
            throw new Exception("OTP has expired. Please request a new password reset.");
        }
        if (token.getOtp().equals(otp)) {
            return true;
        }
        token.setAttempts(token.getAttempts() + 1);
        if (token.getAttempts() >= MAX_ATTEMPTS) {
            forgotPasswordRepository.delete(token);
            throw new Exception("Too many failed attempts. Please request a new password reset.");
        }
        forgotPasswordRepository.save(token);
        return false;
    }
}
