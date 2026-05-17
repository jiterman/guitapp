package org.fiuba.guitapp.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.fiuba.guitapp.dto.AddExpenseRequest;
import org.fiuba.guitapp.dto.ExpenseResponse;
import org.fiuba.guitapp.dto.ExpenseStatisticsResponse;
import org.fiuba.guitapp.dto.FixedAndVariableStatisticsResponse;
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
                new BigDecimal("1500.00"), "Lunch", ExpenseCategory.RESTAURANT, ExpenseType.VARIABLE, LocalDate.now());

        Expense savedExpense = new Expense();
        savedExpense.setId(UUID.randomUUID());
        savedExpense.setAmount(request.amount());
        savedExpense.setDescription(request.description());
        savedExpense.setCategory(request.category());
        savedExpense.setType(request.type());
        savedExpense.setDate(LocalDate.now());
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
                new BigDecimal("100.00"), null, ExpenseCategory.OTHER, ExpenseType.FIXED, LocalDate.now());

        when(userRepository.findByEmail(testEmail)).thenReturn(Optional.empty());

        AuthException exception = assertThrows(AuthException.class, () -> expenseService.addExpense(testEmail, request));

        assertEquals(ErrorCode.USER_NOT_FOUND, exception.getErrorCode());
        verify(expenseRepository, never()).save(any(Expense.class));
    }

    @Test
    void addExpense_ShouldSaveExpenseWithNullDescription_WhenDescriptionIsNull() {
        AddExpenseRequest request = new AddExpenseRequest(
                new BigDecimal("500.00"), null, ExpenseCategory.SUPERMARKET, ExpenseType.VARIABLE, LocalDate.now());

        Expense savedExpense = new Expense();
        savedExpense.setId(UUID.randomUUID());
        savedExpense.setAmount(request.amount());
        savedExpense.setDescription(null);
        savedExpense.setCategory(request.category());
        savedExpense.setDate(LocalDate.now());
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
                new BigDecimal("200.00"), "Transport", ExpenseCategory.PUBLIC_TRANSPORT, ExpenseType.FIXED, LocalDate.now());

        Expense savedExpense = new Expense();
        savedExpense.setId(UUID.randomUUID());
        savedExpense.setAmount(request.amount());
        savedExpense.setCategory(request.category());
        savedExpense.setType(request.type());
        savedExpense.setDate(LocalDate.now());
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
        LocalDate now = LocalDate.now();

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
        LocalDate now = LocalDate.now();

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
                ExpenseType.FIXED,
                LocalDate.now());

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
        LocalDate now = LocalDate.now();

        Expense expense = new Expense();
        expense.setId(expenseId);
        expense.setAmount(new BigDecimal("50.00"));
        expense.setDescription("Keep");
        expense.setCategory(ExpenseCategory.GYM);
        expense.setType(ExpenseType.FIXED);
        expense.setDate(now);
        expense.setUser(testUser);

        UpdateExpenseRequest request = new UpdateExpenseRequest(null, null, null, null, null);

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
        LocalDate now = LocalDate.now();

        Expense expense = new Expense();
        expense.setId(expenseId);
        expense.setAmount(new BigDecimal("40.00"));
        expense.setDescription("Note");
        expense.setCategory(ExpenseCategory.OUTINGS);
        expense.setType(ExpenseType.VARIABLE);
        expense.setDate(now);
        expense.setUser(testUser);

        UpdateExpenseRequest request = new UpdateExpenseRequest(null, "", null, null, null);

        when(userRepository.findByEmail(testEmail)).thenReturn(Optional.of(testUser));
        when(expenseRepository.findById(expenseId)).thenReturn(Optional.of(expense));
        when(expenseRepository.save(any(Expense.class))).thenAnswer(invocation -> invocation.getArgument(0));

        ExpenseResponse response = expenseService.updateExpense(testEmail, expenseId, request);

        assertEquals("", response.description());
        assertEquals(new BigDecimal("40.00"), response.amount());
        assertEquals(ExpenseCategory.OUTINGS, response.category());
        assertEquals(ExpenseType.VARIABLE, response.type());
    }

    @Test
    void updateExpense_ShouldThrowAuthException_WhenExpenseNotFound() {
        UUID expenseId = UUID.randomUUID();
        UpdateExpenseRequest request = new UpdateExpenseRequest(new BigDecimal("1.00"), "x", ExpenseCategory.OTHER, ExpenseType.VARIABLE, LocalDate.now());

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

        UpdateExpenseRequest request = new UpdateExpenseRequest(new BigDecimal("1.00"), "x", ExpenseCategory.OTHER, ExpenseType.VARIABLE, LocalDate.now());

        when(userRepository.findByEmail(testEmail)).thenReturn(Optional.of(testUser));
        when(expenseRepository.findById(expenseId)).thenReturn(Optional.of(expense));

        AuthException exception = assertThrows(AuthException.class, () -> expenseService.updateExpense(testEmail, expenseId, request));

        assertEquals(ErrorCode.EXPENSE_ACCESS_DENIED, exception.getErrorCode());
        verify(expenseRepository, never()).save(any(Expense.class));
    }

    @Test
    void getExpenseStatistics_ShouldReturnStatistics_WithMonthlyPeriodAndSpecificDate() {
        LocalDate januaryFirst = LocalDate.of(2024, 1, 1);
        LocalDate januaryEnd = LocalDate.of(2024, 2, 1);

        Expense expense1 = new Expense();
        expense1.setId(UUID.randomUUID());
        expense1.setAmount(new BigDecimal("100.00"));
        expense1.setCategory(ExpenseCategory.RESTAURANT);
        expense1.setType(ExpenseType.VARIABLE);
        expense1.setDate(LocalDate.of(2024, 1, 15));
        expense1.setUser(testUser);

        Expense expense2 = new Expense();
        expense2.setId(UUID.randomUUID());
        expense2.setAmount(new BigDecimal("200.00"));
        expense2.setCategory(ExpenseCategory.RESTAURANT);
        expense2.setType(ExpenseType.VARIABLE);
        expense2.setDate(LocalDate.of(2024, 1, 20));
        expense2.setUser(testUser);

        List<Expense> expenses = Arrays.asList(expense1, expense2);

        when(userRepository.findByEmail(testEmail)).thenReturn(Optional.of(testUser));
        when(expenseRepository.findAllByUserAndDateBetween(testUser, januaryFirst, januaryEnd))
                .thenReturn(expenses);

        ExpenseStatisticsResponse response = expenseService.getExpenseStatistics(testEmail, "monthly", 2024, 1, null);

        assertNotNull(response);
        assertEquals(new BigDecimal("300.00"), response.totalAmount());
        assertEquals(1, response.categories().size());
        assertEquals(ExpenseCategory.RESTAURANT, response.categories().get(0).category());
        assertEquals(new BigDecimal("300.00"), response.categories().get(0).totalAmount());
        assertEquals(2L, response.categories().get(0).count());
        assertEquals(100.0, response.categories().get(0).percentage());

        verify(expenseRepository, times(1)).findAllByUserAndDateBetween(testUser, januaryFirst, januaryEnd);
    }

    @Test
    void getExpenseStatistics_ShouldReturnStatistics_WithDailyPeriodAndSpecificDate() {
        LocalDate dayStart = LocalDate.of(2024, 5, 15);
        LocalDate dayEnd = LocalDate.of(2024, 5, 16);

        Expense expense1 = new Expense();
        expense1.setId(UUID.randomUUID());
        expense1.setAmount(new BigDecimal("50.00"));
        expense1.setCategory(ExpenseCategory.CAFE);
        expense1.setType(ExpenseType.VARIABLE);
        expense1.setDate(LocalDate.of(2024, 5, 15));
        expense1.setUser(testUser);

        List<Expense> expenses = Arrays.asList(expense1);

        when(userRepository.findByEmail(testEmail)).thenReturn(Optional.of(testUser));
        when(expenseRepository.findAllByUserAndDateBetween(testUser, dayStart, dayEnd))
                .thenReturn(expenses);

        ExpenseStatisticsResponse response = expenseService.getExpenseStatistics(testEmail, "daily", 2024, 5, 15);

        assertNotNull(response);
        assertEquals(new BigDecimal("50.00"), response.totalAmount());
        assertEquals(1, response.categories().size());
        assertEquals(ExpenseCategory.CAFE, response.categories().get(0).category());

        verify(expenseRepository, times(1)).findAllByUserAndDateBetween(testUser, dayStart, dayEnd);
    }

    @Test
    void getExpenseStatistics_ShouldReturnStatistics_WithAllPeriod() {
        Expense expense1 = new Expense();
        expense1.setId(UUID.randomUUID());
        expense1.setAmount(new BigDecimal("100.00"));
        expense1.setCategory(ExpenseCategory.RENT);
        expense1.setType(ExpenseType.FIXED);
        expense1.setDate(LocalDate.now());
        expense1.setUser(testUser);

        Expense expense2 = new Expense();
        expense2.setId(UUID.randomUUID());
        expense2.setAmount(new BigDecimal("150.00"));
        expense2.setCategory(ExpenseCategory.SUPERMARKET);
        expense2.setType(ExpenseType.VARIABLE);
        expense2.setDate(LocalDate.now());
        expense2.setUser(testUser);

        List<Expense> expenses = Arrays.asList(expense1, expense2);

        when(userRepository.findByEmail(testEmail)).thenReturn(Optional.of(testUser));
        when(expenseRepository.findAllByUser(testUser)).thenReturn(expenses);

        ExpenseStatisticsResponse response = expenseService.getExpenseStatistics(testEmail, "all", null, null, null);

        assertNotNull(response);
        assertEquals(new BigDecimal("250.00"), response.totalAmount());
        assertEquals(2, response.categories().size());

        verify(expenseRepository, times(1)).findAllByUser(testUser);
    }

    @Test
    void getExpenseStatistics_ShouldHandleMultipleCategories() {
        LocalDate monthStart = LocalDate.of(2024, 3, 1);
        LocalDate monthEnd = LocalDate.of(2024, 4, 1);

        Expense expense1 = new Expense();
        expense1.setId(UUID.randomUUID());
        expense1.setAmount(new BigDecimal("100.00"));
        expense1.setCategory(ExpenseCategory.RESTAURANT);
        expense1.setType(ExpenseType.VARIABLE);
        expense1.setDate(LocalDate.of(2024, 3, 10));
        expense1.setUser(testUser);

        Expense expense2 = new Expense();
        expense2.setId(UUID.randomUUID());
        expense2.setAmount(new BigDecimal("50.00"));
        expense2.setCategory(ExpenseCategory.CAFE);
        expense2.setType(ExpenseType.VARIABLE);
        expense2.setDate(LocalDate.of(2024, 3, 15));
        expense2.setUser(testUser);

        Expense expense3 = new Expense();
        expense3.setId(UUID.randomUUID());
        expense3.setAmount(new BigDecimal("150.00"));
        expense3.setCategory(ExpenseCategory.RESTAURANT);
        expense3.setType(ExpenseType.VARIABLE);
        expense3.setDate(LocalDate.of(2024, 3, 20));
        expense3.setUser(testUser);

        List<Expense> expenses = Arrays.asList(expense1, expense2, expense3);

        when(userRepository.findByEmail(testEmail)).thenReturn(Optional.of(testUser));
        when(expenseRepository.findAllByUserAndDateBetween(testUser, monthStart, monthEnd))
                .thenReturn(expenses);

        ExpenseStatisticsResponse response = expenseService.getExpenseStatistics(testEmail, "monthly", 2024, 3, null);

        assertNotNull(response);
        assertEquals(new BigDecimal("300.00"), response.totalAmount());
        assertEquals(2, response.categories().size());
        assertEquals(ExpenseCategory.RESTAURANT, response.categories().get(0).category());
        assertEquals(new BigDecimal("250.00"), response.categories().get(0).totalAmount());
        assertEquals(2L, response.categories().get(0).count());
        assertEquals(ExpenseCategory.CAFE, response.categories().get(1).category());
        assertEquals(new BigDecimal("50.00"), response.categories().get(1).totalAmount());
        assertEquals(1L, response.categories().get(1).count());
    }

    @Test
    void getExpenseStatistics_ShouldReturnEmptyList_WhenNoExpenses() {
        LocalDate monthStart = LocalDate.of(2024, 6, 1);
        LocalDate monthEnd = LocalDate.of(2024, 7, 1);

        when(userRepository.findByEmail(testEmail)).thenReturn(Optional.of(testUser));
        when(expenseRepository.findAllByUserAndDateBetween(testUser, monthStart, monthEnd))
                .thenReturn(Arrays.asList());

        ExpenseStatisticsResponse response = expenseService.getExpenseStatistics(testEmail, "monthly", 2024, 6, null);

        assertNotNull(response);
        assertEquals(BigDecimal.ZERO, response.totalAmount());
        assertEquals(0, response.categories().size());
    }

    @Test
    void getFixedAndVariableStatistics_ShouldReturnStatistics_WithMonthlyPeriod() {
        LocalDate monthStart = LocalDate.of(2024, 2, 1);
        LocalDate monthEnd = LocalDate.of(2024, 3, 1);

        Expense fixedExpense = new Expense();
        fixedExpense.setId(UUID.randomUUID());
        fixedExpense.setAmount(new BigDecimal("200.00"));
        fixedExpense.setCategory(ExpenseCategory.RENT);
        fixedExpense.setType(ExpenseType.FIXED);
        fixedExpense.setDate(LocalDate.of(2024, 2, 10));
        fixedExpense.setUser(testUser);

        Expense variableExpense = new Expense();
        variableExpense.setId(UUID.randomUUID());
        variableExpense.setAmount(new BigDecimal("100.00"));
        variableExpense.setCategory(ExpenseCategory.SUPERMARKET);
        variableExpense.setType(ExpenseType.VARIABLE);
        variableExpense.setDate(LocalDate.of(2024, 2, 12));
        variableExpense.setUser(testUser);

        List<Expense> expenses = Arrays.asList(fixedExpense, variableExpense);

        when(userRepository.findByEmail(testEmail)).thenReturn(Optional.of(testUser));
        when(expenseRepository.findAllByUserAndDateBetween(testUser, monthStart, monthEnd))
                .thenReturn(expenses);

        FixedAndVariableStatisticsResponse response = expenseService.getFixedAndVariableStatistics(
                testEmail, "monthly", 2024, 2, null);

        assertNotNull(response);
        assertEquals(new BigDecimal("300.00"), response.totalAmount());
        assertEquals(new BigDecimal("200.00"), response.fixedAmount());
        assertEquals(new BigDecimal("100.00"), response.variableAmount());
        assertEquals(66.6667, response.fixedPercentage(), 0.01);
        assertEquals(33.3333, response.variablePercentage(), 0.01);
    }

    @Test
    void getFixedAndVariableStatistics_ShouldReturnZeroes_WhenNoExpenses() {
        when(userRepository.findByEmail(testEmail)).thenReturn(Optional.of(testUser));
        when(expenseRepository.findAllByUser(testUser)).thenReturn(Arrays.asList());

        FixedAndVariableStatisticsResponse response = expenseService.getFixedAndVariableStatistics(
                testEmail, "all", null, null, null);

        assertNotNull(response);
        assertEquals(BigDecimal.ZERO, response.totalAmount());
        assertEquals(BigDecimal.ZERO, response.fixedAmount());
        assertEquals(BigDecimal.ZERO, response.variableAmount());
        assertEquals(0.0, response.fixedPercentage());
        assertEquals(0.0, response.variablePercentage());
    }

    @Test
    void getExpenseStatistics_ShouldThrowAuthException_WhenUserNotFound() {
        when(userRepository.findByEmail(testEmail)).thenReturn(Optional.empty());

        AuthException exception = assertThrows(AuthException.class,
                () -> expenseService.getExpenseStatistics(testEmail, "monthly", 2024, 1, null));

        assertEquals(ErrorCode.USER_NOT_FOUND, exception.getErrorCode());
        verify(expenseRepository, never()).findAllByUser(any());
        verify(expenseRepository, never()).findAllByUserAndDateBetween(any(), any(), any());
    }
}
