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
import org.fiuba.guitapp.model.ExpenseCategory;
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
    private Expense testExpense;
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

        testExpense = new Expense();
        testExpense.setId(expenseId);
        testExpense.setAmount(amount);
        testExpense.setDescription("Lunch");
        testExpense.setCategory(ExpenseCategory.RESTAURANT);
        testExpense.setDate(date);
        testExpense.setUser(testUser);

        testExpenseCreatedEvent = new ExpenseCreatedEvent(expenseId, userEmail, amount, date);

    }

    @Test
    void handleExpenseCreatedEvent_ShouldSendThresholdExceededNotification_WhenThresholdExceeded() {
        when(userRepository.findByEmail(userEmail)).thenReturn(Optional.of(testUser));
        when(expenseRepository.findById(expenseId)).thenReturn(Optional.of(testExpense));

        // Given
        Expense existingExpense1 = new Expense();
        existingExpense1.setAmount(new BigDecimal("60000"));
        Expense existingExpense2 = new Expense();
        existingExpense2.setAmount(new BigDecimal("45000"));

        when(expenseRepository.findByUserAndDateBetween(eq(testUser), any(LocalDateTime.class), any(LocalDateTime.class)))
                .thenReturn(Arrays.asList(existingExpense1, existingExpense2));

        // When
        expenseEventListener.handleExpenseCreatedEvent(testExpenseCreatedEvent);

        // Then
        verify(notificationService, times(1)).sendExpenseThresholdExceededNotification(eq(testUser), any(BigDecimal.class));

    }

    @Test
    void handleExpenseCreatedEvent_ShouldSendIndividualExpenseNotification_WhenThresholdNotExceeded() {
        when(userRepository.findByEmail(userEmail)).thenReturn(Optional.of(testUser));
        when(expenseRepository.findById(expenseId)).thenReturn(Optional.of(testExpense));

        // Given
        Expense existingExpense = new Expense();
        existingExpense.setAmount(new BigDecimal("10000"));
        when(expenseRepository.findByUserAndDateBetween(eq(testUser), any(LocalDateTime.class), any(LocalDateTime.class)))
                .thenReturn(Collections.singletonList(existingExpense));

        // When
        expenseEventListener.handleExpenseCreatedEvent(testExpenseCreatedEvent);

        // Then

        verify(notificationService, never()).sendExpenseThresholdExceededNotification(any(User.class), any(BigDecimal.class));
    }

    @Test
    void handleExpenseCreatedEvent_ShouldThrowAuthException_WhenUserNotFound() {
        // Given
        when(userRepository.findByEmail(userEmail)).thenReturn(Optional.empty());

        // When & Then
        AuthException thrown = assertThrows(AuthException.class, () -> {
            expenseEventListener.handleExpenseCreatedEvent(testExpenseCreatedEvent);
        });

        assertEquals(ErrorCode.USER_NOT_FOUND, thrown.getErrorCode());

        verify(notificationService, never()).sendExpenseThresholdExceededNotification(any(), any());
    }

    @Test
    void handleExpenseCreatedEvent_ShouldThrowAuthException_WhenExpenseNotFound() {
        when(userRepository.findByEmail(userEmail)).thenReturn(Optional.of(testUser));
        // Given
        when(expenseRepository.findById(expenseId)).thenReturn(Optional.empty());

        // When & Then
        AuthException thrown = assertThrows(AuthException.class, () -> {
            expenseEventListener.handleExpenseCreatedEvent(testExpenseCreatedEvent);
        });

        assertEquals(ErrorCode.EXPENSE_NOT_FOUND, thrown.getErrorCode());

        verify(notificationService, never()).sendExpenseThresholdExceededNotification(any(), any());
    }
}
