package dev.pioruocco.service;

import dev.pioruocco.domain.USER_ROLE;
import dev.pioruocco.model.User;
import dev.pioruocco.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataInitializationComponent implements CommandLineRunner {

    private final UserRepository userRepository;

    private final PasswordEncoder passwordEncoder;

    private final UserServiceClient userServiceClient;

    @Value("${admin.seed.email}")
    private String adminEmail;

    @Value("${admin.seed.password}")
    private String adminPassword;

    @Value("${admin.seed.full-name}")
    private String adminFullName;

    @Autowired
    public DataInitializationComponent(UserRepository userRepository,
                                       PasswordEncoder passwordEncoder,
                                       UserServiceClient userServiceClient
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.userServiceClient = userServiceClient;

    }

    @Override
    public void run(String... args) {
        initializeAdminUser();
    }

    private void initializeAdminUser() {
        if (userRepository.findByEmail(adminEmail) == null) {
            User adminUser = new User();

            adminUser.setPassword(passwordEncoder.encode(adminPassword));
            adminUser.setFullName(adminFullName);
            adminUser.setEmail(adminEmail);
            adminUser.setRole(USER_ROLE.ROLE_ADMIN);
            User admin = userRepository.save(adminUser);

            userServiceClient.createProfile(admin.getId(), adminFullName, adminEmail);
        }
    }

}
