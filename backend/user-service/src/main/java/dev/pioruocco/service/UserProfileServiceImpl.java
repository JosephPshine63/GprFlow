package dev.pioruocco.service;

import dev.pioruocco.exception.UserException;
import dev.pioruocco.model.UserProfile;
import dev.pioruocco.repository.UserProfileRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class UserProfileServiceImpl implements UserProfileService {

    @Autowired
    private UserProfileRepository userProfileRepository;

    @Override
    public UserProfile createProfile(Long id, String fullName, String email) {
        UserProfile profile = new UserProfile();
        profile.setId(id);
        profile.setFullName(fullName);
        profile.setEmail(email);
        return userProfileRepository.save(profile);
    }

    @Override
    public UserProfile findById(Long id) throws UserException {
        Optional<UserProfile> opt = userProfileRepository.findById(id);
        if (opt.isEmpty()) {
            throw new UserException("user not found with id " + id);
        }
        return opt.get();
    }

    @Override
    public UserProfile findByEmail(String email) throws UserException {
        UserProfile profile = userProfileRepository.findByEmail(email);
        if (profile == null) {
            throw new UserException("user not exist with email " + email);
        }
        return profile;
    }
}
