package org.fiuba.guitapp.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.fiuba.guitapp.dto.MonthlySummaryResponse;
import org.fiuba.guitapp.exception.AuthException;
import org.fiuba.guitapp.model.AlertType;
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
class MonthlySummaryServiceTests {

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

    private User activeUser;
    private User inactiveUser;
    private final String email = "test@example.com";

    @BeforeEach
    void setUp() {
        activeUser = new User();
        activeUser.setId(UUID.randomUUID());
        activeUser.setEmail(email);
        activeUser.setStatus(UserStatus.ACTIVE);
        activeUser.setFirstName("Test");

        inactiveUser = new User();
        inactiveUser.setId(UUID.randomUUID());
        inactiveUser.setEmail("inactive@example.com");
        inactiveUser.setStatus(UserStatus.PENDING_VERIFICATION);
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

    @Test
    void getSummary_returnsTotalsAndBalance() {
        when(userRepository.findByEmail(email)).thenReturn(Optional.of(activeUser));

        List<Expense> expenses = List.of(
                expense(new BigDecimal("1000"), ExpenseCategory.RENT, LocalDate.of(2025, 4, 5)),
                expense(new BigDecimal("500"), ExpenseCategory.DELIVERY, LocalDate.of(2025, 4, 10)));
        List<Income> incomes = List.of(income(new BigDecimal("3000"), LocalDate.of(2025, 4, 1)));

        when(expenseRepository.findAllByUserAndDateBetween(eq(activeUser), any(), any()))
                .thenReturn(expenses, Collections.emptyList());
        when(incomeRepository.findAllByUserAndDateBetween(eq(activeUser), any(), any()))
                .thenReturn(incomes, Collections.emptyList());

        MonthlySummaryResponse summary = monthlySummaryService.getSummary(email, 2025, 4);

        assertEquals(2025, summary.year());
        assertEquals(4, summary.month());
        assertEquals(new BigDecimal("3000"), summary.totalIncome());
        assertEquals(new BigDecimal("1500"), summary.totalExpenses());
        assertEquals(new BigDecimal("1500"), summary.balance());
    }

    @Test
    void getSummary_throwsWhenUserNotFound() {
        when(userRepository.findByEmail(email)).thenReturn(Optional.empty());
        assertThrows(AuthException.class, () -> monthlySummaryService.getSummary(email, 2025, 4));
    }

    @Test
    void getSummary_throwsWhenRequestedMonthIsCurrentMonth() {
        java.time.YearMonth now = java.time.YearMonth.now();
        assertThrows(AuthException.class,
                () -> monthlySummaryService.getSummary(email, now.getYear(), now.getMonthValue()));
    }

    @Test
    void getSummary_throwsWhenRequestedMonthIsFuture() {
        java.time.YearMonth future = java.time.YearMonth.now().plusMonths(1);
        assertThrows(AuthException.class,
                () -> monthlySummaryService.getSummary(email, future.getYear(), future.getMonthValue()));
    }

    @Test
    void getSummary_buildsCategoryBreakdown_sortedByAmount() {
        when(userRepository.findByEmail(email)).thenReturn(Optional.of(activeUser));

        List<Expense> expenses = List.of(
                expense(new BigDecimal("200"), ExpenseCategory.DELIVERY, LocalDate.of(2025, 4, 5)),
                expense(new BigDecimal("800"), ExpenseCategory.RENT, LocalDate.of(2025, 4, 5)));

        when(expenseRepository.findAllByUserAndDateBetween(eq(activeUser), any(), any()))
                .thenReturn(expenses, Collections.emptyList());
        when(incomeRepository.findAllByUserAndDateBetween(eq(activeUser), any(), any()))
                .thenReturn(Collections.emptyList(), Collections.emptyList());

        MonthlySummaryResponse summary = monthlySummaryService.getSummary(email, 2025, 4);

        assertEquals(2, summary.categoryBreakdown().size());
        assertEquals(ExpenseCategory.RENT, summary.categoryBreakdown().get(0).category());
        assertEquals(80.0, summary.categoryBreakdown().get(0).percentage(), 0.1);
        assertEquals(ExpenseCategory.DELIVERY, summary.categoryBreakdown().get(1).category());
    }

    @Test
    void getSummary_categoryChangeVsPreviousMonth_calculatedCorrectly() {
        when(userRepository.findByEmail(email)).thenReturn(Optional.of(activeUser));

        List<Expense> currentExpenses = List.of(
                expense(new BigDecimal("242"), ExpenseCategory.DELIVERY, LocalDate.of(2025, 4, 5)));
        List<Expense> prevExpenses = List.of(
                expense(new BigDecimal("100"), ExpenseCategory.DELIVERY, LocalDate.of(2025, 3, 5)));

        when(expenseRepository.findAllByUserAndDateBetween(eq(activeUser), any(), any()))
                .thenReturn(currentExpenses, prevExpenses);
        when(incomeRepository.findAllByUserAndDateBetween(eq(activeUser), any(), any()))
                .thenReturn(Collections.emptyList(), Collections.emptyList());

        MonthlySummaryResponse summary = monthlySummaryService.getSummary(email, 2025, 4);

        assertNotNull(summary.categoryBreakdown().get(0).changeVsPreviousMonth());
        assertEquals(142.0, summary.categoryBreakdown().get(0).changeVsPreviousMonth(), 0.5);
    }

    @Test
    void getSummary_categoryChangeVsPreviousMonth_nullWhenNoPreviousData() {
        when(userRepository.findByEmail(email)).thenReturn(Optional.of(activeUser));

        List<Expense> currentExpenses = List.of(
                expense(new BigDecimal("100"), ExpenseCategory.DELIVERY, LocalDate.of(2025, 4, 5)));

        when(expenseRepository.findAllByUserAndDateBetween(eq(activeUser), any(), any()))
                .thenReturn(currentExpenses, Collections.emptyList());
        when(incomeRepository.findAllByUserAndDateBetween(eq(activeUser), any(), any()))
                .thenReturn(Collections.emptyList(), Collections.emptyList());

        MonthlySummaryResponse summary = monthlySummaryService.getSummary(email, 2025, 4);

        assertNull(summary.categoryBreakdown().get(0).changeVsPreviousMonth());
    }

    @Test
    void getSummary_insightsExpensesVsPrevMonth_increase() {
        when(userRepository.findByEmail(email)).thenReturn(Optional.of(activeUser));

        when(expenseRepository.findAllByUserAndDateBetween(eq(activeUser), any(), any()))
                .thenReturn(
                        List.of(expense(new BigDecimal("147"), ExpenseCategory.DELIVERY, LocalDate.of(2025, 4, 5))),
                        List.of(expense(new BigDecimal("100"), ExpenseCategory.DELIVERY, LocalDate.of(2025, 3, 5))));
        when(incomeRepository.findAllByUserAndDateBetween(eq(activeUser), any(), any()))
                .thenReturn(Collections.emptyList(), Collections.emptyList());

        MonthlySummaryResponse summary = monthlySummaryService.getSummary(email, 2025, 4);

        assertTrue(summary.insights().stream().anyMatch(i ->
                i.type().equals("EXPENSES_VS_PREV_MONTH") &&
                i.label().equals("Tus gastos aumentaron") &&
                i.highlight().startsWith("+") &&
                i.variant().equals("negative")));
    }

    @Test
    void getSummary_insightsExpensesVsPrevMonth_decrease() {
        when(userRepository.findByEmail(email)).thenReturn(Optional.of(activeUser));

        when(expenseRepository.findAllByUserAndDateBetween(eq(activeUser), any(), any()))
                .thenReturn(
                        List.of(expense(new BigDecimal("50"), ExpenseCategory.DELIVERY, LocalDate.of(2025, 4, 5))),
                        List.of(expense(new BigDecimal("100"), ExpenseCategory.DELIVERY, LocalDate.of(2025, 3, 5))));
        when(incomeRepository.findAllByUserAndDateBetween(eq(activeUser), any(), any()))
                .thenReturn(Collections.emptyList(), Collections.emptyList());

        MonthlySummaryResponse summary = monthlySummaryService.getSummary(email, 2025, 4);

        assertTrue(summary.insights().stream().anyMatch(i ->
                i.type().equals("EXPENSES_VS_PREV_MONTH") &&
                i.label().equals("Tus gastos bajaron") &&
                i.highlight().startsWith("-") &&
                i.variant().equals("positive")));
    }

    @Test
    void getSummary_insightsExpensesVsPrevMonth_stable_treatedAsPositive() {
        when(userRepository.findByEmail(email)).thenReturn(Optional.of(activeUser));

        when(expenseRepository.findAllByUserAndDateBetween(eq(activeUser), any(), any()))
                .thenReturn(
                        List.of(expense(new BigDecimal("100"), ExpenseCategory.DELIVERY, LocalDate.of(2025, 4, 5))),
                        List.of(expense(new BigDecimal("100"), ExpenseCategory.DELIVERY, LocalDate.of(2025, 3, 5))));
        when(incomeRepository.findAllByUserAndDateBetween(eq(activeUser), any(), any()))
                .thenReturn(Collections.emptyList(), Collections.emptyList());

        MonthlySummaryResponse summary = monthlySummaryService.getSummary(email, 2025, 4);

        assertTrue(summary.insights().stream().anyMatch(i ->
                i.type().equals("EXPENSES_VS_PREV_MONTH") &&
                i.variant().equals("positive")));
    }

    @Test
    void getSummary_insightsSavings_positive() {
        when(userRepository.findByEmail(email)).thenReturn(Optional.of(activeUser));

        when(expenseRepository.findAllByUserAndDateBetween(eq(activeUser), any(), any()))
                .thenReturn(Collections.emptyList(), Collections.emptyList());
        when(incomeRepository.findAllByUserAndDateBetween(eq(activeUser), any(), any()))
                .thenReturn(List.of(income(new BigDecimal("1000"), LocalDate.of(2025, 4, 1))),
                        Collections.emptyList());

        MonthlySummaryResponse summary = monthlySummaryService.getSummary(email, 2025, 4);

        assertTrue(summary.insights().stream().anyMatch(i ->
                i.type().equals("SAVINGS") &&
                i.label().equals("Ahorraste") &&
                i.sub().equals("de tus ingresos") &&
                i.variant().equals("positive")));
    }

    @Test
    void getSummary_insightsSavings_negative() {
        when(userRepository.findByEmail(email)).thenReturn(Optional.of(activeUser));

        when(expenseRepository.findAllByUserAndDateBetween(eq(activeUser), any(), any()))
                .thenReturn(List.of(expense(new BigDecimal("1500"), ExpenseCategory.RENT, LocalDate.of(2025, 4, 1))),
                        Collections.emptyList());
        when(incomeRepository.findAllByUserAndDateBetween(eq(activeUser), any(), any()))
                .thenReturn(List.of(income(new BigDecimal("1000"), LocalDate.of(2025, 4, 1))),
                        Collections.emptyList());

        MonthlySummaryResponse summary = monthlySummaryService.getSummary(email, 2025, 4);

        assertTrue(summary.insights().stream().anyMatch(i ->
                i.type().equals("SAVINGS") &&
                i.label().equals("Gastaste") &&
                i.sub().equals("más que tus ingresos") &&
                i.variant().equals("negative")));
    }

    @Test
    void getSummary_insightsSavings_neutral_treatedAsPositive() {
        when(userRepository.findByEmail(email)).thenReturn(Optional.of(activeUser));

        when(expenseRepository.findAllByUserAndDateBetween(eq(activeUser), any(), any()))
                .thenReturn(List.of(expense(new BigDecimal("1000"), ExpenseCategory.RENT, LocalDate.of(2025, 4, 1))),
                        Collections.emptyList());
        when(incomeRepository.findAllByUserAndDateBetween(eq(activeUser), any(), any()))
                .thenReturn(List.of(income(new BigDecimal("1000"), LocalDate.of(2025, 4, 1))),
                        Collections.emptyList());

        MonthlySummaryResponse summary = monthlySummaryService.getSummary(email, 2025, 4);

        assertTrue(summary.insights().stream().anyMatch(i ->
                i.type().equals("SAVINGS") &&
                i.label().equals("Ahorraste") &&
                i.variant().equals("positive")));
    }

    @Test
    void getSummary_insightsIncludeTopCategory_whenExpensesExist() {
        when(userRepository.findByEmail(email)).thenReturn(Optional.of(activeUser));

        when(expenseRepository.findAllByUserAndDateBetween(eq(activeUser), any(), any()))
                .thenReturn(List.of(expense(new BigDecimal("500"), ExpenseCategory.RENT, LocalDate.of(2025, 4, 1))),
                        Collections.emptyList());
        when(incomeRepository.findAllByUserAndDateBetween(eq(activeUser), any(), any()))
                .thenReturn(Collections.emptyList(), Collections.emptyList());

        MonthlySummaryResponse summary = monthlySummaryService.getSummary(email, 2025, 4);

        assertTrue(summary.insights().stream().anyMatch(i ->
                i.type().equals("TOP_CATEGORY") &&
                i.label().equals("Mayor gasto: Alquiler") &&
                i.sub().equals("del total")));
    }

    @Test
    void getSummary_noInsightsWhenNoData() {
        when(userRepository.findByEmail(email)).thenReturn(Optional.of(activeUser));

        when(expenseRepository.findAllByUserAndDateBetween(eq(activeUser), any(), any()))
                .thenReturn(Collections.emptyList(), Collections.emptyList());
        when(incomeRepository.findAllByUserAndDateBetween(eq(activeUser), any(), any()))
                .thenReturn(Collections.emptyList(), Collections.emptyList());

        MonthlySummaryResponse summary = monthlySummaryService.getSummary(email, 2025, 4);

        assertTrue(summary.insights().isEmpty());
        assertTrue(summary.categoryBreakdown().isEmpty());
    }

    @Test
    void sendSummaryNotifications_sendsOnlyToActiveUsers() {
        when(userRepository.findAll()).thenReturn(Arrays.asList(activeUser, inactiveUser));

        when(expenseRepository.findAllByUserAndDateBetween(eq(activeUser), any(), any()))
                .thenReturn(Collections.emptyList(), Collections.emptyList());
        when(incomeRepository.findAllByUserAndDateBetween(eq(activeUser), any(), any()))
                .thenReturn(Collections.emptyList(), Collections.emptyList());

        monthlySummaryService.sendSummaryNotifications(2025, 4);

        verify(alertDeliveryService, times(1)).deliverAlert(eq(activeUser), eq(AlertType.MONTHLY_SUMMARY), anyString());
        verify(alertDeliveryService, never()).deliverAlert(eq(inactiveUser), any(), anyString());
    }

    @Test
    void sendSummaryNotifications_continuesOnUserError() {
        User failingUser = new User();
        failingUser.setId(UUID.randomUUID());
        failingUser.setEmail("fail@example.com");
        failingUser.setStatus(UserStatus.ACTIVE);

        when(userRepository.findAll()).thenReturn(Arrays.asList(failingUser, activeUser));

        when(expenseRepository.findAllByUserAndDateBetween(eq(failingUser), any(), any()))
                .thenThrow(new RuntimeException("DB error"));

        when(expenseRepository.findAllByUserAndDateBetween(eq(activeUser), any(), any()))
                .thenReturn(Collections.emptyList(), Collections.emptyList());
        when(incomeRepository.findAllByUserAndDateBetween(eq(activeUser), any(), any()))
                .thenReturn(Collections.emptyList(), Collections.emptyList());

        assertDoesNotThrow(() -> monthlySummaryService.sendSummaryNotifications(2025, 4));
        verify(alertDeliveryService, times(1)).deliverAlert(eq(activeUser), any(), anyString());
    }

    @Test
    void getSummary_insightsIncludeCategoryIncrease_whenCategoryIncreasedVsPrevMonth() {
        when(userRepository.findByEmail(email)).thenReturn(Optional.of(activeUser));

        List<Expense> currentExpenses = List.of(
                expense(new BigDecimal("200"), ExpenseCategory.DELIVERY, LocalDate.of(2025, 4, 5)));
        List<Expense> prevExpenses = List.of(
                expense(new BigDecimal("100"), ExpenseCategory.DELIVERY, LocalDate.of(2025, 3, 5)));

        when(expenseRepository.findAllByUserAndDateBetween(eq(activeUser), any(), any()))
                .thenReturn(currentExpenses, prevExpenses);
        when(incomeRepository.findAllByUserAndDateBetween(eq(activeUser), any(), any()))
                .thenReturn(Collections.emptyList(), Collections.emptyList());

        MonthlySummaryResponse summary = monthlySummaryService.getSummary(email, 2025, 4);

        assertTrue(summary.insights().stream().anyMatch(i ->
                i.type().equals("CATEGORY_INCREASE") &&
                i.label().equals("Mayor aumento: Delivery") &&
                i.highlight().startsWith("+") &&
                i.variant().equals("negative")));
    }

    @Test
    void getSummary_insightsIncludeCategoryDecrease_whenCategoryDecreasedVsPrevMonth() {
        when(userRepository.findByEmail(email)).thenReturn(Optional.of(activeUser));

        List<Expense> currentExpenses = List.of(
                expense(new BigDecimal("50"), ExpenseCategory.DELIVERY, LocalDate.of(2025, 4, 5)));
        List<Expense> prevExpenses = List.of(
                expense(new BigDecimal("100"), ExpenseCategory.DELIVERY, LocalDate.of(2025, 3, 5)));

        when(expenseRepository.findAllByUserAndDateBetween(eq(activeUser), any(), any()))
                .thenReturn(currentExpenses, prevExpenses);
        when(incomeRepository.findAllByUserAndDateBetween(eq(activeUser), any(), any()))
                .thenReturn(Collections.emptyList(), Collections.emptyList());

        MonthlySummaryResponse summary = monthlySummaryService.getSummary(email, 2025, 4);

        assertTrue(summary.insights().stream().anyMatch(i ->
                i.type().equals("CATEGORY_DECREASE") &&
                i.label().equals("Mayor reducción: Delivery") &&
                i.highlight().startsWith("-") &&
                i.variant().equals("positive")));
    }

    @Test
    void formatCategory_returnsSpanishLabel() {
        assertEquals("Supermercado", monthlySummaryService.formatCategory(ExpenseCategory.SUPERMARKET));
        assertEquals("Restaurante", monthlySummaryService.formatCategory(ExpenseCategory.RESTAURANT));
        assertEquals("Café", monthlySummaryService.formatCategory(ExpenseCategory.CAFE));
        assertEquals("Delivery", monthlySummaryService.formatCategory(ExpenseCategory.DELIVERY));
        assertEquals("Transporte público", monthlySummaryService.formatCategory(ExpenseCategory.PUBLIC_TRANSPORT));
        assertEquals("Combustible", monthlySummaryService.formatCategory(ExpenseCategory.FUEL));
        assertEquals("Taxi", monthlySummaryService.formatCategory(ExpenseCategory.TAXI));
        assertEquals("Servicios", monthlySummaryService.formatCategory(ExpenseCategory.UTILITIES));
        assertEquals("Alquiler", monthlySummaryService.formatCategory(ExpenseCategory.RENT));
        assertEquals("Hogar", monthlySummaryService.formatCategory(ExpenseCategory.HOME));
        assertEquals("Doctor", monthlySummaryService.formatCategory(ExpenseCategory.DOCTOR));
        assertEquals("Farmacia", monthlySummaryService.formatCategory(ExpenseCategory.PHARMACY));
        assertEquals("Suscripciones", monthlySummaryService.formatCategory(ExpenseCategory.SUBSCRIPTIONS));
        assertEquals("Salidas", monthlySummaryService.formatCategory(ExpenseCategory.OUTINGS));
        assertEquals("Gimnasio", monthlySummaryService.formatCategory(ExpenseCategory.GYM));
        assertEquals("Viajes", monthlySummaryService.formatCategory(ExpenseCategory.TRAVEL));
        assertEquals("Ropa", monthlySummaryService.formatCategory(ExpenseCategory.CLOTHING));
        assertEquals("Educación", monthlySummaryService.formatCategory(ExpenseCategory.EDUCATION));
        assertEquals("Tecnología", monthlySummaryService.formatCategory(ExpenseCategory.TECHNOLOGY));
        assertEquals("Cuota de consorcio", monthlySummaryService.formatCategory(ExpenseCategory.HOA_FEES));
        assertEquals("Vehículo", monthlySummaryService.formatCategory(ExpenseCategory.VEHICLE));
        assertEquals("Belleza", monthlySummaryService.formatCategory(ExpenseCategory.BEAUTY));
        assertEquals("Mascotas", monthlySummaryService.formatCategory(ExpenseCategory.PETS));
        assertEquals("Compras", monthlySummaryService.formatCategory(ExpenseCategory.SHOPPING));
        assertEquals("Otro", monthlySummaryService.formatCategory(ExpenseCategory.OTHER));
    }

    @Test
    void getSummary_categoryBreakdown_zeroTotalExpenses_percentageIsZero() {
        when(userRepository.findByEmail(email)).thenReturn(Optional.of(activeUser));

        // No expenses in current or previous month but service should handle empty gracefully
        when(expenseRepository.findAllByUserAndDateBetween(eq(activeUser), any(), any()))
                .thenReturn(Collections.emptyList(), Collections.emptyList());
        when(incomeRepository.findAllByUserAndDateBetween(eq(activeUser), any(), any()))
                .thenReturn(Collections.emptyList(), Collections.emptyList());

        MonthlySummaryResponse summary = monthlySummaryService.getSummary(email, 2025, 4);
        assertTrue(summary.categoryBreakdown().isEmpty());
    }
}
