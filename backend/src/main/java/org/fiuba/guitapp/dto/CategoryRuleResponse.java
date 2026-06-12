package org.fiuba.guitapp.dto;

import org.fiuba.guitapp.model.ExpenseCategory;
import org.fiuba.guitapp.model.ExpenseType;

public record CategoryRuleResponse(
        Long id,
        ExpenseCategory category,
        ExpenseType type) {
}
