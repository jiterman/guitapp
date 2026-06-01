package org.fiuba.guitapp.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.fiuba.guitapp.model.AlertType;
import org.fiuba.guitapp.model.Notification;
import org.fiuba.guitapp.model.User;
import org.fiuba.guitapp.repository.UserRepository;
import org.fiuba.guitapp.service.UserNotificationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class NotificationControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private UserNotificationService userNotificationService;

    @MockBean
    private UserRepository userRepository;

    private User testUser;
    private Notification testNotification;

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setId(UUID.randomUUID());
        testUser.setEmail("test@example.com");

        testNotification = Notification.builder()
                .id(1L)
                .user(testUser)
                .type(AlertType.FIXED_EXPENSE_THRESHOLD_EXCEEDED)
                .title("Test Title")
                .body("Test Body")
                .createdAt(LocalDateTime.of(2023, 10, 27, 10, 0))
                .read(false)
                .build();
    }

    @Test
    @WithMockUser(username = "test@example.com")
    void getNotifications_ShouldReturnNotificationList() throws Exception {
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));
        when(userNotificationService.getNotificationsForUser(testUser)).thenReturn(List.of(testNotification));

        mockMvc.perform(get("/api/notifications")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(1))
                .andExpect(jsonPath("$[0].type").value("FIXED_EXPENSE_THRESHOLD_EXCEEDED"))
                .andExpect(jsonPath("$[0].title").value("Test Title"))
                .andExpect(jsonPath("$[0].body").value("Test Body"))
                .andExpect(jsonPath("$[0].read").value(false));

        verify(userNotificationService, times(1)).getNotificationsForUser(testUser);
    }

    @Test
    @WithMockUser(username = "test@example.com")
    void getUnreadCount_ShouldReturnUnreadCount() throws Exception {
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));
        when(userNotificationService.getUnreadCount(testUser)).thenReturn(5L);

        mockMvc.perform(get("/api/notifications/unread-count")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").value(5));

        verify(userNotificationService, times(1)).getUnreadCount(testUser);
    }

    @Test
    @WithMockUser(username = "test@example.com")
    void markAsRead_ShouldReturnOk() throws Exception {
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));
        doNothing().when(userNotificationService).markAsRead(eq(1L), any(User.class));

        mockMvc.perform(patch("/api/notifications/1/read")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());

        verify(userNotificationService, times(1)).markAsRead(eq(1L), eq(testUser));
    }

    @Test
    @WithMockUser(username = "test@example.com")
    void markAllAsRead_ShouldReturnOk() throws Exception {
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));
        doNothing().when(userNotificationService).markAllAsRead(any(User.class));

        mockMvc.perform(patch("/api/notifications/read-all")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());

        verify(userNotificationService, times(1)).markAllAsRead(testUser);
    }
}
