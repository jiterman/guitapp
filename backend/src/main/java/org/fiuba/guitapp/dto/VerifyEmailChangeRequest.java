package org.fiuba.guitapp.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record VerifyEmailChangeRequest(
        @NotBlank(message = "El código OTP es obligatorio") @Size(min = 6, max = 6, message = "El OTP debe tener 6 dígitos") String otp) {
}
