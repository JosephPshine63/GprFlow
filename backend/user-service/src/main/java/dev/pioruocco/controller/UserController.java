package dev.pioruocco.controller;

import dev.pioruocco.exception.UserException;
import dev.pioruocco.model.UserProfile;
import dev.pioruocco.response.UserSummaryDTO;
import dev.pioruocco.service.UserProfileService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class UserController {

    @Autowired
    private UserProfileService userProfileService;

    @GetMapping("/api/users/{userId}")
    public ResponseEntity<UserSummaryDTO> findUserById(@PathVariable Long userId) throws UserException {
        UserProfile profile = userProfileService.findById(userId);
        return new ResponseEntity<>(new UserSummaryDTO(profile.getId(), profile.getFullName()), HttpStatus.ACCEPTED);
    }

    @GetMapping("/api/users/email/{email}")
    public ResponseEntity<UserSummaryDTO> findUserByEmail(@PathVariable String email) throws UserException {
        UserProfile profile = userProfileService.findByEmail(email);
        return new ResponseEntity<>(new UserSummaryDTO(profile.getId(), profile.getFullName()), HttpStatus.ACCEPTED);
    }

}
