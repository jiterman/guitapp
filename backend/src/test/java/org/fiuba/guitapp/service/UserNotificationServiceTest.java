package org.fiuba.guitapp.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.fiuba.guitapp.model.AlertType;
import org.fiuba.guitapp.model.Notification;
import org.fiuba.guitapp.model.User;
import org.fiuba.guitapp.repository.NotificationRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class UserNotificationServiceTest {

    @Mock
    private NotificationRepository notificationRepository;

    @InjectMocks
    private UserNotificationService userNotificationService;

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
                .createdAt(LocalDateTime.now())
                .read(false)
                .build();
    }

    @Test
    void getNotificationsForUser_ShouldReturnNotifications() {
        when(notificationRepository.findByUserOrderByCreatedAtDesc(testUser)).thenReturn(List.of(testNotification));

        List<Notification> result = userNotificationService.getNotificationsForUser(testUser);

        assertEquals(1, result.size());
        assertEquals(testNotification, result.get(0));
        verify(notificationRepository, times(1)).findByUserOrderByCreatedAtDesc(testUser);
    }

    @Test
    void getUnreadCount_ShouldReturnCount() {
        when(notificationRepository.countByUserAndReadFalse(testUser)).thenReturn(5L);

        long count = userNotificationService.getUnreadCount(testUser);

        assertEquals(5L, count);
        verify(notificationRepository, times(1)).countByUserAndReadFalse(testUser);
    }

    @Test
    void markAsRead_ShouldMarkAsRead_WhenNotificationBelongsToUser() {
        when(notificationRepository.findById(1L)).thenReturn(Optional.of(testNotification));

        userNotificationService.markAsRead(1L, testUser);

        assertTrue(testNotification.isRead());
        verify(notificationRepository, times(1)).save(testNotification);
    }

    @Test
    void markAsRead_ShouldNotMarkAsRead_WhenNotificationDoesNotBelongToUser() {
        User otherUser = new User();
        otherUser.setId(UUID.randomUUID());

        when(notificationRepository.findById(1L)).thenReturn(Optional.of(testNotification));

        userNotificationService.markAsRead(1L, otherUser);

        assertFalse(testNotification.isRead());
        verify(notificationRepository, never()).save(any());
    }

    @Test
    void markAllAsRead_ShouldMarkAllUnreadAsRead() {
        Notification unread1 = Notification.builder().user(testUser).read(false).build();
        Notification unread2 = Notification.builder().user(testUser).read(false).build();
        Notification readAlready = Notification.builder().user(testUser).read(true).build();

        when(notificationRepository.findByUserOrderByCreatedAtDesc(testUser))
                .thenReturn(List.of(unread1, unread2, readAlready));

        userNotificationService.markAllAsRead(testUser);

        assertTrue(unread1.isRead());
        assertTrue(unread2.isRead());
        assertTrue(readAlready.isRead()); // Was already read, remains read

        verify(notificationRepository, times(1)).saveAll(argThat(list -> {
            List<Notification> notifications = (List<Notification>) list;
            return notifications.size() == 2 && notifications.contains(unread1) && notifications.contains(unread2);
        }));
    }
}
