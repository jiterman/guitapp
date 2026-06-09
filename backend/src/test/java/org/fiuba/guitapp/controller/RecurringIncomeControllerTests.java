package org.fiuba.guitapp.controller;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import org.fiuba.guitapp.dto.AddRecurringIncomeRequest;
import org.fiuba.guitapp.dto.RecurringIncomeResponse;
import org.fiuba.guitapp.dto.UpdateRecurringIncomeRequest;
import org.fiuba.guitapp.model.IncomeCategory;
import org.fiuba.guitapp.model.RecurrenceFrequency;
import org.fiuba.guitapp.service.RecurringIncomeService;
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
class RecurringIncomeControllerTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private RecurringIncomeService recurringIncomeService;

    private RecurringIncomeResponse sampleResponse(UUID id) {
        return new RecurringIncomeResponse(
                id,
                new BigDecimal("500000.00"),
                "Salary",
                IncomeCategory.SALARY,
                RecurrenceFrequency.MONTHLY,
                LocalDate.of(2026, 6, 1),
                null,
                LocalDate.of(2026, 6, 1),
                true);
    }

    @Test
    @WithMockUser(username = "test@example.com")
    void addRecurringIncome_ShouldReturnResponse_WhenRequestIsValid() throws Exception {
        UUID id = UUID.randomUUID();
        AddRecurringIncomeRequest request = new AddRecurringIncomeRequest(
                new BigDecimal("500000.00"), "Salary", IncomeCategory.SALARY,
                RecurrenceFrequency.MONTHLY, LocalDate.of(2026, 6, 1), null);

        when(recurringIncomeService.addRecurringIncome(eq("test@example.com"), any()))
                .thenReturn(sampleResponse(id));

        mockMvc.perform(post("/api/incomes/recurring")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(id.toString()))
                .andExpect(jsonPath("$.frequency").value("MONTHLY"))
                .andExpect(jsonPath("$.active").value(true));

        verify(recurringIncomeService, times(1)).addRecurringIncome(eq("test@example.com"), any());
    }

    @Test
    @WithMockUser(username = "test@example.com")
    void addRecurringIncome_ShouldReturnBadRequest_WhenFrequencyIsMissing() throws Exception {
        String body = "{\"amount\": 1000, \"category\": \"SALARY\", \"startDate\": \"2026-06-01\"}";

        mockMvc.perform(post("/api/incomes/recurring")
                .contentType(MediaType.APPLICATION_JSON)
                .content(body))
                .andExpect(status().isBadRequest());

        verify(recurringIncomeService, never()).addRecurringIncome(anyString(), any());
    }

    @Test
    @WithMockUser(username = "test@example.com")
    void getRecurringIncomes_ShouldReturnList() throws Exception {
        UUID id = UUID.randomUUID();
        when(recurringIncomeService.getRecurringIncomes("test@example.com"))
                .thenReturn(List.of(sampleResponse(id)));

        mockMvc.perform(get("/api/incomes/recurring"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(id.toString()));

        verify(recurringIncomeService, times(1)).getRecurringIncomes("test@example.com");
    }

    @Test
    @WithMockUser(username = "test@example.com")
    void getRecurringIncomeById_ShouldReturnResponse() throws Exception {
        UUID id = UUID.randomUUID();
        when(recurringIncomeService.getRecurringIncomeById("test@example.com", id))
                .thenReturn(sampleResponse(id));

        mockMvc.perform(get("/api/incomes/recurring/" + id))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(id.toString()));
    }

    @Test
    @WithMockUser(username = "test@example.com")
    void updateRecurringIncome_ShouldReturnResponse() throws Exception {
        UUID id = UUID.randomUUID();
        UpdateRecurringIncomeRequest request = new UpdateRecurringIncomeRequest(
                new BigDecimal("600000.00"), null, null, null, null, null, false);

        when(recurringIncomeService.updateRecurringIncome(eq("test@example.com"), eq(id), any()))
                .thenReturn(sampleResponse(id));

        mockMvc.perform(patch("/api/incomes/recurring/" + id)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(id.toString()));

        verify(recurringIncomeService, times(1)).updateRecurringIncome(eq("test@example.com"), eq(id), any());
    }

    @Test
    @WithMockUser(username = "test@example.com")
    void deleteRecurringIncome_ShouldReturnNoContent() throws Exception {
        UUID id = UUID.randomUUID();

        mockMvc.perform(delete("/api/incomes/recurring/" + id))
                .andExpect(status().isNoContent());

        verify(recurringIncomeService, times(1)).deleteRecurringIncome("test@example.com", id);
    }
}
