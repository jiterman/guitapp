package org.fiuba.guitapp.listener;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.Arrays;
import java.util.Collections;
import java.util.Optional;
import java.util.UUID;

import org.fiuba.guitapp.event.ExpenseCreatedEvent;
import org.fiuba.guitapp.exception.AuthException;
import org.fiuba.guitapp.exception.ErrorCode;
import org.fiuba.guitapp.model.Expense;
import org.fiuba.guitapp.model.ExpenseType;
import org.fiuba.guitapp.model.User;
import org.fiuba.guitapp.model.UserStatus;
import org.fiuba.guitapp.repository.ExpenseRepository;
import org.fiuba.guitapp.repository.IncomeRepository;
import org.fiuba.guitapp.repository.UserRepository;
import org.fiuba.guitapp.service.NotificationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Assumptions;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class ExpenseEventListenerTest {

    @Mock
    private NotificationService notificationService;

    @Mock
    private UserRepository userRepository;

    @Mock
    private ExpenseRepository expenseRepository;

    @Mock
    private IncomeRepository incomeRepository;

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

        baseDate = LocalDate.now().minusMonths(1).withDayOfMonth(10);
        testExpenseCreatedEvent = new ExpenseCreatedEvent(expenseId, userEmail, amount, baseDate, ExpenseType.VARIABLE);

    }

    @Test
    void handleExpenseCreatedEvent_ShouldOnlySendVariableNotification_WhenVariableExpenseCreatedAndBothExceeded() {
        testExpenseCreatedEvent = new ExpenseCreatedEvent(expenseId, userEmail, amount, baseDate, ExpenseType.VARIABLE);
        when(userRepository.findByEmail(userEmail)).thenReturn(Optional.of(testUser));

        Expense fixedExpense = new Expense();
        fixedExpense.setAmount(new BigDecimal("60000"));
        fixedExpense.setType(ExpenseType.FIXED);

        Expense variableExpense = new Expense();
        variableExpense.setAmount(new BigDecimal("40000"));
        variableExpense.setType(ExpenseType.VARIABLE);

        when(expenseRepository.findAllByUserAndDateBetween(eq(testUser), any(LocalDate.class), any(LocalDate.class)))
                .thenReturn(Arrays.asList(fixedExpense, variableExpense));

        expenseEventListener.handleExpenseCreatedEvent(testExpenseCreatedEvent);

        // Should only send variable notification because the event was for a VARIABLE expense
        verify(notificationService, times(1)).sendExpenseThresholdExceededNotification(eq(testUser),
                argThat(s -> !s.contains("gastos fijos") && s.contains("gastos variables")));
    }

    @Test
    void handleExpenseCreatedEvent_ShouldOnlySendFixedNotification_WhenFixedExpenseCreatedAndBothExceeded() {
        testExpenseCreatedEvent = new ExpenseCreatedEvent(expenseId, userEmail, amount, baseDate, ExpenseType.FIXED);
        when(userRepository.findByEmail(userEmail)).thenReturn(Optional.of(testUser));

        Expense fixedExpense = new Expense();
        fixedExpense.setAmount(new BigDecimal("60000"));
        fixedExpense.setType(ExpenseType.FIXED);

        Expense variableExpense = new Expense();
        variableExpense.setAmount(new BigDecimal("40000"));
        variableExpense.setType(ExpenseType.VARIABLE);

        when(expenseRepository.findAllByUserAndDateBetween(eq(testUser), any(LocalDate.class), any(LocalDate.class)))
                .thenReturn(Arrays.asList(fixedExpense, variableExpense));

        expenseEventListener.handleExpenseCreatedEvent(testExpenseCreatedEvent);

        // Should only send fixed notification because the event was for a FIXED expense
        verify(notificationService, times(1)).sendExpenseThresholdExceededNotification(eq(testUser),
                argThat(s -> s.contains("gastos fijos") && !s.contains("gastos variables")));
    }

    @Test
    void handleExpenseCreatedEvent_ShouldSendFixedNotification_WhenFixedExceeded() {
        testExpenseCreatedEvent = new ExpenseCreatedEvent(expenseId, userEmail, amount, baseDate, ExpenseType.FIXED);
        when(userRepository.findByEmail(userEmail)).thenReturn(Optional.of(testUser));

        Expense fixedExpense = new Expense();
        fixedExpense.setAmount(new BigDecimal("60000"));
        fixedExpense.setType(ExpenseType.FIXED);

        when(expenseRepository.findAllByUserAndDateBetween(eq(testUser), any(LocalDate.class), any(LocalDate.class)))
                .thenReturn(Collections.singletonList(fixedExpense));

        expenseEventListener.handleExpenseCreatedEvent(testExpenseCreatedEvent);

        verify(notificationService, times(1)).sendExpenseThresholdExceededNotification(eq(testUser),
                argThat(s -> s.contains("gastos fijos") && !s.contains("gastos variables")));
    }

    @Test
    void handleExpenseCreatedEvent_ShouldSendVariableNotification_WhenVariableExceeded() {
        testExpenseCreatedEvent = new ExpenseCreatedEvent(expenseId, userEmail, amount, baseDate, ExpenseType.VARIABLE);
        when(userRepository.findByEmail(userEmail)).thenReturn(Optional.of(testUser));

        Expense variableExpense = new Expense();
        variableExpense.setAmount(new BigDecimal("35000"));
        variableExpense.setType(ExpenseType.VARIABLE);

        when(expenseRepository.findAllByUserAndDateBetween(eq(testUser), any(LocalDate.class), any(LocalDate.class)))
                .thenReturn(Collections.singletonList(variableExpense));

        expenseEventListener.handleExpenseCreatedEvent(testExpenseCreatedEvent);

        verify(notificationService, times(1)).sendExpenseThresholdExceededNotification(eq(testUser),
                argThat(s -> !s.contains("gastos fijos") && s.contains("gastos variables")));
    }

    @Test
    void handleExpenseCreatedEvent_ShouldNotSendNotification_WhenThresholdsNotExceeded() {
        when(userRepository.findByEmail(userEmail)).thenReturn(Optional.of(testUser));

        Expense fixedExpense = new Expense();
        fixedExpense.setAmount(new BigDecimal("10000"));
        fixedExpense.setType(ExpenseType.FIXED);

        when(expenseRepository.findAllByUserAndDateBetween(eq(testUser), any(LocalDate.class), any(LocalDate.class)))
                .thenReturn(Collections.singletonList(fixedExpense));

        expenseEventListener.handleExpenseCreatedEvent(testExpenseCreatedEvent);

        verify(notificationService, never()).sendExpenseThresholdExceededNotification(any(), any());
    }

    @Test
    void handleExpenseCreatedEvent_ShouldNotSendNotification_WhenIncomeIsZero() {
        testUser.setEstimatedMonthlyIncome(BigDecimal.ZERO);
        when(userRepository.findByEmail(userEmail)).thenReturn(Optional.of(testUser));

        expenseEventListener.handleExpenseCreatedEvent(testExpenseCreatedEvent);

        verify(notificationService, never()).sendExpenseThresholdExceededNotification(any(), any());
    }

    @Test
    void handleExpenseCreatedEvent_ShouldThrowAuthException_WhenUserNotFound() {
        when(userRepository.findByEmail(userEmail)).thenReturn(Optional.empty());

        AuthException thrown = assertThrows(AuthException.class, () -> {
            expenseEventListener.handleExpenseCreatedEvent(testExpenseCreatedEvent);
        });

        assertEquals(ErrorCode.USER_NOT_FOUND, thrown.getErrorCode());
        verify(notificationService, never()).sendExpenseThresholdExceededNotification(any(), any());
    }

    @Test
    void handleExpenseCreatedEvent_ShouldNotSendNotification_WhenTargetFixedExpensesIsNull() {
        testExpenseCreatedEvent = new ExpenseCreatedEvent(expenseId, userEmail, amount, baseDate, ExpenseType.FIXED);
        testUser.setTargetFixedExpenses(null);
        when(userRepository.findByEmail(userEmail)).thenReturn(Optional.of(testUser));

        expenseEventListener.handleExpenseCreatedEvent(testExpenseCreatedEvent);

        verify(notificationService, never()).sendExpenseThresholdExceededNotification(any(), any());
    }

    @Test
    void handleExpenseCreatedEvent_ShouldNotSendNotification_WhenTargetVariableExpensesIsNull() {
        testExpenseCreatedEvent = new ExpenseCreatedEvent(expenseId, userEmail, amount, baseDate, ExpenseType.VARIABLE);
        testUser.setTargetVariableExpenses(null);
        when(userRepository.findByEmail(userEmail)).thenReturn(Optional.of(testUser));

        expenseEventListener.handleExpenseCreatedEvent(testExpenseCreatedEvent);

        verify(notificationService, never()).sendExpenseThresholdExceededNotification(any(), any());
    }

    @Test
    void handleExpenseCreatedEvent_ShouldSendNegativeBalanceRiskNotification_WhenProjectedExpensesExceedIncome() {
        LocalDate today = LocalDate.now();
        Assumptions.assumeTrue(today.getDayOfMonth() > 5);

        testUser.setTargetFixedExpenses(null);
        testUser.setTargetVariableExpenses(null);
        testUser.setTargetSavings(20);

        testExpenseCreatedEvent = new ExpenseCreatedEvent(
                expenseId,
                userEmail,
                amount,
                today,
                ExpenseType.VARIABLE);
        when(userRepository.findByEmail(userEmail)).thenReturn(Optional.of(testUser));

        when(incomeRepository.findAllByUserAndDateBetween(eq(testUser), any(LocalDate.class), any(LocalDate.class)))
            .thenReturn(Collections.emptyList());

        BigDecimal expenseAmount = testUser.getEstimatedMonthlyIncome().add(BigDecimal.ONE);
        Expense expense = new Expense();
        expense.setAmount(expenseAmount);
        expense.setType(ExpenseType.VARIABLE);

        when(expenseRepository.findAllByUserAndDateBetween(eq(testUser), any(LocalDate.class), any(LocalDate.class)))
                .thenReturn(Collections.singletonList(expense));

        expenseEventListener.handleExpenseCreatedEvent(testExpenseCreatedEvent);

        verify(notificationService, times(1)).sendNegativeBalanceRiskNotification(eq(testUser),
                argThat(s -> s.contains("saldo") && s.contains("ingresos")));
        verify(notificationService, never()).sendSavingsGoalAtRiskNotification(any(), any());
        verify(notificationService, never()).sendExpenseThresholdExceededNotification(any(), any());
    }

        @Test
        void handleExpenseCreatedEvent_ShouldSendSavingsGoalRiskNotification_WhenProjectedExpensesExceedSavingsTargetButNotIncome() {
        LocalDate today = LocalDate.now();
        Assumptions.assumeTrue(today.getDayOfMonth() > 5);

        testUser.setTargetFixedExpenses(null);
        testUser.setTargetVariableExpenses(null);
        testUser.setTargetSavings(20);

        testExpenseCreatedEvent = new ExpenseCreatedEvent(
            expenseId,
            userEmail,
            amount,
            today,
            ExpenseType.VARIABLE);
        when(userRepository.findByEmail(userEmail)).thenReturn(Optional.of(testUser));

        when(incomeRepository.findAllByUserAndDateBetween(eq(testUser), any(LocalDate.class), any(LocalDate.class)))
            .thenReturn(Collections.emptyList());

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

        verify(notificationService, times(1)).sendSavingsGoalAtRiskNotification(eq(testUser),
            argThat(s -> s.contains("meta de ahorro") || s.contains("meta")));
        verify(notificationService, never()).sendNegativeBalanceRiskNotification(any(), any());
        verify(notificationService, never()).sendExpenseThresholdExceededNotification(any(), any());
        }
}
