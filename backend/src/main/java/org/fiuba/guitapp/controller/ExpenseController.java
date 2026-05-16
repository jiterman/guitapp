package org.fiuba.guitapp.controller;

import java.security.Principal;
import java.util.UUID;

import org.fiuba.guitapp.dto.AddExpenseRequest;
import org.fiuba.guitapp.dto.ExpenseResponse;
import org.fiuba.guitapp.dto.ExpenseStatisticsResponse;
import org.fiuba.guitapp.dto.UpdateExpenseRequest;
import org.fiuba.guitapp.service.ExpenseService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/expenses")
@RequiredArgsConstructor
public class ExpenseController {

    private final ExpenseService expenseService;

    @PostMapping
    public ResponseEntity<ExpenseResponse> addExpense(
            Principal principal,
            @Valid @RequestBody AddExpenseRequest request) {
        ExpenseResponse response = expenseService.addExpense(principal.getName(), request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{expenseId}")
    public ResponseEntity<ExpenseResponse> getExpenseById(Principal principal, @PathVariable UUID expenseId) {
        ExpenseResponse response = expenseService.getExpenseById(principal.getName(), expenseId);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{expenseId}")
    public ResponseEntity<Void> deleteExpense(Principal principal, @PathVariable UUID expenseId) {
        expenseService.deleteExpense(principal.getName(), expenseId);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{expenseId}")
    public ResponseEntity<ExpenseResponse> updateExpense(
            Principal principal,
            @PathVariable UUID expenseId,
            @Valid @RequestBody UpdateExpenseRequest request) {
        ExpenseResponse response = expenseService.updateExpense(principal.getName(), expenseId, request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/statistics")
    public ResponseEntity<ExpenseStatisticsResponse> getExpenseStatistics(
            Principal principal,
            @RequestParam(defaultValue = "monthly") String period,
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) Integer month,
            @RequestParam(required = false) Integer day) {
        ExpenseStatisticsResponse response = expenseService.getExpenseStatistics(
                principal.getName(), period, year, month, day);
        return ResponseEntity.ok(response);
    }
}
