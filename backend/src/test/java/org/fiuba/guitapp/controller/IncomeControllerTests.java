package org.fiuba.guitapp.controller;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

import org.fiuba.guitapp.dto.AddIncomeRequest;
import org.fiuba.guitapp.dto.IncomeResponse;
import org.fiuba.guitapp.dto.UpdateIncomeRequest;
import org.fiuba.guitapp.model.IncomeCategory;
import org.fiuba.guitapp.service.IncomeService;
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
class IncomeControllerTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private IncomeService incomeService;

    @Test
    @WithMockUser(username = "test@example.com")
    void addIncome_ShouldReturnIncomeResponse_WhenRequestIsValid() throws Exception {
        UUID incomeId = UUID.randomUUID();
        AddIncomeRequest request = new AddIncomeRequest(
                new BigDecimal("1500.00"), "Freelance", IncomeCategory.FREELANCE);

        IncomeResponse response = new IncomeResponse(
                incomeId,
                new BigDecimal("1500.00"),
                "Freelance",
                IncomeCategory.FREELANCE,
                LocalDateTime.now());

        when(incomeService.addIncome(eq("test@example.com"), any(AddIncomeRequest.class)))
                .thenReturn(response);

        mockMvc.perform(post("/api/incomes")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(incomeId.toString()))
                .andExpect(jsonPath("$.amount").value(1500.00))
                .andExpect(jsonPath("$.description").value("Freelance"))
                .andExpect(jsonPath("$.category").value("FREELANCE"));

        verify(incomeService, times(1)).addIncome(eq("test@example.com"), any(AddIncomeRequest.class));
    }

    @Test
    @WithMockUser(username = "test@example.com")
    void addIncome_ShouldReturnOk_WhenDescriptionIsNull() throws Exception {
        UUID incomeId = UUID.randomUUID();
        AddIncomeRequest request = new AddIncomeRequest(
                new BigDecimal("500.00"), null, IncomeCategory.SALARY);

        IncomeResponse response = new IncomeResponse(
                incomeId,
                new BigDecimal("500.00"),
                null,
                IncomeCategory.SALARY,
                LocalDateTime.now());

        when(incomeService.addIncome(eq("test@example.com"), any(AddIncomeRequest.class)))
                .thenReturn(response);

        mockMvc.perform(post("/api/incomes")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.category").value("SALARY"));

        verify(incomeService, times(1)).addIncome(anyString(), any(AddIncomeRequest.class));
    }

    @Test
    @WithMockUser(username = "test@example.com")
    void addIncome_ShouldReturnBadRequest_WhenAmountIsNull() throws Exception {
        String body = "{\"amount\": null, \"category\": \"SALARY\"}";

        mockMvc.perform(post("/api/incomes")
                .contentType(MediaType.APPLICATION_JSON)
                .content(body))
                .andExpect(status().isBadRequest());

        verify(incomeService, never()).addIncome(anyString(), any(AddIncomeRequest.class));
    }

    @Test
    @WithMockUser(username = "test@example.com")
    void addIncome_ShouldReturnBadRequest_WhenAmountIsNegative() throws Exception {
        AddIncomeRequest request = new AddIncomeRequest(
                new BigDecimal("-100.00"), null, IncomeCategory.OTHER);

        mockMvc.perform(post("/api/incomes")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());

        verify(incomeService, never()).addIncome(anyString(), any(AddIncomeRequest.class));
    }

    @Test
    @WithMockUser(username = "test@example.com")
    void addIncome_ShouldReturnBadRequest_WhenCategoryIsNull() throws Exception {
        String body = "{\"amount\": 100.00, \"category\": null}";

        mockMvc.perform(post("/api/incomes")
                .contentType(MediaType.APPLICATION_JSON)
                .content(body))
                .andExpect(status().isBadRequest());

        verify(incomeService, never()).addIncome(anyString(), any(AddIncomeRequest.class));
    }

    @Test
    void addIncome_ShouldReturnUnauthorized_WhenNotAuthenticated() throws Exception {
        String body = "{\"amount\": 100.00, \"category\": \"SALARY\"}";

        mockMvc.perform(post("/api/incomes")
                .contentType(MediaType.APPLICATION_JSON)
                .content(body))
                .andExpect(status().isForbidden());

        verify(incomeService, never()).addIncome(anyString(), any(AddIncomeRequest.class));
    }

    @Test
    @WithMockUser(username = "test@example.com")
    void deleteIncome_ShouldReturnNoContent_WhenAuthenticated() throws Exception {
        UUID incomeId = UUID.randomUUID();

        doNothing().when(incomeService).deleteIncome("test@example.com", incomeId);

        mockMvc.perform(delete("/api/incomes/{incomeId}", incomeId))
                .andExpect(status().isNoContent());

        verify(incomeService, times(1)).deleteIncome("test@example.com", incomeId);
    }

    @Test
    void deleteIncome_ShouldReturnUnauthorized_WhenNotAuthenticated() throws Exception {
        UUID incomeId = UUID.randomUUID();

        mockMvc.perform(delete("/api/incomes/{incomeId}", incomeId))
                .andExpect(status().isForbidden());

        verify(incomeService, never()).deleteIncome(anyString(), any(UUID.class));
    }

    @Test
    @WithMockUser(username = "test@example.com")
    void getIncomeById_ShouldReturnIncomeResponse_WhenAuthenticated() throws Exception {
        UUID incomeId = UUID.randomUUID();

        IncomeResponse response = new IncomeResponse(
                incomeId,
                new BigDecimal("1500.00"),
                "Freelance",
                IncomeCategory.FREELANCE,
                LocalDateTime.now());

        when(incomeService.getIncomeById("test@example.com", incomeId)).thenReturn(response);

        mockMvc.perform(get("/api/incomes/{incomeId}", incomeId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(incomeId.toString()))
                .andExpect(jsonPath("$.amount").value(1500.00))
                .andExpect(jsonPath("$.description").value("Freelance"))
                .andExpect(jsonPath("$.category").value("FREELANCE"));

        verify(incomeService, times(1)).getIncomeById("test@example.com", incomeId);
    }

    @Test
    void getIncomeById_ShouldReturnUnauthorized_WhenNotAuthenticated() throws Exception {
        UUID incomeId = UUID.randomUUID();

        mockMvc.perform(get("/api/incomes/{incomeId}", incomeId))
                .andExpect(status().isForbidden());

        verify(incomeService, never()).getIncomeById(anyString(), any(UUID.class));
    }

    @Test
    @WithMockUser(username = "test@example.com")
    void updateIncome_ShouldReturnIncomeResponse_WhenRequestIsValid() throws Exception {
        UUID incomeId = UUID.randomUUID();
        UpdateIncomeRequest request = new UpdateIncomeRequest(
                new BigDecimal("2000.00"),
                "Updated",
                IncomeCategory.SALARY);

        IncomeResponse response = new IncomeResponse(
                incomeId,
                new BigDecimal("2000.00"),
                "Updated",
                IncomeCategory.SALARY,
                LocalDateTime.now());

        when(incomeService.updateIncome(eq("test@example.com"), eq(incomeId), any(UpdateIncomeRequest.class)))
                .thenReturn(response);

        mockMvc.perform(patch("/api/incomes/{incomeId}", incomeId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(incomeId.toString()))
                .andExpect(jsonPath("$.amount").value(2000.00))
                .andExpect(jsonPath("$.description").value("Updated"))
                .andExpect(jsonPath("$.category").value("SALARY"));

        verify(incomeService, times(1)).updateIncome(eq("test@example.com"), eq(incomeId), any(UpdateIncomeRequest.class));
    }

    @Test
    @WithMockUser(username = "test@example.com")
    void updateIncome_ShouldReturnBadRequest_WhenAmountIsNegative() throws Exception {
        UUID incomeId = UUID.randomUUID();
        UpdateIncomeRequest request = new UpdateIncomeRequest(
                new BigDecimal("-1.00"),
                "Updated",
                IncomeCategory.SALARY);

        mockMvc.perform(patch("/api/incomes/{incomeId}", incomeId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());

        verify(incomeService, never()).updateIncome(anyString(), any(UUID.class), any(UpdateIncomeRequest.class));
    }

    @Test
    void updateIncome_ShouldReturnUnauthorized_WhenNotAuthenticated() throws Exception {
        UUID incomeId = UUID.randomUUID();
        String body = "{\"amount\": 100.00, \"category\": \"SALARY\"}";

        mockMvc.perform(patch("/api/incomes/{incomeId}", incomeId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(body))
                .andExpect(status().isForbidden());

        verify(incomeService, never()).updateIncome(anyString(), any(UUID.class), any(UpdateIncomeRequest.class));
    }
}
