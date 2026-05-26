package org.fiuba.guitapp.dto;

import java.math.BigDecimal;
import java.util.List;

public record ExpenseStatisticsResponse(
        BigDecimal totalAmount,
        List<ExpenseCategoryStatistics> categories) {
}
