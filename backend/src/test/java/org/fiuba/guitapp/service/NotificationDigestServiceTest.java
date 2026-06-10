package org.fiuba.guitapp.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.UUID;

import org.fiuba.guitapp.model.AlertType;
import org.fiuba.guitapp.model.NotificationFrequency;
import org.fiuba.guitapp.model.User;
import org.fiuba.guitapp.model.UserStatus;
import org.fiuba.guitapp.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class NotificationDigestServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private UserNotificationService userNotificationService;

    @Mock
    private NotificationSummarySender notificationSummarySender;

    @InjectMocks
    private NotificationDigestService notificationDigestService;

    private User dailyUser;
    private User weeklyUser;

    @BeforeEach
    void setUp() {
        dailyUser = new User();
        dailyUser.setId(UUID.randomUUID());
        dailyUser.setEmail("daily@example.com");
        dailyUser.setStatus(UserStatus.ACTIVE);
        dailyUser.setNotificationFrequency(NotificationFrequency.DAILY);

        weeklyUser = new User();
        weeklyUser.setId(UUID.randomUUID());
        weeklyUser.setEmail("weekly@example.com");
        weeklyUser.setStatus(UserStatus.ACTIVE);
        weeklyUser.setNotificationFrequency(NotificationFrequency.WEEKLY);
    }

    @Test
    void processDailySummaries_ShouldReleasePendingAndSendReminderToAllDailyUsers() {
        when(userRepository.findByNotificationFrequencyAndStatus(NotificationFrequency.DAILY, UserStatus.ACTIVE))
                .thenReturn(List.of(dailyUser));

        int usersNotified = notificationDigestService.processDailySummaries();

        assertEquals(1, usersNotified);
        verify(userNotificationService).releasePendingNotifications(dailyUser);
        verify(notificationSummarySender).sendSummary(
                eq(dailyUser),
                eq(AlertType.DAILY_SUMMARY),
                eq(NotificationDigestService.DAILY_SUMMARY_MESSAGE));
    }

    @Test
    void processDailySummaries_ShouldReturnZero_WhenNoDailyUsersExist() {
        when(userRepository.findByNotificationFrequencyAndStatus(NotificationFrequency.DAILY, UserStatus.ACTIVE))
                .thenReturn(List.of());

        int usersNotified = notificationDigestService.processDailySummaries();

        assertEquals(0, usersNotified);
        verify(userNotificationService, never()).releasePendingNotifications(any());
        verify(notificationSummarySender, never()).sendSummary(any(), any(), any());
    }

    @Test
    void processWeeklySummaries_ShouldReleasePendingAndSendReminderToAllWeeklyUsers() {
        when(userRepository.findByNotificationFrequencyAndStatus(NotificationFrequency.WEEKLY, UserStatus.ACTIVE))
                .thenReturn(List.of(weeklyUser));

        int usersNotified = notificationDigestService.processWeeklySummaries();

        assertEquals(1, usersNotified);
        verify(userNotificationService).releasePendingNotifications(weeklyUser);
        verify(notificationSummarySender).sendSummary(
                eq(weeklyUser),
                eq(AlertType.WEEKLY_SUMMARY),
                eq(NotificationDigestService.WEEKLY_SUMMARY_MESSAGE));
    }

    @Test
    void processWeeklySummaries_ShouldNotifyAllWeeklyUsers() {
        User anotherWeeklyUser = new User();
        anotherWeeklyUser.setId(UUID.randomUUID());
        anotherWeeklyUser.setEmail("weekly2@example.com");
        anotherWeeklyUser.setStatus(UserStatus.ACTIVE);
        anotherWeeklyUser.setNotificationFrequency(NotificationFrequency.WEEKLY);

        when(userRepository.findByNotificationFrequencyAndStatus(NotificationFrequency.WEEKLY, UserStatus.ACTIVE))
                .thenReturn(List.of(weeklyUser, anotherWeeklyUser));

        int usersNotified = notificationDigestService.processWeeklySummaries();

        assertEquals(2, usersNotified);
        verify(userNotificationService, times(2)).releasePendingNotifications(any());
        verify(notificationSummarySender, times(2)).sendSummary(any(), eq(AlertType.WEEKLY_SUMMARY), any());
    }
}
