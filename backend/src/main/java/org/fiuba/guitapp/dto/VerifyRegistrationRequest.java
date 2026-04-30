package org.fiuba.guitapp.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record VerifyRegistrationRequest(
        @NotBlank(message = "Email is required") @Email(message = "Invalid email format") String email,
        @NotBlank(message = "OTP is required") @Size(min = 6, max = 6, message = "OTP must be exactly 6 digits") String otp) {
}
