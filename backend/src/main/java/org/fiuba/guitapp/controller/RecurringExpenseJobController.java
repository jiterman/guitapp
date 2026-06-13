package org.fiuba.guitapp.controller;

import org.fiuba.guitapp.service.RecurringExpenseGenerationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/expenses/recurring")
@RequiredArgsConstructor
public class RecurringExpenseJobController {

    private final RecurringExpenseGenerationService recurringExpenseGenerationService;

    @PostMapping("/run")
    public ResponseEntity<Integer> runRecurringExpenseGeneration() {
        int expensesGenerated = recurringExpenseGenerationService.generateDueExpenses();
        return ResponseEntity.ok(expensesGenerated);
    }
}
