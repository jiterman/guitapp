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
import org.fiuba.guitapp.dto.UpdateExpenseRequest;
import org.fiuba.guitapp.exception.AuthException;
import org.fiuba.guitapp.exception.ErrorCode;
import org.fiuba.guitapp.model.Expense;
import org.fiuba.guitapp.model.ExpenseCategory;
import org.fiuba.guitapp.model.ExpenseType;
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

@ExtendWith(MockitoExtension.class)
@SuppressWarnings("null")
class ExpenseServiceTests {

    @Mock
    private ExpenseRepository expenseRepository;

    @Mock
    private UserRepository userRepository;

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
                new BigDecimal("1500.00"), "Lunch", ExpenseCategory.RESTAURANT, ExpenseType.VARIABLE);

        Expense savedExpense = new Expense();
        savedExpense.setId(UUID.randomUUID());
        savedExpense.setAmount(request.amount());
        savedExpense.setDescription(request.description());
        savedExpense.setCategory(request.category());
        savedExpense.setType(request.type());
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
        assertEquals(ExpenseType.VARIABLE, response.type());
        assertNotNull(response.date());
        verify(userRepository, times(1)).findByEmail(testEmail);
        verify(expenseRepository, times(1)).save(any(Expense.class));
    }

    @Test
    void addExpense_ShouldThrowAuthException_WhenUserNotFound() {
        AddExpenseRequest request = new AddExpenseRequest(
                new BigDecimal("100.00"), null, ExpenseCategory.OTHER, ExpenseType.FIXED);

        when(userRepository.findByEmail(testEmail)).thenReturn(Optional.empty());

        AuthException exception = assertThrows(AuthException.class, () -> expenseService.addExpense(testEmail, request));

        assertEquals(ErrorCode.USER_NOT_FOUND, exception.getErrorCode());
        verify(expenseRepository, never()).save(any(Expense.class));
    }

    @Test
    void addExpense_ShouldSaveExpenseWithNullDescription_WhenDescriptionIsNull() {
        AddExpenseRequest request = new AddExpenseRequest(
                new BigDecimal("500.00"), null, ExpenseCategory.SUPERMARKET, ExpenseType.VARIABLE);

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
    }

    @Test
    void addExpense_ShouldAssociateExpenseWithUser() {
        AddExpenseRequest request = new AddExpenseRequest(
                new BigDecimal("200.00"), "Transport", ExpenseCategory.PUBLIC_TRANSPORT, ExpenseType.FIXED);

        Expense savedExpense = new Expense();
        savedExpense.setId(UUID.randomUUID());
        savedExpense.setAmount(request.amount());
        savedExpense.setCategory(request.category());
        savedExpense.setType(request.type());
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
    }

    @Test
    void deleteExpense_ShouldDeleteExpense_WhenExpenseBelongsToUser() {
        UUID expenseId = UUID.randomUUID();

        Expense expense = new Expense();
        expense.setId(expenseId);
        expense.setUser(testUser);

        when(userRepository.findByEmail(testEmail)).thenReturn(Optional.of(testUser));
        when(expenseRepository.findById(expenseId)).thenReturn(Optional.of(expense));

        expenseService.deleteExpense(testEmail, expenseId);

        verify(expenseRepository, times(1)).delete(expense);
    }

    @Test
    void deleteExpense_ShouldThrowAuthException_WhenExpenseNotFound() {
        UUID expenseId = UUID.randomUUID();

        when(userRepository.findByEmail(testEmail)).thenReturn(Optional.of(testUser));
        when(expenseRepository.findById(expenseId)).thenReturn(Optional.empty());

        AuthException exception = assertThrows(AuthException.class, () -> expenseService.deleteExpense(testEmail, expenseId));

        assertEquals(ErrorCode.EXPENSE_NOT_FOUND, exception.getErrorCode());
        verify(expenseRepository, never()).delete(any(Expense.class));
    }

    @Test
    void deleteExpense_ShouldThrowAuthException_WhenExpenseBelongsToAnotherUser() {
        UUID expenseId = UUID.randomUUID();

        User otherUser = new User();
        otherUser.setId(UUID.randomUUID());
        otherUser.setEmail("other@example.com");
        otherUser.setStatus(UserStatus.ACTIVE);

        Expense expense = new Expense();
        expense.setId(expenseId);
        expense.setUser(otherUser);

        when(userRepository.findByEmail(testEmail)).thenReturn(Optional.of(testUser));
        when(expenseRepository.findById(expenseId)).thenReturn(Optional.of(expense));

        AuthException exception = assertThrows(AuthException.class, () -> expenseService.deleteExpense(testEmail, expenseId));

        assertEquals(ErrorCode.EXPENSE_ACCESS_DENIED, exception.getErrorCode());
        verify(expenseRepository, never()).delete(any(Expense.class));
    }

    @Test
    void deleteExpense_ShouldThrowAuthException_WhenExpenseHasNoUser() {
        UUID expenseId = UUID.randomUUID();

        Expense expense = new Expense();
        expense.setId(expenseId);
        expense.setUser(null);

        when(userRepository.findByEmail(testEmail)).thenReturn(Optional.of(testUser));
        when(expenseRepository.findById(expenseId)).thenReturn(Optional.of(expense));

        AuthException exception = assertThrows(AuthException.class, () -> expenseService.deleteExpense(testEmail, expenseId));

        assertEquals(ErrorCode.EXPENSE_ACCESS_DENIED, exception.getErrorCode());
        verify(expenseRepository, never()).delete(any(Expense.class));
    }

    @Test
    void getExpenseById_ShouldReturnExpenseResponse_WhenExpenseBelongsToUser() {
        UUID expenseId = UUID.randomUUID();
        LocalDateTime now = LocalDateTime.now();

        Expense expense = new Expense();
        expense.setId(expenseId);
        expense.setAmount(new BigDecimal("99.99"));
        expense.setDescription("Coffee");
        expense.setCategory(ExpenseCategory.CAFE);
        expense.setType(ExpenseType.VARIABLE);
        expense.setDate(now);
        expense.setUser(testUser);

        when(userRepository.findByEmail(testEmail)).thenReturn(Optional.of(testUser));
        when(expenseRepository.findById(expenseId)).thenReturn(Optional.of(expense));

        ExpenseResponse response = expenseService.getExpenseById(testEmail, expenseId);

        assertEquals(expenseId, response.id());
        assertEquals(new BigDecimal("99.99"), response.amount());
        assertEquals("Coffee", response.description());
        assertEquals(ExpenseCategory.CAFE, response.category());
        assertEquals(ExpenseType.VARIABLE, response.type());
        assertEquals(now, response.date());
    }

    @Test
    void getExpenseById_ShouldThrowAuthException_WhenExpenseNotFound() {
        UUID expenseId = UUID.randomUUID();

        when(userRepository.findByEmail(testEmail)).thenReturn(Optional.of(testUser));
        when(expenseRepository.findById(expenseId)).thenReturn(Optional.empty());

        AuthException exception = assertThrows(AuthException.class, () -> expenseService.getExpenseById(testEmail, expenseId));

        assertEquals(ErrorCode.EXPENSE_NOT_FOUND, exception.getErrorCode());
    }

    @Test
    void getExpenseById_ShouldThrowAuthException_WhenExpenseBelongsToAnotherUser() {
        UUID expenseId = UUID.randomUUID();

        User otherUser = new User();
        otherUser.setId(UUID.randomUUID());
        otherUser.setEmail("other@example.com");
        otherUser.setStatus(UserStatus.ACTIVE);

        Expense expense = new Expense();
        expense.setId(expenseId);
        expense.setUser(otherUser);

        when(userRepository.findByEmail(testEmail)).thenReturn(Optional.of(testUser));
        when(expenseRepository.findById(expenseId)).thenReturn(Optional.of(expense));

        AuthException exception = assertThrows(AuthException.class, () -> expenseService.getExpenseById(testEmail, expenseId));

        assertEquals(ErrorCode.EXPENSE_ACCESS_DENIED, exception.getErrorCode());
    }

    @Test
    void getExpenseById_ShouldThrowAuthException_WhenExpenseHasUserWithoutId() {
        UUID expenseId = UUID.randomUUID();

        User userWithoutId = new User();
        userWithoutId.setId(null);

        Expense expense = new Expense();
        expense.setId(expenseId);
        expense.setUser(userWithoutId);

        when(userRepository.findByEmail(testEmail)).thenReturn(Optional.of(testUser));
        when(expenseRepository.findById(expenseId)).thenReturn(Optional.of(expense));

        AuthException exception = assertThrows(AuthException.class, () -> expenseService.getExpenseById(testEmail, expenseId));

        assertEquals(ErrorCode.EXPENSE_ACCESS_DENIED, exception.getErrorCode());
    }

    @Test
    void updateExpense_ShouldUpdateFields_WhenProvided() {
        UUID expenseId = UUID.randomUUID();
        LocalDateTime now = LocalDateTime.now();

        Expense expense = new Expense();
        expense.setId(expenseId);
        expense.setAmount(new BigDecimal("50.00"));
        expense.setDescription("Old");
        expense.setCategory(ExpenseCategory.CAFE);
        expense.setType(ExpenseType.VARIABLE);
        expense.setDate(now);
        expense.setUser(testUser);

        UpdateExpenseRequest request = new UpdateExpenseRequest(
                new BigDecimal("120.00"),
                "Updated lunch",
                ExpenseCategory.RESTAURANT,
                ExpenseType.FIXED);

        when(userRepository.findByEmail(testEmail)).thenReturn(Optional.of(testUser));
        when(expenseRepository.findById(expenseId)).thenReturn(Optional.of(expense));
        when(expenseRepository.save(any(Expense.class))).thenAnswer(invocation -> invocation.getArgument(0));

        ExpenseResponse response = expenseService.updateExpense(testEmail, expenseId, request);

        assertEquals(expenseId, response.id());
        assertEquals(new BigDecimal("120.00"), response.amount());
        assertEquals("Updated lunch", response.description());
        assertEquals(ExpenseCategory.RESTAURANT, response.category());
        assertEquals(ExpenseType.FIXED, response.type());
        assertEquals(now, response.date());
    }

    @Test
    void updateExpense_ShouldKeepExistingValues_WhenFieldsAreNull() {
        UUID expenseId = UUID.randomUUID();
        LocalDateTime now = LocalDateTime.now();

        Expense expense = new Expense();
        expense.setId(expenseId);
        expense.setAmount(new BigDecimal("50.00"));
        expense.setDescription("Keep");
        expense.setCategory(ExpenseCategory.GYM);
        expense.setType(ExpenseType.FIXED);
        expense.setDate(now);
        expense.setUser(testUser);

        UpdateExpenseRequest request = new UpdateExpenseRequest(null, null, null, null);

        when(userRepository.findByEmail(testEmail)).thenReturn(Optional.of(testUser));
        when(expenseRepository.findById(expenseId)).thenReturn(Optional.of(expense));
        when(expenseRepository.save(any(Expense.class))).thenAnswer(invocation -> invocation.getArgument(0));

        ExpenseResponse response = expenseService.updateExpense(testEmail, expenseId, request);

        assertEquals(new BigDecimal("50.00"), response.amount());
        assertEquals("Keep", response.description());
        assertEquals(ExpenseCategory.GYM, response.category());
        assertEquals(ExpenseType.FIXED, response.type());
    }

    @Test
    void updateExpense_ShouldSetDescriptionToEmpty_WhenEmptyStringProvided() {
        UUID expenseId = UUID.randomUUID();
        LocalDateTime now = LocalDateTime.now();

        Expense expense = new Expense();
        expense.setId(expenseId);
        expense.setAmount(new BigDecimal("40.00"));
        expense.setDescription("Note");
        expense.setCategory(ExpenseCategory.BAR);
        expense.setType(ExpenseType.VARIABLE);
        expense.setDate(now);
        expense.setUser(testUser);

        UpdateExpenseRequest request = new UpdateExpenseRequest(null, "", null, null);

        when(userRepository.findByEmail(testEmail)).thenReturn(Optional.of(testUser));
        when(expenseRepository.findById(expenseId)).thenReturn(Optional.of(expense));
        when(expenseRepository.save(any(Expense.class))).thenAnswer(invocation -> invocation.getArgument(0));

        ExpenseResponse response = expenseService.updateExpense(testEmail, expenseId, request);

        assertEquals("", response.description());
        assertEquals(new BigDecimal("40.00"), response.amount());
        assertEquals(ExpenseCategory.BAR, response.category());
        assertEquals(ExpenseType.VARIABLE, response.type());
    }

    @Test
    void updateExpense_ShouldThrowAuthException_WhenExpenseNotFound() {
        UUID expenseId = UUID.randomUUID();
        UpdateExpenseRequest request = new UpdateExpenseRequest(new BigDecimal("1.00"), "x", ExpenseCategory.OTHER, ExpenseType.VARIABLE);

        when(userRepository.findByEmail(testEmail)).thenReturn(Optional.of(testUser));
        when(expenseRepository.findById(expenseId)).thenReturn(Optional.empty());

        AuthException exception = assertThrows(AuthException.class, () -> expenseService.updateExpense(testEmail, expenseId, request));

        assertEquals(ErrorCode.EXPENSE_NOT_FOUND, exception.getErrorCode());
        verify(expenseRepository, never()).save(any(Expense.class));
    }

    @Test
    void updateExpense_ShouldThrowAuthException_WhenExpenseBelongsToAnotherUser() {
        UUID expenseId = UUID.randomUUID();

        User otherUser = new User();
        otherUser.setId(UUID.randomUUID());
        otherUser.setEmail("other@example.com");
        otherUser.setStatus(UserStatus.ACTIVE);

        Expense expense = new Expense();
        expense.setId(expenseId);
        expense.setUser(otherUser);

        UpdateExpenseRequest request = new UpdateExpenseRequest(new BigDecimal("1.00"), "x", ExpenseCategory.OTHER, ExpenseType.VARIABLE);

        when(userRepository.findByEmail(testEmail)).thenReturn(Optional.of(testUser));
        when(expenseRepository.findById(expenseId)).thenReturn(Optional.of(expense));

        AuthException exception = assertThrows(AuthException.class, () -> expenseService.updateExpense(testEmail, expenseId, request));

        assertEquals(ErrorCode.EXPENSE_ACCESS_DENIED, exception.getErrorCode());
        verify(expenseRepository, never()).save(any(Expense.class));
    }
}
