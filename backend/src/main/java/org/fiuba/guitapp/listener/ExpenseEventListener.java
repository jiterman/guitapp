package org.fiuba.guitapp.listener;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.text.NumberFormat;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;
import java.util.Locale;

import org.fiuba.guitapp.event.ExpenseCreatedEvent;
import org.fiuba.guitapp.exception.AuthException;
import org.fiuba.guitapp.exception.ErrorCode;
import org.fiuba.guitapp.model.AlertType;
import org.fiuba.guitapp.model.Expense;
import org.fiuba.guitapp.model.ExpenseCategory;
import org.fiuba.guitapp.model.ExpenseType;
import org.fiuba.guitapp.model.User;
import org.fiuba.guitapp.repository.ExpenseRepository;
import org.fiuba.guitapp.repository.UserRepository;
import org.fiuba.guitapp.service.AlertDeliveryService;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
@RequiredArgsConstructor
public class ExpenseEventListener {

    private final AlertDeliveryService alertDeliveryService;
    private final UserRepository userRepository;
    private final ExpenseRepository expenseRepository;

    @Async
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleExpenseCreatedEvent(ExpenseCreatedEvent event) {
        log.info("Procesando ExpenseCreatedEvent de forma asincrona tras el commit: {}", event.getExpenseId());

        YearMonth expenseMonth = YearMonth.from(event.getDate());
        YearMonth currentMonth = YearMonth.now();

        if (!expenseMonth.equals(currentMonth)) {
            log.info("Omitiendo notificaciones para gasto de mes no actual: {}", expenseMonth);
            return;
        }

        User user = userRepository.findByEmail(event.getUserEmail())
                .orElseThrow(() -> new AuthException(ErrorCode.USER_NOT_FOUND, "User not found"));

        List<Expense> monthlyExpenses = expenseRepository.findAllByUserAndDateBetween(
                user,
                expenseMonth.atDay(1),
                expenseMonth.atEndOfMonth());

        ProjectionData projectionData = buildProjectionData(user, monthlyExpenses, expenseMonth);
        if (checkNegativeBalanceRisk(user, projectionData)) {
            return;
        }

        if (checkSavingsGoalRisk(user, projectionData)) {
            return;
        }

        boolean thresholdTriggered = false;
        if (event.getType() == ExpenseType.FIXED) {
            thresholdTriggered = checkFixedThreshold(user, monthlyExpenses);
        } else if (event.getType() == ExpenseType.VARIABLE) {
            thresholdTriggered = checkVariableThreshold(user, monthlyExpenses);
        }

        if (thresholdTriggered) {
            return;
        }

        checkCategoryOverspending(user, event, monthlyExpenses);
    }

    private boolean checkCategoryOverspending(User user, ExpenseCreatedEvent event, List<Expense> monthlyExpenses) {
        Expense createdExpense = expenseRepository.findById(event.getExpenseId()).orElse(null);
        if (createdExpense == null || createdExpense.getCategory() == null) {
            return false;
        }

        ExpenseCategory category = createdExpense.getCategory();

        BigDecimal currentCategoryTotal = monthlyExpenses.stream()
                .filter(e -> e.getCategory() == category)
                .map(Expense::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        YearMonth previousMonth = YearMonth.from(event.getDate()).minusMonths(1);
        List<Expense> previousMonthExpenses = expenseRepository.findAllByUserAndDateBetween(
                user,
                previousMonth.atDay(1),
                previousMonth.atEndOfMonth());

        BigDecimal previousCategoryTotal = previousMonthExpenses.stream()
                .filter(e -> e.getCategory() == category)
                .map(Expense::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        if (previousCategoryTotal.compareTo(BigDecimal.ZERO) <= 0) {
            return false;
        }

        if (currentCategoryTotal.compareTo(previousCategoryTotal) > 0) {
            log.info("Enviando notificacion al usuario por gasto de categoria superior al mes anterior");
            Locale localeArg = Locale.of("es", "AR");
            String message = String.format(localeArg,
                    "Tu gasto en la categoría %s supera al mes anterior. Revisá tus gastos.",
                    formatCategory(category));
            alertDeliveryService.deliverAlert(user, AlertType.CATEGORY_OVERSPENDING, message);
            return true;
        }

        return false;
    }

    private String formatCategory(ExpenseCategory category) {
        return switch (category) {
        case SUPERMARKET -> "Supermercado";
        case RESTAURANT -> "Restaurante";
        case CAFE -> "Café";
        case DELIVERY -> "Delivery";
        case PUBLIC_TRANSPORT -> "Transporte público";
        case FUEL -> "Combustible";
        case TAXI -> "Taxi";
        case UTILITIES -> "Servicios";
        case RENT -> "Alquiler";
        case HOME -> "Hogar";
        case DOCTOR -> "Doctor";
        case PHARMACY -> "Farmacia";
        case SUBSCRIPTIONS -> "Suscripciones";
        case OUTINGS -> "Salidas";
        case GYM -> "Gimnasio";
        case TRAVEL -> "Viajes";
        case CLOTHING -> "Ropa";
        case EDUCATION -> "Educación";
        case TECHNOLOGY -> "Tecnología";
        case HOA_FEES -> "Cuota de consorcio";
        case VEHICLE -> "Vehículo";
        case BEAUTY -> "Belleza";
        case PETS -> "Mascotas";
        case SHOPPING -> "Compras";
        case OTHER -> "Otro";
        };
    }

    private boolean checkFixedThreshold(User user, List<Expense> monthlyExpenses) {
        if (user.getTargetFixedExpenses() == null)
            return false;
        if (user.getEstimatedMonthlyIncome() == null
                || user.getEstimatedMonthlyIncome().compareTo(BigDecimal.ZERO) <= 0) {
            log.info("Límite de gastos no verificado: el ingreso mensual estimado debe ser mayor a cero.");
            return false;
        }

        BigDecimal totalFixed = monthlyExpenses.stream()
                .filter(e -> e.getType() == ExpenseType.FIXED)
                .map(Expense::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal fixedLimit = user.getEstimatedMonthlyIncome()
                .multiply(BigDecimal.valueOf(user.getTargetFixedExpenses()))
                .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);

        if (totalFixed.compareTo(fixedLimit) > 0) {
            log.info("Enviando notificacion al usuario por limite de gastos fijos excedido");
            Locale localeArg = Locale.of("es", "AR");
            NumberFormat formatter = NumberFormat.getCurrencyInstance(localeArg);
            String message = String.format(localeArg,
                    "Te pasaste de tu presupuesto de gastos fijos. Llevás gastado %s de los %s de tu objetivo de este mes",
                    formatter.format(totalFixed),
                    formatter.format(fixedLimit));
            alertDeliveryService.deliverAlert(user, AlertType.FIXED_EXPENSE_THRESHOLD_EXCEEDED, message);
            return true;
        }

        return false;
    }

    private boolean checkVariableThreshold(User user, List<Expense> monthlyExpenses) {
        if (user.getTargetVariableExpenses() == null)
            return false;
        if (user.getEstimatedMonthlyIncome() == null
                || user.getEstimatedMonthlyIncome().compareTo(BigDecimal.ZERO) <= 0) {
            log.info("Límite de gastos no verificado: el ingreso mensual estimado debe ser mayor a cero.");
            return false;
        }

        BigDecimal totalVariable = monthlyExpenses.stream()
                .filter(e -> e.getType() == ExpenseType.VARIABLE)
                .map(Expense::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal variableLimit = user.getEstimatedMonthlyIncome()
                .multiply(BigDecimal.valueOf(user.getTargetVariableExpenses()))
                .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);

        if (totalVariable.compareTo(variableLimit) > 0) {
            log.info("Enviando notificacion al usuario por limite de gastos variables excedido");
            Locale localeArg = Locale.of("es", "AR");
            NumberFormat formatter = NumberFormat.getCurrencyInstance(localeArg);
            String message = String.format(localeArg,
                    "Te pasaste de tu presupuesto de gastos variables. Llevás gastado %s de los %s de tu objetivo de este mes",
                    formatter.format(totalVariable),
                    formatter.format(variableLimit));
            alertDeliveryService.deliverAlert(user, AlertType.VARIABLE_EXPENSE_THRESHOLD_EXCEEDED, message);
            return true;
        }

        return false;
    }

    private boolean checkSavingsGoalRisk(User user, ProjectionData projectionData) {
        if (user.getTargetSavings() == null || projectionData == null) {
            return false;
        }

        BigDecimal savingsTargetAmount = projectionData.expectedIncome()
                .multiply(BigDecimal.valueOf(user.getTargetSavings()))
                .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);

        BigDecimal allowedExpenses = projectionData.expectedIncome().subtract(savingsTargetAmount);

        if (projectionData.projectedExpenses().compareTo(allowedExpenses) > 0) {
            Locale localeArg = Locale.of("es", "AR");
            NumberFormat formatter = NumberFormat.getCurrencyInstance(localeArg);
            String message = String.format(localeArg,
                    "Tu meta de ahorro est\u00e1 en riesgo. Si segu\u00eds con este ritmo, podr\u00edas gastar %s este mes y tu tope para cumplir el objetivo es %s",
                    formatter.format(projectionData.projectedExpenses()),
                    formatter.format(allowedExpenses));
            alertDeliveryService.deliverAlert(user, AlertType.SAVINGS_GOAL_AT_RISK, message);
            return true;
        }

        return false;
    }

    private boolean checkNegativeBalanceRisk(User user, ProjectionData projectionData) {
        if (projectionData == null) {
            return false;
        }

        if (projectionData.projectedExpenses().compareTo(projectionData.expectedIncome()) > 0) {
            Locale localeArg = Locale.of("es", "AR");
            NumberFormat formatter = NumberFormat.getCurrencyInstance(localeArg);
            String message = String.format(localeArg,
                    "Tu saldo podr\u00eda quedar en negativo. Si segu\u00eds con este ritmo, podr\u00edas gastar %s este mes y tus ingresos esperados son %s",
                    formatter.format(projectionData.projectedExpenses()),
                    formatter.format(projectionData.expectedIncome()));
            alertDeliveryService.deliverAlert(user, AlertType.NEGATIVE_BALANCE_RISK, message);
            return true;
        }

        return false;
    }

    private ProjectionData buildProjectionData(
            User user,
            List<Expense> monthlyExpenses,
            YearMonth expenseMonth) {
        LocalDate today = LocalDate.now();
        YearMonth currentMonth = YearMonth.from(today);
        if (!currentMonth.equals(expenseMonth)) {
            return null;
        }

        if (today.getDayOfMonth() <= 5) {
            // No se envia notificacion en los primeros 5 dias del mes porque no hay suficiente data para proyectar los gastos del mes.
            return null;
        }

        BigDecimal expectedIncome = user.getEstimatedMonthlyIncome();

        if (expectedIncome == null || expectedIncome.compareTo(BigDecimal.ZERO) <= 0) {
            return null;
        }

        BigDecimal totalExpenses = monthlyExpenses.stream()
                .map(Expense::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        int daysElapsed = today.getDayOfMonth();
        int daysInMonth = currentMonth.lengthOfMonth();

        BigDecimal averageDailyExpense = totalExpenses.divide(
                BigDecimal.valueOf(daysElapsed), 4, RoundingMode.HALF_UP);
        BigDecimal projectedExpenses = averageDailyExpense.multiply(BigDecimal.valueOf(daysInMonth));

        return new ProjectionData(expectedIncome, projectedExpenses);
    }

    private record ProjectionData(BigDecimal expectedIncome, BigDecimal projectedExpenses) {
    }
}
