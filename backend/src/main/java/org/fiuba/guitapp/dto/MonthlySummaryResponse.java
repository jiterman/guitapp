package org.fiuba.guitapp.dto;

import java.math.BigDecimal;
import java.util.List;

public record MonthlySummaryResponse(
        int year,
        int month,
        BigDecimal totalIncome,
        BigDecimal totalExpenses,
        BigDecimal balance,
        List<MonthlyCategoryBreakdown> categoryBreakdown,
        List<MonthlyInsight> insights) {
}
