package org.fiuba.guitapp.model;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum AlertType {

    FIXED_EXPENSE_THRESHOLD_EXCEEDED("Se nos fue la mano \uD83D\uDCB8", "l\u00edmite de gastos fijos excedido"),
    VARIABLE_EXPENSE_THRESHOLD_EXCEEDED("Se nos fue la mano \uD83D\uDCB8", "l\u00edmite de gastos variables excedido"),
    SAVINGS_GOAL_AT_RISK("Se nos fue la mano \uD83D\uDCB8", "meta de ahorro en riesgo"),
    NEGATIVE_BALANCE_RISK("Se nos fue la mano \uD83D\uDCB8", "saldo negativo proyectado"),
    CATEGORY_OVERSPENDING("Venimos gastando un poco m\u00e1s \uD83D\uDCC8", "gasto por categor\u00eda superior al mes anterior"),
    MONTHLY_SUMMARY("Tu resumen del mes 📅", "resumen mensual");

    private final String title;
    private final String logContext;
}
