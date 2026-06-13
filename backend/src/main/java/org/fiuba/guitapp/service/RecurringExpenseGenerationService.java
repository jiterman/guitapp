package org.fiuba.guitapp.service;

import java.time.LocalDate;
import java.util.List;

import org.fiuba.guitapp.model.Expense;
import org.fiuba.guitapp.model.RecurringExpense;
import org.fiuba.guitapp.repository.ExpenseRepository;
import org.fiuba.guitapp.repository.RecurringExpenseRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class RecurringExpenseGenerationService {

    private final RecurringExpenseRepository recurringExpenseRepository;
    private final ExpenseRepository expenseRepository;

    @Transactional
    public int generateDueExpenses() {
        LocalDate today = LocalDate.now();
        List<RecurringExpense> dueTemplates = recurringExpenseRepository
                .findAllByActiveTrueAndNextOccurrenceLessThanEqual(today);

        int totalGenerated = 0;
        for (RecurringExpense template : dueTemplates) {
            totalGenerated += processTemplate(template, today);
        }

        log.info("Recurring expense generation finished: {} expense(s) created from {} template(s)",
                totalGenerated, dueTemplates.size());
        return totalGenerated;
    }

    private int processTemplate(RecurringExpense template, LocalDate today) {
        int anchorDayOfMonth = template.getStartDate().getDayOfMonth();
        LocalDate occurrence = template.getNextOccurrence();
        int generated = 0;

        while (!occurrence.isAfter(today)
                && (template.getEndDate() == null || !occurrence.isAfter(template.getEndDate()))) {
            createExpense(template, occurrence);
            generated++;
            occurrence = RecurrenceCalculator.next(occurrence, template.getFrequency(), anchorDayOfMonth);
        }

        template.setNextOccurrence(occurrence);
        if (template.getEndDate() != null && occurrence.isAfter(template.getEndDate())) {
            template.setActive(false);
        }
        recurringExpenseRepository.save(template);

        return generated;
    }

    private void createExpense(RecurringExpense template, LocalDate date) {
        Expense expense = new Expense();
        expense.setAmount(template.getAmount());
        expense.setTitle(template.getTitle());
        expense.setDescription(template.getDescription());
        expense.setCategory(template.getCategory());
        expense.setType(template.getType());
        expense.setDate(date);
        expense.setUser(template.getUser());
        expenseRepository.save(expense);
    }
}
