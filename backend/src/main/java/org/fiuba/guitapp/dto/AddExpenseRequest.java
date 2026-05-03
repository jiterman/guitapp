package org.fiuba.guitapp.dto;

import java.math.BigDecimal;

import org.fiuba.guitapp.model.ExpenseCategory;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

public record AddExpenseRequest(
        @NotNull @Positive BigDecimal amount,
        @Size(max = 255) String description,
        @NotNull ExpenseCategory category) {
}
