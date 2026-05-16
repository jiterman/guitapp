package org.fiuba.guitapp.controller;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

import org.fiuba.guitapp.dto.AddExpenseRequest;
import org.fiuba.guitapp.dto.ExpenseCategoryStatistics;
import org.fiuba.guitapp.dto.ExpenseResponse;
import org.fiuba.guitapp.dto.ExpenseStatisticsResponse;
import org.fiuba.guitapp.dto.UpdateExpenseRequest;
import org.fiuba.guitapp.model.ExpenseCategory;
import org.fiuba.guitapp.model.ExpenseType;
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
@SuppressWarnings("null")
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
                new BigDecimal("1500.00"), "Lunch", ExpenseCategory.RESTAURANT, ExpenseType.VARIABLE);

        ExpenseResponse response = new ExpenseResponse(
                expenseId,
                new BigDecimal("1500.00"),
                "Lunch",
                ExpenseCategory.RESTAURANT,
                ExpenseType.VARIABLE,
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
                new BigDecimal("500.00"), null, ExpenseCategory.SUPERMARKET, ExpenseType.FIXED);

        ExpenseResponse response = new ExpenseResponse(
                expenseId,
                new BigDecimal("500.00"),
                null,
                ExpenseCategory.SUPERMARKET,
                ExpenseType.FIXED,
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
        String body = "{\"amount\": null, \"category\": \"RESTAURANT\", \"type\": \"VARIABLE\"}";

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
                new BigDecimal("-100.00"), null, ExpenseCategory.OTHER, ExpenseType.VARIABLE);

        mockMvc.perform(post("/api/expenses")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());

        verify(expenseService, never()).addExpense(anyString(), any(AddExpenseRequest.class));
    }

    @Test
    @WithMockUser(username = "test@example.com")
    void addExpense_ShouldReturnBadRequest_WhenCategoryIsNull() throws Exception {
        String body = "{\"amount\": 100.00, \"category\": null, \"type\": \"FIXED\"}";

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

    @Test
    @WithMockUser(username = "test@example.com")
    void getExpenseById_ShouldReturnExpenseResponse_WhenAuthenticated() throws Exception {
        UUID expenseId = UUID.randomUUID();

        ExpenseResponse response = new ExpenseResponse(
                expenseId,
                new BigDecimal("150.00"),
                "Taxi",
                ExpenseCategory.TAXI,
                ExpenseType.VARIABLE,
                LocalDateTime.now());

        when(expenseService.getExpenseById("test@example.com", expenseId)).thenReturn(response);

        mockMvc.perform(get("/api/expenses/{expenseId}", expenseId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(expenseId.toString()))
                .andExpect(jsonPath("$.amount").value(150.00))
                .andExpect(jsonPath("$.description").value("Taxi"))
                .andExpect(jsonPath("$.category").value("TAXI"))
                .andExpect(jsonPath("$.type").value("VARIABLE"));

        verify(expenseService, times(1)).getExpenseById("test@example.com", expenseId);
    }

    @Test
    void getExpenseById_ShouldReturnUnauthorized_WhenNotAuthenticated() throws Exception {
        UUID expenseId = UUID.randomUUID();

        mockMvc.perform(get("/api/expenses/{expenseId}", expenseId))
                .andExpect(status().isForbidden());

        verify(expenseService, never()).getExpenseById(anyString(), any(UUID.class));
    }

    @Test
    @WithMockUser(username = "test@example.com")
    void deleteExpense_ShouldReturnNoContent_WhenAuthenticated() throws Exception {
        UUID expenseId = UUID.randomUUID();

        doNothing().when(expenseService).deleteExpense("test@example.com", expenseId);

        mockMvc.perform(delete("/api/expenses/{expenseId}", expenseId))
                .andExpect(status().isNoContent());

        verify(expenseService, times(1)).deleteExpense("test@example.com", expenseId);
    }

    @Test
    void deleteExpense_ShouldReturnUnauthorized_WhenNotAuthenticated() throws Exception {
        UUID expenseId = UUID.randomUUID();

        mockMvc.perform(delete("/api/expenses/{expenseId}", expenseId))
                .andExpect(status().isForbidden());

        verify(expenseService, never()).deleteExpense(anyString(), any(UUID.class));
    }

    @Test
    @WithMockUser(username = "test@example.com")
    void updateExpense_ShouldReturnExpenseResponse_WhenRequestIsValid() throws Exception {
        UUID expenseId = UUID.randomUUID();
        UpdateExpenseRequest request = new UpdateExpenseRequest(
                new BigDecimal("88.50"),
                "Groceries",
                ExpenseCategory.SUPERMARKET,
                ExpenseType.VARIABLE);

        ExpenseResponse response = new ExpenseResponse(
                expenseId,
                new BigDecimal("88.50"),
                "Groceries",
                ExpenseCategory.SUPERMARKET,
                ExpenseType.VARIABLE,
                LocalDateTime.now());

        when(expenseService.updateExpense(eq("test@example.com"), eq(expenseId), any(UpdateExpenseRequest.class)))
                .thenReturn(response);

        mockMvc.perform(patch("/api/expenses/{expenseId}", expenseId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(expenseId.toString()))
                .andExpect(jsonPath("$.amount").value(88.50))
                .andExpect(jsonPath("$.description").value("Groceries"))
                .andExpect(jsonPath("$.category").value("SUPERMARKET"))
                .andExpect(jsonPath("$.type").value("VARIABLE"));

        verify(expenseService, times(1)).updateExpense(eq("test@example.com"), eq(expenseId), any(UpdateExpenseRequest.class));
    }

    @Test
    @WithMockUser(username = "test@example.com")
    void updateExpense_ShouldReturnBadRequest_WhenAmountIsNegative() throws Exception {
        UUID expenseId = UUID.randomUUID();
        UpdateExpenseRequest request = new UpdateExpenseRequest(
                new BigDecimal("-1.00"),
                "Bad",
                ExpenseCategory.OTHER,
                ExpenseType.VARIABLE);

        mockMvc.perform(patch("/api/expenses/{expenseId}", expenseId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());

        verify(expenseService, never()).updateExpense(anyString(), any(UUID.class), any(UpdateExpenseRequest.class));
    }

    @Test
    void updateExpense_ShouldReturnUnauthorized_WhenNotAuthenticated() throws Exception {
        UUID expenseId = UUID.randomUUID();
        String body = "{\"amount\": 10.00, \"category\": \"OTHER\", \"type\": \"FIXED\"}";

        mockMvc.perform(patch("/api/expenses/{expenseId}", expenseId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(body))
                .andExpect(status().isForbidden());

        verify(expenseService, never()).updateExpense(anyString(), any(UUID.class), any(UpdateExpenseRequest.class));
    }

    @Test
    @WithMockUser(username = "test@example.com")
    void getExpenseStatistics_ShouldReturnStatistics_WithDefaultPeriod() throws Exception {
        List<ExpenseCategoryStatistics> categories = Arrays.asList(
                new ExpenseCategoryStatistics(ExpenseCategory.RESTAURANT, new BigDecimal("500.00"), 5L, 50.0),
                new ExpenseCategoryStatistics(ExpenseCategory.SUPERMARKET, new BigDecimal("300.00"), 3L, 30.0),
                new ExpenseCategoryStatistics(ExpenseCategory.TAXI, new BigDecimal("200.00"), 2L, 20.0));

        ExpenseStatisticsResponse response = new ExpenseStatisticsResponse(
                new BigDecimal("1000.00"), categories);

        when(expenseService.getExpenseStatistics("test@example.com", "monthly")).thenReturn(response);

        mockMvc.perform(get("/api/expenses/statistics"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalAmount").value(1000.00))
                .andExpect(jsonPath("$.categories").isArray())
                .andExpect(jsonPath("$.categories[0].category").value("RESTAURANT"))
                .andExpect(jsonPath("$.categories[0].totalAmount").value(500.00))
                .andExpect(jsonPath("$.categories[0].count").value(5))
                .andExpect(jsonPath("$.categories[0].percentage").value(50.0));

        verify(expenseService, times(1)).getExpenseStatistics("test@example.com", "monthly");
    }

    @Test
    @WithMockUser(username = "test@example.com")
    void getExpenseStatistics_ShouldReturnStatistics_WithDailyPeriod() throws Exception {
        List<ExpenseCategoryStatistics> categories = Arrays.asList(
                new ExpenseCategoryStatistics(ExpenseCategory.CAFE, new BigDecimal("50.00"), 2L, 100.0));

        ExpenseStatisticsResponse response = new ExpenseStatisticsResponse(
                new BigDecimal("50.00"), categories);

        when(expenseService.getExpenseStatistics("test@example.com", "daily")).thenReturn(response);

        mockMvc.perform(get("/api/expenses/statistics")
                .param("period", "daily"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalAmount").value(50.00))
                .andExpect(jsonPath("$.categories[0].category").value("CAFE"));

        verify(expenseService, times(1)).getExpenseStatistics("test@example.com", "daily");
    }

    @Test
    @WithMockUser(username = "test@example.com")
    void getExpenseStatistics_ShouldReturnStatistics_WithAllPeriod() throws Exception {
        List<ExpenseCategoryStatistics> categories = Arrays.asList(
                new ExpenseCategoryStatistics(ExpenseCategory.RENT, new BigDecimal("5000.00"), 10L, 100.0));

        ExpenseStatisticsResponse response = new ExpenseStatisticsResponse(
                new BigDecimal("5000.00"), categories);

        when(expenseService.getExpenseStatistics("test@example.com", "all")).thenReturn(response);

        mockMvc.perform(get("/api/expenses/statistics")
                .param("period", "all"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalAmount").value(5000.00))
                .andExpect(jsonPath("$.categories[0].category").value("RENT"));

        verify(expenseService, times(1)).getExpenseStatistics("test@example.com", "all");
    }

    @Test
    void getExpenseStatistics_ShouldReturnUnauthorized_WhenNotAuthenticated() throws Exception {
        mockMvc.perform(get("/api/expenses/statistics"))
                .andExpect(status().isForbidden());

        verify(expenseService, never()).getExpenseStatistics(anyString(), anyString());
    }
}
