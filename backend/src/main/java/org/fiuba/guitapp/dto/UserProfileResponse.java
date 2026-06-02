package org.fiuba.guitapp.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

import org.fiuba.guitapp.model.NotificationChannel;
import org.fiuba.guitapp.model.NotificationFrequency;

public record UserProfileResponse(
        UUID id,
        String email,
        String firstName,
        String lastName,
        String avatarUrl,
        boolean onboardingCompleted,
        BigDecimal estimatedMonthlyIncome,
        Integer targetFixedExpenses,
        Integer targetVariableExpenses,
        Integer targetSavings,
        NotificationChannel notificationChannel,
        NotificationFrequency notificationFrequency,
        LocalDateTime createdAt) {
}
