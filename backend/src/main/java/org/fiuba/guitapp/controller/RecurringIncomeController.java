package org.fiuba.guitapp.controller;

import java.security.Principal;
import java.util.List;
import java.util.UUID;

import org.fiuba.guitapp.dto.AddRecurringIncomeRequest;
import org.fiuba.guitapp.dto.RecurringIncomeResponse;
import org.fiuba.guitapp.dto.UpdateRecurringIncomeRequest;
import org.fiuba.guitapp.service.RecurringIncomeService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/incomes/recurring")
@RequiredArgsConstructor
public class RecurringIncomeController {

    private final RecurringIncomeService recurringIncomeService;

    @PostMapping
    public ResponseEntity<RecurringIncomeResponse> addRecurringIncome(
            Principal principal,
            @Valid @RequestBody AddRecurringIncomeRequest request) {
        RecurringIncomeResponse response = recurringIncomeService.addRecurringIncome(principal.getName(), request);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<List<RecurringIncomeResponse>> getRecurringIncomes(Principal principal) {
        return ResponseEntity.ok(recurringIncomeService.getRecurringIncomes(principal.getName()));
    }

    @GetMapping("/{recurringIncomeId}")
    public ResponseEntity<RecurringIncomeResponse> getRecurringIncomeById(
            Principal principal, @PathVariable UUID recurringIncomeId) {
        RecurringIncomeResponse response = recurringIncomeService.getRecurringIncomeById(
                principal.getName(), recurringIncomeId);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{recurringIncomeId}")
    public ResponseEntity<RecurringIncomeResponse> updateRecurringIncome(
            Principal principal,
            @PathVariable UUID recurringIncomeId,
            @Valid @RequestBody UpdateRecurringIncomeRequest request) {
        RecurringIncomeResponse response = recurringIncomeService.updateRecurringIncome(
                principal.getName(), recurringIncomeId, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{recurringIncomeId}")
    public ResponseEntity<Void> deleteRecurringIncome(
            Principal principal, @PathVariable UUID recurringIncomeId) {
        recurringIncomeService.deleteRecurringIncome(principal.getName(), recurringIncomeId);
        return ResponseEntity.noContent().build();
    }
}
