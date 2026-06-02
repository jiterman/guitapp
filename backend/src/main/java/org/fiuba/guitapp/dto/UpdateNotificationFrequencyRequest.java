package org.fiuba.guitapp.dto;

import org.fiuba.guitapp.model.NotificationFrequency;

import jakarta.validation.constraints.NotNull;

public record UpdateNotificationFrequencyRequest(@NotNull NotificationFrequency notificationFrequency) {
}
