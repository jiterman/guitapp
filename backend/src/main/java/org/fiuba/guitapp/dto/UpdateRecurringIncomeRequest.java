package org.fiuba.guitapp.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

import org.fiuba.guitapp.model.IncomeCategory;
import org.fiuba.guitapp.model.RecurrenceFrequency;

import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

public record UpdateRecurringIncomeRequest(
        @Positive BigDecimal amount,
        @Size(max = 255) String description,
        IncomeCategory category,
        RecurrenceFrequency frequency,
        LocalDate startDate,
        LocalDate endDate,
        Boolean active) {
}
