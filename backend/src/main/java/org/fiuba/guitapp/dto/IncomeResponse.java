package org.fiuba.guitapp.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

import org.fiuba.guitapp.model.IncomeCategory;

public record IncomeResponse(
        UUID id,
        BigDecimal amount,
        String description,
        IncomeCategory category,
        LocalDateTime date) {
}
