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
import org.fiuba.guitapp.model.NotificationSentState;
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
                .sentState(NotificationSentState.SENT)
                .build();
    }

    @Test
    void getNotificationsForUser_ShouldReturnOnlySentNotifications() {
        when(notificationRepository.findByUserAndSentStateOrderByCreatedAtDesc(testUser, NotificationSentState.SENT))
                .thenReturn(List.of(testNotification));

        List<Notification> result = userNotificationService.getNotificationsForUser(testUser);

        assertEquals(1, result.size());
        assertEquals(testNotification, result.get(0));
        verify(notificationRepository, times(1))
                .findByUserAndSentStateOrderByCreatedAtDesc(testUser, NotificationSentState.SENT);
    }

    @Test
    void getUnreadCount_ShouldCountOnlySentUnreadNotifications() {
        when(notificationRepository.countByUserAndReadFalseAndSentState(testUser, NotificationSentState.SENT))
                .thenReturn(5L);

        long count = userNotificationService.getUnreadCount(testUser);

        assertEquals(5L, count);
        verify(notificationRepository, times(1)).countByUserAndReadFalseAndSentState(testUser, NotificationSentState.SENT);
    }

    @Test
    void releasePendingNotifications_ShouldUpdatePendingNotificationsToSent() {
        Notification pendingNotification = Notification.builder()
                .user(testUser)
                .sentState(NotificationSentState.PENDING)
                .read(false)
                .build();
        when(notificationRepository.findByUserAndSentState(testUser, NotificationSentState.PENDING))
                .thenReturn(List.of(pendingNotification));

        userNotificationService.releasePendingNotifications(testUser);

        assertEquals(NotificationSentState.SENT, pendingNotification.getSentState());
        verify(notificationRepository).saveAll(List.of(pendingNotification));
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
    void deleteAllNotificationsForUser_ShouldCallDeleteByUser() {
        doNothing().when(notificationRepository).deleteByUser(testUser);

        userNotificationService.deleteAllNotificationsForUser(testUser);

        verify(notificationRepository, times(1)).deleteByUser(testUser);
    }

    @Test
    void markAllAsRead_ShouldMarkOnlySentUnreadNotificationsAsRead() {
        Notification unreadSent = Notification.builder().user(testUser).read(false).sentState(NotificationSentState.SENT).build();
        Notification unreadSent2 = Notification.builder().user(testUser).read(false).sentState(NotificationSentState.SENT).build();
        Notification readAlready = Notification.builder().user(testUser).read(true).sentState(NotificationSentState.SENT).build();

        when(notificationRepository.findByUserAndSentStateOrderByCreatedAtDesc(testUser, NotificationSentState.SENT))
                .thenReturn(List.of(unreadSent, unreadSent2, readAlready));

        userNotificationService.markAllAsRead(testUser);

        assertTrue(unreadSent.isRead());
        assertTrue(unreadSent2.isRead());
        assertTrue(readAlready.isRead());

        verify(notificationRepository, times(1)).saveAll(argThat(list -> {
            List<Notification> notifications = (List<Notification>) list;
            return notifications.size() == 2
                    && notifications.contains(unreadSent)
                    && notifications.contains(unreadSent2);
        }));
    }
}
