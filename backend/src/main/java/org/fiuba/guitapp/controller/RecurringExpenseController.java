package org.fiuba.guitapp.controller;

import java.security.Principal;
import java.util.List;
import java.util.UUID;

import org.fiuba.guitapp.dto.AddRecurringExpenseRequest;
import org.fiuba.guitapp.dto.RecurringExpenseResponse;
import org.fiuba.guitapp.dto.UpdateRecurringExpenseRequest;
import org.fiuba.guitapp.service.RecurringExpenseService;
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
@RequestMapping("/api/expenses/recurring")
@RequiredArgsConstructor
public class RecurringExpenseController {

    private final RecurringExpenseService recurringExpenseService;

    @PostMapping
    public ResponseEntity<RecurringExpenseResponse> addRecurringExpense(
            Principal principal,
            @Valid @RequestBody AddRecurringExpenseRequest request) {
        RecurringExpenseResponse response = recurringExpenseService.addRecurringExpense(principal.getName(), request);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<List<RecurringExpenseResponse>> getRecurringExpenses(Principal principal) {
        return ResponseEntity.ok(recurringExpenseService.getRecurringExpenses(principal.getName()));
    }

    @GetMapping("/{recurringExpenseId}")
    public ResponseEntity<RecurringExpenseResponse> getRecurringExpenseById(
            Principal principal, @PathVariable UUID recurringExpenseId) {
        RecurringExpenseResponse response = recurringExpenseService.getRecurringExpenseById(
                principal.getName(), recurringExpenseId);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{recurringExpenseId}")
    public ResponseEntity<RecurringExpenseResponse> updateRecurringExpense(
            Principal principal,
            @PathVariable UUID recurringExpenseId,
            @Valid @RequestBody UpdateRecurringExpenseRequest request) {
        RecurringExpenseResponse response = recurringExpenseService.updateRecurringExpense(
                principal.getName(), recurringExpenseId, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{recurringExpenseId}")
    public ResponseEntity<Void> deleteRecurringExpense(
            Principal principal, @PathVariable UUID recurringExpenseId) {
        recurringExpenseService.deleteRecurringExpense(principal.getName(), recurringExpenseId);
        return ResponseEntity.noContent().build();
    }
}
