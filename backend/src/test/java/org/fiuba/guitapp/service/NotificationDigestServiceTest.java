package org.fiuba.guitapp.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.Collections;
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
    void processDailySummaries_ShouldSendReminderToAllDailyUsers() {
        when(userRepository.findByNotificationFrequencyAndStatus(NotificationFrequency.DAILY, UserStatus.ACTIVE))
                .thenReturn(List.of(dailyUser));

        var result = notificationDigestService.processDailySummaries();

        assertEquals(1, result.usersNotified());
        verify(notificationSummarySender).sendSummary(
                eq(dailyUser), eq(AlertType.DAILY_SUMMARY), eq("No dejes los gastos de hoy sin registrar👀. Revisa tus movimientos."));
    }

    @Test
    void processDailySummaries_ShouldNotifyDailyUsers_EvenWithoutStoredNotifications() {
        when(userRepository.findByNotificationFrequencyAndStatus(NotificationFrequency.DAILY, UserStatus.ACTIVE))
                .thenReturn(List.of(dailyUser));

        var result = notificationDigestService.processDailySummaries();

        assertEquals(1, result.usersNotified());
        verify(notificationSummarySender).sendSummary(any(), any(), any());
    }

    @Test
    void processDailySummaries_ShouldReturnZero_WhenNoDailyUsers() {
        when(userRepository.findByNotificationFrequencyAndStatus(NotificationFrequency.DAILY, UserStatus.ACTIVE))
                .thenReturn(Collections.emptyList());

        var result = notificationDigestService.processDailySummaries();

        assertEquals(0, result.usersNotified());
        verify(notificationSummarySender, never()).sendSummary(any(), any(), any());
    }

    @Test
    void processWeeklySummaries_ShouldSendReminderToAllWeeklyUsers() {
        when(userRepository.findByNotificationFrequencyAndStatus(NotificationFrequency.WEEKLY, UserStatus.ACTIVE))
                .thenReturn(List.of(weeklyUser));

        var result = notificationDigestService.processWeeklySummaries();

        assertEquals(1, result.usersNotified());
        verify(notificationSummarySender).sendSummary(
                eq(weeklyUser),
                eq(AlertType.WEEKLY_SUMMARY),
                eq("¿Cómo vienen los movimientos de la semana? 👀. Revisa la app."));
    }
}
