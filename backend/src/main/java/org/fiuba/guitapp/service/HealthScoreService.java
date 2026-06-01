package org.fiuba.guitapp.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.EnumSet;
import java.util.List;
import java.util.Set;

import org.fiuba.guitapp.dto.HealthScoreFactor;
import org.fiuba.guitapp.dto.HealthScoreResponse;
import org.fiuba.guitapp.exception.AuthException;
import org.fiuba.guitapp.exception.ErrorCode;
import org.fiuba.guitapp.model.Expense;
import org.fiuba.guitapp.model.ExpenseCategory;
import org.fiuba.guitapp.model.Income;
import org.fiuba.guitapp.model.User;
import org.fiuba.guitapp.repository.ExpenseRepository;
import org.fiuba.guitapp.repository.IncomeRepository;
import org.fiuba.guitapp.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class HealthScoreService {

    private static final Set<ExpenseCategory> NON_ESSENTIAL_CATEGORIES = EnumSet.of(
            ExpenseCategory.RESTAURANT,
            ExpenseCategory.CAFE,
            ExpenseCategory.DELIVERY,
            ExpenseCategory.SUBSCRIPTIONS,
            ExpenseCategory.OUTINGS,
            ExpenseCategory.GYM,
            ExpenseCategory.TRAVEL,
            ExpenseCategory.CLOTHING,
            ExpenseCategory.BEAUTY,
            ExpenseCategory.SHOPPING,
            ExpenseCategory.TECHNOLOGY);

    private final ExpenseRepository expenseRepository;
    private final IncomeRepository incomeRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public HealthScoreResponse getHealthScore(String email, int year, int month) {
        YearMonth requested = YearMonth.of(year, month);
        YearMonth current = YearMonth.now();
        if (!requested.isBefore(current)) {
            throw new AuthException(ErrorCode.INVALID_PERIOD,
                    "Health score is only available for completed months");
        }
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AuthException(ErrorCode.USER_NOT_FOUND, "User not found"));

        LocalDate start = requested.atDay(1);
        LocalDate end = requested.atEndOfMonth();
        List<Expense> expenses = expenseRepository.findAllByUserAndDateBetween(user, start, end);
        List<Income> incomes = incomeRepository.findAllByUserAndDateBetween(user, start, end);

        YearMonth prevYearMonth = requested.minusMonths(1);
        List<Expense> prevExpenses = expenseRepository.findAllByUserAndDateBetween(
                user, prevYearMonth.atDay(1), prevYearMonth.atEndOfMonth());

        BigDecimal totalExpenses = sumAmount(expenses.stream().map(Expense::getAmount).toList());
        BigDecimal totalIncome = sumAmount(incomes.stream().map(Income::getAmount).toList());
        BigDecimal balance = totalIncome.subtract(totalExpenses);
        BigDecimal prevTotalExpenses = sumAmount(prevExpenses.stream().map(Expense::getAmount).toList());

        Integer targetSavings = user.getTargetSavings();
        double savingsTarget = (targetSavings != null && targetSavings > 0) ? targetSavings / 100.0 : 0.20;
        HealthScoreFactor savings = calculateSavingsFactor(balance, totalIncome, savingsTarget);
        HealthScoreFactor expenseControl = calculateExpenseControlFactor(totalExpenses, prevTotalExpenses);
        HealthScoreFactor distribution = calculateDistributionFactor(expenses, totalExpenses);

        int finalScore = (int) Math.round(
                savings.score() * 0.45
                        + expenseControl.score() * 0.35
                        + distribution.score() * 0.20);
        finalScore = Math.max(0, Math.min(100, finalScore));

        String level = resolveLevel(finalScore);
        String title = resolveTitle(finalScore);
        String message = resolveMessage(finalScore);

        List<HealthScoreFactor> factors = List.of(savings, expenseControl, distribution);
        return new HealthScoreResponse(finalScore, title, message, level, factors);
    }

    private HealthScoreFactor calculateSavingsFactor(BigDecimal balance, BigDecimal totalIncome, double target) {
        if (totalIncome.compareTo(BigDecimal.ZERO) <= 0) {
            return new HealthScoreFactor("savings", "Capacidad de ahorro", 0, 100,
                    "Los gastos superaron tus ingresos este mes");
        }
        double savingsRate = balance.divide(totalIncome, 6, RoundingMode.HALF_UP).doubleValue();
        int score;
        if (savingsRate < 0) {
            score = 0;
        } else if (savingsRate >= target) {
            score = 100;
        } else {
            score = (int) Math.round(savingsRate / target * 100);
        }
        score = Math.max(0, Math.min(100, score));

        int targetPct = (int) Math.round(target * 100);
        String explanation;
        if (savingsRate >= target) {
            explanation = "¡Llegaste a tu meta de ahorro del " + targetPct + "%! 🔥";
        } else if (savingsRate >= target * 0.75) {
            explanation = "Casi en tu meta, ahorraste " + (int) Math.round(savingsRate * 100) + "%";
        } else if (savingsRate >= target * 0.4) {
            explanation = "Lograste ahorrar algo este mes";
        } else if (savingsRate >= 0) {
            explanation = "El ahorro fue bajo, pero positivo";
        } else {
            explanation = "Los gastos superaron tus ingresos este mes";
        }
        return new HealthScoreFactor("savings", "Capacidad de ahorro", score, 100, explanation);
    }

    private HealthScoreFactor calculateExpenseControlFactor(BigDecimal totalExpenses, BigDecimal prevTotalExpenses) {
        if (prevTotalExpenses.compareTo(BigDecimal.ZERO) <= 0) {
            return new HealthScoreFactor("expenseControl", "Control de gastos", 70, 100,
                    "Sin datos del mes anterior para comparar");
        }
        double changeRate = totalExpenses.subtract(prevTotalExpenses)
                .divide(prevTotalExpenses, 6, RoundingMode.HALF_UP)
                .doubleValue();
        double rawScore;
        if (changeRate <= -0.20) {
            rawScore = 100;
        } else if (changeRate <= -0.10) {
            rawScore = 85 + ((-0.10 - changeRate) / 0.10) * 15;
        } else if (changeRate <= 0.10) {
            rawScore = 70 - (changeRate / 0.10) * 30;
        } else if (changeRate <= 0.20) {
            rawScore = 40 - ((changeRate - 0.10) / 0.10) * 40;
        } else {
            rawScore = 0;
        }
        int score = Math.max(0, Math.min(100, (int) Math.round(rawScore)));

        String explanation;
        if (score >= 85) {
            explanation = "Tus gastos bajaron bastante respecto al mes anterior";
        } else if (score >= 60) {
            explanation = "Tus gastos se mantuvieron bastantes estables";
        } else if (score >= 40) {
            explanation = "Tus gastos subieron un poco este mes";
        } else {
            explanation = "Tus gastos aumentaron bastante respecto al mes anterior";
        }
        return new HealthScoreFactor("expenseControl", "Control de gastos", score, 100, explanation);
    }

    private HealthScoreFactor calculateDistributionFactor(List<Expense> expenses, BigDecimal totalExpenses) {
        double nonEssentialTotal = 0.0;
        if (totalExpenses.compareTo(BigDecimal.ZERO) > 0) {
            BigDecimal nonEssentialSum = expenses.stream()
                    .filter(e -> NON_ESSENTIAL_CATEGORIES.contains(e.getCategory()))
                    .map(Expense::getAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            nonEssentialTotal = nonEssentialSum.divide(totalExpenses, 6, RoundingMode.HALF_UP).doubleValue();
        }
        int score;
        if (nonEssentialTotal > 0.30) {
            score = 30;
        } else if (nonEssentialTotal > 0.25) {
            score = (int) Math.round(60 - ((nonEssentialTotal - 0.25) / 0.05) * 30);
        } else if (nonEssentialTotal > 0.20) {
            score = (int) Math.round(100 - ((nonEssentialTotal - 0.20) / 0.05) * 40);
        } else {
            score = 100;
        }
        score = Math.max(30, Math.min(100, score));
        String explanation;
        if (nonEssentialTotal <= 0.20) {
            explanation = "Tus gastos no esenciales están bien controlados";
        } else if (nonEssentialTotal <= 0.25) {
            explanation = "Los gastos no esenciales están un poco altos";
        } else if (nonEssentialTotal <= 0.30) {
            explanation = "Los gastos no esenciales están bastante altos";
        } else {
            explanation = "Más del 30% de tus gastos son no esenciales";
        }
        return new HealthScoreFactor("distribution", "Distribución de gastos", score, 100, explanation);
    }

    private BigDecimal sumAmount(List<BigDecimal> amounts) {
        return amounts.stream().reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private String resolveLevel(int score) {
        if (score >= 90)
            return "excellent";
        if (score >= 75)
            return "great";
        if (score >= 60)
            return "good";
        if (score >= 40)
            return "fair";
        return "poor";
    }

    private String resolveTitle(int score) {
        if (score >= 90)
            return "¡Mes increíble!";
        if (score >= 75)
            return "¡Muy buen mes!";
        if (score >= 60)
            return "Buen mes";
        if (score >= 40)
            return "Mes regular";
        return "Mes difícil";
    }

    private String resolveMessage(int score) {
        if (score >= 90)
            return "Estás en racha. Tu capacidad de ahorro fue excelente y mantuviste tus gastos bajo control.";
        if (score >= 75)
            return "Sólido. Hay algún detalle para mejorar, pero vas por buen camino.";
        if (score >= 60)
            return "Nada mal. Con algunos ajustes podés llevarlo al siguiente nivel.";
        if (score >= 40)
            return "Hubo altibajos. Vale la pena revisar qué se puede mejorar el mes que viene.";
        return "Este mes fue complicado, pero entender qué pasó es el primer paso para mejorar.";
    }
}
