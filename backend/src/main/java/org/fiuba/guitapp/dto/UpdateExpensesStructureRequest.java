package org.fiuba.guitapp.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record UpdateExpensesStructureRequest(

        @NotNull(message = "Fixed expenses target is required") @Min(value = 0, message = "Fixed expenses must be >= 0") @Max(value = 100, message = "Fixed expenses must be <= 100") Integer targetFixedExpenses,

        @NotNull(message = "Variable expenses target is required") @Min(value = 0, message = "Variable expenses must be >= 0") @Max(value = 100, message = "Variable expenses must be <= 100") Integer targetVariableExpenses) {
}
