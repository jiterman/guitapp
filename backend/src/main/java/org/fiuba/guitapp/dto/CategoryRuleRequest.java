package org.fiuba.guitapp.dto;

import org.fiuba.guitapp.model.ExpenseCategory;
import org.fiuba.guitapp.model.ExpenseType;

import jakarta.validation.constraints.NotNull;

public record CategoryRuleRequest(
        @NotNull ExpenseCategory category,
        @NotNull ExpenseType type) {
}
