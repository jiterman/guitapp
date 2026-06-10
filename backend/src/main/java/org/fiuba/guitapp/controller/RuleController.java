package org.fiuba.guitapp.controller;

import java.security.Principal;
import java.util.List;
import java.util.Map;

import org.fiuba.guitapp.dto.CategoryRuleRequest;
import org.fiuba.guitapp.dto.CategoryRuleResponse;
import org.fiuba.guitapp.dto.UpdateCategoryRuleRequest;
import org.fiuba.guitapp.exception.AuthException;
import org.fiuba.guitapp.service.CategoryRuleService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/rules/categories")
@RequiredArgsConstructor
public class RuleController {

    private final CategoryRuleService categoryRuleService;

    @GetMapping
    public ResponseEntity<List<CategoryRuleResponse>> getUserRules(Principal principal) {
        List<CategoryRuleResponse> rules = categoryRuleService.getUserRules(principal);
        return ResponseEntity.ok(rules);
    }

    @PostMapping
    public ResponseEntity<?> createCategoryRule(Principal principal, @RequestBody CategoryRuleRequest request) {
        try {
            CategoryRuleResponse createdRule = categoryRuleService.createRule(principal, request);
            return ResponseEntity.ok(createdRule);
        } catch (AuthException ex) {
            return ResponseEntity.badRequest()
                    .body(Map.of(
                            "message", ex.getMessage(),
                            "code", ex.getErrorCode().name()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateCategoryRule(Principal principal, @PathVariable Long id, @RequestBody UpdateCategoryRuleRequest request) {
        try {
            categoryRuleService.updateRule(principal, id, request);
            return ResponseEntity.ok(Map.of("message", "Regla actualizada con éxito"));
        } catch (AuthException ex) {
            return ResponseEntity.badRequest()
                    .body(Map.of(
                            "message", ex.getMessage(),
                            "code", ex.getErrorCode().name()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteCategoryRule(Principal principal, @PathVariable Long id) {
        try {
            categoryRuleService.deleteRule(principal, id);
            return ResponseEntity.ok(Map.of("message", "Regla eliminada con éxito"));
        } catch (AuthException ex) {
            return ResponseEntity.badRequest()
                    .body(Map.of(
                            "message", ex.getMessage(),
                            "code", ex.getErrorCode().name()));
        }
    }
}
