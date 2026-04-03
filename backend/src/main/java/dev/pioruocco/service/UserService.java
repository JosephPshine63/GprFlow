package dev.pioruocco.service;


import dev.pioruocco.domain.VerificationType;
import dev.pioruocco.exception.UserException;
import dev.pioruocco.model.User;


public interface UserService {

    User findUserProfileByJwt(String jwt) throws UserException;

    User findUserByEmail(String email) throws UserException;

    User findUserById(Long userId) throws UserException;

    User verifyUser(User user) throws UserException;

    User enabledTwoFactorAuthentication(VerificationType verificationType,
                                        String sendTo, User user) throws UserException;

//	public List<User> getPenddingRestaurantOwner();

    User updatePassword(User user, String newPassword);

    void sendUpdatePasswordOtp(String email, String otp);

//	void sendPasswordResetEmail(User user);
}
