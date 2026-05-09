package org.fiuba.guitapp.dto;

import jakarta.validation.constraints.NotBlank;

public record UpdateUserProfileRequest(
        @NotBlank(message = "First name is required") String firstName,
        String lastName) {
}
