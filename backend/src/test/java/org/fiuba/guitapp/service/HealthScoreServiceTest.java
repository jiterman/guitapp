package org.fiuba.guitapp.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.fiuba.guitapp.dto.HealthScoreFactor;
import org.fiuba.guitapp.dto.HealthScoreResponse;
import org.fiuba.guitapp.model.Expense;
import org.fiuba.guitapp.model.ExpenseCategory;
import org.fiuba.guitapp.model.ExpenseType;
import org.fiuba.guitapp.model.Income;
import org.fiuba.guitapp.model.IncomeCategory;
import org.fiuba.guitapp.model.User;
import org.fiuba.guitapp.model.UserStatus;
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
@SuppressWarnings("null")
class HealthScoreServiceTest {

    @Mock
    private ExpenseRepository expenseRepository;

    @Mock
    private IncomeRepository incomeRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private HealthScoreService healthScoreService;

    private User activeUser;
    private final String email = "test@example.com";

    @BeforeEach
    void setUp() {
        activeUser = new User();
        activeUser.setId(UUID.randomUUID());
        activeUser.setEmail(email);
        activeUser.setStatus(UserStatus.ACTIVE);
        activeUser.setFirstName("Test");
        activeUser.setTargetSavings(20);
    }

    private Expense expense(BigDecimal amount, ExpenseCategory category, LocalDate date) {
        Expense e = new Expense();
        e.setId(UUID.randomUUID());
        e.setAmount(amount);
        e.setCategory(category);
        e.setType(ExpenseType.VARIABLE);
        e.setDate(date);
        e.setUser(activeUser);
        return e;
    }

    private Income income(BigDecimal amount, LocalDate date) {
        Income i = new Income();
        i.setId(UUID.randomUUID());
        i.setAmount(amount);
        i.setCategory(IncomeCategory.SALARY);
        i.setDate(date);
        i.setUser(activeUser);
        return i;
    }

    private HealthScoreFactor factorByKey(HealthScoreResponse r, String key) {
        return r.factors().stream().filter(f -> f.key().equals(key)).findFirst().orElseThrow();
    }

    @Test
    void getHealthScore_userWithSavings_returnsPositiveScoreWith3Factors() {
        when(userRepository.findByEmail(email)).thenReturn(Optional.of(activeUser));

        // Current month: income 3000, expenses 1500 -> savings rate 50% >= target 20%
        List<Expense> currentExpenses = List.of(
                expense(new BigDecimal("1000"), ExpenseCategory.RENT, LocalDate.of(2025, 4, 5)),
                expense(new BigDecimal("500"), ExpenseCategory.SUPERMARKET, LocalDate.of(2025, 4, 10)));
        List<Income> currentIncomes = List.of(income(new BigDecimal("3000"), LocalDate.of(2025, 4, 1)));
        List<Expense> prevExpenses = List.of(
                expense(new BigDecimal("1500"), ExpenseCategory.RENT, LocalDate.of(2025, 3, 5)));

        when(expenseRepository.findAllByUserAndDateBetween(eq(activeUser), any(), any()))
                .thenReturn(currentExpenses, prevExpenses);
        when(incomeRepository.findAllByUserAndDateBetween(eq(activeUser), any(), any()))
                .thenReturn(currentIncomes);

        HealthScoreResponse response = healthScoreService.getHealthScore(email, 2025, 4);

        assertNotNull(response);
        assertEquals(3, response.factors().size());
        assertTrue(response.score() > 0);
        assertTrue(response.score() <= 100);
        HealthScoreFactor savings = factorByKey(response, "savings");
        assertEquals("Capacidad de ahorro", savings.label());
        assertEquals(100, savings.score());
        assertEquals(100, savings.maxScore());
        assertNotNull(response.level());
        assertNotNull(response.title());
        assertNotNull(response.message());
    }

    @Test
    void getHealthScore_savingsAboveTarget_score100() {
        activeUser.setTargetSavings(20);
        when(userRepository.findByEmail(email)).thenReturn(Optional.of(activeUser));

        // income 1000, expenses 700 -> savings rate 30% > target 20%
        List<Expense> currentExpenses = List.of(
                expense(new BigDecimal("700"), ExpenseCategory.RENT, LocalDate.of(2025, 4, 5)));
        List<Income> currentIncomes = List.of(income(new BigDecimal("1000"), LocalDate.of(2025, 4, 1)));

        when(expenseRepository.findAllByUserAndDateBetween(eq(activeUser), any(), any()))
                .thenReturn(currentExpenses, Collections.emptyList());
        when(incomeRepository.findAllByUserAndDateBetween(eq(activeUser), any(), any()))
                .thenReturn(currentIncomes);

        HealthScoreResponse response = healthScoreService.getHealthScore(email, 2025, 4);

        assertEquals(100, factorByKey(response, "savings").score());
    }

    @Test
    void getHealthScore_savingsBelowTarget_scoreProportional() {
        activeUser.setTargetSavings(40);
        when(userRepository.findByEmail(email)).thenReturn(Optional.of(activeUser));

        // income 1000, expenses 800 -> savings rate 20%, target 40% -> score = 50
        List<Expense> currentExpenses = List.of(
                expense(new BigDecimal("800"), ExpenseCategory.RENT, LocalDate.of(2025, 4, 5)));
        List<Income> currentIncomes = List.of(income(new BigDecimal("1000"), LocalDate.of(2025, 4, 1)));

        when(expenseRepository.findAllByUserAndDateBetween(eq(activeUser), any(), any()))
                .thenReturn(currentExpenses, Collections.emptyList());
        when(incomeRepository.findAllByUserAndDateBetween(eq(activeUser), any(), any()))
                .thenReturn(currentIncomes);

        HealthScoreResponse response = healthScoreService.getHealthScore(email, 2025, 4);

        assertEquals(50, factorByKey(response, "savings").score());
    }

    @Test
    void getHealthScore_userWithDeficit_returnsLowSavingsScore() {
        when(userRepository.findByEmail(email)).thenReturn(Optional.of(activeUser));

        List<Expense> currentExpenses = List.of(
                expense(new BigDecimal("1500"), ExpenseCategory.RENT, LocalDate.of(2025, 4, 5)));
        List<Income> currentIncomes = List.of(income(new BigDecimal("1000"), LocalDate.of(2025, 4, 1)));

        when(expenseRepository.findAllByUserAndDateBetween(eq(activeUser), any(), any()))
                .thenReturn(currentExpenses, Collections.emptyList());
        when(incomeRepository.findAllByUserAndDateBetween(eq(activeUser), any(), any()))
                .thenReturn(currentIncomes);

        HealthScoreResponse response = healthScoreService.getHealthScore(email, 2025, 4);

        HealthScoreFactor savings = factorByKey(response, "savings");
        assertEquals(0, savings.score());
        assertEquals("Los gastos superaron tus ingresos este mes", savings.explanation());
    }

    @Test
    void getHealthScore_noPreviousMonthData_expenseControlDefaultsTo70() {
        when(userRepository.findByEmail(email)).thenReturn(Optional.of(activeUser));

        List<Expense> currentExpenses = List.of(
                expense(new BigDecimal("500"), ExpenseCategory.RENT, LocalDate.of(2025, 4, 5)));
        List<Income> currentIncomes = List.of(income(new BigDecimal("1000"), LocalDate.of(2025, 4, 1)));

        when(expenseRepository.findAllByUserAndDateBetween(eq(activeUser), any(), any()))
                .thenReturn(currentExpenses, Collections.emptyList());
        when(incomeRepository.findAllByUserAndDateBetween(eq(activeUser), any(), any()))
                .thenReturn(currentIncomes);

        HealthScoreResponse response = healthScoreService.getHealthScore(email, 2025, 4);

        HealthScoreFactor expenseControl = factorByKey(response, "expenseControl");
        assertEquals(70, expenseControl.score());
        assertEquals("Sin datos del mes anterior para comparar", expenseControl.explanation());
        assertEquals("Control de gastos", expenseControl.label());
    }

    @Test
    void getHealthScore_nonEssentialBelow20Percent_distributionScoreIs100() {
        when(userRepository.findByEmail(email)).thenReturn(Optional.of(activeUser));

        // Restaurant 150 of 1000 total (15% non-essential) <= 20%
        List<Expense> currentExpenses = List.of(
                expense(new BigDecimal("150"), ExpenseCategory.RESTAURANT, LocalDate.of(2025, 4, 5)),
                expense(new BigDecimal("850"), ExpenseCategory.RENT, LocalDate.of(2025, 4, 10)));
        List<Income> currentIncomes = List.of(income(new BigDecimal("1500"), LocalDate.of(2025, 4, 1)));

        when(expenseRepository.findAllByUserAndDateBetween(eq(activeUser), any(), any()))
                .thenReturn(currentExpenses, Collections.emptyList());
        when(incomeRepository.findAllByUserAndDateBetween(eq(activeUser), any(), any()))
                .thenReturn(currentIncomes);

        HealthScoreResponse response = healthScoreService.getHealthScore(email, 2025, 4);

        HealthScoreFactor distribution = factorByKey(response, "distribution");
        assertEquals(100, distribution.score());
        assertEquals("Distribución de gastos", distribution.label());
        assertEquals("Tus gastos no esenciales están bien controlados", distribution.explanation());
    }

    @Test
    void getHealthScore_nonEssentialAt22Percent_distributionScoreBetween60And100() {
        when(userRepository.findByEmail(email)).thenReturn(Optional.of(activeUser));

        // Restaurant 220 of 1000 total (22% non-essential) — between 20% and 25% -> score ~84
        List<Expense> currentExpenses = List.of(
                expense(new BigDecimal("220"), ExpenseCategory.RESTAURANT, LocalDate.of(2025, 4, 5)),
                expense(new BigDecimal("780"), ExpenseCategory.RENT, LocalDate.of(2025, 4, 10)));
        List<Income> currentIncomes = List.of(income(new BigDecimal("1500"), LocalDate.of(2025, 4, 1)));

        when(expenseRepository.findAllByUserAndDateBetween(eq(activeUser), any(), any()))
                .thenReturn(currentExpenses, Collections.emptyList());
        when(incomeRepository.findAllByUserAndDateBetween(eq(activeUser), any(), any()))
                .thenReturn(currentIncomes);

        HealthScoreResponse response = healthScoreService.getHealthScore(email, 2025, 4);

        HealthScoreFactor distribution = factorByKey(response, "distribution");
        assertTrue(distribution.score() > 60 && distribution.score() < 100);
        assertEquals("Los gastos no esenciales están un poco altos", distribution.explanation());
    }

    @Test
    void getHealthScore_nonEssentialOver30Percent_distributionScoreIs30() {
        when(userRepository.findByEmail(email)).thenReturn(Optional.of(activeUser));

        // Restaurant 400 + Delivery 100 = 500 of 1000 total (50% non-essential) > 30%
        List<Expense> currentExpenses = List.of(
                expense(new BigDecimal("400"), ExpenseCategory.RESTAURANT, LocalDate.of(2025, 4, 5)),
                expense(new BigDecimal("100"), ExpenseCategory.DELIVERY, LocalDate.of(2025, 4, 6)),
                expense(new BigDecimal("500"), ExpenseCategory.RENT, LocalDate.of(2025, 4, 10)));
        List<Income> currentIncomes = List.of(income(new BigDecimal("1500"), LocalDate.of(2025, 4, 1)));

        when(expenseRepository.findAllByUserAndDateBetween(eq(activeUser), any(), any()))
                .thenReturn(currentExpenses, Collections.emptyList());
        when(incomeRepository.findAllByUserAndDateBetween(eq(activeUser), any(), any()))
                .thenReturn(currentIncomes);

        HealthScoreResponse response = healthScoreService.getHealthScore(email, 2025, 4);

        HealthScoreFactor distribution = factorByKey(response, "distribution");
        assertEquals(30, distribution.score());
        assertEquals("Distribución de gastos", distribution.label());
        assertEquals("Más del 30% de tus gastos son no esenciales", distribution.explanation());
    }

    @Test
    void getHealthScore_nonEssentialAt27Percent_distributionScoreBetween30And60() {
        when(userRepository.findByEmail(email)).thenReturn(Optional.of(activeUser));

        // Restaurant 270 of 1000 total (27% non-essential) — between 25% and 30%
        List<Expense> currentExpenses = List.of(
                expense(new BigDecimal("270"), ExpenseCategory.RESTAURANT, LocalDate.of(2025, 4, 5)),
                expense(new BigDecimal("730"), ExpenseCategory.RENT, LocalDate.of(2025, 4, 10)));
        List<Income> currentIncomes = List.of(income(new BigDecimal("1500"), LocalDate.of(2025, 4, 1)));

        when(expenseRepository.findAllByUserAndDateBetween(eq(activeUser), any(), any()))
                .thenReturn(currentExpenses, Collections.emptyList());
        when(incomeRepository.findAllByUserAndDateBetween(eq(activeUser), any(), any()))
                .thenReturn(currentIncomes);

        HealthScoreResponse response = healthScoreService.getHealthScore(email, 2025, 4);

        HealthScoreFactor distribution = factorByKey(response, "distribution");
        assertTrue(distribution.score() > 30 && distribution.score() < 60);
        assertEquals("Los gastos no esenciales están bastante altos", distribution.explanation());
    }
}
