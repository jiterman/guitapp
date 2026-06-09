package org.fiuba.guitapp.listener;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

import java.lang.reflect.Method;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Clock;
import java.time.LocalDate;
import java.time.YearMonth;
import java.time.ZoneId;
import java.util.Arrays;
import java.util.Collections;
import java.util.Optional;
import java.util.UUID;

import org.fiuba.guitapp.event.ExpenseCreatedEvent;
import org.fiuba.guitapp.exception.AuthException;
import org.fiuba.guitapp.exception.ErrorCode;
import org.fiuba.guitapp.model.AlertType;
import org.fiuba.guitapp.model.Expense;
import org.fiuba.guitapp.model.ExpenseCategory;
import org.fiuba.guitapp.model.ExpenseType;
import org.fiuba.guitapp.model.User;
import org.fiuba.guitapp.model.UserStatus;
import org.fiuba.guitapp.repository.ExpenseRepository;
import org.fiuba.guitapp.repository.UserRepository;
import org.fiuba.guitapp.service.AlertDeliveryService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class ExpenseEventListenerTest {

    @Mock
    private AlertDeliveryService alertDeliveryService;

    @Mock
    private UserRepository userRepository;

    @Mock
    private ExpenseRepository expenseRepository;

    @InjectMocks
    private ExpenseEventListener expenseEventListener;

    private User testUser;
    private ExpenseCreatedEvent testExpenseCreatedEvent;

    private final UUID expenseId = UUID.randomUUID();
    private final String userEmail = "test@example.com";
    private final BigDecimal amount = new BigDecimal("50000");
    private LocalDate baseDate;

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setId(UUID.randomUUID());
        testUser.setEmail(userEmail);
        testUser.setFirstName("John");
        testUser.setStatus(UserStatus.ACTIVE);
        testUser.setFcmToken("some_fcm_token");
        testUser.setEstimatedMonthlyIncome(new BigDecimal("100000"));
        testUser.setTargetFixedExpenses(50); // Limit: 50,000
        testUser.setTargetVariableExpenses(30); // Limit: 30,000

        // Fix the clock to day 3 of the current month so buildProjectionData always
        // returns null (day <= 5 guard), preventing NEGATIVE_BALANCE_RISK from
        // interfering with threshold and category tests regardless of when tests run.
        LocalDate fixedDay = LocalDate.now().withDayOfMonth(3);
        Clock fixedClock = Clock.fixed(
                fixedDay.atStartOfDay(ZoneId.systemDefault()).toInstant(),
                ZoneId.systemDefault());
        expenseEventListener.setClock(fixedClock);

        baseDate = fixedDay;
        testExpenseCreatedEvent = new ExpenseCreatedEvent(expenseId, userEmail, amount, baseDate, ExpenseType.VARIABLE);

        lenient().when(expenseRepository.findById(expenseId)).thenReturn(Optional.empty());
        lenient().when(expenseRepository.findAllByUserAndDateBetween(eq(testUser), any(LocalDate.class), any(LocalDate.class)))
                .thenReturn(Collections.emptyList());
    }

    @Test
    void handleExpenseCreatedEvent_ShouldSkip_WhenExpenseIsFromPastMonth() {
        LocalDate pastDate = LocalDate.now().minusMonths(1);
        testExpenseCreatedEvent = new ExpenseCreatedEvent(expenseId, userEmail, amount, pastDate, ExpenseType.VARIABLE);

        expenseEventListener.handleExpenseCreatedEvent(testExpenseCreatedEvent);

        verify(userRepository, never()).findByEmail(any());
        verify(alertDeliveryService, never()).deliverAlert(any(), any(), any());
    }

    @Test
    void handleExpenseCreatedEvent_ShouldOnlySendVariableNotification_WhenVariableExpenseCreatedAndBothExceeded() {
        testUser.setEstimatedMonthlyIncome(new BigDecimal("1000000"));
        testUser.setTargetFixedExpenses(5);
        testUser.setTargetVariableExpenses(3);
        testExpenseCreatedEvent = new ExpenseCreatedEvent(expenseId, userEmail, amount, baseDate, ExpenseType.VARIABLE);
        when(userRepository.findByEmail(userEmail)).thenReturn(Optional.of(testUser));

        Expense fixedExpense = new Expense();
        fixedExpense.setAmount(new BigDecimal("60000"));
        fixedExpense.setType(ExpenseType.FIXED);
        fixedExpense.setCategory(ExpenseCategory.SUPERMARKET);

        Expense variableExpense = new Expense();
        variableExpense.setAmount(new BigDecimal("40000"));
        variableExpense.setType(ExpenseType.VARIABLE);
        variableExpense.setCategory(ExpenseCategory.SUPERMARKET);

        when(expenseRepository.findAllByUserAndDateBetween(eq(testUser), any(LocalDate.class), any(LocalDate.class)))
                .thenReturn(Arrays.asList(fixedExpense, variableExpense));

        expenseEventListener.handleExpenseCreatedEvent(testExpenseCreatedEvent);

        // Should only send variable notification because the event was for a VARIABLE expense
        verify(alertDeliveryService, times(1)).deliverAlert(eq(testUser), eq(AlertType.VARIABLE_EXPENSE_THRESHOLD_EXCEEDED),
                argThat(s -> !s.contains("gastos fijos") && s.contains("gastos variables")));
    }

    @Test
    void handleExpenseCreatedEvent_ShouldOnlySendFixedNotification_WhenFixedExpenseCreatedAndBothExceeded() {
        testUser.setEstimatedMonthlyIncome(new BigDecimal("1000000"));
        testUser.setTargetFixedExpenses(5);
        testUser.setTargetVariableExpenses(3);
        testExpenseCreatedEvent = new ExpenseCreatedEvent(expenseId, userEmail, amount, baseDate, ExpenseType.FIXED);
        when(userRepository.findByEmail(userEmail)).thenReturn(Optional.of(testUser));

        Expense fixedExpense = new Expense();
        fixedExpense.setAmount(new BigDecimal("60000"));
        fixedExpense.setType(ExpenseType.FIXED);
        fixedExpense.setCategory(ExpenseCategory.SUPERMARKET);

        Expense variableExpense = new Expense();
        variableExpense.setAmount(new BigDecimal("40000"));
        variableExpense.setType(ExpenseType.VARIABLE);
        variableExpense.setCategory(ExpenseCategory.SUPERMARKET);

        when(expenseRepository.findAllByUserAndDateBetween(eq(testUser), any(LocalDate.class), any(LocalDate.class)))
                .thenReturn(Arrays.asList(fixedExpense, variableExpense));

        expenseEventListener.handleExpenseCreatedEvent(testExpenseCreatedEvent);

        // Should only send fixed notification because the event was for a FIXED expense
        verify(alertDeliveryService, times(1)).deliverAlert(eq(testUser), eq(AlertType.FIXED_EXPENSE_THRESHOLD_EXCEEDED),
                argThat(s -> s.contains("gastos fijos") && !s.contains("gastos variables")));
    }

    @Test
    void handleExpenseCreatedEvent_ShouldSendFixedNotification_WhenFixedExceeded() {
        testUser.setEstimatedMonthlyIncome(new BigDecimal("1000000"));
        testUser.setTargetFixedExpenses(5);
        testExpenseCreatedEvent = new ExpenseCreatedEvent(expenseId, userEmail, amount, baseDate, ExpenseType.FIXED);
        when(userRepository.findByEmail(userEmail)).thenReturn(Optional.of(testUser));

        Expense fixedExpense = new Expense();
        fixedExpense.setAmount(new BigDecimal("60000"));
        fixedExpense.setType(ExpenseType.FIXED);
        fixedExpense.setCategory(ExpenseCategory.SUPERMARKET);

        when(expenseRepository.findAllByUserAndDateBetween(eq(testUser), any(LocalDate.class), any(LocalDate.class)))
                .thenReturn(Collections.singletonList(fixedExpense));

        expenseEventListener.handleExpenseCreatedEvent(testExpenseCreatedEvent);

        verify(alertDeliveryService, times(1)).deliverAlert(eq(testUser), eq(AlertType.FIXED_EXPENSE_THRESHOLD_EXCEEDED),
                argThat(s -> s.contains("gastos fijos") && !s.contains("gastos variables")));
    }

    @Test
    void handleExpenseCreatedEvent_ShouldSendVariableNotification_WhenVariableExceeded() {
        testUser.setEstimatedMonthlyIncome(new BigDecimal("1000000"));
        testUser.setTargetVariableExpenses(3);
        testExpenseCreatedEvent = new ExpenseCreatedEvent(expenseId, userEmail, amount, baseDate, ExpenseType.VARIABLE);
        when(userRepository.findByEmail(userEmail)).thenReturn(Optional.of(testUser));

        Expense variableExpense = new Expense();
        variableExpense.setAmount(new BigDecimal("35000"));
        variableExpense.setType(ExpenseType.VARIABLE);
        variableExpense.setCategory(ExpenseCategory.SUPERMARKET);

        when(expenseRepository.findAllByUserAndDateBetween(eq(testUser), any(LocalDate.class), any(LocalDate.class)))
                .thenReturn(Collections.singletonList(variableExpense));

        expenseEventListener.handleExpenseCreatedEvent(testExpenseCreatedEvent);

        verify(alertDeliveryService, times(1)).deliverAlert(eq(testUser), eq(AlertType.VARIABLE_EXPENSE_THRESHOLD_EXCEEDED),
                argThat(s -> !s.contains("gastos fijos") && s.contains("gastos variables")));
    }

    @Test
    void handleExpenseCreatedEvent_ShouldNotSendNotification_WhenThresholdsNotExceeded() {
        when(userRepository.findByEmail(userEmail)).thenReturn(Optional.of(testUser));

        Expense fixedExpense = new Expense();
        fixedExpense.setAmount(new BigDecimal("10000"));
        fixedExpense.setType(ExpenseType.FIXED);
        fixedExpense.setCategory(ExpenseCategory.SUPERMARKET);

        when(expenseRepository.findAllByUserAndDateBetween(eq(testUser), any(LocalDate.class), any(LocalDate.class)))
                .thenReturn(Collections.singletonList(fixedExpense));

        expenseEventListener.handleExpenseCreatedEvent(testExpenseCreatedEvent);

        verify(alertDeliveryService, never()).deliverAlert(any(), any(), any());
    }

    @Test
    void handleExpenseCreatedEvent_ShouldNotSendNotification_WhenIncomeIsZero() {
        testUser.setEstimatedMonthlyIncome(BigDecimal.ZERO);
        when(userRepository.findByEmail(userEmail)).thenReturn(Optional.of(testUser));

        expenseEventListener.handleExpenseCreatedEvent(testExpenseCreatedEvent);

        verify(alertDeliveryService, never()).deliverAlert(any(), any(), any());
    }

    @Test
    void handleExpenseCreatedEvent_ShouldSendCategoryOverspendingNotification_WhenCategoryExceedsPreviousMonth() {
        testUser.setTargetFixedExpenses(null);
        testUser.setTargetVariableExpenses(null);

        LocalDate eventDate = baseDate;
        YearMonth eventMonth = YearMonth.from(eventDate);
        YearMonth previousMonth = eventMonth.minusMonths(1);

        testExpenseCreatedEvent = new ExpenseCreatedEvent(expenseId, userEmail, amount, eventDate, ExpenseType.VARIABLE);
        when(userRepository.findByEmail(userEmail)).thenReturn(Optional.of(testUser));

        Expense createdExpense = new Expense();
        createdExpense.setCategory(ExpenseCategory.SUPERMARKET);
        createdExpense.setType(ExpenseType.VARIABLE);
        createdExpense.setAmount(amount);
        when(expenseRepository.findById(expenseId)).thenReturn(Optional.of(createdExpense));

        Expense currentMonthExpense = new Expense();
        currentMonthExpense.setAmount(new BigDecimal("20000"));
        currentMonthExpense.setType(ExpenseType.VARIABLE);
        currentMonthExpense.setCategory(ExpenseCategory.SUPERMARKET);

        Expense previousMonthExpense = new Expense();
        previousMonthExpense.setAmount(new BigDecimal("10000"));
        previousMonthExpense.setType(ExpenseType.VARIABLE);
        previousMonthExpense.setCategory(ExpenseCategory.SUPERMARKET);

        when(expenseRepository.findAllByUserAndDateBetween(eq(testUser), any(LocalDate.class), any(LocalDate.class)))
                .thenAnswer(invocation -> {
                    LocalDate start = invocation.getArgument(1);
                    YearMonth startMonth = YearMonth.from(start);
                    if (startMonth.equals(eventMonth)) {
                        return Collections.singletonList(currentMonthExpense);
                    }
                    if (startMonth.equals(previousMonth)) {
                        return Collections.singletonList(previousMonthExpense);
                    }
                    return Collections.emptyList();
                });

        expenseEventListener.handleExpenseCreatedEvent(testExpenseCreatedEvent);

        verify(alertDeliveryService, times(1)).deliverAlert(eq(testUser), eq(AlertType.CATEGORY_OVERSPENDING),
                argThat(s -> s.contains("supera al mes anterior") && s.contains("Supermercado")));
        verify(alertDeliveryService, never()).deliverAlert(eq(testUser), eq(AlertType.FIXED_EXPENSE_THRESHOLD_EXCEEDED), any());
        verify(alertDeliveryService, never()).deliverAlert(eq(testUser), eq(AlertType.VARIABLE_EXPENSE_THRESHOLD_EXCEEDED), any());
        verify(alertDeliveryService, never()).deliverAlert(eq(testUser), eq(AlertType.SAVINGS_GOAL_AT_RISK), any());
        verify(alertDeliveryService, never()).deliverAlert(eq(testUser), eq(AlertType.NEGATIVE_BALANCE_RISK), any());
    }

    @Test
    void handleExpenseCreatedEvent_ShouldNotSendCategoryOverspendingNotification_WhenCreatedExpenseNotFound() {
        testUser.setTargetFixedExpenses(null);
        testUser.setTargetVariableExpenses(null);
        when(userRepository.findByEmail(userEmail)).thenReturn(Optional.of(testUser));
        when(expenseRepository.findById(expenseId)).thenReturn(Optional.empty());

        expenseEventListener.handleExpenseCreatedEvent(testExpenseCreatedEvent);

        verify(alertDeliveryService, never()).deliverAlert(any(), any(), any());
    }

    @Test
    void handleExpenseCreatedEvent_ShouldNotSendCategoryOverspendingNotification_WhenCreatedExpenseHasNoCategory() {
        testUser.setTargetFixedExpenses(null);
        testUser.setTargetVariableExpenses(null);
        when(userRepository.findByEmail(userEmail)).thenReturn(Optional.of(testUser));

        Expense createdExpense = new Expense();
        createdExpense.setCategory(null);
        createdExpense.setType(ExpenseType.VARIABLE);
        createdExpense.setAmount(amount);
        when(expenseRepository.findById(expenseId)).thenReturn(Optional.of(createdExpense));

        expenseEventListener.handleExpenseCreatedEvent(testExpenseCreatedEvent);

        verify(alertDeliveryService, never()).deliverAlert(any(), any(), any());
    }

    @Test
    void handleExpenseCreatedEvent_ShouldNotSendCategoryOverspendingNotification_WhenPreviousMonthIsZero() {
        testUser.setTargetFixedExpenses(null);
        testUser.setTargetVariableExpenses(null);

        LocalDate eventDate = baseDate;
        YearMonth eventMonth = YearMonth.from(eventDate);
        YearMonth previousMonth = eventMonth.minusMonths(1);

        testExpenseCreatedEvent = new ExpenseCreatedEvent(expenseId, userEmail, amount, eventDate, ExpenseType.VARIABLE);
        when(userRepository.findByEmail(userEmail)).thenReturn(Optional.of(testUser));

        Expense createdExpense = new Expense();
        createdExpense.setCategory(ExpenseCategory.SUPERMARKET);
        createdExpense.setType(ExpenseType.VARIABLE);
        createdExpense.setAmount(amount);
        when(expenseRepository.findById(expenseId)).thenReturn(Optional.of(createdExpense));

        Expense currentMonthExpense = new Expense();
        currentMonthExpense.setAmount(new BigDecimal("20000"));
        currentMonthExpense.setType(ExpenseType.VARIABLE);
        currentMonthExpense.setCategory(ExpenseCategory.SUPERMARKET);

        when(expenseRepository.findAllByUserAndDateBetween(eq(testUser), any(LocalDate.class), any(LocalDate.class)))
                .thenAnswer(invocation -> {
                    LocalDate start = invocation.getArgument(1);
                    YearMonth startMonth = YearMonth.from(start);
                    if (startMonth.equals(eventMonth)) {
                        return Collections.singletonList(currentMonthExpense);
                    }
                    if (startMonth.equals(previousMonth)) {
                        return Collections.emptyList();
                    }
                    return Collections.emptyList();
                });

        expenseEventListener.handleExpenseCreatedEvent(testExpenseCreatedEvent);

        verify(alertDeliveryService, never()).deliverAlert(any(), any(), any());
    }

    @Test
    void handleExpenseCreatedEvent_ShouldNotSendCategoryOverspendingNotification_WhenCurrentNotExceedPrevious() {
        testUser.setTargetFixedExpenses(null);
        testUser.setTargetVariableExpenses(null);

        LocalDate eventDate = baseDate;
        YearMonth eventMonth = YearMonth.from(eventDate);
        YearMonth previousMonth = eventMonth.minusMonths(1);

        testExpenseCreatedEvent = new ExpenseCreatedEvent(expenseId, userEmail, amount, eventDate, ExpenseType.VARIABLE);
        when(userRepository.findByEmail(userEmail)).thenReturn(Optional.of(testUser));

        Expense createdExpense = new Expense();
        createdExpense.setCategory(ExpenseCategory.SUPERMARKET);
        createdExpense.setType(ExpenseType.VARIABLE);
        createdExpense.setAmount(amount);
        when(expenseRepository.findById(expenseId)).thenReturn(Optional.of(createdExpense));

        Expense currentMonthExpense = new Expense();
        currentMonthExpense.setAmount(new BigDecimal("9000"));
        currentMonthExpense.setType(ExpenseType.VARIABLE);
        currentMonthExpense.setCategory(ExpenseCategory.SUPERMARKET);

        Expense previousMonthExpense = new Expense();
        previousMonthExpense.setAmount(new BigDecimal("10000"));
        previousMonthExpense.setType(ExpenseType.VARIABLE);
        previousMonthExpense.setCategory(ExpenseCategory.SUPERMARKET);

        when(expenseRepository.findAllByUserAndDateBetween(eq(testUser), any(LocalDate.class), any(LocalDate.class)))
                .thenAnswer(invocation -> {
                    LocalDate start = invocation.getArgument(1);
                    YearMonth startMonth = YearMonth.from(start);
                    if (startMonth.equals(eventMonth)) {
                        return Collections.singletonList(currentMonthExpense);
                    }
                    if (startMonth.equals(previousMonth)) {
                        return Collections.singletonList(previousMonthExpense);
                    }
                    return Collections.emptyList();
                });

        expenseEventListener.handleExpenseCreatedEvent(testExpenseCreatedEvent);

        verify(alertDeliveryService, never()).deliverAlert(any(), any(), any());
    }

    @Test
    void handleExpenseCreatedEvent_ShouldThrowAuthException_WhenUserNotFound() {
        when(userRepository.findByEmail(userEmail)).thenReturn(Optional.empty());

        AuthException thrown = assertThrows(AuthException.class, () -> {
            expenseEventListener.handleExpenseCreatedEvent(testExpenseCreatedEvent);
        });

        assertEquals(ErrorCode.USER_NOT_FOUND, thrown.getErrorCode());
        verify(alertDeliveryService, never()).deliverAlert(any(), any(), any());
    }

    @Test
    void handleExpenseCreatedEvent_ShouldNotSendNotification_WhenTargetFixedExpensesIsNull() {
        testExpenseCreatedEvent = new ExpenseCreatedEvent(expenseId, userEmail, amount, baseDate, ExpenseType.FIXED);
        testUser.setTargetFixedExpenses(null);
        when(userRepository.findByEmail(userEmail)).thenReturn(Optional.of(testUser));

        expenseEventListener.handleExpenseCreatedEvent(testExpenseCreatedEvent);

        verify(alertDeliveryService, never()).deliverAlert(any(), any(), any());
    }

    @Test
    void handleExpenseCreatedEvent_ShouldNotSendNotification_WhenTargetVariableExpensesIsNull() {
        testExpenseCreatedEvent = new ExpenseCreatedEvent(expenseId, userEmail, amount, baseDate, ExpenseType.VARIABLE);
        testUser.setTargetVariableExpenses(null);
        when(userRepository.findByEmail(userEmail)).thenReturn(Optional.of(testUser));

        expenseEventListener.handleExpenseCreatedEvent(testExpenseCreatedEvent);

        verify(alertDeliveryService, never()).deliverAlert(any(), any(), any());
    }

    @Test
    void handleExpenseCreatedEvent_ShouldNotSendProjectionNotifications_WhenMonthDoesNotMatch() {
        testUser.setTargetFixedExpenses(null);
        testUser.setTargetVariableExpenses(null);
        testUser.setTargetSavings(20);

        LocalDate eventDate = LocalDate.now().minusMonths(2).withDayOfMonth(10);
        testExpenseCreatedEvent = new ExpenseCreatedEvent(expenseId, userEmail, amount, eventDate, ExpenseType.VARIABLE);

        expenseEventListener.handleExpenseCreatedEvent(testExpenseCreatedEvent);

        verify(alertDeliveryService, never()).deliverAlert(any(), any(), any());
    }

    @Test
    void handleExpenseCreatedEvent_ShouldNotSendProjectionNotifications_WhenEstimatedMonthlyIncomeIsNull() {
        LocalDate today = LocalDate.now().withDayOfMonth(15);
        expenseEventListener.setClock(Clock.fixed(
                today.atStartOfDay(ZoneId.systemDefault()).toInstant(), ZoneId.systemDefault()));

        testUser.setTargetFixedExpenses(null);
        testUser.setTargetVariableExpenses(null);
        testUser.setTargetSavings(20);
        testUser.setEstimatedMonthlyIncome(null);

        testExpenseCreatedEvent = new ExpenseCreatedEvent(expenseId, userEmail, amount, today, ExpenseType.VARIABLE);
        when(userRepository.findByEmail(userEmail)).thenReturn(Optional.of(testUser));

        expenseEventListener.handleExpenseCreatedEvent(testExpenseCreatedEvent);

        verify(alertDeliveryService, never()).deliverAlert(any(), any(), any());
    }

    @Test
    void handleExpenseCreatedEvent_ShouldSendNegativeBalanceRiskNotification_WhenProjectedExpensesExceedIncome() {
        LocalDate today = LocalDate.now().withDayOfMonth(15);
        expenseEventListener.setClock(Clock.fixed(
                today.atStartOfDay(ZoneId.systemDefault()).toInstant(), ZoneId.systemDefault()));

        testUser.setTargetFixedExpenses(null);
        testUser.setTargetVariableExpenses(null);
        testUser.setTargetSavings(20);

        testExpenseCreatedEvent = new ExpenseCreatedEvent(expenseId, userEmail, amount, today, ExpenseType.VARIABLE);
        when(userRepository.findByEmail(userEmail)).thenReturn(Optional.of(testUser));

        int daysElapsed = today.getDayOfMonth();
        int daysInMonth = YearMonth.from(today).lengthOfMonth();
        // expense that when projected to full month exceeds income (100k)
        BigDecimal totalExpenses = testUser.getEstimatedMonthlyIncome()
                .multiply(BigDecimal.valueOf(daysElapsed))
                .divide(BigDecimal.valueOf(daysInMonth), 4, java.math.RoundingMode.HALF_UP)
                .add(BigDecimal.ONE);
        Expense expense = new Expense();
        expense.setAmount(totalExpenses);
        expense.setType(ExpenseType.VARIABLE);

        when(expenseRepository.findAllByUserAndDateBetween(eq(testUser), any(LocalDate.class), any(LocalDate.class)))
                .thenReturn(Collections.singletonList(expense));

        expenseEventListener.handleExpenseCreatedEvent(testExpenseCreatedEvent);

        verify(alertDeliveryService, times(1)).deliverAlert(eq(testUser), eq(AlertType.NEGATIVE_BALANCE_RISK),
                argThat(s -> s.contains("saldo") && s.contains("ingresos")));
        verify(alertDeliveryService, never()).deliverAlert(eq(testUser), eq(AlertType.SAVINGS_GOAL_AT_RISK), any());
        verify(alertDeliveryService, never()).deliverAlert(eq(testUser), eq(AlertType.FIXED_EXPENSE_THRESHOLD_EXCEEDED), any());
        verify(alertDeliveryService, never()).deliverAlert(eq(testUser), eq(AlertType.VARIABLE_EXPENSE_THRESHOLD_EXCEEDED), any());
        verify(alertDeliveryService, never()).deliverAlert(eq(testUser), eq(AlertType.CATEGORY_OVERSPENDING), any());
    }

    @Test
    void handleExpenseCreatedEvent_ShouldSendSavingsGoalRiskNotification_WhenProjectedExpensesExceedSavingsTargetButNotIncome() {
        LocalDate today = LocalDate.now().withDayOfMonth(15);
        expenseEventListener.setClock(Clock.fixed(
                today.atStartOfDay(ZoneId.systemDefault()).toInstant(), ZoneId.systemDefault()));

        testUser.setTargetFixedExpenses(null);
        testUser.setTargetVariableExpenses(null);
        testUser.setTargetSavings(20);

        testExpenseCreatedEvent = new ExpenseCreatedEvent(expenseId, userEmail, amount, today, ExpenseType.VARIABLE);
        when(userRepository.findByEmail(userEmail)).thenReturn(Optional.of(testUser));

        // today is day 15; project to 90k/month → totalExpenses = 90k * 15 / daysInMonth
        int daysElapsed = today.getDayOfMonth();
        int daysInMonth = YearMonth.from(today).lengthOfMonth();
        BigDecimal projectedTarget = new BigDecimal("90000");
        BigDecimal totalExpenses = projectedTarget
                .multiply(BigDecimal.valueOf(daysElapsed))
                .divide(BigDecimal.valueOf(daysInMonth), 4, RoundingMode.HALF_UP);

        Expense expense = new Expense();
        expense.setAmount(totalExpenses);
        expense.setType(ExpenseType.VARIABLE);

        when(expenseRepository.findAllByUserAndDateBetween(eq(testUser), any(LocalDate.class), any(LocalDate.class)))
                .thenReturn(Collections.singletonList(expense));

        expenseEventListener.handleExpenseCreatedEvent(testExpenseCreatedEvent);

        verify(alertDeliveryService, times(1)).deliverAlert(eq(testUser), eq(AlertType.SAVINGS_GOAL_AT_RISK),
                argThat(s -> s.contains("meta de ahorro") || s.contains("meta")));
        verify(alertDeliveryService, never()).deliverAlert(eq(testUser), eq(AlertType.NEGATIVE_BALANCE_RISK), any());
        verify(alertDeliveryService, never()).deliverAlert(eq(testUser), eq(AlertType.FIXED_EXPENSE_THRESHOLD_EXCEEDED), any());
        verify(alertDeliveryService, never()).deliverAlert(eq(testUser), eq(AlertType.VARIABLE_EXPENSE_THRESHOLD_EXCEEDED), any());
        verify(alertDeliveryService, never()).deliverAlert(eq(testUser), eq(AlertType.CATEGORY_OVERSPENDING), any());
    }

    @Test
    void formatCategory_ShouldReturnCorrectSpanishName_ForSupermarketCategory() throws Exception {
        String result = invokeFormatCategory(ExpenseCategory.SUPERMARKET);
        assertEquals("Supermercado", result);
    }

    @Test
    void formatCategory_ShouldReturnCorrectSpanishName_ForRestaurantCategory() throws Exception {
        String result = invokeFormatCategory(ExpenseCategory.RESTAURANT);
        assertEquals("Restaurante", result);
    }

    @Test
    void formatCategory_ShouldReturnCorrectSpanishName_ForCafeCategory() throws Exception {
        String result = invokeFormatCategory(ExpenseCategory.CAFE);
        assertEquals("Café", result);
    }

    @Test
    void formatCategory_ShouldReturnCorrectSpanishName_ForDeliveryCategory() throws Exception {
        String result = invokeFormatCategory(ExpenseCategory.DELIVERY);
        assertEquals("Delivery", result);
    }

    @Test
    void formatCategory_ShouldReturnCorrectSpanishName_ForPublicTransportCategory() throws Exception {
        String result = invokeFormatCategory(ExpenseCategory.PUBLIC_TRANSPORT);
        assertEquals("Transporte público", result);
    }

    @Test
    void formatCategory_ShouldReturnCorrectSpanishName_ForFuelCategory() throws Exception {
        String result = invokeFormatCategory(ExpenseCategory.FUEL);
        assertEquals("Combustible", result);
    }

    @Test
    void formatCategory_ShouldReturnCorrectSpanishName_ForTaxiCategory() throws Exception {
        String result = invokeFormatCategory(ExpenseCategory.TAXI);
        assertEquals("Taxi", result);
    }

    @Test
    void formatCategory_ShouldReturnCorrectSpanishName_ForUtilitiesCategory() throws Exception {
        String result = invokeFormatCategory(ExpenseCategory.UTILITIES);
        assertEquals("Servicios", result);
    }

    @Test
    void formatCategory_ShouldReturnCorrectSpanishName_ForRentCategory() throws Exception {
        String result = invokeFormatCategory(ExpenseCategory.RENT);
        assertEquals("Alquiler", result);
    }

    @Test
    void formatCategory_ShouldReturnCorrectSpanishName_ForHomeCategory() throws Exception {
        String result = invokeFormatCategory(ExpenseCategory.HOME);
        assertEquals("Hogar", result);
    }

    @Test
    void formatCategory_ShouldReturnCorrectSpanishName_ForDoctorCategory() throws Exception {
        String result = invokeFormatCategory(ExpenseCategory.DOCTOR);
        assertEquals("Doctor", result);
    }

    @Test
    void formatCategory_ShouldReturnCorrectSpanishName_ForPharmacyCategory() throws Exception {
        String result = invokeFormatCategory(ExpenseCategory.PHARMACY);
        assertEquals("Farmacia", result);
    }

    @Test
    void formatCategory_ShouldReturnCorrectSpanishName_ForSubscriptionsCategory() throws Exception {
        String result = invokeFormatCategory(ExpenseCategory.SUBSCRIPTIONS);
        assertEquals("Suscripciones", result);
    }

    @Test
    void formatCategory_ShouldReturnCorrectSpanishName_ForOutingsCategory() throws Exception {
        String result = invokeFormatCategory(ExpenseCategory.OUTINGS);
        assertEquals("Salidas", result);
    }

    @Test
    void formatCategory_ShouldReturnCorrectSpanishName_ForGymCategory() throws Exception {
        String result = invokeFormatCategory(ExpenseCategory.GYM);
        assertEquals("Gimnasio", result);
    }

    @Test
    void formatCategory_ShouldReturnCorrectSpanishName_ForTravelCategory() throws Exception {
        String result = invokeFormatCategory(ExpenseCategory.TRAVEL);
        assertEquals("Viajes", result);
    }

    @Test
    void formatCategory_ShouldReturnCorrectSpanishName_ForClothingCategory() throws Exception {
        String result = invokeFormatCategory(ExpenseCategory.CLOTHING);
        assertEquals("Ropa", result);
    }

    @Test
    void formatCategory_ShouldReturnCorrectSpanishName_ForEducationCategory() throws Exception {
        String result = invokeFormatCategory(ExpenseCategory.EDUCATION);
        assertEquals("Educación", result);
    }

    @Test
    void formatCategory_ShouldReturnCorrectSpanishName_ForTechnologyCategory() throws Exception {
        String result = invokeFormatCategory(ExpenseCategory.TECHNOLOGY);
        assertEquals("Tecnología", result);
    }

    @Test
    void formatCategory_ShouldReturnCorrectSpanishName_ForHoaFeesCategory() throws Exception {
        String result = invokeFormatCategory(ExpenseCategory.HOA_FEES);
        assertEquals("Cuota de consorcio", result);
    }

    @Test
    void formatCategory_ShouldReturnCorrectSpanishName_ForVehicleCategory() throws Exception {
        String result = invokeFormatCategory(ExpenseCategory.VEHICLE);
        assertEquals("Vehículo", result);
    }

    @Test
    void formatCategory_ShouldReturnCorrectSpanishName_ForBeautyCategory() throws Exception {
        String result = invokeFormatCategory(ExpenseCategory.BEAUTY);
        assertEquals("Belleza", result);
    }

    @Test
    void formatCategory_ShouldReturnCorrectSpanishName_ForPetsCategory() throws Exception {
        String result = invokeFormatCategory(ExpenseCategory.PETS);
        assertEquals("Mascotas", result);
    }

    @Test
    void formatCategory_ShouldReturnCorrectSpanishName_ForShoppingCategory() throws Exception {
        String result = invokeFormatCategory(ExpenseCategory.SHOPPING);
        assertEquals("Compras", result);
    }

    @Test
    void formatCategory_ShouldReturnCorrectSpanishName_ForOtherCategory() throws Exception {
        String result = invokeFormatCategory(ExpenseCategory.OTHER);
        assertEquals("Otro", result);
    }

    // Helper method to invoke private formatCategory method using reflection
    private String invokeFormatCategory(ExpenseCategory category) throws Exception {
        Method method = ExpenseEventListener.class.getDeclaredMethod("formatCategory", ExpenseCategory.class);
        method.setAccessible(true);
        return (String) method.invoke(expenseEventListener, category);
    }
}
