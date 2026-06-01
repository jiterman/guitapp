package org.fiuba.guitapp.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.stream.Collectors;

import org.fiuba.guitapp.dto.MonthlyCategoryBreakdown;
import org.fiuba.guitapp.dto.MonthlyInsight;
import org.fiuba.guitapp.dto.MonthlySummaryResponse;
import org.fiuba.guitapp.exception.AuthException;
import org.fiuba.guitapp.exception.ErrorCode;
import org.fiuba.guitapp.model.AlertType;
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
public class MonthlySummaryService {

    private static final Locale LOCALE_AR = Locale.of("es", "AR");

    private final ExpenseRepository expenseRepository;
    private final IncomeRepository incomeRepository;
    private final UserRepository userRepository;
    private final AlertDeliveryService alertDeliveryService;

    @Transactional(readOnly = true)
    public MonthlySummaryResponse getSummary(String email, int year, int month) {
        YearMonth requested = YearMonth.of(year, month);
        YearMonth current = YearMonth.now();
        if (!requested.isBefore(current)) {
            throw new AuthException(ErrorCode.INVALID_PERIOD,
                    "Monthly summary is only available for completed months");
        }
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AuthException(ErrorCode.USER_NOT_FOUND, "User not found"));
        return buildSummary(user, year, month);
    }

    @Transactional(readOnly = true)
    public void sendSummaryNotifications(int year, int month) {
        List<User> users = userRepository.findAll();
        for (User user : users) {
            if (!user.isEnabled()) {
                continue;
            }
            try {
                MonthlySummaryResponse summary = buildSummary(user, year, month);
                String body = buildNotificationBody(summary);
                alertDeliveryService.deliverAlert(user, AlertType.MONTHLY_SUMMARY, body);
            } catch (Exception e) {
                log.error("Error sending monthly summary to user {}", user.getEmail(), e);
            }
        }
    }

    private MonthlySummaryResponse buildSummary(User user, int year, int month) {
        YearMonth yearMonth = YearMonth.of(year, month);
        LocalDate start = yearMonth.atDay(1);
        LocalDate end = yearMonth.atEndOfMonth();

        YearMonth prevYearMonth = yearMonth.minusMonths(1);
        LocalDate prevStart = prevYearMonth.atDay(1);
        LocalDate prevEnd = prevYearMonth.atEndOfMonth();

        List<Expense> expenses = expenseRepository.findAllByUserAndDateBetween(user, start, end);
        List<Income> incomes = incomeRepository.findAllByUserAndDateBetween(user, start, end);
        List<Expense> prevExpenses = expenseRepository.findAllByUserAndDateBetween(user, prevStart, prevEnd);
        List<Income> prevIncomes = incomeRepository.findAllByUserAndDateBetween(user, prevStart, prevEnd);

        BigDecimal totalIncome = incomes.stream()
                .map(Income::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalExpenses = expenses.stream()
                .map(Expense::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal balance = totalIncome.subtract(totalExpenses);

        BigDecimal prevTotalExpenses = prevExpenses.stream()
                .map(Expense::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal prevTotalIncome = prevIncomes.stream()
                .map(Income::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        List<MonthlyCategoryBreakdown> categoryBreakdown = buildCategoryBreakdown(
                expenses, totalExpenses, prevExpenses);

        List<MonthlyInsight> insights = buildInsights(
                totalIncome, totalExpenses, balance, prevTotalIncome, prevTotalExpenses, categoryBreakdown);

        return new MonthlySummaryResponse(year, month, totalIncome, totalExpenses, balance,
                categoryBreakdown, insights);
    }

    private List<MonthlyCategoryBreakdown> buildCategoryBreakdown(
            List<Expense> expenses,
            BigDecimal totalExpenses,
            List<Expense> prevExpenses) {

        Map<ExpenseCategory, BigDecimal> prevByCategory = prevExpenses.stream()
                .collect(Collectors.groupingBy(
                        Expense::getCategory,
                        Collectors.reducing(BigDecimal.ZERO, Expense::getAmount, BigDecimal::add)));

        return expenses.stream()
                .collect(Collectors.groupingBy(
                        Expense::getCategory,
                        Collectors.reducing(BigDecimal.ZERO, Expense::getAmount, BigDecimal::add)))
                .entrySet()
                .stream()
                .map(entry -> {
                    ExpenseCategory category = entry.getKey();
                    BigDecimal amount = entry.getValue();
                    double pct = totalExpenses.compareTo(BigDecimal.ZERO) > 0
                            ? amount.divide(totalExpenses, 4, RoundingMode.HALF_UP)
                                    .multiply(BigDecimal.valueOf(100))
                                    .doubleValue()
                            : 0.0;
                    BigDecimal prev = prevByCategory.getOrDefault(category, BigDecimal.ZERO);
                    Double change = prev.compareTo(BigDecimal.ZERO) > 0
                            ? amount.subtract(prev)
                                    .divide(prev, 4, RoundingMode.HALF_UP)
                                    .multiply(BigDecimal.valueOf(100))
                                    .doubleValue()
                            : null;
                    return new MonthlyCategoryBreakdown(category, amount, pct, change);
                })
                .sorted(Comparator.comparing(MonthlyCategoryBreakdown::totalAmount).reversed())
                .toList();
    }

    private List<MonthlyInsight> buildInsights(
            BigDecimal totalIncome,
            BigDecimal totalExpenses,
            BigDecimal balance,
            BigDecimal prevTotalIncome,
            BigDecimal prevTotalExpenses,
            List<MonthlyCategoryBreakdown> categoryBreakdown) {

        List<MonthlyInsight> insights = new ArrayList<>();

        if (totalIncome.compareTo(BigDecimal.ZERO) > 0) {
            double savingsPct = balance.abs()
                    .divide(totalIncome, 4, RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100))
                    .doubleValue();
            if (balance.compareTo(BigDecimal.ZERO) >= 0) {
                String highlight = String.format(LOCALE_AR, "%.0f%%", savingsPct);
                insights.add(new MonthlyInsight("SAVINGS", "Ahorraste", highlight, "de tus ingresos", "positive", null));
            } else {
                String highlight = String.format(LOCALE_AR, "%.0f%%", savingsPct);
                insights.add(new MonthlyInsight("SAVINGS", "Gastaste", highlight, "más que tus ingresos", "negative", null));
            }
        }

        if (prevTotalExpenses.compareTo(BigDecimal.ZERO) > 0) {
            double changeExpenses = totalExpenses.subtract(prevTotalExpenses)
                    .divide(prevTotalExpenses, 4, RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100))
                    .doubleValue();
            String label;
            String highlight;
            String variant;
            if (changeExpenses > 0) {
                label = "Tus gastos aumentaron";
                highlight = String.format(LOCALE_AR, "+%.0f%%", changeExpenses);
                variant = "negative";
            } else {
                label = changeExpenses < 0 ? "Tus gastos bajaron" : "Tus gastos fueron estables";
                highlight = changeExpenses < 0
                        ? String.format(LOCALE_AR, "-%.0f%%", Math.abs(changeExpenses))
                        : "0%";
                variant = "positive";
            }
            insights.add(new MonthlyInsight("EXPENSES_VS_PREV_MONTH", label, highlight, "vs mes anterior", variant, null));
        }

        categoryBreakdown.stream().findFirst().ifPresent(top -> {
            String highlight = String.format(LOCALE_AR, "%.0f%%", top.percentage());
            insights.add(new MonthlyInsight("TOP_CATEGORY",
                    "Mayor gasto: " + formatCategory(top.category()), highlight, "del total", "neutral", top.category().name()));
        });

        categoryBreakdown.stream()
                .filter(c -> c.changeVsPreviousMonth() != null && c.changeVsPreviousMonth() > 0)
                .max(Comparator.comparingDouble(MonthlyCategoryBreakdown::changeVsPreviousMonth))
                .ifPresent(biggest -> {
                    String highlight = String.format(LOCALE_AR, "+%.0f%%", biggest.changeVsPreviousMonth());
                    insights.add(new MonthlyInsight("CATEGORY_INCREASE",
                            "Mayor aumento: " + formatCategory(biggest.category()), highlight, "vs mes anterior", "negative", biggest.category().name()));
                });

        categoryBreakdown.stream()
                .filter(c -> c.changeVsPreviousMonth() != null && c.changeVsPreviousMonth() < 0)
                .min(Comparator.comparingDouble(MonthlyCategoryBreakdown::changeVsPreviousMonth))
                .ifPresent(smallest -> {
                    String highlight = String.format(LOCALE_AR, "-%.0f%%", Math.abs(smallest.changeVsPreviousMonth()));
                    insights.add(new MonthlyInsight("CATEGORY_DECREASE",
                            "Mayor reducción: " + formatCategory(smallest.category()), highlight, "vs mes anterior", "positive", smallest.category().name()));
                });

        return insights;
    }

    private String buildNotificationBody(MonthlySummaryResponse summary) {
        return String.format(LOCALE_AR,
                "Ingresos: $%.0f | Gastos: $%.0f | Balance: $%.0f. Abrí la app para ver el detalle completo.",
                summary.totalIncome(), summary.totalExpenses(), summary.balance());
    }

    String formatCategory(ExpenseCategory category) {
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
}
