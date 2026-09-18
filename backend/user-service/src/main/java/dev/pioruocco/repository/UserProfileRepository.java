package dev.pioruocco.repository;

import dev.pioruocco.model.UserProfile;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserProfileRepository extends JpaRepository<UserProfile, Long> {

    UserProfile findByEmail(String email);

}
