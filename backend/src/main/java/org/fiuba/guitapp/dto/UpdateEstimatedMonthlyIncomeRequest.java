package org.fiuba.guitapp.dto;

import java.math.BigDecimal;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

public record UpdateEstimatedMonthlyIncomeRequest(

        @NotNull(message = "Estimated monthly income is required") @DecimalMin(value = "0.0", inclusive = true, message = "Estimated monthly income must be >= 0") BigDecimal estimatedMonthlyIncome) {
}
