package org.fiuba.guitapp.dto;

import java.math.BigDecimal;

import org.fiuba.guitapp.model.IncomeCategory;

import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

public record UpdateIncomeRequest(
        @Positive BigDecimal amount,
        @Size(max = 255) String description,
        IncomeCategory category) {
}

