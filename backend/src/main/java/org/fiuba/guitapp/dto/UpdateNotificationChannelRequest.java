package org.fiuba.guitapp.dto;

import org.fiuba.guitapp.model.NotificationChannel;

import jakarta.validation.constraints.NotNull;

public record UpdateNotificationChannelRequest(
        @NotNull(message = "Notification channel cannot be null") NotificationChannel notificationChannel) {
}
