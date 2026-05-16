package org.fiuba.guitapp.listener;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
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
import org.fiuba.guitapp.repository.UserRepository;
import org.fiuba.guitapp.service.NotificationService;
import org.junit.jupiter.api.BeforeEach;
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

    @InjectMocks
    private ExpenseEventListener expenseEventListener;

    private User testUser;
    private ExpenseCreatedEvent testExpenseCreatedEvent;

    private final UUID expenseId = UUID.randomUUID();
    private final String userEmail = "test@example.com";
    private final BigDecimal amount = new BigDecimal("50000");
    private final LocalDateTime date = LocalDateTime.of(2026, 5, 15, 10, 0);

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

        testExpenseCreatedEvent = new ExpenseCreatedEvent(expenseId, userEmail, amount, date, ExpenseType.VARIABLE);
    }

    @Test
    void handleExpenseCreatedEvent_ShouldOnlySendVariableNotification_WhenVariableExpenseCreatedAndBothExceeded() {
        testExpenseCreatedEvent = new ExpenseCreatedEvent(expenseId, userEmail, amount, date, ExpenseType.VARIABLE);
        when(userRepository.findByEmail(userEmail)).thenReturn(Optional.of(testUser));

        Expense fixedExpense = new Expense();
        fixedExpense.setAmount(new BigDecimal("60000"));
        fixedExpense.setType(ExpenseType.FIXED);

        Expense variableExpense = new Expense();
        variableExpense.setAmount(new BigDecimal("40000"));
        variableExpense.setType(ExpenseType.VARIABLE);

        when(expenseRepository.findByUserAndDateBetween(eq(testUser), any(LocalDateTime.class), any(LocalDateTime.class)))
                .thenReturn(Arrays.asList(fixedExpense, variableExpense));

        expenseEventListener.handleExpenseCreatedEvent(testExpenseCreatedEvent);

        // Should only send variable notification because the event was for a VARIABLE expense
        verify(notificationService, times(1)).sendExpenseThresholdExceededNotification(eq(testUser),
                argThat(s -> !s.contains("gastos fijos") && s.contains("gastos variables")));
    }

    @Test
    void handleExpenseCreatedEvent_ShouldOnlySendFixedNotification_WhenFixedExpenseCreatedAndBothExceeded() {
        testExpenseCreatedEvent = new ExpenseCreatedEvent(expenseId, userEmail, amount, date, ExpenseType.FIXED);
        when(userRepository.findByEmail(userEmail)).thenReturn(Optional.of(testUser));

        Expense fixedExpense = new Expense();
        fixedExpense.setAmount(new BigDecimal("60000"));
        fixedExpense.setType(ExpenseType.FIXED);

        Expense variableExpense = new Expense();
        variableExpense.setAmount(new BigDecimal("40000"));
        variableExpense.setType(ExpenseType.VARIABLE);

        when(expenseRepository.findByUserAndDateBetween(eq(testUser), any(LocalDateTime.class), any(LocalDateTime.class)))
                .thenReturn(Arrays.asList(fixedExpense, variableExpense));

        expenseEventListener.handleExpenseCreatedEvent(testExpenseCreatedEvent);

        // Should only send fixed notification because the event was for a FIXED expense
        verify(notificationService, times(1)).sendExpenseThresholdExceededNotification(eq(testUser),
                argThat(s -> s.contains("gastos fijos") && !s.contains("gastos variables")));
    }

    @Test
    void handleExpenseCreatedEvent_ShouldSendFixedNotification_WhenFixedExceeded() {
        testExpenseCreatedEvent = new ExpenseCreatedEvent(expenseId, userEmail, amount, date, ExpenseType.FIXED);
        when(userRepository.findByEmail(userEmail)).thenReturn(Optional.of(testUser));

        Expense fixedExpense = new Expense();
        fixedExpense.setAmount(new BigDecimal("60000"));
        fixedExpense.setType(ExpenseType.FIXED);

        when(expenseRepository.findByUserAndDateBetween(eq(testUser), any(LocalDateTime.class), any(LocalDateTime.class)))
                .thenReturn(Collections.singletonList(fixedExpense));

        expenseEventListener.handleExpenseCreatedEvent(testExpenseCreatedEvent);

        verify(notificationService, times(1)).sendExpenseThresholdExceededNotification(eq(testUser),
                argThat(s -> s.contains("gastos fijos") && !s.contains("gastos variables")));
    }

    @Test
    void handleExpenseCreatedEvent_ShouldSendVariableNotification_WhenVariableExceeded() {
        testExpenseCreatedEvent = new ExpenseCreatedEvent(expenseId, userEmail, amount, date, ExpenseType.VARIABLE);
        when(userRepository.findByEmail(userEmail)).thenReturn(Optional.of(testUser));

        Expense variableExpense = new Expense();
        variableExpense.setAmount(new BigDecimal("35000"));
        variableExpense.setType(ExpenseType.VARIABLE);

        when(expenseRepository.findByUserAndDateBetween(eq(testUser), any(LocalDateTime.class), any(LocalDateTime.class)))
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

        when(expenseRepository.findByUserAndDateBetween(eq(testUser), any(LocalDateTime.class), any(LocalDateTime.class)))
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
        verify(expenseRepository, never()).findByUserAndDateBetween(any(), any(), any());
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
        testExpenseCreatedEvent = new ExpenseCreatedEvent(expenseId, userEmail, amount, date, ExpenseType.FIXED);
        testUser.setTargetFixedExpenses(null);
        when(userRepository.findByEmail(userEmail)).thenReturn(Optional.of(testUser));

        expenseEventListener.handleExpenseCreatedEvent(testExpenseCreatedEvent);

        verify(notificationService, never()).sendExpenseThresholdExceededNotification(any(), any());
    }

    @Test
    void handleExpenseCreatedEvent_ShouldNotSendNotification_WhenTargetVariableExpensesIsNull() {
        testExpenseCreatedEvent = new ExpenseCreatedEvent(expenseId, userEmail, amount, date, ExpenseType.VARIABLE);
        testUser.setTargetVariableExpenses(null);
        when(userRepository.findByEmail(userEmail)).thenReturn(Optional.of(testUser));

        expenseEventListener.handleExpenseCreatedEvent(testExpenseCreatedEvent);

        verify(notificationService, never()).sendExpenseThresholdExceededNotification(any(), any());
    }
}
