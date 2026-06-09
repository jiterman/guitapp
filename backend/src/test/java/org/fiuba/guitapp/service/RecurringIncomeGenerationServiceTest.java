package org.fiuba.guitapp.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import org.fiuba.guitapp.model.Income;
import org.fiuba.guitapp.model.IncomeCategory;
import org.fiuba.guitapp.model.RecurrenceFrequency;
import org.fiuba.guitapp.model.RecurringIncome;
import org.fiuba.guitapp.model.User;
import org.fiuba.guitapp.repository.IncomeRepository;
import org.fiuba.guitapp.repository.RecurringIncomeRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
@SuppressWarnings("null")
class RecurringIncomeGenerationServiceTest {

    @Mock
    private RecurringIncomeRepository recurringIncomeRepository;

    @Mock
    private IncomeRepository incomeRepository;

    @InjectMocks
    private RecurringIncomeGenerationService generationService;

    private User testUser;

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setId(UUID.randomUUID());
        testUser.setEmail("test@example.com");
    }

    private RecurringIncome buildTemplate(
            RecurrenceFrequency frequency, LocalDate startDate, LocalDate nextOccurrence, LocalDate endDate) {
        RecurringIncome template = new RecurringIncome();
        template.setId(UUID.randomUUID());
        template.setAmount(new BigDecimal("1000.00"));
        template.setDescription("Salary");
        template.setCategory(IncomeCategory.SALARY);
        template.setFrequency(frequency);
        template.setStartDate(startDate);
        template.setNextOccurrence(nextOccurrence);
        template.setEndDate(endDate);
        template.setActive(true);
        template.setUser(testUser);
        return template;
    }

    @Test
    void generateDueIncomes_ShouldReturnZero_WhenNoTemplatesDue() {
        when(recurringIncomeRepository.findAllByActiveTrueAndNextOccurrenceLessThanEqual(any(LocalDate.class)))
                .thenReturn(List.of());

        int generated = generationService.generateDueIncomes();

        assertEquals(0, generated);
        verify(incomeRepository, never()).save(any());
    }

    @Test
    void generateDueIncomes_Weekly_ShouldCatchUpAllMissedOccurrences() {
        LocalDate today = LocalDate.now();
        LocalDate start = today.minusWeeks(3);
        RecurringIncome template = buildTemplate(RecurrenceFrequency.WEEKLY, start, start, null);

        when(recurringIncomeRepository.findAllByActiveTrueAndNextOccurrenceLessThanEqual(any(LocalDate.class)))
                .thenReturn(List.of(template));

        int generated = generationService.generateDueIncomes();

        assertEquals(4, generated);
        verify(incomeRepository, times(4)).save(any(Income.class));
        assertEquals(today.plusWeeks(1), template.getNextOccurrence());
        assertTrue(template.isActive());
        verify(recurringIncomeRepository, times(1)).save(template);
    }

    @Test
    void generateDueIncomes_ShouldCreateIncomeWithTemplateData() {
        LocalDate today = LocalDate.now();
        RecurringIncome template = buildTemplate(RecurrenceFrequency.WEEKLY, today, today, null);

        when(recurringIncomeRepository.findAllByActiveTrueAndNextOccurrenceLessThanEqual(any(LocalDate.class)))
                .thenReturn(List.of(template));

        generationService.generateDueIncomes();

        ArgumentCaptor<Income> captor = ArgumentCaptor.forClass(Income.class);
        verify(incomeRepository).save(captor.capture());
        Income created = captor.getValue();
        assertEquals(new BigDecimal("1000.00"), created.getAmount());
        assertEquals("Salary", created.getDescription());
        assertEquals(IncomeCategory.SALARY, created.getCategory());
        assertEquals(today, created.getDate());
        assertEquals(testUser, created.getUser());
    }

    @Test
    void generateDueIncomes_ShouldStopAtEndDate_AndDeactivateTemplate() {
        LocalDate today = LocalDate.now();
        LocalDate start = today.minusWeeks(2);
        LocalDate endDate = today.minusWeeks(1);
        RecurringIncome template = buildTemplate(RecurrenceFrequency.WEEKLY, start, start, endDate);

        when(recurringIncomeRepository.findAllByActiveTrueAndNextOccurrenceLessThanEqual(any(LocalDate.class)))
                .thenReturn(List.of(template));

        int generated = generationService.generateDueIncomes();

        assertEquals(2, generated);
        verify(incomeRepository, times(2)).save(any(Income.class));
        assertFalse(template.isActive());
    }

    @Test
    void generateDueIncomes_ShouldGenerateSingleOccurrence_WhenNextOccurrenceIsToday() {
        LocalDate today = LocalDate.now();
        RecurringIncome template = buildTemplate(RecurrenceFrequency.MONTHLY, today, today, null);

        when(recurringIncomeRepository.findAllByActiveTrueAndNextOccurrenceLessThanEqual(any(LocalDate.class)))
                .thenReturn(List.of(template));

        int generated = generationService.generateDueIncomes();

        assertEquals(1, generated);
        verify(incomeRepository, times(1)).save(any(Income.class));
        assertTrue(template.getNextOccurrence().isAfter(today));
    }
}
