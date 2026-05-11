package org.fiuba.guitapp.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record InitiateEmailChangeRequest(
        @NotBlank(message = "El nuevo email es obligatorio") @Email(message = "Formato de email inválido") String newEmail) {
}
