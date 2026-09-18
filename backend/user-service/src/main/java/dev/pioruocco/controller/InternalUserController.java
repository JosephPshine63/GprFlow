package dev.pioruocco.controller;

import dev.pioruocco.exception.UserException;
import dev.pioruocco.model.UserProfile;
import dev.pioruocco.request.CreateUserProfileRequest;
import dev.pioruocco.response.InternalUserProfileResponse;
import dev.pioruocco.service.UserProfileService;
import dev.pioruocco.service.WatchlistService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

/**
 * Never routed through the gateway — reachable only on the Docker Compose internal network,
 * called exclusively by auth-service right after it persists a User row.
 */
@RestController
@RequestMapping("/internal/users")
public class InternalUserController {

    @Autowired
    private UserProfileService userProfileService;

    @Autowired
    private WatchlistService watchlistService;

    @PostMapping
    @Transactional
    public ResponseEntity<Void> createUser(@RequestBody CreateUserProfileRequest request) {
        userProfileService.createProfile(request.id(), request.fullName(), request.email());
        watchlistService.createWatchList(request.id());
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<InternalUserProfileResponse> getUser(@PathVariable Long id) throws UserException {
        UserProfile profile = userProfileService.findById(id);
        return ResponseEntity.ok(new InternalUserProfileResponse(profile.getId(), profile.getFullName(), profile.getEmail()));
    }
}
