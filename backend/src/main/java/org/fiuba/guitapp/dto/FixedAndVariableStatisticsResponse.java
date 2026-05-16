package org.fiuba.guitapp.dto;

import java.math.BigDecimal;

public record FixedAndVariableStatisticsResponse(
        BigDecimal totalAmount,
        BigDecimal fixedAmount,
        BigDecimal variableAmount,
        Double fixedPercentage,
        Double variablePercentage) {
}
