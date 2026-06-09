package org.fiuba.guitapp.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

import org.fiuba.guitapp.model.IncomeCategory;
import org.fiuba.guitapp.model.RecurrenceFrequency;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

public record AddRecurringIncomeRequest(
        @NotNull @Positive BigDecimal amount,
        @Size(max = 255) String description,
        @NotNull IncomeCategory category,
        @NotNull RecurrenceFrequency frequency,
        @NotNull LocalDate startDate,
        LocalDate endDate) {
}
