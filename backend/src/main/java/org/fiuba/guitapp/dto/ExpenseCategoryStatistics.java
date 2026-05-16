package org.fiuba.guitapp.dto;

import java.math.BigDecimal;

import org.fiuba.guitapp.model.ExpenseCategory;

public record ExpenseCategoryStatistics(
        ExpenseCategory category,
        BigDecimal totalAmount,
        Long count,
        Double percentage) {
}
