package org.fiuba.guitapp.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

import org.fiuba.guitapp.model.ExpenseCategory;
import org.fiuba.guitapp.model.ExpenseType;
import org.fiuba.guitapp.model.RecurrenceFrequency;

import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

public record UpdateRecurringExpenseRequest(
        @Positive BigDecimal amount,
        @Size(max = 20) String title,
        @Size(max = 255) String description,
        ExpenseCategory category,
        ExpenseType type,
        RecurrenceFrequency frequency,
        LocalDate startDate,
        LocalDate endDate,
        Boolean active) {
}
