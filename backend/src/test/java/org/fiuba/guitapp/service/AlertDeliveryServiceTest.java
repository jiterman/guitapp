package org.fiuba.guitapp.service;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import org.fiuba.guitapp.model.AlertType;
import org.fiuba.guitapp.model.NotificationChannel;
import org.fiuba.guitapp.model.NotificationEvent;
import org.fiuba.guitapp.model.NotificationFrequency;
import org.fiuba.guitapp.model.User;
import org.fiuba.guitapp.repository.NotificationEventRepository;
import org.fiuba.guitapp.repository.NotificationRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class AlertDeliveryServiceTest {

    @Mock
    private NotificationService notificationService;

    @Mock
    private EmailService emailService;

    @Mock
    private NotificationRepository notificationRepository;

    @Mock
    private NotificationEventRepository notificationEventRepository;

    @InjectMocks
    private AlertDeliveryService alertDeliveryService;

    private User testUser;
    private static final String BODY = "Test alert body";

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setEmail("user@example.com");
        testUser.setFcmToken("fcm-token");
    }

    @Test
    void deliverAlert_ShouldSendEmail_WhenChannelIsEmail() {
        testUser.setNotificationChannel(NotificationChannel.EMAIL);

        alertDeliveryService.deliverAlert(testUser, AlertType.FIXED_EXPENSE_THRESHOLD_EXCEEDED, BODY);

        verify(emailService).sendAlertEmail(
                testUser.getEmail(),
                AlertType.FIXED_EXPENSE_THRESHOLD_EXCEEDED.getTitle(),
                BODY);
        verify(notificationRepository).save(any());
        verify(notificationService, never()).sendPushNotification(
                any(),
                any(),
                any(),
                any());
    }

    @Test
    void deliverAlert_ShouldSendPush_WhenChannelIsPushAndTokenPresent() {
        testUser.setNotificationChannel(NotificationChannel.PUSH);

        alertDeliveryService.deliverAlert(testUser, AlertType.CATEGORY_OVERSPENDING, BODY);

        verify(notificationService).sendPushNotification(
                testUser,
                AlertType.CATEGORY_OVERSPENDING.getTitle(),
                BODY,
                AlertType.CATEGORY_OVERSPENDING);
        verify(notificationRepository).save(any());
        verify(emailService, never()).sendAlertEmail(
                any(),
                any(),
                any());
    }

    @Test
    void deliverAlert_ShouldDefaultToPush_WhenChannelIsNull() {
        testUser.setNotificationChannel(null);

        alertDeliveryService.deliverAlert(testUser, AlertType.NEGATIVE_BALANCE_RISK, BODY);

        verify(notificationService).sendPushNotification(
                testUser,
                AlertType.NEGATIVE_BALANCE_RISK.getTitle(),
                BODY,
                AlertType.NEGATIVE_BALANCE_RISK);
        verify(notificationRepository).save(any());
        verify(emailService, never()).sendAlertEmail(
                any(),
                any(),
                any());
    }

    @Test
    void deliverAlert_ShouldNotSendEmail_WhenChannelIsPush() {
        testUser.setNotificationChannel(NotificationChannel.PUSH);

        alertDeliveryService.deliverAlert(testUser, AlertType.SAVINGS_GOAL_AT_RISK, BODY);

        verify(notificationRepository).save(any());
        verify(emailService, never()).sendAlertEmail(
                any(),
                any(),
                any());
    }

    @Test
    void deliverAlert_ShouldDeliverImmediately_WhenFrequencyIsInstant() {
        testUser.setNotificationFrequency(NotificationFrequency.INSTANT);
        testUser.setNotificationChannel(NotificationChannel.PUSH);

        alertDeliveryService.deliverAlert(testUser, AlertType.CATEGORY_OVERSPENDING, BODY);

        verify(notificationEventRepository, never()).save(any());
        verify(notificationService).sendPushNotification(
                testUser,
                AlertType.CATEGORY_OVERSPENDING.getTitle(),
                BODY,
                AlertType.CATEGORY_OVERSPENDING.getLogContext());
        verify(notificationRepository).save(any());
    }

    @Test
    void deliverAlert_ShouldRecordPendingEvent_WhenFrequencyIsDaily() {
        testUser.setNotificationFrequency(NotificationFrequency.DAILY);

        alertDeliveryService.deliverAlert(testUser, AlertType.SAVINGS_GOAL_AT_RISK, BODY);

        verify(notificationEventRepository).save(any(NotificationEvent.class));
        verify(notificationRepository, never()).save(any());
        verify(notificationService, never()).sendPushNotification(any(), any(), any(), any());
        verify(emailService, never()).sendAlertEmail(any(), any(), any());
    }

    @Test
    void deliverAlert_ShouldRecordPendingEvent_WhenFrequencyIsWeekly() {
        testUser.setNotificationFrequency(NotificationFrequency.WEEKLY);

        alertDeliveryService.deliverAlert(testUser, AlertType.NEGATIVE_BALANCE_RISK, BODY);

        verify(notificationEventRepository).save(any(NotificationEvent.class));
        verify(notificationRepository, never()).save(any());
        verify(notificationService, never()).sendPushNotification(any(), any(), any(), any());
    }

    @Test
    void deliverAlert_ShouldDeliverMonthlySummary_WhenFrequencyIsDaily() {
        testUser.setNotificationFrequency(NotificationFrequency.DAILY);
        testUser.setNotificationChannel(NotificationChannel.PUSH);

        alertDeliveryService.deliverAlert(testUser, AlertType.MONTHLY_SUMMARY, BODY);

        verify(notificationEventRepository, never()).save(any());
        verify(notificationService).sendPushNotification(
                testUser,
                AlertType.MONTHLY_SUMMARY.getTitle(),
                BODY,
                AlertType.MONTHLY_SUMMARY.getLogContext());
    }

    @Test
    void deliverSummaryNotification_ShouldSendPushWithoutPersistingNotification_WhenChannelIsPush() {
        testUser.setNotificationChannel(NotificationChannel.PUSH);

        alertDeliveryService.deliverSummaryNotification(testUser, AlertType.DAILY_SUMMARY, BODY);

        verify(notificationService).sendPushNotification(
                testUser,
                AlertType.DAILY_SUMMARY.getTitle(),
                BODY,
                AlertType.DAILY_SUMMARY.getLogContext());
        verify(notificationRepository, never()).save(any());
        verify(emailService, never()).sendAlertEmail(any(), any(), any());
    }

    @Test
    void deliverSummaryNotification_ShouldSendEmailWithoutPersistingNotification_WhenChannelIsEmail() {
        testUser.setNotificationChannel(NotificationChannel.EMAIL);

        alertDeliveryService.deliverSummaryNotification(testUser, AlertType.WEEKLY_SUMMARY, BODY);

        verify(emailService).sendAlertEmail(
                testUser.getEmail(),
                AlertType.WEEKLY_SUMMARY.getTitle(),
                BODY);
        verify(notificationRepository, never()).save(any());
    }

    @Test
    void deliverAlert_ShouldNotSend_WhenAlreadySentThisMonth() {
        when(notificationRepository.existsByUserAndTypeAndCreatedAtBetween(eq(testUser),
                eq(AlertType.MONTHLY_SUMMARY), any(), any())).thenReturn(true);

        alertDeliveryService.deliverAlert(testUser, AlertType.MONTHLY_SUMMARY, BODY);

        verify(notificationRepository, never()).save(any());
        verify(emailService, never()).sendAlertEmail(any(), any(), any());
        verify(notificationService, never()).sendPushNotification(any(), any(), any(), any());
    }

    @Test
    void deliverAlert_ShouldNotCheckDuplicate_WhenAlertTypeIsNotMonthlySummary() {
        when(notificationRepository.existsByUserAndTypeAndCreatedAtBetween(eq(testUser),
                eq(AlertType.CATEGORY_OVERSPENDING), any(), any())).thenReturn(false);
        testUser.setNotificationChannel(NotificationChannel.PUSH);

        alertDeliveryService.deliverAlert(testUser, AlertType.CATEGORY_OVERSPENDING, BODY);

        verify(notificationService).sendPushNotification(any(), any(), any(), any());
        verify(notificationRepository).save(any());
    }

    @Test
    void deliverAlert_ShouldDeliverImmediately_WhenFrequencyIsNullAndAlertTypeIsNotSummary() {
        testUser.setNotificationFrequency(null);
        testUser.setNotificationChannel(NotificationChannel.PUSH);

        alertDeliveryService.deliverAlert(testUser, AlertType.SAVINGS_GOAL_AT_RISK, BODY);

        verify(notificationEventRepository, never()).save(any());
        verify(notificationService).sendPushNotification(any(), any(), any(), any());
    }

    @Test
    void deliverSummaryNotification_ShouldLogError_WhenExceptionOccurs() {
        testUser.setNotificationChannel(NotificationChannel.PUSH);
        doThrow(new RuntimeException("Test exception"))
                .when(notificationService)
                .sendPushNotification(any(), any(), any(), any());

        alertDeliveryService.deliverSummaryNotification(testUser, AlertType.DAILY_SUMMARY, BODY);

        // Should not throw, just log error
    }

    @Test
    void deliverAlert_ShouldDeferWhenFrequencyIsDaily_AndNotSummaryType() {
        testUser.setNotificationFrequency(NotificationFrequency.DAILY);

        alertDeliveryService.deliverAlert(testUser, AlertType.CATEGORY_OVERSPENDING, BODY);

        verify(notificationEventRepository).save(any(NotificationEvent.class));
    }

    @Test
    void deliverAlert_ShouldDeliverImmediatelyMonthlySummary_IgnoringFrequency() {
        testUser.setNotificationFrequency(NotificationFrequency.WEEKLY);
        testUser.setNotificationChannel(NotificationChannel.PUSH);
        when(notificationRepository.existsByUserAndTypeAndCreatedAtBetween(eq(testUser),
                eq(AlertType.MONTHLY_SUMMARY), any(), any())).thenReturn(false);

        alertDeliveryService.deliverAlert(testUser, AlertType.MONTHLY_SUMMARY, BODY);

        verify(notificationService).sendPushNotification(any(), any(), any(), any());
        verify(notificationRepository).save(any());
    }
}
