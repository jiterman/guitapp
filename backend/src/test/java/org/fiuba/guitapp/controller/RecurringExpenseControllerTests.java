package org.fiuba.guitapp.controller;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import org.fiuba.guitapp.dto.AddRecurringExpenseRequest;
import org.fiuba.guitapp.dto.RecurringExpenseResponse;
import org.fiuba.guitapp.dto.UpdateRecurringExpenseRequest;
import org.fiuba.guitapp.model.ExpenseCategory;
import org.fiuba.guitapp.model.ExpenseType;
import org.fiuba.guitapp.model.RecurrenceFrequency;
import org.fiuba.guitapp.service.RecurringExpenseService;
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
class RecurringExpenseControllerTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private RecurringExpenseService recurringExpenseService;

    private RecurringExpenseResponse sampleResponse(UUID id) {
        return new RecurringExpenseResponse(
                id,
                new BigDecimal("500000.00"),
                "Rent",
                "Monthly rent",
                ExpenseCategory.RENT,
                ExpenseType.FIXED,
                RecurrenceFrequency.MONTHLY,
                LocalDate.of(2026, 6, 1),
                null,
                LocalDate.of(2026, 6, 1),
                true);
    }

    @Test
    @WithMockUser(username = "test@example.com")
    void addRecurringExpense_ShouldReturnResponse_WhenRequestIsValid() throws Exception {
        UUID id = UUID.randomUUID();
        AddRecurringExpenseRequest request = new AddRecurringExpenseRequest(
                new BigDecimal("500000.00"), "Rent", "Monthly rent", ExpenseCategory.RENT,
                ExpenseType.FIXED, RecurrenceFrequency.MONTHLY, LocalDate.of(2026, 6, 1), null);

        when(recurringExpenseService.addRecurringExpense(eq("test@example.com"), any()))
                .thenReturn(sampleResponse(id));

        mockMvc.perform(post("/api/expenses/recurring")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(id.toString()))
                .andExpect(jsonPath("$.frequency").value("MONTHLY"))
                .andExpect(jsonPath("$.active").value(true));

        verify(recurringExpenseService, times(1)).addRecurringExpense(eq("test@example.com"), any());
    }

    @Test
    @WithMockUser(username = "test@example.com")
    void addRecurringExpense_ShouldReturnBadRequest_WhenFrequencyIsMissing() throws Exception {
        String body = "{\"amount\": 1000, \"category\": \"RENT\", \"type\": \"FIXED\", \"startDate\": \"2026-06-01\"}";

        mockMvc.perform(post("/api/expenses/recurring")
                .contentType(MediaType.APPLICATION_JSON)
                .content(body))
                .andExpect(status().isBadRequest());

        verify(recurringExpenseService, never()).addRecurringExpense(anyString(), any());
    }

    @Test
    @WithMockUser(username = "test@example.com")
    void getRecurringExpenses_ShouldReturnList() throws Exception {
        UUID id = UUID.randomUUID();
        when(recurringExpenseService.getRecurringExpenses("test@example.com"))
                .thenReturn(List.of(sampleResponse(id)));

        mockMvc.perform(get("/api/expenses/recurring"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(id.toString()));

        verify(recurringExpenseService, times(1)).getRecurringExpenses("test@example.com");
    }

    @Test
    @WithMockUser(username = "test@example.com")
    void getRecurringExpenseById_ShouldReturnResponse() throws Exception {
        UUID id = UUID.randomUUID();
        when(recurringExpenseService.getRecurringExpenseById("test@example.com", id))
                .thenReturn(sampleResponse(id));

        mockMvc.perform(get("/api/expenses/recurring/" + id))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(id.toString()));
    }

    @Test
    @WithMockUser(username = "test@example.com")
    void updateRecurringExpense_ShouldReturnResponse() throws Exception {
        UUID id = UUID.randomUUID();
        UpdateRecurringExpenseRequest request = new UpdateRecurringExpenseRequest(
                new BigDecimal("600000.00"), null, null, null, null, null, null, null, false);

        when(recurringExpenseService.updateRecurringExpense(eq("test@example.com"), eq(id), any()))
                .thenReturn(sampleResponse(id));

        mockMvc.perform(patch("/api/expenses/recurring/" + id)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(id.toString()));

        verify(recurringExpenseService, times(1)).updateRecurringExpense(eq("test@example.com"), eq(id), any());
    }

    @Test
    @WithMockUser(username = "test@example.com")
    void deleteRecurringExpense_ShouldReturnNoContent() throws Exception {
        UUID id = UUID.randomUUID();

        mockMvc.perform(delete("/api/expenses/recurring/" + id))
                .andExpect(status().isNoContent());

        verify(recurringExpenseService, times(1)).deleteRecurringExpense("test@example.com", id);
    }
}
