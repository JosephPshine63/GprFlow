package dev.pioruocco.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;

/**
 * The profile half of what used to be the monolith's User entity (Fase 8). The credentials
 * half stays in auth-service's own User entity, keyed by the same id — auth-service assigns
 * the id (its User.id is auto-generated) and passes it explicitly via POST /internal/users,
 * so this id is never auto-generated here. email is denormalized so GET /api/users/email/{email}
 * doesn't need a network round trip back to auth-service on every read.
 */
@Entity
@Table(name = "user_profile")
@Data
public class UserProfile {

    @Id
    private Long id;

    private String fullName;

    private String email;
}
