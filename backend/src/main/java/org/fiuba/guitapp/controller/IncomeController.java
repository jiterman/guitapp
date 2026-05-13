package org.fiuba.guitapp.controller;

import java.security.Principal;
import java.util.UUID;

import org.fiuba.guitapp.dto.AddIncomeRequest;
import org.fiuba.guitapp.dto.IncomeResponse;
import org.fiuba.guitapp.dto.UpdateIncomeRequest;
import org.fiuba.guitapp.service.IncomeService;
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
@RequestMapping("/api/incomes")
@RequiredArgsConstructor
public class IncomeController {

    private final IncomeService incomeService;

    @PostMapping
    public ResponseEntity<IncomeResponse> addIncome(
            Principal principal,
            @Valid @RequestBody AddIncomeRequest request) {
        IncomeResponse response = incomeService.addIncome(principal.getName(), request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{incomeId}")
    public ResponseEntity<Void> deleteIncome(Principal principal, @PathVariable UUID incomeId) {
        incomeService.deleteIncome(principal.getName(), incomeId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{incomeId}")
    public ResponseEntity<IncomeResponse> getIncomeById(Principal principal, @PathVariable UUID incomeId) {
        IncomeResponse response = incomeService.getIncomeById(principal.getName(), incomeId);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{incomeId}")
    public ResponseEntity<IncomeResponse> updateIncome(
            Principal principal,
            @PathVariable UUID incomeId,
            @Valid @RequestBody UpdateIncomeRequest request) {
        IncomeResponse response = incomeService.updateIncome(principal.getName(), incomeId, request);
        return ResponseEntity.ok(response);
    }
}
