package org.fiuba.guitapp.controller;

import org.fiuba.guitapp.service.RecurringIncomeGenerationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/incomes/recurring")
@RequiredArgsConstructor
public class RecurringIncomeJobController {

    private final RecurringIncomeGenerationService recurringIncomeGenerationService;

    @PostMapping("/run")
    public ResponseEntity<Integer> runRecurringIncomeGeneration() {
        int incomesGenerated = recurringIncomeGenerationService.generateDueIncomes();
        return ResponseEntity.ok(incomesGenerated);
    }
}
