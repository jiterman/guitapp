package org.fiuba.guitapp.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record MovementResponse(
        UUID id,
        String type,
        BigDecimal amount,
        String description,
        String category,
        String expenseType,
        LocalDate date) {
}
