package org.fiuba.guitapp.dto;

import org.fiuba.guitapp.model.ExpenseType;

import jakarta.validation.constraints.NotNull;

public record UpdateCategoryRuleRequest(
        @NotNull(message = "El tipo de gasto es requerido") ExpenseType type) {
}
