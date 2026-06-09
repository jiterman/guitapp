package org.fiuba.guitapp.service;

import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.YearMonth;
import java.time.temporal.TemporalAdjusters;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.fiuba.guitapp.dto.MonthlySummaryResponse;
import org.fiuba.guitapp.model.Expense;
import org.fiuba.guitapp.model.ExpenseCategory;
import org.fiuba.guitapp.model.ExpenseType;
import org.fiuba.guitapp.model.Income;
import org.fiuba.guitapp.model.IncomeCategory;
import org.fiuba.guitapp.model.User;
import org.fiuba.guitapp.repository.ExpenseRepository;
import org.fiuba.guitapp.repository.IncomeRepository;
import org.fiuba.guitapp.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class MonthlySummaryServiceTest {

    @Mock
    private ExpenseRepository expenseRepository;

    @Mock
    private IncomeRepository incomeRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private AlertDeliveryService alertDeliveryService;

    @InjectMocks
    private MonthlySummaryService monthlySummaryService;

    private User user;
    private YearMonth targetMonth;

    @BeforeEach
    void setUp() {
        user = new User();
        user.setId(UUID.randomUUID());
        user.setEmail("test@example.com");
        targetMonth = YearMonth.now().minusMonths(1);

        when(userRepository.findByEmail(user.getEmail())).thenReturn(
                Optional.of(user));
        when(
                incomeRepository.findAllByUserAndDateBetween(
                        eq(user),
                        any(LocalDate.class),
                        any(LocalDate.class)))
                .thenReturn(
                        List.of(buildIncome(targetMonth.atDay(5), new BigDecimal("100000"))));
    }

    @Test
    void getSummary_shouldIncludeWeekdayCategoryInsight_whenCategoryHasDayOverHalf() {
        LocalDate firstSaturday = targetMonth
                .atDay(1)
                .with(TemporalAdjusters.nextOrSame(DayOfWeek.SATURDAY));
        LocalDate secondSaturday = firstSaturday.plusWeeks(1);
        LocalDate thirdSaturday = firstSaturday.plusWeeks(2);

        Expense taxiFirstSaturday = buildExpense(
                firstSaturday,
                new BigDecimal("700"),
                ExpenseCategory.TAXI);
        Expense taxiSecondSaturday = buildExpense(
                secondSaturday,
                new BigDecimal("200"),
                ExpenseCategory.TAXI);
        Expense taxiThirdSaturday = buildExpense(
                thirdSaturday,
                new BigDecimal("100"),
                ExpenseCategory.TAXI);
        Expense cafeFirstSaturday = buildExpense(
                firstSaturday,
                new BigDecimal("200"),
                ExpenseCategory.CAFE);
        Expense cafeSunday = buildExpense(
                firstSaturday.with(TemporalAdjusters.next(DayOfWeek.SUNDAY)),
                new BigDecimal("200"),
                ExpenseCategory.CAFE);

        List<Expense> currentMonthExpenses = List.of(
                taxiFirstSaturday,
                taxiSecondSaturday,
                taxiThirdSaturday,
                cafeFirstSaturday,
                cafeSunday);

        when(
                expenseRepository.findAllByUserAndDateBetween(
                        eq(user),
                        any(LocalDate.class),
                        any(LocalDate.class)))
                .thenAnswer(invocation -> {
                    LocalDate start = invocation.getArgument(1);
                    if (YearMonth.from(start).equals(targetMonth)) {
                        return currentMonthExpenses;
                    }
                    return Collections.emptyList();
                });

        MonthlySummaryResponse response = monthlySummaryService.getSummary(
                user.getEmail(),
                targetMonth.getYear(),
                targetMonth.getMonthValue());

        assertTrue(
                response
                        .insights()
                        .stream()
                        .anyMatch(
                                insight -> insight
                                        .type()
                                        .equals("CATEGORY_WEEKDAY_CONCENTRATION") &&
                                        insight.label().contains("Sábado") &&
                                        insight.category().equals(ExpenseCategory.TAXI.name())));
    }

    @Test
    void getSummary_shouldIncludeWeeklyVariableInsight_whenWeekExceedsHalf() {
        LocalDate firstSunday = targetMonth
                .atDay(1)
                .with(TemporalAdjusters.nextOrSame(DayOfWeek.SUNDAY));
        LocalDate sameWeekTuesday = firstSunday.with(
                TemporalAdjusters.next(DayOfWeek.TUESDAY));
        LocalDate nextWeekSunday = firstSunday.plusWeeks(1);

        Expense weekOneSunday = buildExpense(
                firstSunday,
                new BigDecimal("80"),
                ExpenseCategory.OUTINGS);
        Expense weekOneTuesday = buildExpense(
                sameWeekTuesday,
                new BigDecimal("40"),
                ExpenseCategory.OUTINGS);
        Expense weekTwoSunday = buildExpense(
                nextWeekSunday,
                new BigDecimal("80"),
                ExpenseCategory.OUTINGS);

        List<Expense> currentMonthExpenses = List.of(
                weekOneSunday,
                weekOneTuesday,
                weekTwoSunday);

        when(
                expenseRepository.findAllByUserAndDateBetween(
                        eq(user),
                        any(LocalDate.class),
                        any(LocalDate.class)))
                .thenAnswer(invocation -> {
                    LocalDate start = invocation.getArgument(1);
                    if (YearMonth.from(start).equals(targetMonth)) {
                        return currentMonthExpenses;
                    }
                    return Collections.emptyList();
                });

        MonthlySummaryResponse response = monthlySummaryService.getSummary(
                user.getEmail(),
                targetMonth.getYear(),
                targetMonth.getMonthValue());

        assertTrue(
                response
                        .insights()
                        .stream()
                        .anyMatch(
                                insight -> insight
                                        .type()
                                        .equals("WEEKLY_VARIABLE_CONCENTRATION") &&
                                        insight.sub().contains("semana del") &&
                                        insight
                                                .sub()
                                                .contains(
                                                        String.valueOf(firstSunday.getDayOfMonth()))));
    }

    private Expense buildExpense(
            LocalDate date,
            BigDecimal amount,
            ExpenseCategory category) {
        Expense expense = new Expense();
        expense.setUser(user);
        expense.setDate(date);
        expense.setAmount(amount);
        expense.setCategory(category);
        expense.setType(ExpenseType.VARIABLE);
        return expense;
    }

    private Income buildIncome(LocalDate date, BigDecimal amount) {
        Income income = new Income();
        income.setUser(user);
        income.setDate(date);
        income.setAmount(amount);
        income.setCategory(IncomeCategory.SALARY);
        return income;
    }
}
