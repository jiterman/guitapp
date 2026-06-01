package org.fiuba.guitapp.dto;

import java.time.LocalDateTime;

import org.fiuba.guitapp.model.AlertType;

public record NotificationResponse(
        Long id,
        AlertType type,
        String title,
        String body,
        LocalDateTime createdAt,
        boolean read) {
}
