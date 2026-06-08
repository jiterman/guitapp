package org.fiuba.guitapp.dto;

import java.math.BigDecimal;

import org.fiuba.guitapp.model.ExpenseCategory;

public record ReceiptAnalysisResponse(
        String date,
        BigDecimal amount,
        ExpenseCategory category,
        String title) {
}
