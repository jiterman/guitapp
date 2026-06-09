package org.fiuba.guitapp.service;

import java.time.LocalDate;
import java.util.List;

import org.fiuba.guitapp.model.Income;
import org.fiuba.guitapp.model.RecurringIncome;
import org.fiuba.guitapp.repository.IncomeRepository;
import org.fiuba.guitapp.repository.RecurringIncomeRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class RecurringIncomeGenerationService {

    private final RecurringIncomeRepository recurringIncomeRepository;
    private final IncomeRepository incomeRepository;

    @Transactional
    public int generateDueIncomes() {
        LocalDate today = LocalDate.now();
        List<RecurringIncome> dueTemplates = recurringIncomeRepository
                .findAllByActiveTrueAndNextOccurrenceLessThanEqual(today);

        int totalGenerated = 0;
        for (RecurringIncome template : dueTemplates) {
            totalGenerated += processTemplate(template, today);
        }

        log.info("Recurring income generation finished: {} income(s) created from {} template(s)",
                totalGenerated, dueTemplates.size());
        return totalGenerated;
    }

    private int processTemplate(RecurringIncome template, LocalDate today) {
        int anchorDayOfMonth = template.getStartDate().getDayOfMonth();
        LocalDate occurrence = template.getNextOccurrence();
        int generated = 0;

        while (!occurrence.isAfter(today)
                && (template.getEndDate() == null || !occurrence.isAfter(template.getEndDate()))) {
            createIncome(template, occurrence);
            generated++;
            occurrence = RecurrenceCalculator.next(occurrence, template.getFrequency(), anchorDayOfMonth);
        }

        template.setNextOccurrence(occurrence);
        if (template.getEndDate() != null && occurrence.isAfter(template.getEndDate())) {
            template.setActive(false);
        }
        recurringIncomeRepository.save(template);

        return generated;
    }

    private void createIncome(RecurringIncome template, LocalDate date) {
        Income income = new Income();
        income.setAmount(template.getAmount());
        income.setDescription(template.getDescription());
        income.setCategory(template.getCategory());
        income.setDate(date);
        income.setUser(template.getUser());
        incomeRepository.save(income);
    }
}
