package org.fiuba.guitapp.dto;

import java.math.BigDecimal;

import org.fiuba.guitapp.model.ExpenseCategory;
import org.fiuba.guitapp.model.ExpenseType;

import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

public record UpdateExpenseRequest(
        @Positive BigDecimal amount,
        @Size(max = 255) String description,
        ExpenseCategory category,
        ExpenseType type) {
}
