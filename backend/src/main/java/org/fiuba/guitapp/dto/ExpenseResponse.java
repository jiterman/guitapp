package org.fiuba.guitapp.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

import org.fiuba.guitapp.model.ExpenseCategory;

public record ExpenseResponse(
        UUID id,
        BigDecimal amount,
        String description,
        ExpenseCategory category,
        LocalDateTime date) {
}
