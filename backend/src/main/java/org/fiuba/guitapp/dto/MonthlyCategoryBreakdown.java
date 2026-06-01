package org.fiuba.guitapp.dto;

import java.math.BigDecimal;

import org.fiuba.guitapp.model.ExpenseCategory;

public record MonthlyCategoryBreakdown(
        ExpenseCategory category,
        BigDecimal totalAmount,
        Double percentage,
        Double changeVsPreviousMonth) {
}
