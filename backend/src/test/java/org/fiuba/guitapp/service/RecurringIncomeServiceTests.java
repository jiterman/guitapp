package org.fiuba.guitapp.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.fiuba.guitapp.dto.AddRecurringIncomeRequest;
import org.fiuba.guitapp.dto.RecurringIncomeResponse;
import org.fiuba.guitapp.dto.UpdateRecurringIncomeRequest;
import org.fiuba.guitapp.exception.AuthException;
import org.fiuba.guitapp.exception.ErrorCode;
import org.fiuba.guitapp.model.IncomeCategory;
import org.fiuba.guitapp.model.RecurrenceFrequency;
import org.fiuba.guitapp.model.RecurringIncome;
import org.fiuba.guitapp.model.User;
import org.fiuba.guitapp.model.UserStatus;
import org.fiuba.guitapp.repository.RecurringIncomeRepository;
import org.fiuba.guitapp.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
@SuppressWarnings("null")
class RecurringIncomeServiceTests {

    @Mock
    private RecurringIncomeRepository recurringIncomeRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private RecurringIncomeService recurringIncomeService;

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

    private RecurringIncome buildTemplate(UUID id) {
        RecurringIncome template = new RecurringIncome();
        template.setId(id);
        template.setAmount(new BigDecimal("500000.00"));
        template.setDescription("Salary");
        template.setCategory(IncomeCategory.SALARY);
        template.setFrequency(RecurrenceFrequency.MONTHLY);
        template.setStartDate(LocalDate.now().plusDays(5));
        template.setNextOccurrence(LocalDate.now().plusDays(5));
        template.setActive(true);
        template.setUser(testUser);
        return template;
    }

    @Test
    void addRecurringIncome_ShouldPersistTemplate_WithFutureStartDateAsNextOccurrence() {
        LocalDate futureStart = LocalDate.now().plusDays(10);
        AddRecurringIncomeRequest request = new AddRecurringIncomeRequest(
                new BigDecimal("500000.00"), "Salary", IncomeCategory.SALARY,
                RecurrenceFrequency.MONTHLY, futureStart, null);

        when(userRepository.findByEmail(testEmail)).thenReturn(Optional.of(testUser));
        when(recurringIncomeRepository.save(any(RecurringIncome.class))).thenAnswer(invocation -> {
            RecurringIncome saved = invocation.getArgument(0);
            saved.setId(UUID.randomUUID());
            return saved;
        });

        RecurringIncomeResponse response = recurringIncomeService.addRecurringIncome(testEmail, request);

        assertNotNull(response);
        assertEquals(new BigDecimal("500000.00"), response.amount());
        assertEquals(IncomeCategory.SALARY, response.category());
        assertEquals(RecurrenceFrequency.MONTHLY, response.frequency());
        assertEquals(futureStart, response.startDate());
        assertEquals(futureStart, response.nextOccurrence());
        assertTrue(response.active());
        verify(recurringIncomeRepository, times(1)).save(any(RecurringIncome.class));
    }

    @Test
    void addRecurringIncome_ShouldThrowAuthException_WhenUserNotFound() {
        AddRecurringIncomeRequest request = new AddRecurringIncomeRequest(
                new BigDecimal("100.00"), null, IncomeCategory.SALARY,
                RecurrenceFrequency.WEEKLY, LocalDate.now(), null);

        when(userRepository.findByEmail(testEmail)).thenReturn(Optional.empty());

        AuthException exception = assertThrows(AuthException.class,
                () -> recurringIncomeService.addRecurringIncome(testEmail, request));
        assertEquals(ErrorCode.USER_NOT_FOUND, exception.getErrorCode());
        verify(recurringIncomeRepository, never()).save(any());
    }

    @Test
    void getRecurringIncomes_ShouldReturnUserTemplates() {
        RecurringIncome template = buildTemplate(UUID.randomUUID());

        when(userRepository.findByEmail(testEmail)).thenReturn(Optional.of(testUser));
        when(recurringIncomeRepository.findAllByUserOrderByStartDateDesc(testUser))
                .thenReturn(List.of(template));

        List<RecurringIncomeResponse> responses = recurringIncomeService.getRecurringIncomes(testEmail);

        assertEquals(1, responses.size());
        assertEquals(template.getId(), responses.get(0).id());
    }

    @Test
    void getRecurringIncomeById_ShouldReturnTemplate_WhenOwnedByUser() {
        UUID id = UUID.randomUUID();
        RecurringIncome template = buildTemplate(id);

        when(userRepository.findByEmail(testEmail)).thenReturn(Optional.of(testUser));
        when(recurringIncomeRepository.findById(id)).thenReturn(Optional.of(template));

        RecurringIncomeResponse response = recurringIncomeService.getRecurringIncomeById(testEmail, id);

        assertEquals(id, response.id());
        assertEquals("Salary", response.description());
    }

    @Test
    void getRecurringIncomeById_ShouldThrow_WhenNotFound() {
        UUID id = UUID.randomUUID();
        when(userRepository.findByEmail(testEmail)).thenReturn(Optional.of(testUser));
        when(recurringIncomeRepository.findById(id)).thenReturn(Optional.empty());

        AuthException exception = assertThrows(AuthException.class,
                () -> recurringIncomeService.getRecurringIncomeById(testEmail, id));
        assertEquals(ErrorCode.RECURRING_INCOME_NOT_FOUND, exception.getErrorCode());
    }

    @Test
    void getRecurringIncomeById_ShouldThrow_WhenOwnedByAnotherUser() {
        UUID id = UUID.randomUUID();
        RecurringIncome template = buildTemplate(id);
        User otherUser = new User();
        otherUser.setId(UUID.randomUUID());
        template.setUser(otherUser);

        when(userRepository.findByEmail(testEmail)).thenReturn(Optional.of(testUser));
        when(recurringIncomeRepository.findById(id)).thenReturn(Optional.of(template));

        AuthException exception = assertThrows(AuthException.class,
                () -> recurringIncomeService.getRecurringIncomeById(testEmail, id));
        assertEquals(ErrorCode.RECURRING_INCOME_ACCESS_DENIED, exception.getErrorCode());
    }

    @Test
    void updateRecurringIncome_ShouldPatchFields_AndRecomputeNextOccurrence_WhenScheduleChanges() {
        UUID id = UUID.randomUUID();
        RecurringIncome template = buildTemplate(id);
        LocalDate newStart = LocalDate.now().plusDays(20);
        UpdateRecurringIncomeRequest request = new UpdateRecurringIncomeRequest(
                new BigDecimal("600000.00"), "New salary", null,
                RecurrenceFrequency.WEEKLY, newStart, null, null);

        when(userRepository.findByEmail(testEmail)).thenReturn(Optional.of(testUser));
        when(recurringIncomeRepository.findById(id)).thenReturn(Optional.of(template));
        when(recurringIncomeRepository.save(any(RecurringIncome.class))).thenAnswer(inv -> inv.getArgument(0));

        RecurringIncomeResponse response = recurringIncomeService.updateRecurringIncome(testEmail, id, request);

        assertEquals(new BigDecimal("600000.00"), response.amount());
        assertEquals("New salary", response.description());
        assertEquals(RecurrenceFrequency.WEEKLY, response.frequency());
        assertEquals(newStart, response.startDate());
        assertEquals(newStart, response.nextOccurrence());
    }

    @Test
    void updateRecurringIncome_ShouldDeactivate_WhenActiveSetToFalse() {
        UUID id = UUID.randomUUID();
        RecurringIncome template = buildTemplate(id);
        UpdateRecurringIncomeRequest request = new UpdateRecurringIncomeRequest(
                null, null, null, null, null, null, false);

        when(userRepository.findByEmail(testEmail)).thenReturn(Optional.of(testUser));
        when(recurringIncomeRepository.findById(id)).thenReturn(Optional.of(template));
        when(recurringIncomeRepository.save(any(RecurringIncome.class))).thenAnswer(inv -> inv.getArgument(0));

        RecurringIncomeResponse response = recurringIncomeService.updateRecurringIncome(testEmail, id, request);

        assertFalse(response.active());
    }

    @Test
    void deleteRecurringIncome_ShouldDelete_WhenOwnedByUser() {
        UUID id = UUID.randomUUID();
        RecurringIncome template = buildTemplate(id);

        when(userRepository.findByEmail(testEmail)).thenReturn(Optional.of(testUser));
        when(recurringIncomeRepository.findById(id)).thenReturn(Optional.of(template));

        recurringIncomeService.deleteRecurringIncome(testEmail, id);

        verify(recurringIncomeRepository, times(1)).delete(template);
    }
}
