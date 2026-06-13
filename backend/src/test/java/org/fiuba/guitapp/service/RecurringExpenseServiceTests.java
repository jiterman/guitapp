package org.fiuba.guitapp.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.fiuba.guitapp.dto.AddRecurringExpenseRequest;
import org.fiuba.guitapp.dto.RecurringExpenseResponse;
import org.fiuba.guitapp.dto.UpdateRecurringExpenseRequest;
import org.fiuba.guitapp.exception.AuthException;
import org.fiuba.guitapp.exception.ErrorCode;
import org.fiuba.guitapp.model.ExpenseCategory;
import org.fiuba.guitapp.model.ExpenseType;
import org.fiuba.guitapp.model.RecurrenceFrequency;
import org.fiuba.guitapp.model.RecurringExpense;
import org.fiuba.guitapp.model.User;
import org.fiuba.guitapp.model.UserStatus;
import org.fiuba.guitapp.repository.RecurringExpenseRepository;
import org.fiuba.guitapp.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
@SuppressWarnings("null")
class RecurringExpenseServiceTests {

    @Mock
    private RecurringExpenseRepository recurringExpenseRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private RecurringExpenseService recurringExpenseService;

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

    private RecurringExpense buildTemplate(UUID id) {
        RecurringExpense template = new RecurringExpense();
        template.setId(id);
        template.setAmount(new BigDecimal("500000.00"));
        template.setTitle("Rent");
        template.setDescription("Monthly rent");
        template.setCategory(ExpenseCategory.RENT);
        template.setType(ExpenseType.FIXED);
        template.setFrequency(RecurrenceFrequency.MONTHLY);
        template.setStartDate(LocalDate.now().plusDays(5));
        template.setNextOccurrence(LocalDate.now().plusDays(5));
        template.setActive(true);
        template.setUser(testUser);
        return template;
    }

    @Test
    void addRecurringExpense_ShouldPersistTemplate_WithFutureStartDateAsNextOccurrence() {
        LocalDate futureStart = LocalDate.now().plusDays(10);
        AddRecurringExpenseRequest request = new AddRecurringExpenseRequest(
                new BigDecimal("500000.00"), "Rent", "Monthly rent", ExpenseCategory.RENT,
                ExpenseType.FIXED, RecurrenceFrequency.MONTHLY, futureStart, null);

        when(userRepository.findByEmail(testEmail)).thenReturn(Optional.of(testUser));
        when(recurringExpenseRepository.save(any(RecurringExpense.class))).thenAnswer(invocation -> {
            RecurringExpense saved = invocation.getArgument(0);
            saved.setId(UUID.randomUUID());
            return saved;
        });

        RecurringExpenseResponse response = recurringExpenseService.addRecurringExpense(testEmail, request);

        assertNotNull(response);
        assertEquals(new BigDecimal("500000.00"), response.amount());
        assertEquals("Rent", response.title());
        assertEquals(ExpenseCategory.RENT, response.category());
        assertEquals(ExpenseType.FIXED, response.type());
        assertEquals(RecurrenceFrequency.MONTHLY, response.frequency());
        assertEquals(futureStart, response.startDate());
        assertEquals(futureStart, response.nextOccurrence());
        assertTrue(response.active());
        verify(recurringExpenseRepository, times(1)).save(any(RecurringExpense.class));
    }

    @Test
    void addRecurringExpense_ShouldThrowAuthException_WhenUserNotFound() {
        AddRecurringExpenseRequest request = new AddRecurringExpenseRequest(
                new BigDecimal("100.00"), null, null, ExpenseCategory.RENT,
                ExpenseType.VARIABLE, RecurrenceFrequency.WEEKLY, LocalDate.now(), null);

        when(userRepository.findByEmail(testEmail)).thenReturn(Optional.empty());

        AuthException exception = assertThrows(AuthException.class,
                () -> recurringExpenseService.addRecurringExpense(testEmail, request));
        assertEquals(ErrorCode.USER_NOT_FOUND, exception.getErrorCode());
        verify(recurringExpenseRepository, never()).save(any());
    }

    @Test
    void getRecurringExpenses_ShouldThrowAuthException_WhenUserNotFound() {
        when(userRepository.findByEmail(testEmail)).thenReturn(Optional.empty());

        AuthException exception = assertThrows(AuthException.class,
                () -> recurringExpenseService.getRecurringExpenses(testEmail));
        assertEquals(ErrorCode.USER_NOT_FOUND, exception.getErrorCode());
        verify(recurringExpenseRepository, never()).findAllByUserOrderByStartDateDesc(any());
    }

    @Test
    void getRecurringExpenseById_ShouldThrow_WhenTemplateHasNoUser() {
        UUID id = UUID.randomUUID();
        RecurringExpense template = buildTemplate(id);
        template.setUser(null);

        when(userRepository.findByEmail(testEmail)).thenReturn(Optional.of(testUser));
        when(recurringExpenseRepository.findById(id)).thenReturn(Optional.of(template));

        AuthException exception = assertThrows(AuthException.class,
                () -> recurringExpenseService.getRecurringExpenseById(testEmail, id));
        assertEquals(ErrorCode.RECURRING_EXPENSE_ACCESS_DENIED, exception.getErrorCode());
    }

    @Test
    void getRecurringExpenseById_ShouldThrow_WhenTemplateUserHasNoId() {
        UUID id = UUID.randomUUID();
        RecurringExpense template = buildTemplate(id);
        User userWithoutId = new User();
        userWithoutId.setEmail("orphan@example.com");
        template.setUser(userWithoutId);

        when(userRepository.findByEmail(testEmail)).thenReturn(Optional.of(testUser));
        when(recurringExpenseRepository.findById(id)).thenReturn(Optional.of(template));

        AuthException exception = assertThrows(AuthException.class,
                () -> recurringExpenseService.getRecurringExpenseById(testEmail, id));
        assertEquals(ErrorCode.RECURRING_EXPENSE_ACCESS_DENIED, exception.getErrorCode());
    }

    @Test
    void addRecurringExpense_ShouldPersistEndDate_WhenProvided() {
        LocalDate startDate = LocalDate.now().plusDays(3);
        LocalDate endDate = startDate.plusMonths(6);
        AddRecurringExpenseRequest request = new AddRecurringExpenseRequest(
                new BigDecimal("100.00"), null, null, ExpenseCategory.SUBSCRIPTIONS,
                ExpenseType.VARIABLE, RecurrenceFrequency.WEEKLY, startDate, endDate);

        when(userRepository.findByEmail(testEmail)).thenReturn(Optional.of(testUser));
        when(recurringExpenseRepository.save(any(RecurringExpense.class))).thenAnswer(invocation -> {
            RecurringExpense saved = invocation.getArgument(0);
            saved.setId(UUID.randomUUID());
            return saved;
        });

        RecurringExpenseResponse response = recurringExpenseService.addRecurringExpense(testEmail, request);

        assertEquals(endDate, response.endDate());
    }

    @Test
    void updateRecurringExpense_ShouldUpdateCategory_WithoutChangingSchedule() {
        UUID id = UUID.randomUUID();
        RecurringExpense template = buildTemplate(id);
        LocalDate originalNextOccurrence = template.getNextOccurrence();
        UpdateRecurringExpenseRequest request = new UpdateRecurringExpenseRequest(
                null, null, null, ExpenseCategory.SUBSCRIPTIONS, null, null, null, null, null);

        when(userRepository.findByEmail(testEmail)).thenReturn(Optional.of(testUser));
        when(recurringExpenseRepository.findById(id)).thenReturn(Optional.of(template));
        when(recurringExpenseRepository.save(any(RecurringExpense.class))).thenAnswer(inv -> inv.getArgument(0));

        RecurringExpenseResponse response = recurringExpenseService.updateRecurringExpense(testEmail, id, request);

        assertEquals(ExpenseCategory.SUBSCRIPTIONS, response.category());
        assertEquals(originalNextOccurrence, response.nextOccurrence());
    }

    @Test
    void updateRecurringExpense_ShouldUpdateEndDate_WithoutRecomputingNextOccurrence() {
        UUID id = UUID.randomUUID();
        RecurringExpense template = buildTemplate(id);
        LocalDate originalNextOccurrence = template.getNextOccurrence();
        LocalDate endDate = LocalDate.now().plusMonths(12);
        UpdateRecurringExpenseRequest request = new UpdateRecurringExpenseRequest(
                null, null, null, null, null, null, null, endDate, null);

        when(userRepository.findByEmail(testEmail)).thenReturn(Optional.of(testUser));
        when(recurringExpenseRepository.findById(id)).thenReturn(Optional.of(template));
        when(recurringExpenseRepository.save(any(RecurringExpense.class))).thenAnswer(inv -> inv.getArgument(0));

        RecurringExpenseResponse response = recurringExpenseService.updateRecurringExpense(testEmail, id, request);

        assertEquals(endDate, response.endDate());
        assertEquals(originalNextOccurrence, response.nextOccurrence());
    }

    @Test
    void updateRecurringExpense_ShouldRecomputeNextOccurrence_WhenOnlyFrequencyChanges() {
        UUID id = UUID.randomUUID();
        RecurringExpense template = buildTemplate(id);
        LocalDate startDate = LocalDate.now().minusWeeks(1);
        template.setStartDate(startDate);
        template.setFrequency(RecurrenceFrequency.MONTHLY);
        template.setNextOccurrence(startDate);
        UpdateRecurringExpenseRequest request = new UpdateRecurringExpenseRequest(
                null, null, null, null, null, RecurrenceFrequency.WEEKLY, null, null, null);

        when(userRepository.findByEmail(testEmail)).thenReturn(Optional.of(testUser));
        when(recurringExpenseRepository.findById(id)).thenReturn(Optional.of(template));
        when(recurringExpenseRepository.save(any(RecurringExpense.class))).thenAnswer(inv -> inv.getArgument(0));

        RecurringExpenseResponse response = recurringExpenseService.updateRecurringExpense(testEmail, id, request);

        assertEquals(RecurrenceFrequency.WEEKLY, response.frequency());
        assertFalse(response.nextOccurrence().isBefore(LocalDate.now()));
    }

    @Test
    void getRecurringExpenses_ShouldReturnUserTemplates() {
        RecurringExpense template = buildTemplate(UUID.randomUUID());

        when(userRepository.findByEmail(testEmail)).thenReturn(Optional.of(testUser));
        when(recurringExpenseRepository.findAllByUserOrderByStartDateDesc(testUser))
                .thenReturn(List.of(template));

        List<RecurringExpenseResponse> responses = recurringExpenseService.getRecurringExpenses(testEmail);

        assertEquals(1, responses.size());
        assertEquals(template.getId(), responses.get(0).id());
    }

    @Test
    void getRecurringExpenseById_ShouldReturnTemplate_WhenOwnedByUser() {
        UUID id = UUID.randomUUID();
        RecurringExpense template = buildTemplate(id);

        when(userRepository.findByEmail(testEmail)).thenReturn(Optional.of(testUser));
        when(recurringExpenseRepository.findById(id)).thenReturn(Optional.of(template));

        RecurringExpenseResponse response = recurringExpenseService.getRecurringExpenseById(testEmail, id);

        assertEquals(id, response.id());
        assertEquals("Rent", response.title());
    }

    @Test
    void getRecurringExpenseById_ShouldThrow_WhenNotFound() {
        UUID id = UUID.randomUUID();
        when(userRepository.findByEmail(testEmail)).thenReturn(Optional.of(testUser));
        when(recurringExpenseRepository.findById(id)).thenReturn(Optional.empty());

        AuthException exception = assertThrows(AuthException.class,
                () -> recurringExpenseService.getRecurringExpenseById(testEmail, id));
        assertEquals(ErrorCode.RECURRING_EXPENSE_NOT_FOUND, exception.getErrorCode());
    }

    @Test
    void getRecurringExpenseById_ShouldThrow_WhenOwnedByAnotherUser() {
        UUID id = UUID.randomUUID();
        RecurringExpense template = buildTemplate(id);
        User otherUser = new User();
        otherUser.setId(UUID.randomUUID());
        template.setUser(otherUser);

        when(userRepository.findByEmail(testEmail)).thenReturn(Optional.of(testUser));
        when(recurringExpenseRepository.findById(id)).thenReturn(Optional.of(template));

        AuthException exception = assertThrows(AuthException.class,
                () -> recurringExpenseService.getRecurringExpenseById(testEmail, id));
        assertEquals(ErrorCode.RECURRING_EXPENSE_ACCESS_DENIED, exception.getErrorCode());
    }

    @Test
    void updateRecurringExpense_ShouldPatchFields_AndRecomputeNextOccurrence_WhenScheduleChanges() {
        UUID id = UUID.randomUUID();
        RecurringExpense template = buildTemplate(id);
        LocalDate newStart = LocalDate.now().plusDays(20);
        UpdateRecurringExpenseRequest request = new UpdateRecurringExpenseRequest(
                new BigDecimal("600000.00"), "New rent", null, null, null,
                RecurrenceFrequency.WEEKLY, newStart, null, null);

        when(userRepository.findByEmail(testEmail)).thenReturn(Optional.of(testUser));
        when(recurringExpenseRepository.findById(id)).thenReturn(Optional.of(template));
        when(recurringExpenseRepository.save(any(RecurringExpense.class))).thenAnswer(inv -> inv.getArgument(0));

        RecurringExpenseResponse response = recurringExpenseService.updateRecurringExpense(testEmail, id, request);

        assertEquals(new BigDecimal("600000.00"), response.amount());
        assertEquals("New rent", response.title());
        assertEquals(RecurrenceFrequency.WEEKLY, response.frequency());
        assertEquals(newStart, response.startDate());
        assertEquals(newStart, response.nextOccurrence());
    }

    @Test
    void updateRecurringExpense_ShouldDeactivate_WhenActiveSetToFalse() {
        UUID id = UUID.randomUUID();
        RecurringExpense template = buildTemplate(id);
        UpdateRecurringExpenseRequest request = new UpdateRecurringExpenseRequest(
                null, null, null, null, null, null, null, null, false);

        when(userRepository.findByEmail(testEmail)).thenReturn(Optional.of(testUser));
        when(recurringExpenseRepository.findById(id)).thenReturn(Optional.of(template));
        when(recurringExpenseRepository.save(any(RecurringExpense.class))).thenAnswer(inv -> inv.getArgument(0));

        RecurringExpenseResponse response = recurringExpenseService.updateRecurringExpense(testEmail, id, request);

        assertFalse(response.active());
    }

    @Test
    void deleteRecurringExpense_ShouldDelete_WhenOwnedByUser() {
        UUID id = UUID.randomUUID();
        RecurringExpense template = buildTemplate(id);

        when(userRepository.findByEmail(testEmail)).thenReturn(Optional.of(testUser));
        when(recurringExpenseRepository.findById(id)).thenReturn(Optional.of(template));

        recurringExpenseService.deleteRecurringExpense(testEmail, id);

        verify(recurringExpenseRepository, times(1)).delete(template);
    }
}
