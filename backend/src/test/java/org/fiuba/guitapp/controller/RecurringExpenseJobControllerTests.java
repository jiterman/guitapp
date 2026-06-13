package org.fiuba.guitapp.controller;

import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.fiuba.guitapp.service.RecurringExpenseGenerationService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class RecurringExpenseJobControllerTests {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private RecurringExpenseGenerationService recurringExpenseGenerationService;

    @Test
    void runRecurringExpenseGeneration_ShouldReturnCount_WithApiKey() throws Exception {
        when(recurringExpenseGenerationService.generateDueExpenses()).thenReturn(3);

        mockMvc.perform(post("/api/expenses/recurring/run")
                .header("X-Internal-Key", "test-internal-key"))
                .andExpect(status().isOk())
                .andExpect(content().string("3"));

        verify(recurringExpenseGenerationService).generateDueExpenses();
    }
}
