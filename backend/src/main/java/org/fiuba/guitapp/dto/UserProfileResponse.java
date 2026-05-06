package org.fiuba.guitapp.dto;

import java.util.UUID;

public record UserProfileResponse(
        UUID id,
        String email,
        String firstName,
        String lastName,
        String avatarUrl,
        boolean onboardingCompleted,
        Integer targetFixedExpenses,
        Integer targetVariableExpenses,
        Integer targetSavings) {
}
