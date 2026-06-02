package org.fiuba.guitapp.controller;

import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.fiuba.guitapp.dto.NotificationDigestJobResponse;
import org.fiuba.guitapp.service.NotificationDigestService;
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
class NotificationJobControllerTests {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private NotificationDigestService notificationDigestService;

    @Test
    void sendDailySummaryNotifications_ShouldReturnOk_WithApiKey() throws Exception {
        when(notificationDigestService.processDailySummaries())
                .thenReturn(new NotificationDigestJobResponse(2, 5));

        mockMvc.perform(post("/api/notifications/daily/notify")
                .header("X-Internal-Key", "test-internal-key"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.usersNotified").value(2))
                .andExpect(jsonPath("$.eventsProcessed").value(5));

        verify(notificationDigestService).processDailySummaries();
    }

    @Test
    void sendWeeklySummaryNotifications_ShouldReturnOk_WithApiKey() throws Exception {
        when(notificationDigestService.processWeeklySummaries())
                .thenReturn(new NotificationDigestJobResponse(1, 3));

        mockMvc.perform(post("/api/notifications/weekly/notify")
                .header("X-Internal-Key", "test-internal-key"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.usersNotified").value(1))
                .andExpect(jsonPath("$.eventsProcessed").value(3));

        verify(notificationDigestService).processWeeklySummaries();
    }
}
