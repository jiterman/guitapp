package org.fiuba.guitapp.controller;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

import org.fiuba.guitapp.dto.AddExpenseRequest;
import org.fiuba.guitapp.dto.ExpenseResponse;
import org.fiuba.guitapp.model.ExpenseCategory;
import org.fiuba.guitapp.service.ExpenseService;
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
class ExpenseControllerTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private ExpenseService expenseService;

    @Test
    @WithMockUser(username = "test@example.com")
    void addExpense_ShouldReturnExpenseResponse_WhenRequestIsValid() throws Exception {
        UUID expenseId = UUID.randomUUID();
        AddExpenseRequest request = new AddExpenseRequest(
                new BigDecimal("1500.00"), "Lunch", ExpenseCategory.RESTAURANT);

        ExpenseResponse response = new ExpenseResponse(
                expenseId,
                new BigDecimal("1500.00"),
                "Lunch",
                ExpenseCategory.RESTAURANT,
                LocalDateTime.now());

        when(expenseService.addExpense(eq("test@example.com"), any(AddExpenseRequest.class)))
                .thenReturn(response);

        mockMvc.perform(post("/api/expenses")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(expenseId.toString()))
                .andExpect(jsonPath("$.amount").value(1500.00))
                .andExpect(jsonPath("$.description").value("Lunch"))
                .andExpect(jsonPath("$.category").value("RESTAURANT"));

        verify(expenseService, times(1)).addExpense(eq("test@example.com"), any(AddExpenseRequest.class));
    }

    @Test
    @WithMockUser(username = "test@example.com")
    void addExpense_ShouldReturnOk_WhenDescriptionIsNull() throws Exception {
        UUID expenseId = UUID.randomUUID();
        AddExpenseRequest request = new AddExpenseRequest(
                new BigDecimal("500.00"), null, ExpenseCategory.SUPERMARKET);

        ExpenseResponse response = new ExpenseResponse(
                expenseId,
                new BigDecimal("500.00"),
                null,
                ExpenseCategory.SUPERMARKET,
                LocalDateTime.now());

        when(expenseService.addExpense(eq("test@example.com"), any(AddExpenseRequest.class)))
                .thenReturn(response);

        mockMvc.perform(post("/api/expenses")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.category").value("SUPERMARKET"));

        verify(expenseService, times(1)).addExpense(anyString(), any(AddExpenseRequest.class));
    }

    @Test
    @WithMockUser(username = "test@example.com")
    void addExpense_ShouldReturnBadRequest_WhenAmountIsNull() throws Exception {
        String body = "{\"amount\": null, \"category\": \"RESTAURANT\"}";

        mockMvc.perform(post("/api/expenses")
                .contentType(MediaType.APPLICATION_JSON)
                .content(body))
                .andExpect(status().isBadRequest());

        verify(expenseService, never()).addExpense(anyString(), any(AddExpenseRequest.class));
    }

    @Test
    @WithMockUser(username = "test@example.com")
    void addExpense_ShouldReturnBadRequest_WhenAmountIsNegative() throws Exception {
        AddExpenseRequest request = new AddExpenseRequest(
                new BigDecimal("-100.00"), null, ExpenseCategory.OTHER);

        mockMvc.perform(post("/api/expenses")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());

        verify(expenseService, never()).addExpense(anyString(), any(AddExpenseRequest.class));
    }

    @Test
    @WithMockUser(username = "test@example.com")
    void addExpense_ShouldReturnBadRequest_WhenCategoryIsNull() throws Exception {
        String body = "{\"amount\": 100.00, \"category\": null}";

        mockMvc.perform(post("/api/expenses")
                .contentType(MediaType.APPLICATION_JSON)
                .content(body))
                .andExpect(status().isBadRequest());

        verify(expenseService, never()).addExpense(anyString(), any(AddExpenseRequest.class));
    }

    @Test
    void addExpense_ShouldReturnUnauthorized_WhenNotAuthenticated() throws Exception {
        String body = "{\"amount\": 100.00, \"category\": \"RESTAURANT\"}";

        mockMvc.perform(post("/api/expenses")
                .contentType(MediaType.APPLICATION_JSON)
                .content(body))
                .andExpect(status().isForbidden());

        verify(expenseService, never()).addExpense(anyString(), any(AddExpenseRequest.class));
    }
}
