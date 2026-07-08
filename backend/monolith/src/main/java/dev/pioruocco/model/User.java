package dev.pioruocco.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import dev.pioruocco.domain.USER_ROLE;
import dev.pioruocco.domain.UserStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    private String fullName;
    private String email;
    private String mobile;

    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private String password;

    private UserStatus status = UserStatus.PENDING;

    private boolean isVerified = false;

    @Embedded
    private TwoFactorAuth twoFactorAuth = new TwoFactorAuth();

    private String picture;

    private USER_ROLE role = USER_ROLE.ROLE_USER;

}
