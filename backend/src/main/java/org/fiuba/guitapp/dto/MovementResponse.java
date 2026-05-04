package org.fiuba.guitapp.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

public record MovementResponse(
        UUID id,
        String type,
        BigDecimal amount,
        String description,
        String category,
        LocalDateTime date) {
}
