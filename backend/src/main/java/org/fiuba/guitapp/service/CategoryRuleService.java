package org.fiuba.guitapp.service;

import java.security.Principal;
import java.util.List;

import org.fiuba.guitapp.dto.CategoryRuleRequest;
import org.fiuba.guitapp.dto.CategoryRuleResponse;
import org.fiuba.guitapp.dto.UpdateCategoryRuleRequest;
import org.fiuba.guitapp.exception.AuthException;
import org.fiuba.guitapp.exception.ErrorCode;
import org.fiuba.guitapp.model.CategoryRule;
import org.fiuba.guitapp.model.ExpenseCategory;
import org.fiuba.guitapp.model.User;
import org.fiuba.guitapp.repository.CategoryRuleRepository;
import org.fiuba.guitapp.repository.UserRepository;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CategoryRuleService {

    private final CategoryRuleRepository categoryRuleRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<CategoryRuleResponse> getUserRules(Principal principal) {
        User user = fetchUser(principal);

        return categoryRuleRepository.findByUser(user)
                .stream()
                .map(rule -> new CategoryRuleResponse(rule.getId(), rule.getCategory(), rule.getType()))
                .toList();
    }

    @Transactional
    public CategoryRuleResponse createRule(Principal principal, CategoryRuleRequest request) {
        if (request.category() == ExpenseCategory.OTHER) {
            throw new AuthException(
                    ErrorCode.CATEGORY_RULE_INVALID_CATEGORY,
                    "No se puede crear una regla para esta categoría indefinida.");
        }

        User user = fetchUser(principal);

        CategoryRule newRule = new CategoryRule();
        newRule.setUser(user);
        newRule.setCategory(request.category());
        newRule.setType(request.type());

        try {
            categoryRuleRepository.save(newRule);
            categoryRuleRepository.flush();

            return new CategoryRuleResponse(newRule.getId(), newRule.getCategory(), newRule.getType());

        } catch (DataIntegrityViolationException ex) {
            throw new AuthException(
                    ErrorCode.CATEGORY_RULE_DUPLICATED,
                    "Ya existe una regla para esa categoría. No se permiten duplicados.");
        }
    }

    @Transactional
    public void updateRule(Principal principal, Long id, UpdateCategoryRuleRequest request) {
        User user = fetchUser(principal);

        CategoryRule rule = categoryRuleRepository.findById(id)
                .filter(r -> r.getUser().getId().equals(user.getId()))
                .orElseThrow(() -> new AuthException(
                        ErrorCode.CATEGORY_RULE_NOT_FOUND,
                        "Regla no encontrada."));

        rule.setType(request.type());
        categoryRuleRepository.save(rule);
    }

    @Transactional
    public void deleteRule(Principal principal, Long id) {
        User user = fetchUser(principal);

        CategoryRule rule = categoryRuleRepository.findById(id)
                .filter(r -> r.getUser().getId().equals(user.getId()))
                .orElseThrow(() -> new AuthException(
                        ErrorCode.CATEGORY_RULE_NOT_FOUND,
                        "Regla no encontrada."));

        categoryRuleRepository.delete(rule);
    }

    private User fetchUser(Principal principal) {
        String email = principal.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new AuthException(
                        ErrorCode.USER_NOT_FOUND,
                        "User not found"));
    }
}
