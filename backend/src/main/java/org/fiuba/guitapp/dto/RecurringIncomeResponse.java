package org.fiuba.guitapp.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

import org.fiuba.guitapp.model.IncomeCategory;
import org.fiuba.guitapp.model.RecurrenceFrequency;

public record RecurringIncomeResponse(
        UUID id,
        BigDecimal amount,
        String description,
        IncomeCategory category,
        RecurrenceFrequency frequency,
        LocalDate startDate,
        LocalDate endDate,
        LocalDate nextOccurrence,
        boolean active) {
}
