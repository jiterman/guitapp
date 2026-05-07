package org.fiuba.guitapp.dto;

import java.util.UUID;

public record UserProfileResponse(
        UUID id,
        String email,
        String firstName,
        boolean onboardingCompleted,
        Integer targetFixedExpenses,
        Integer targetVariableExpenses,
        Integer targetSavings) {
}
