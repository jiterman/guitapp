package org.fiuba.guitapp.controller;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import java.security.Principal;
import java.util.List;

import org.fiuba.guitapp.dto.CategoryRuleRequest;
import org.fiuba.guitapp.dto.CategoryRuleResponse;
import org.fiuba.guitapp.dto.UpdateCategoryRuleRequest;
import org.fiuba.guitapp.exception.AuthException;
import org.fiuba.guitapp.exception.ErrorCode;
import org.fiuba.guitapp.model.ExpenseCategory;
import org.fiuba.guitapp.model.ExpenseType;
import org.fiuba.guitapp.service.CategoryRuleService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import com.fasterxml.jackson.databind.ObjectMapper;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class RuleControllerTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private CategoryRuleService categoryRuleService;

    @Test
    @WithMockUser(username = "test@example.com")
    void getUserRules_ShouldReturnRulesList() throws Exception {
        CategoryRuleResponse rule1 = new CategoryRuleResponse(1L, ExpenseCategory.RESTAURANT, ExpenseType.VARIABLE);
        CategoryRuleResponse rule2 = new CategoryRuleResponse(2L, ExpenseCategory.RENT, ExpenseType.FIXED);
        List<CategoryRuleResponse> mockRules = List.of(rule1, rule2);

        when(categoryRuleService.getUserRules(any(Principal.class))).thenReturn(mockRules);

        mockMvc.perform(get("/api/rules/categories")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(1))
                .andExpect(jsonPath("$[0].category").value("RESTAURANT"))
                .andExpect(jsonPath("$[0].type").value("VARIABLE"))
                .andExpect(jsonPath("$[1].id").value(2))
                .andExpect(jsonPath("$[1].category").value("RENT"))
                .andExpect(jsonPath("$[1].type").value("FIXED"));

        verify(categoryRuleService, times(1)).getUserRules(any(Principal.class));
    }

    @Test
    @WithMockUser(username = "test@example.com")
    void createCategoryRule_ShouldReturnCreatedRule_WhenSuccess() throws Exception {
        CategoryRuleRequest request = new CategoryRuleRequest(ExpenseCategory.RESTAURANT, ExpenseType.VARIABLE);
        CategoryRuleResponse response = new CategoryRuleResponse(100L, ExpenseCategory.RESTAURANT, ExpenseType.VARIABLE);

        when(categoryRuleService.createRule(any(Principal.class), any(CategoryRuleRequest.class)))
                .thenReturn(response);

        mockMvc.perform(post("/api/rules/categories")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(100))
                .andExpect(jsonPath("$.category").value("RESTAURANT"))
                .andExpect(jsonPath("$.type").value("VARIABLE"));

        verify(categoryRuleService, times(1)).createRule(any(Principal.class), any(CategoryRuleRequest.class));
    }

    @Test
    @WithMockUser(username = "test@example.com")
    void createCategoryRule_ShouldReturnBadRequest_WhenAuthExceptionThrown() throws Exception {
        CategoryRuleRequest request = new CategoryRuleRequest(ExpenseCategory.RESTAURANT, ExpenseType.VARIABLE);

        AuthException mockException = new AuthException(ErrorCode.CATEGORY_RULE_INVALID_CATEGORY, "No se puede crear una regla para esta categoría indefinida.");

        when(categoryRuleService.createRule(any(Principal.class), any(CategoryRuleRequest.class)))
                .thenThrow(mockException);

        mockMvc.perform(post("/api/rules/categories")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("No se puede crear una regla para esta categoría indefinida."))
                .andExpect(jsonPath("$.code").value("CATEGORY_RULE_INVALID_CATEGORY"));

        verify(categoryRuleService, times(1)).createRule(any(Principal.class), any(CategoryRuleRequest.class));
    }

    @Test
    @WithMockUser(username = "test@example.com")
    void updateCategoryRule_ShouldReturnSuccessMessage_WhenSuccess() throws Exception {
        Long ruleId = 1L;
        UpdateCategoryRuleRequest request = new UpdateCategoryRuleRequest(ExpenseType.FIXED);

        doNothing().when(categoryRuleService).updateRule(any(Principal.class), eq(ruleId), any(UpdateCategoryRuleRequest.class));

        mockMvc.perform(put("/api/rules/categories/{id}", ruleId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Regla actualizada con éxito"));

        verify(categoryRuleService, times(1)).updateRule(any(Principal.class), eq(ruleId), any(UpdateCategoryRuleRequest.class));
    }

    @Test
    @WithMockUser(username = "test@example.com")
    void updateCategoryRule_ShouldReturnBadRequest_WhenAuthExceptionThrown() throws Exception {
        Long ruleId = 1L;
        UpdateCategoryRuleRequest request = new UpdateCategoryRuleRequest(ExpenseType.FIXED);
        AuthException mockException = new AuthException(ErrorCode.CATEGORY_RULE_NOT_FOUND, "Regla no encontrada.");

        doThrow(mockException).when(categoryRuleService).updateRule(any(Principal.class), eq(ruleId), any(UpdateCategoryRuleRequest.class));

        mockMvc.perform(put("/api/rules/categories/{id}", ruleId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Regla no encontrada."))
                .andExpect(jsonPath("$.code").value("CATEGORY_RULE_NOT_FOUND"));

        verify(categoryRuleService, times(1)).updateRule(any(Principal.class), eq(ruleId), any(UpdateCategoryRuleRequest.class));
    }

    @Test
    @WithMockUser(username = "test@example.com")
    void deleteCategoryRule_ShouldReturnSuccessMessage_WhenSuccess() throws Exception {
        Long ruleId = 5L;

        doNothing().when(categoryRuleService).deleteRule(any(Principal.class), eq(ruleId));

        mockMvc.perform(delete("/api/rules/categories/{id}", ruleId)
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Regla eliminada con éxito"));

        verify(categoryRuleService, times(1)).deleteRule(any(Principal.class), eq(ruleId));
    }

    @Test
    @WithMockUser(username = "test@example.com")
    void deleteCategoryRule_ShouldReturnBadRequest_WhenAuthExceptionThrown() throws Exception {
        Long ruleId = 5L;
        AuthException mockException = new AuthException(ErrorCode.CATEGORY_RULE_NOT_FOUND, "Regla no encontrada.");

        doThrow(mockException).when(categoryRuleService).deleteRule(any(Principal.class), eq(ruleId));

        mockMvc.perform(delete("/api/rules/categories/{id}", ruleId)
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Regla no encontrada."))
                .andExpect(jsonPath("$.code").value("CATEGORY_RULE_NOT_FOUND"));

        verify(categoryRuleService, times(1)).deleteRule(any(Principal.class), eq(ruleId));
    }
}
