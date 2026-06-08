package org.fiuba.guitapp.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

import org.fiuba.guitapp.model.IncomeCategory;

public record IncomeResponse(
        UUID id,
        BigDecimal amount,
        String title,
        String description,
        IncomeCategory category,
        LocalDate date) {
}
