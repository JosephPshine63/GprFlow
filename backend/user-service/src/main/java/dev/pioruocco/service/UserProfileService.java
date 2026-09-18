package dev.pioruocco.service;

import dev.pioruocco.exception.UserException;
import dev.pioruocco.model.UserProfile;

public interface UserProfileService {

    UserProfile createProfile(Long id, String fullName, String email);

    UserProfile findById(Long id) throws UserException;

    UserProfile findByEmail(String email) throws UserException;

}
