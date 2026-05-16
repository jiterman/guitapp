package org.fiuba.guitapp.dto;

import jakarta.validation.constraints.NotBlank;

public record UpdateFcmTokenRequest(
        @NotBlank(message = "Token cannot be blank") String fcmToken) {
}
