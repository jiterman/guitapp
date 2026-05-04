package org.fiuba.guitapp.controller;

import java.security.Principal;

import org.fiuba.guitapp.dto.AddIncomeRequest;
import org.fiuba.guitapp.dto.IncomeResponse;
import org.fiuba.guitapp.service.IncomeService;
import org.springframework.http.ResponseEntity;
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
}
