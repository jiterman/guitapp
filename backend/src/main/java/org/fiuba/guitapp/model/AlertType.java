package org.fiuba.guitapp.model;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum AlertType {

    EXPENSE_THRESHOLD_EXCEEDED("Se nos fue la mano \uD83D\uDCB8", "limite de gastos excedido"),
    SAVINGS_GOAL_AT_RISK("Se nos fue la mano \uD83D\uDCB8", "meta de ahorro en riesgo"),
    NEGATIVE_BALANCE_RISK("Se nos fue la mano \uD83D\uDCB8", "saldo negativo proyectado"),
    CATEGORY_OVERSPENDING("Venimos gastando un poco más 📈", "gasto por categoria superior al mes anterior");

    private final String title;
    private final String logContext;
}
