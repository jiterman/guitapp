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
import org.fiuba.guitapp.model.Expense;
import org.fiuba.guitapp.model.ExpenseType;
import org.fiuba.guitapp.model.Income;
import org.fiuba.guitapp.model.IncomeCategory;
import org.fiuba.guitapp.model.User;
import org.fiuba.guitapp.repository.ExpenseRepository;
import org.fiuba.guitapp.repository.IncomeRepository;
import org.fiuba.guitapp.repository.UserRepository;
import org.fiuba.guitapp.service.NotificationService;
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

    private final NotificationService notificationService;
    private final UserRepository userRepository;
    private final ExpenseRepository expenseRepository;
    private final IncomeRepository incomeRepository;

    @Async
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleExpenseCreatedEvent(ExpenseCreatedEvent event) {
        log.info("Handling ExpenseCreatedEvent asynchronously after transaction commit: {}", event.getExpenseId());

        User user = userRepository.findByEmail(event.getUserEmail())
                .orElseThrow(() -> new AuthException(ErrorCode.USER_NOT_FOUND, "User not found"));

        YearMonth currentMonth = YearMonth.from(event.getDate());
        List<Expense> monthlyExpenses = expenseRepository.findAllByUserAndDateBetween(
                user,
                currentMonth.atDay(1),
                currentMonth.atEndOfMonth());

        if (event.getType() == ExpenseType.FIXED) {
            checkFixedThreshold(user, monthlyExpenses);
        } else if (event.getType() == ExpenseType.VARIABLE) {
            checkVariableThreshold(user, monthlyExpenses);
        }

        checkSavingsGoalRisk(user, monthlyExpenses, currentMonth);
    }

    private void checkFixedThreshold(User user, List<Expense> monthlyExpenses) {
        if (user.getTargetFixedExpenses() == null)
            return;
        if (user.getEstimatedMonthlyIncome() == null
                || user.getEstimatedMonthlyIncome().compareTo(BigDecimal.ZERO) <= 0) {
            log.info("Límite de gastos no verificado: el ingreso mensual estimado debe ser mayor a cero.");
            return;
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
            notificationService.sendExpenseThresholdExceededNotification(user, message);
        }
    }

    private void checkVariableThreshold(User user, List<Expense> monthlyExpenses) {
        if (user.getTargetVariableExpenses() == null)
            return;
        if (user.getEstimatedMonthlyIncome() == null
                || user.getEstimatedMonthlyIncome().compareTo(BigDecimal.ZERO) <= 0) {
            log.info("Límite de gastos no verificado: el ingreso mensual estimado debe ser mayor a cero.");
            return;
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
            notificationService.sendExpenseThresholdExceededNotification(user, message);
        }
    }

    private void checkSavingsGoalRisk(
            User user,
            List<Expense> monthlyExpenses,
            YearMonth expenseMonth) {
        if (user.getTargetSavings() == null) {
            return;
        }

        LocalDate today = LocalDate.now();
        YearMonth currentMonth = YearMonth.from(today);
        if (!currentMonth.equals(expenseMonth)) {
            return;
        }

        if (today.getDayOfMonth() <= 5) {
            return;
            // No se envia notificacion en los primeros 5 dias del mes porque no hay suficiente data para proyectar los gastos del mes
        }

        List<Income> monthlyIncomes = incomeRepository.findAllByUserAndDateBetween(
                user,
                currentMonth.atDay(1),
                currentMonth.atEndOfMonth());

        BigDecimal salaryIncome = monthlyIncomes.stream()
                .filter(income -> income.getCategory() == IncomeCategory.SALARY)
                .map(Income::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal expectedIncome = salaryIncome.compareTo(BigDecimal.ZERO) > 0
                ? salaryIncome
                : user.getEstimatedMonthlyIncome();

        if (expectedIncome == null || expectedIncome.compareTo(BigDecimal.ZERO) <= 0) {
            return;
        }

        BigDecimal totalExpenses = monthlyExpenses.stream()
                .map(Expense::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        int daysElapsed = today.getDayOfMonth();
        int daysInMonth = currentMonth.lengthOfMonth();

        BigDecimal averageDailyExpense = totalExpenses.divide(
                BigDecimal.valueOf(daysElapsed), 4, RoundingMode.HALF_UP);
        BigDecimal projectedExpenses = averageDailyExpense.multiply(BigDecimal.valueOf(daysInMonth));

        BigDecimal savingsTargetAmount = expectedIncome
                .multiply(BigDecimal.valueOf(user.getTargetSavings()))
                .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);

        BigDecimal allowedExpenses = expectedIncome.subtract(savingsTargetAmount);

        if (projectedExpenses.compareTo(allowedExpenses) > 0) {
            Locale localeArg = Locale.of("es", "AR");
            NumberFormat formatter = NumberFormat.getCurrencyInstance(localeArg);
            String message = String.format(localeArg,
                    "Tu meta de ahorro est\u00e1 en riesgo. Si segu\u00eds con este ritmo, podr\u00edas gastar %s este mes y tu tope para cumplir el objetivo es %s",
                    formatter.format(projectedExpenses),
                    formatter.format(allowedExpenses));
            notificationService.sendSavingsGoalAtRiskNotification(user, message);
        }
    }
}
