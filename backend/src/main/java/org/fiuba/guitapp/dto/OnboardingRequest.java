package org.fiuba.guitapp.dto;

import java.math.BigDecimal;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

public record OnboardingRequest(
        @NotBlank(message = "First name is required") @Pattern(regexp = "^[a-zA-ZáéíóúÁÉÍÓÚñÑ]+$", message = "First name must contain only letters and no spaces") String firstName,

        @NotNull(message = "Fixed expenses target is required") @Min(value = 1, message = "Target must be greater than 0") @Max(value = 98, message = "Target must be less than 100") Integer targetFixedExpenses,

        @NotNull(message = "Variable expenses target is required") @Min(value = 1, message = "Target must be greater than 0") @Max(value = 98, message = "Target must be less than 100") Integer targetVariableExpenses,

        @NotNull(message = "Estimated monthly income is required") @DecimalMin(value = "0.01", message = "Estimated monthly income must be greater than 0") BigDecimal estimatedMonthlyIncome) {
}
