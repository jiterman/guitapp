package org.fiuba.guitapp.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ResetPasswordRequest(
        @NotBlank(message = "El email es obligatorio") @Email(message = "Formato de email inválido") String email,

        @NotBlank(message = "El código OTP es obligatorio") @Size(min = 6, max = 6, message = "El OTP debe tener 6 dígitos") String otp,

        @NotBlank(message = "La nueva contraseña es obligatoria") @Size(min = 8, message = "La contraseña debe tener al menos 8 caracteres") String newPassword) {
}
