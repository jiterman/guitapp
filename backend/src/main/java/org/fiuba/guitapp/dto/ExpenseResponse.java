package org.fiuba.guitapp.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

import org.fiuba.guitapp.model.ExpenseCategory;
import org.fiuba.guitapp.model.ExpenseType;

public record ExpenseResponse(
        UUID id,
        BigDecimal amount,
        String title,
        String description,
        ExpenseCategory category,
        ExpenseType type,
        LocalDate date) {
}
