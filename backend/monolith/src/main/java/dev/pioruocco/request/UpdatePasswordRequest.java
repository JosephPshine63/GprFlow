package dev.pioruocco.request;

import dev.pioruocco.domain.VerificationType;
import lombok.Data;

@Data
public class UpdatePasswordRequest {
    private String sendTo;
    private VerificationType verificationType;
}
