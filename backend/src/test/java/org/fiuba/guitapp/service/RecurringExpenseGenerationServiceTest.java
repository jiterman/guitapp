package org.fiuba.guitapp.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import org.fiuba.guitapp.model.Expense;
import org.fiuba.guitapp.model.ExpenseCategory;
import org.fiuba.guitapp.model.ExpenseType;
import org.fiuba.guitapp.model.RecurrenceFrequency;
import org.fiuba.guitapp.model.RecurringExpense;
import org.fiuba.guitapp.model.User;
import org.fiuba.guitapp.repository.ExpenseRepository;
import org.fiuba.guitapp.repository.RecurringExpenseRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
@SuppressWarnings("null")
class RecurringExpenseGenerationServiceTest {

    @Mock
    private RecurringExpenseRepository recurringExpenseRepository;

    @Mock
    private ExpenseRepository expenseRepository;

    @InjectMocks
    private RecurringExpenseGenerationService generationService;

    private User testUser;

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setId(UUID.randomUUID());
        testUser.setEmail("test@example.com");
    }

    private RecurringExpense buildTemplate(
            RecurrenceFrequency frequency, LocalDate startDate, LocalDate nextOccurrence, LocalDate endDate) {
        RecurringExpense template = new RecurringExpense();
        template.setId(UUID.randomUUID());
        template.setAmount(new BigDecimal("1000.00"));
        template.setTitle("Rent");
        template.setDescription("Monthly rent");
        template.setCategory(ExpenseCategory.RENT);
        template.setType(ExpenseType.FIXED);
        template.setFrequency(frequency);
        template.setStartDate(startDate);
        template.setNextOccurrence(nextOccurrence);
        template.setEndDate(endDate);
        template.setActive(true);
        template.setUser(testUser);
        return template;
    }

    @Test
    void generateDueExpenses_ShouldRemainActive_WhenEndDateIsStillInFuture() {
        LocalDate today = LocalDate.now();
        LocalDate endDate = today.plusMonths(2);
        RecurringExpense template = buildTemplate(RecurrenceFrequency.WEEKLY, today, today, endDate);

        when(recurringExpenseRepository.findAllByActiveTrueAndNextOccurrenceLessThanEqual(any(LocalDate.class)))
                .thenReturn(List.of(template));

        int generated = generationService.generateDueExpenses();

        assertEquals(1, generated);
        assertTrue(template.isActive());
        assertTrue(template.getNextOccurrence().isBefore(endDate) || template.getNextOccurrence().isEqual(endDate));
    }

    @Test
    void generateDueExpenses_ShouldReturnZero_WhenNoTemplatesDue() {
        when(recurringExpenseRepository.findAllByActiveTrueAndNextOccurrenceLessThanEqual(any(LocalDate.class)))
                .thenReturn(List.of());

        int generated = generationService.generateDueExpenses();

        assertEquals(0, generated);
        verify(expenseRepository, never()).save(any());
    }

    @Test
    void generateDueExpenses_Weekly_ShouldCatchUpAllMissedOccurrences() {
        LocalDate today = LocalDate.now();
        LocalDate start = today.minusWeeks(3);
        RecurringExpense template = buildTemplate(RecurrenceFrequency.WEEKLY, start, start, null);

        when(recurringExpenseRepository.findAllByActiveTrueAndNextOccurrenceLessThanEqual(any(LocalDate.class)))
                .thenReturn(List.of(template));

        int generated = generationService.generateDueExpenses();

        assertEquals(4, generated);
        verify(expenseRepository, times(4)).save(any(Expense.class));
        assertEquals(today.plusWeeks(1), template.getNextOccurrence());
        assertTrue(template.isActive());
        verify(recurringExpenseRepository, times(1)).save(template);
    }

    @Test
    void generateDueExpenses_ShouldCreateExpenseWithTemplateData() {
        LocalDate today = LocalDate.now();
        RecurringExpense template = buildTemplate(RecurrenceFrequency.WEEKLY, today, today, null);

        when(recurringExpenseRepository.findAllByActiveTrueAndNextOccurrenceLessThanEqual(any(LocalDate.class)))
                .thenReturn(List.of(template));

        generationService.generateDueExpenses();

        ArgumentCaptor<Expense> captor = ArgumentCaptor.forClass(Expense.class);
        verify(expenseRepository).save(captor.capture());
        Expense created = captor.getValue();
        assertEquals(new BigDecimal("1000.00"), created.getAmount());
        assertEquals("Rent", created.getTitle());
        assertEquals("Monthly rent", created.getDescription());
        assertEquals(ExpenseCategory.RENT, created.getCategory());
        assertEquals(ExpenseType.FIXED, created.getType());
        assertEquals(today, created.getDate());
        assertEquals(testUser, created.getUser());
    }

    @Test
    void generateDueExpenses_ShouldStopAtEndDate_AndDeactivateTemplate() {
        LocalDate today = LocalDate.now();
        LocalDate start = today.minusWeeks(2);
        LocalDate endDate = today.minusWeeks(1);
        RecurringExpense template = buildTemplate(RecurrenceFrequency.WEEKLY, start, start, endDate);

        when(recurringExpenseRepository.findAllByActiveTrueAndNextOccurrenceLessThanEqual(any(LocalDate.class)))
                .thenReturn(List.of(template));

        int generated = generationService.generateDueExpenses();

        assertEquals(2, generated);
        verify(expenseRepository, times(2)).save(any(Expense.class));
        assertFalse(template.isActive());
    }

    @Test
    void generateDueExpenses_ShouldGenerateSingleOccurrence_WhenNextOccurrenceIsToday() {
        LocalDate today = LocalDate.now();
        RecurringExpense template = buildTemplate(RecurrenceFrequency.MONTHLY, today, today, null);

        when(recurringExpenseRepository.findAllByActiveTrueAndNextOccurrenceLessThanEqual(any(LocalDate.class)))
                .thenReturn(List.of(template));

        int generated = generationService.generateDueExpenses();

        assertEquals(1, generated);
        verify(expenseRepository, times(1)).save(any(Expense.class));
        assertTrue(template.getNextOccurrence().isAfter(today));
    }
}
