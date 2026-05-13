package org.fiuba.guitapp.controller;

import java.security.Principal;
import java.util.UUID;

import org.fiuba.guitapp.dto.AddExpenseRequest;
import org.fiuba.guitapp.dto.ExpenseResponse;
import org.fiuba.guitapp.service.ExpenseService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
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
}
