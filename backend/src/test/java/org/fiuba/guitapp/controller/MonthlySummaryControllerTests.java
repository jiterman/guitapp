package org.fiuba.guitapp.controller;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import java.math.BigDecimal;
import java.util.Collections;
import java.util.List;

import org.fiuba.guitapp.dto.MonthlyCategoryBreakdown;
import org.fiuba.guitapp.dto.MonthlyInsight;
import org.fiuba.guitapp.dto.MonthlySummaryResponse;
import org.fiuba.guitapp.model.ExpenseCategory;
import org.fiuba.guitapp.service.MonthlySummaryService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@SuppressWarnings("null")
class MonthlySummaryControllerTests {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private MonthlySummaryService monthlySummaryService;

    @Test
    @WithMockUser(username = "test@example.com")
    void getMonthlySummary_returnsOkWithSummary() throws Exception {
        MonthlySummaryResponse response = new MonthlySummaryResponse(
                2025, 4,
                new BigDecimal("3000"),
                new BigDecimal("1500"),
                new BigDecimal("1500"),
                List.of(new MonthlyCategoryBreakdown(ExpenseCategory.RENT, new BigDecimal("1500"), 100.0, null)),
                List.of(new MonthlyInsight("SAVINGS", "Ahorraste", "50%", "de tus ingresos", "positive")));

        when(monthlySummaryService.getSummary(eq("test@example.com"), anyInt(), anyInt()))
                .thenReturn(response);

        mockMvc.perform(get("/api/summary/monthly")
                .param("year", "2025")
                .param("month", "4"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.year").value(2025))
                .andExpect(jsonPath("$.month").value(4))
                .andExpect(jsonPath("$.totalIncome").value(3000))
                .andExpect(jsonPath("$.totalExpenses").value(1500))
                .andExpect(jsonPath("$.balance").value(1500))
                .andExpect(jsonPath("$.categoryBreakdown[0].category").value("RENT"))
                .andExpect(jsonPath("$.insights[0].type").value("SAVINGS"));
    }

    @Test
    @WithMockUser(username = "test@example.com")
    void getMonthlySummary_usesDefaultPreviousMonthWhenParamsMissing() throws Exception {
        MonthlySummaryResponse response = new MonthlySummaryResponse(
                2025, 3,
                BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO,
                Collections.emptyList(), Collections.emptyList());

        when(monthlySummaryService.getSummary(any(), anyInt(), anyInt())).thenReturn(response);

        mockMvc.perform(get("/api/summary/monthly"))
                .andExpect(status().isOk());

        verify(monthlySummaryService).getSummary(eq("test@example.com"), anyInt(), anyInt());
    }

    @Test
    void getMonthlySummary_returnsUnauthorizedWithoutAuth() throws Exception {
        mockMvc.perform(get("/api/summary/monthly"))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(username = "admin@example.com")
    void sendMonthlySummaryNotifications_returnsNoContent() throws Exception {
        doNothing().when(monthlySummaryService).sendSummaryNotifications(anyInt(), anyInt());

        mockMvc.perform(post("/api/summary/monthly/notify")
                .param("year", "2025")
                .param("month", "4"))
                .andExpect(status().isNoContent());

        verify(monthlySummaryService).sendSummaryNotifications(2025, 4);
    }

    @Test
    @WithMockUser(username = "admin@example.com")
    void sendMonthlySummaryNotifications_usesDefaultPreviousMonth() throws Exception {
        doNothing().when(monthlySummaryService).sendSummaryNotifications(anyInt(), anyInt());

        mockMvc.perform(post("/api/summary/monthly/notify"))
                .andExpect(status().isNoContent());

        verify(monthlySummaryService).sendSummaryNotifications(anyInt(), anyInt());
    }

    @Test
    void sendMonthlySummaryNotifications_returnsUnauthorizedWithoutAuth() throws Exception {
        mockMvc.perform(post("/api/summary/monthly/notify"))
                .andExpect(status().isForbidden());
    }
}
