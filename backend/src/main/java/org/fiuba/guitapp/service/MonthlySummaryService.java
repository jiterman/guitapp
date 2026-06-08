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
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.fiuba.guitapp.dto.MonthlyCategoryBreakdown;
import org.fiuba.guitapp.dto.MonthlyInsight;
import org.fiuba.guitapp.dto.MonthlySummaryResponse;
import org.fiuba.guitapp.exception.AuthException;
import org.fiuba.guitapp.exception.ErrorCode;
import org.fiuba.guitapp.model.AlertType;
import org.fiuba.guitapp.model.Expense;
import org.fiuba.guitapp.model.ExpenseCategory;
import org.fiuba.guitapp.model.ExpenseType;
import org.fiuba.guitapp.model.Income;
import org.fiuba.guitapp.model.User;
import org.fiuba.guitapp.repository.ExpenseRepository;
import org.fiuba.guitapp.repository.IncomeRepository;
import org.fiuba.guitapp.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class MonthlySummaryService {

    private static final Locale LOCALE_AR = Locale.of("es", "AR");

    private static final java.util.Set<
        ExpenseCategory
    > NON_ESSENTIAL_CATEGORIES = java.util.EnumSet.of(
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
        ExpenseCategory.TECHNOLOGY
    );

    private final ExpenseRepository expenseRepository;
    private final IncomeRepository incomeRepository;
    private final UserRepository userRepository;
    private final AlertDeliveryService alertDeliveryService;

    @Transactional(readOnly = true)
    public MonthlySummaryResponse getSummary(
        String email,
        int year,
        int month
    ) {
        YearMonth requested = YearMonth.of(year, month);
        YearMonth current = YearMonth.now();
        if (!requested.isBefore(current)) {
            throw new AuthException(
                ErrorCode.INVALID_PERIOD,
                "Monthly summary is only available for completed months"
            );
        }
        User user = userRepository
            .findByEmail(email)
            .orElseThrow(() ->
                new AuthException(ErrorCode.USER_NOT_FOUND, "User not found")
            );
        return buildSummary(user, year, month);
    }

    @Transactional
    public void sendSummaryNotifications(int year, int month) {
        List<User> users = userRepository.findAll();
        for (User user : users) {
            if (!user.isEnabled()) {
                continue;
            }
            try {
                MonthlySummaryResponse summary = buildSummary(
                    user,
                    year,
                    month
                );
                String body = buildNotificationBody(summary);
                alertDeliveryService.deliverAlert(
                    user,
                    AlertType.MONTHLY_SUMMARY,
                    body
                );
            } catch (Exception e) {
                log.error(
                    "Error sending monthly summary to user {}",
                    user.getEmail(),
                    e
                );
            }
        }
    }

    private MonthlySummaryResponse buildSummary(
        User user,
        int year,
        int month
    ) {
        YearMonth yearMonth = YearMonth.of(year, month);
        LocalDate start = yearMonth.atDay(1);
        LocalDate end = yearMonth.atEndOfMonth();

        YearMonth prevYearMonth = yearMonth.minusMonths(1);
        LocalDate prevStart = prevYearMonth.atDay(1);
        LocalDate prevEnd = prevYearMonth.atEndOfMonth();

        List<Expense> expenses = expenseRepository.findAllByUserAndDateBetween(
            user,
            start,
            end
        );
        List<Income> incomes = incomeRepository.findAllByUserAndDateBetween(
            user,
            start,
            end
        );
        List<Expense> prevExpenses =
            expenseRepository.findAllByUserAndDateBetween(
                user,
                prevStart,
                prevEnd
            );
        List<Income> prevIncomes = incomeRepository.findAllByUserAndDateBetween(
            user,
            prevStart,
            prevEnd
        );

        BigDecimal totalIncome = incomes
            .stream()
            .map(Income::getAmount)
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalExpenses = expenses
            .stream()
            .map(Expense::getAmount)
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal balance = totalIncome.subtract(totalExpenses);

        BigDecimal prevTotalExpenses = prevExpenses
            .stream()
            .map(Expense::getAmount)
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal prevTotalIncome = prevIncomes
            .stream()
            .map(Income::getAmount)
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        List<MonthlyCategoryBreakdown> categoryBreakdown =
            buildCategoryBreakdown(expenses, totalExpenses, prevExpenses);

        List<Expense> variableExpenses = expenses
            .stream()
            .filter(
                expense ->
                    expense.getType() == null ||
                    expense.getType() == ExpenseType.VARIABLE
            )
            .toList();

        List<MonthlyInsight> insights = buildInsights(
            totalIncome,
            totalExpenses,
            balance,
            prevTotalIncome,
            prevTotalExpenses,
            categoryBreakdown,
            variableExpenses
        );

        return new MonthlySummaryResponse(
            year,
            month,
            totalIncome,
            totalExpenses,
            balance,
            categoryBreakdown,
            insights
        );
    }

    private List<MonthlyCategoryBreakdown> buildCategoryBreakdown(
        List<Expense> expenses,
        BigDecimal totalExpenses,
        List<Expense> prevExpenses
    ) {
        Map<ExpenseCategory, BigDecimal> prevByCategory = prevExpenses
            .stream()
            .collect(
                Collectors.groupingBy(
                    Expense::getCategory,
                    Collectors.reducing(
                        BigDecimal.ZERO,
                        Expense::getAmount,
                        BigDecimal::add
                    )
                )
            );

        return expenses
            .stream()
            .collect(
                Collectors.groupingBy(
                    Expense::getCategory,
                    Collectors.reducing(
                        BigDecimal.ZERO,
                        Expense::getAmount,
                        BigDecimal::add
                    )
                )
            )
            .entrySet()
            .stream()
            .map(entry -> {
                ExpenseCategory category = entry.getKey();
                BigDecimal amount = entry.getValue();
                double pct =
                    totalExpenses.compareTo(BigDecimal.ZERO) > 0
                        ? amount
                              .divide(totalExpenses, 4, RoundingMode.HALF_UP)
                              .multiply(BigDecimal.valueOf(100))
                              .doubleValue()
                        : 0.0;
                BigDecimal prev = prevByCategory.getOrDefault(
                    category,
                    BigDecimal.ZERO
                );
                Double change =
                    prev.compareTo(BigDecimal.ZERO) > 0
                        ? amount
                              .subtract(prev)
                              .divide(prev, 4, RoundingMode.HALF_UP)
                              .multiply(BigDecimal.valueOf(100))
                              .doubleValue()
                        : null;
                return new MonthlyCategoryBreakdown(
                    category,
                    amount,
                    pct,
                    change
                );
            })
            .sorted(
                Comparator.comparing(
                    MonthlyCategoryBreakdown::totalAmount
                ).reversed()
            )
            .toList();
    }

    private List<MonthlyInsight> buildInsights(
        BigDecimal totalIncome,
        BigDecimal totalExpenses,
        BigDecimal balance,
        BigDecimal prevTotalIncome,
        BigDecimal prevTotalExpenses,
        List<MonthlyCategoryBreakdown> categoryBreakdown,
        List<Expense> variableExpenses
    ) {
        List<MonthlyInsight> insights = new ArrayList<>();

        if (totalIncome.compareTo(BigDecimal.ZERO) > 0) {
            double savingsPct = balance
                .abs()
                .divide(totalIncome, 4, RoundingMode.HALF_UP)
                .multiply(BigDecimal.valueOf(100))
                .doubleValue();
            if (balance.compareTo(BigDecimal.ZERO) >= 0) {
                String highlight = String.format(
                    LOCALE_AR,
                    "%.0f%%",
                    savingsPct
                );
                insights.add(
                    new MonthlyInsight(
                        "SAVINGS",
                        "Ahorraste",
                        highlight,
                        "de tus ingresos",
                        "positive",
                        null
                    )
                );
            } else {
                String highlight = String.format(
                    LOCALE_AR,
                    "%.0f%%",
                    savingsPct
                );
                insights.add(
                    new MonthlyInsight(
                        "SAVINGS",
                        "Gastaste",
                        highlight,
                        "más que tus ingresos",
                        "negative",
                        null
                    )
                );
            }
        }

        if (prevTotalExpenses.compareTo(BigDecimal.ZERO) > 0) {
            double changeExpenses = totalExpenses
                .subtract(prevTotalExpenses)
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
                label =
                    changeExpenses < 0
                        ? "Tus gastos bajaron"
                        : "Tus gastos fueron estables";
                highlight =
                    changeExpenses < 0
                        ? String.format(
                              LOCALE_AR,
                              "-%.0f%%",
                              Math.abs(changeExpenses)
                          )
                        : "0%";
                variant = "positive";
            }
            insights.add(
                new MonthlyInsight(
                    "EXPENSES_VS_PREV_MONTH",
                    label,
                    highlight,
                    "vs mes anterior",
                    variant,
                    null
                )
            );
        }

        categoryBreakdown
            .stream()
            .findFirst()
            .ifPresent(top -> {
                String highlight = String.format(
                    LOCALE_AR,
                    "%.0f%%",
                    top.percentage()
                );
                insights.add(
                    new MonthlyInsight(
                        "TOP_CATEGORY",
                        "Mayor gasto: " + formatCategory(top.category()),
                        highlight,
                        "del total",
                        "neutral",
                        top.category().name()
                    )
                );
            });

        categoryBreakdown
            .stream()
            .filter(
                c ->
                    c.changeVsPreviousMonth() != null &&
                    c.changeVsPreviousMonth() > 0
            )
            .max(
                Comparator.comparingDouble(
                    MonthlyCategoryBreakdown::changeVsPreviousMonth
                )
            )
            .ifPresent(biggest -> {
                String highlight = String.format(
                    LOCALE_AR,
                    "+%.0f%%",
                    biggest.changeVsPreviousMonth()
                );
                insights.add(
                    new MonthlyInsight(
                        "CATEGORY_INCREASE",
                        "Mayor aumento: " + formatCategory(biggest.category()),
                        highlight,
                        "vs mes anterior",
                        "negative",
                        biggest.category().name()
                    )
                );
            });

        categoryBreakdown
            .stream()
            .filter(
                c ->
                    c.changeVsPreviousMonth() != null &&
                    c.changeVsPreviousMonth() < 0
            )
            .min(
                Comparator.comparingDouble(
                    MonthlyCategoryBreakdown::changeVsPreviousMonth
                )
            )
            .ifPresent(smallest -> {
                String highlight = String.format(
                    LOCALE_AR,
                    "-%.0f%%",
                    Math.abs(smallest.changeVsPreviousMonth())
                );
                insights.add(
                    new MonthlyInsight(
                        "CATEGORY_DECREASE",
                        "Mayor reducción: " +
                            formatCategory(smallest.category()),
                        highlight,
                        "vs mes anterior",
                        "positive",
                        smallest.category().name()
                    )
                );
            });

        buildWeekdayCategoryInsight(variableExpenses).ifPresent(insights::add);

        buildWeeklyVariableInsight(variableExpenses).ifPresent(insights::add);

        if (totalExpenses.compareTo(BigDecimal.ZERO) > 0) {
            BigDecimal nonEssentialSum = categoryBreakdown
                .stream()
                .filter(c -> NON_ESSENTIAL_CATEGORIES.contains(c.category()))
                .map(MonthlyCategoryBreakdown::totalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
            double nonEssentialPct = nonEssentialSum
                .divide(totalExpenses, 4, RoundingMode.HALF_UP)
                .multiply(BigDecimal.valueOf(100))
                .doubleValue();
            String highlight = String.format(
                LOCALE_AR,
                "%.0f%%",
                nonEssentialPct
            );
            String variant =
                nonEssentialPct <= 20
                    ? "positive"
                    : nonEssentialPct <= 30
                        ? "neutral"
                        : "negative";
            insights.add(
                new MonthlyInsight(
                    "NON_ESSENTIAL_RATIO",
                    "Gastos no esenciales",
                    highlight,
                    "del total",
                    variant,
                    null
                )
            );
        }

        return insights;
    }

    private java.util.Optional<MonthlyInsight> buildWeekdayCategoryInsight(
        List<Expense> variableExpenses
    ) {
        if (variableExpenses.isEmpty()) {
            return java.util.Optional.empty();
        }

        record CategoryWeekdayCandidate(
            ExpenseCategory category,
            java.time.DayOfWeek day,
            BigDecimal totalAmount,
            double percentage
        ) {}

        return variableExpenses
            .stream()
            .collect(
                Collectors.groupingBy(
                    Expense::getCategory,
                    Collectors.reducing(
                        BigDecimal.ZERO,
                        Expense::getAmount,
                        BigDecimal::add
                    )
                )
            )
            .entrySet()
            .stream()
            .map(entry -> {
                ExpenseCategory category = entry.getKey();
                BigDecimal categoryTotal = entry.getValue();
                java.util.Map<java.time.DayOfWeek, BigDecimal> byDay =
                    variableExpenses
                        .stream()
                        .filter(expense -> expense.getCategory() == category)
                        .collect(
                            Collectors.groupingBy(
                                expense -> expense.getDate().getDayOfWeek(),
                                Collectors.reducing(
                                    BigDecimal.ZERO,
                                    Expense::getAmount,
                                    BigDecimal::add
                                )
                            )
                        );

                java.util.Set<LocalDate> distinctDates = variableExpenses
                    .stream()
                    .filter(expense -> expense.getCategory() == category)
                    .map(Expense::getDate)
                    .collect(Collectors.toSet());
                if (distinctDates.size() <= 1) {
                    return null;
                }
                java.util.Map.Entry<java.time.DayOfWeek, BigDecimal> topDay =
                    byDay
                        .entrySet()
                        .stream()
                        .max(java.util.Map.Entry.comparingByValue())
                        .orElse(null);
                if (
                    topDay == null ||
                    categoryTotal.compareTo(BigDecimal.ZERO) <= 0
                ) {
                    return null;
                }
                double percentage = topDay
                    .getValue()
                    .divide(categoryTotal, 4, RoundingMode.HALF_UP)
                    .doubleValue();
                if (percentage <= 0.5) {
                    return null;
                }
                return new CategoryWeekdayCandidate(
                    category,
                    topDay.getKey(),
                    categoryTotal,
                    percentage
                );
            })
            .filter(java.util.Objects::nonNull)
            .max(Comparator.comparing(CategoryWeekdayCandidate::totalAmount))
            .map(candidate -> {
                String dayName = formatDayOfWeek(candidate.day());
                String categoryName = formatCategory(candidate.category());
                String highlight = String.format(
                    LOCALE_AR,
                    "%.0f%%",
                    candidate.percentage() * 100
                );
                String label = "Los días " + dayName + " fueron el";
                String sub = "del total de gastos en " + categoryName;
                return new MonthlyInsight(
                    "CATEGORY_WEEKDAY_CONCENTRATION",
                    label,
                    highlight,
                    sub,
                    "neutral",
                    candidate.category().name()
                );
            });
    }

    private java.util.Optional<MonthlyInsight> buildWeeklyVariableInsight(
        List<Expense> variableExpenses
    ) {
        if (variableExpenses.isEmpty()) {
            return java.util.Optional.empty();
        }

        java.util.Map<LocalDate, BigDecimal> sumByWeekStart =
            new java.util.HashMap<>();
        java.util.Map<
            LocalDate,
            java.util.Set<java.time.DayOfWeek>
        > daysByWeekStart = new java.util.HashMap<>();

        for (Expense expense : variableExpenses) {
            LocalDate date = expense.getDate();
            LocalDate weekStart = date.with(
                java.time.temporal.TemporalAdjusters.previousOrSame(
                    java.time.DayOfWeek.SUNDAY
                )
            );
            sumByWeekStart.merge(
                weekStart,
                expense.getAmount(),
                BigDecimal::add
            );
            daysByWeekStart
                .computeIfAbsent(weekStart, key -> new java.util.HashSet<>())
                .add(date.getDayOfWeek());
        }

        BigDecimal totalVariable = variableExpenses
            .stream()
            .map(Expense::getAmount)
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        if (totalVariable.compareTo(BigDecimal.ZERO) <= 0) {
            return java.util.Optional.empty();
        }

        record WeekCandidate(
            LocalDate weekStart,
            BigDecimal totalAmount,
            double percentage
        ) {}

        return sumByWeekStart
            .entrySet()
            .stream()
            .map(entry -> {
                LocalDate weekStart = entry.getKey();
                BigDecimal amount = entry.getValue();
                java.util.Set<java.time.DayOfWeek> days =
                    daysByWeekStart.getOrDefault(weekStart, java.util.Set.of());
                if (days.size() <= 1) {
                    return null;
                }
                double percentage = amount
                    .divide(totalVariable, 4, RoundingMode.HALF_UP)
                    .doubleValue();
                if (percentage <= 0.5) {
                    return null;
                }
                return new WeekCandidate(weekStart, amount, percentage);
            })
            .filter(java.util.Objects::nonNull)
            .max(Comparator.comparing(WeekCandidate::totalAmount))
            .map(candidate -> {
                String highlight = String.format(
                    LOCALE_AR,
                    "%.0f%%",
                    candidate.percentage() * 100
                );
                String monthName = candidate
                    .weekStart()
                    .getMonth()
                    .getDisplayName(java.time.format.TextStyle.FULL, LOCALE_AR);
                String sub = String.format(
                    LOCALE_AR,
                    "del total en la semana del %d de %s",
                    candidate.weekStart().getDayOfMonth(),
                    monthName
                );
                return new MonthlyInsight(
                    "WEEKLY_VARIABLE_CONCENTRATION",
                    "Gastaste",
                    highlight,
                    sub,
                    "neutral",
                    null
                );
            });
    }

    private String formatDayOfWeek(java.time.DayOfWeek dayOfWeek) {
        return switch (dayOfWeek) {
            case MONDAY -> "Lunes";
            case TUESDAY -> "Martes";
            case WEDNESDAY -> "Miércoles";
            case THURSDAY -> "Jueves";
            case FRIDAY -> "Viernes";
            case SATURDAY -> "Sábado";
            case SUNDAY -> "Domingo";
        };
    }

    private String buildNotificationBody(MonthlySummaryResponse summary) {
        return String.format(
            LOCALE_AR,
            "Descubrí cómo cerró tu mes, qué gastos tuvieron mayor impacto y cuál fue tu salud financiera.",
            summary.totalIncome(),
            summary.totalExpenses(),
            summary.balance()
        );
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
