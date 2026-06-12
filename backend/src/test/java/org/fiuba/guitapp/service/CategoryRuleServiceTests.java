package org.fiuba.guitapp.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

import java.security.Principal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.fiuba.guitapp.dto.CategoryRuleRequest;
import org.fiuba.guitapp.dto.CategoryRuleResponse;
import org.fiuba.guitapp.dto.UpdateCategoryRuleRequest;
import org.fiuba.guitapp.exception.AuthException;
import org.fiuba.guitapp.exception.ErrorCode;
import org.fiuba.guitapp.model.CategoryRule;
import org.fiuba.guitapp.model.ExpenseCategory;
import org.fiuba.guitapp.model.ExpenseType;
import org.fiuba.guitapp.model.User;
import org.fiuba.guitapp.repository.CategoryRuleRepository;
import org.fiuba.guitapp.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.dao.DataIntegrityViolationException;

@ExtendWith(MockitoExtension.class)
class CategoryRuleServiceTests {

    @Mock
    private CategoryRuleRepository categoryRuleRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private CategoryRuleService categoryRuleService;

    @Mock
    private Principal mockPrincipal;

    private User testUser;
    private String testEmail = "test@example.com";

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setId(UUID.randomUUID());
        testUser.setEmail(testEmail);
        testUser.setFirstName("John");

        lenient().when(mockPrincipal.getName()).thenReturn(testEmail);
    }

    // ==========================================
    // TESTS: getUserRules
    // ==========================================

    @Test
    void getUserRules_ShouldReturnRulesList_WhenUserExists() {
        CategoryRule rule1 = new CategoryRule();
        rule1.setId(1L);
        rule1.setUser(testUser);
        rule1.setCategory(ExpenseCategory.RESTAURANT);
        rule1.setType(ExpenseType.VARIABLE);

        CategoryRule rule2 = new CategoryRule();
        rule2.setId(2L);
        rule2.setUser(testUser);
        rule2.setCategory(ExpenseCategory.RENT);
        rule2.setType(ExpenseType.FIXED);

        when(userRepository.findByEmail(testEmail)).thenReturn(Optional.of(testUser));
        when(categoryRuleRepository.findByUser(testUser)).thenReturn(List.of(rule1, rule2));

        List<CategoryRuleResponse> response = categoryRuleService.getUserRules(mockPrincipal);

        assertNotNull(response);
        assertEquals(2, response.size());
        assertEquals(1L, response.get(0).id());
        assertEquals(ExpenseCategory.RESTAURANT, response.get(0).category());
        assertEquals(ExpenseType.VARIABLE, response.get(0).type());
        verify(userRepository, times(1)).findByEmail(testEmail);
        verify(categoryRuleRepository, times(1)).findByUser(testUser);
    }

    @Test
    void getUserRules_ShouldThrowAuthException_WhenUserNotFound() {
        when(userRepository.findByEmail(testEmail)).thenReturn(Optional.empty());

        AuthException exception = assertThrows(AuthException.class, () -> {
            categoryRuleService.getUserRules(mockPrincipal);
        });

        assertEquals(ErrorCode.USER_NOT_FOUND, exception.getErrorCode());
        assertEquals("User not found", exception.getMessage());
        verify(categoryRuleRepository, never()).findByUser(any());
    }

    // ==========================================
    // TESTS: createRule
    // ==========================================

    @Test
    void createRule_ShouldCreateRule_WithValidData() {
        CategoryRuleRequest request = new CategoryRuleRequest(ExpenseCategory.RESTAURANT, ExpenseType.VARIABLE);

        when(userRepository.findByEmail(testEmail)).thenReturn(Optional.of(testUser));
        when(categoryRuleRepository.save(any(CategoryRule.class))).thenAnswer(invocation -> {
            CategoryRule r = invocation.getArgument(0);
            r.setId(100L);
            return r;
        });

        CategoryRuleResponse response = categoryRuleService.createRule(mockPrincipal, request);

        assertNotNull(response);
        assertEquals(100L, response.id());
        assertEquals(ExpenseCategory.RESTAURANT, response.category());
        assertEquals(ExpenseType.VARIABLE, response.type());
        verify(categoryRuleRepository, times(1)).save(any(CategoryRule.class));
        verify(categoryRuleRepository, times(1)).flush();
    }

    @Test
    void createRule_ShouldThrowAuthException_WhenCategoryIsOther() {
        CategoryRuleRequest request = new CategoryRuleRequest(ExpenseCategory.OTHER, ExpenseType.VARIABLE);

        AuthException exception = assertThrows(AuthException.class, () -> {
            categoryRuleService.createRule(mockPrincipal, request);
        });

        assertEquals(ErrorCode.CATEGORY_RULE_INVALID_CATEGORY, exception.getErrorCode());
        assertEquals("No se puede crear una regla para esta categoría indefinida.", exception.getMessage());
        verify(userRepository, never()).findByEmail(anyString());
        verify(categoryRuleRepository, never()).save(any());
    }

    @Test
    void createRule_ShouldThrowAuthException_WhenDuplicatedCategory() {
        CategoryRuleRequest request = new CategoryRuleRequest(ExpenseCategory.RESTAURANT, ExpenseType.VARIABLE);

        when(userRepository.findByEmail(testEmail)).thenReturn(Optional.of(testUser));
        when(categoryRuleRepository.save(any(CategoryRule.class))).thenThrow(new DataIntegrityViolationException("Duplicate key"));

        AuthException exception = assertThrows(AuthException.class, () -> {
            categoryRuleService.createRule(mockPrincipal, request);
        });

        assertEquals(ErrorCode.CATEGORY_RULE_DUPLICATED, exception.getErrorCode());
        assertEquals("Ya existe una regla para esa categoría. No se permiten duplicados.", exception.getMessage());
        verify(categoryRuleRepository, times(1)).save(any(CategoryRule.class));
        verify(categoryRuleRepository, never()).flush();
    }

    // ==========================================
    // TESTS: updateRule
    // ==========================================

    @Test
    void updateRule_ShouldUpdateType_WhenRuleExistsAndBelongsToUser() {
        Long ruleId = 1L;
        UpdateCategoryRuleRequest request = new UpdateCategoryRuleRequest(ExpenseType.FIXED);

        CategoryRule existingRule = new CategoryRule();
        existingRule.setId(ruleId);
        existingRule.setUser(testUser);
        existingRule.setCategory(ExpenseCategory.RESTAURANT);
        existingRule.setType(ExpenseType.VARIABLE);

        when(userRepository.findByEmail(testEmail)).thenReturn(Optional.of(testUser));
        when(categoryRuleRepository.findById(ruleId)).thenReturn(Optional.of(existingRule));

        categoryRuleService.updateRule(mockPrincipal, ruleId, request);

        assertEquals(ExpenseType.FIXED, existingRule.getType());
        verify(categoryRuleRepository, times(1)).save(existingRule);
    }

    @Test
    void updateRule_ShouldThrowAuthException_WhenRuleDoesNotBelongToUser() {
        Long ruleId = 1L;
        UpdateCategoryRuleRequest request = new UpdateCategoryRuleRequest(ExpenseType.FIXED);

        User anotherUser = new User();
        anotherUser.setId(UUID.randomUUID());

        CategoryRule existingRule = new CategoryRule();
        existingRule.setId(ruleId);
        existingRule.setUser(anotherUser);

        when(userRepository.findByEmail(testEmail)).thenReturn(Optional.of(testUser));
        when(categoryRuleRepository.findById(ruleId)).thenReturn(Optional.of(existingRule));

        AuthException exception = assertThrows(AuthException.class, () -> {
            categoryRuleService.updateRule(mockPrincipal, ruleId, request);
        });

        assertEquals(ErrorCode.CATEGORY_RULE_NOT_FOUND, exception.getErrorCode());
        assertEquals("Regla no encontrada.", exception.getMessage());
        verify(categoryRuleRepository, never()).save(any());
    }

    // ==========================================
    // TESTS: deleteRule
    // ==========================================

    @Test
    void deleteRule_ShouldDelete_WhenRuleExistsAndBelongsToUser() {
        Long ruleId = 1L;
        CategoryRule existingRule = new CategoryRule();
        existingRule.setId(ruleId);
        existingRule.setUser(testUser);

        when(userRepository.findByEmail(testEmail)).thenReturn(Optional.of(testUser));
        when(categoryRuleRepository.findById(ruleId)).thenReturn(Optional.of(existingRule));

        categoryRuleService.deleteRule(mockPrincipal, ruleId);

        verify(categoryRuleRepository, times(1)).delete(existingRule);
    }

    @Test
    void deleteRule_ShouldThrowAuthException_WhenRuleNotFoundInDatabase() {
        Long ruleId = 999L;
        when(userRepository.findByEmail(testEmail)).thenReturn(Optional.of(testUser));
        when(categoryRuleRepository.findById(ruleId)).thenReturn(Optional.empty());

        AuthException exception = assertThrows(AuthException.class, () -> {
            categoryRuleService.deleteRule(mockPrincipal, ruleId);
        });

        assertEquals(ErrorCode.CATEGORY_RULE_NOT_FOUND, exception.getErrorCode());
        verify(categoryRuleRepository, never()).delete(any());
    }
}
