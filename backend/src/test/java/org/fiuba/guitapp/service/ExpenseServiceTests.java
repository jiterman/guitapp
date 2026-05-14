package org.fiuba.guitapp.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

import org.fiuba.guitapp.dto.AddExpenseRequest;
import org.fiuba.guitapp.dto.ExpenseResponse;
import org.fiuba.guitapp.event.ExpenseCreatedEvent;
import org.fiuba.guitapp.exception.AuthException;
import org.fiuba.guitapp.exception.ErrorCode;
import org.fiuba.guitapp.model.Expense;
import org.fiuba.guitapp.model.ExpenseCategory;
import org.fiuba.guitapp.model.User;
import org.fiuba.guitapp.model.UserStatus;
import org.fiuba.guitapp.repository.ExpenseRepository;
import org.fiuba.guitapp.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.ApplicationEventPublisher;

@ExtendWith(MockitoExtension.class)
class ExpenseServiceTests {

    @Mock
    private ExpenseRepository expenseRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private ApplicationEventPublisher applicationEventPublisher; // Mock ApplicationEventPublisher

    @InjectMocks
    private ExpenseService expenseService;

    private User testUser;
    private final String testEmail = "test@example.com";

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setId(UUID.randomUUID());
        testUser.setEmail(testEmail);
        testUser.setFirstName("John");
        testUser.setStatus(UserStatus.ACTIVE);
    }

    @Test
    void addExpense_ShouldReturnExpenseResponse_WhenUserExists() {
        AddExpenseRequest request = new AddExpenseRequest(
                new BigDecimal("1500.00"), "Lunch", ExpenseCategory.RESTAURANT);

        Expense savedExpense = new Expense();
        savedExpense.setId(UUID.randomUUID());
        savedExpense.setAmount(request.amount());
        savedExpense.setDescription(request.description());
        savedExpense.setCategory(request.category());
        savedExpense.setDate(LocalDateTime.now());
        savedExpense.setUser(testUser);

        when(userRepository.findByEmail(testEmail)).thenReturn(Optional.of(testUser));
        when(expenseRepository.save(any(Expense.class))).thenReturn(savedExpense);

        ExpenseResponse response = expenseService.addExpense(testEmail, request);

        assertNotNull(response);
        assertEquals(savedExpense.getId(), response.id());
        assertEquals(new BigDecimal("1500.00"), response.amount());
        assertEquals("Lunch", response.description());
        assertEquals(ExpenseCategory.RESTAURANT, response.category());
        assertNotNull(response.date());
        verify(userRepository, times(1)).findByEmail(testEmail);
        verify(expenseRepository, times(1)).save(any(Expense.class));
        verify(applicationEventPublisher, times(1)).publishEvent(any(ExpenseCreatedEvent.class)); // Verify ExpenseCreatedEvent publishing
    }

    @Test
    void addExpense_ShouldThrowAuthException_WhenUserNotFound() {
        AddExpenseRequest request = new AddExpenseRequest(
                new BigDecimal("100.00"), null, ExpenseCategory.OTHER);

        when(userRepository.findByEmail(testEmail)).thenReturn(Optional.empty());

        AuthException exception = assertThrows(AuthException.class, () -> expenseService.addExpense(testEmail, request));

        assertEquals(ErrorCode.USER_NOT_FOUND, exception.getErrorCode());
        verify(expenseRepository, never()).save(any(Expense.class));
        verify(applicationEventPublisher, never()).publishEvent(any(ExpenseCreatedEvent.class)); // No event published if user not found
    }

    @Test
    void addExpense_ShouldSaveExpenseWithNullDescription_WhenDescriptionIsNull() {
        AddExpenseRequest request = new AddExpenseRequest(
                new BigDecimal("500.00"), null, ExpenseCategory.SUPERMARKET);

        Expense savedExpense = new Expense();
        savedExpense.setId(UUID.randomUUID());
        savedExpense.setAmount(request.amount());
        savedExpense.setDescription(null);
        savedExpense.setCategory(request.category());
        savedExpense.setDate(LocalDateTime.now());
        savedExpense.setUser(testUser);

        when(userRepository.findByEmail(testEmail)).thenReturn(Optional.of(testUser));
        when(expenseRepository.save(any(Expense.class))).thenReturn(savedExpense);

        ExpenseResponse response = expenseService.addExpense(testEmail, request);

        assertNull(response.description());
        verify(expenseRepository, times(1)).save(any(Expense.class));
        verify(applicationEventPublisher, times(1)).publishEvent(any(ExpenseCreatedEvent.class)); // Verify ExpenseCreatedEvent publishing
    }

    @Test
    void addExpense_ShouldAssociateExpenseWithUser() {
        AddExpenseRequest request = new AddExpenseRequest(
                new BigDecimal("200.00"), "Transport", ExpenseCategory.PUBLIC_TRANSPORT);

        Expense savedExpense = new Expense();
        savedExpense.setId(UUID.randomUUID());
        savedExpense.setAmount(request.amount());
        savedExpense.setCategory(request.category());
        savedExpense.setDate(LocalDateTime.now());
        savedExpense.setUser(testUser);

        when(userRepository.findByEmail(testEmail)).thenReturn(Optional.of(testUser));
        when(expenseRepository.save(any(Expense.class))).thenAnswer(invocation -> {
            Expense expense = invocation.getArgument(0);
            assertEquals(testUser, expense.getUser());
            return savedExpense;
        });

        expenseService.addExpense(testEmail, request);

        verify(expenseRepository, times(1)).save(any(Expense.class));
        verify(applicationEventPublisher, times(1)).publishEvent(any(ExpenseCreatedEvent.class)); // Verify ExpenseCreatedEvent publishing
    }
}
