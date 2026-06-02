package org.fiuba.guitapp.service;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import org.fiuba.guitapp.model.AlertType;
import org.fiuba.guitapp.model.NotificationChannel;
import org.fiuba.guitapp.model.User;
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
        when(notificationRepository.existsByUserAndTypeAndCreatedAtBetween(eq(testUser),
                eq(AlertType.FIXED_EXPENSE_THRESHOLD_EXCEEDED), any(), any())).thenReturn(false);

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
        when(notificationRepository.existsByUserAndTypeAndCreatedAtBetween(eq(testUser),
                eq(AlertType.CATEGORY_OVERSPENDING), any(), any())).thenReturn(false);

        alertDeliveryService.deliverAlert(testUser, AlertType.CATEGORY_OVERSPENDING, BODY);

        verify(notificationService).sendPushNotification(
                testUser,
                AlertType.CATEGORY_OVERSPENDING.getTitle(),
                BODY,
                AlertType.CATEGORY_OVERSPENDING.getLogContext());
        verify(notificationRepository).save(any());
        verify(emailService, never()).sendAlertEmail(
                any(),
                any(),
                any());
    }

    @Test
    void deliverAlert_ShouldDefaultToPush_WhenChannelIsNull() {
        testUser.setNotificationChannel(null);
        when(notificationRepository.existsByUserAndTypeAndCreatedAtBetween(eq(testUser),
                eq(AlertType.NEGATIVE_BALANCE_RISK), any(), any())).thenReturn(false);

        alertDeliveryService.deliverAlert(testUser, AlertType.NEGATIVE_BALANCE_RISK, BODY);

        verify(notificationService).sendPushNotification(
                testUser,
                AlertType.NEGATIVE_BALANCE_RISK.getTitle(),
                BODY,
                AlertType.NEGATIVE_BALANCE_RISK.getLogContext());
        verify(notificationRepository).save(any());
        verify(emailService, never()).sendAlertEmail(
                any(),
                any(),
                any());
    }

    @Test
    void deliverAlert_ShouldNotSendEmail_WhenChannelIsPush() {
        testUser.setNotificationChannel(NotificationChannel.PUSH);
        when(notificationRepository.existsByUserAndTypeAndCreatedAtBetween(eq(testUser),
                eq(AlertType.SAVINGS_GOAL_AT_RISK), any(), any())).thenReturn(false);

        alertDeliveryService.deliverAlert(testUser, AlertType.SAVINGS_GOAL_AT_RISK, BODY);

        verify(notificationRepository).save(any());
        verify(emailService, never()).sendAlertEmail(
                any(),
                any(),
                any());
    }

    @Test
    void deliverAlert_ShouldNotSend_WhenAlreadySentThisMonth() {
        when(notificationRepository.existsByUserAndTypeAndCreatedAtBetween(eq(testUser),
                eq(AlertType.FIXED_EXPENSE_THRESHOLD_EXCEEDED), any(), any())).thenReturn(true);

        alertDeliveryService.deliverAlert(testUser, AlertType.FIXED_EXPENSE_THRESHOLD_EXCEEDED, BODY);

        verify(notificationRepository, never()).save(any());
        verify(emailService, never()).sendAlertEmail(any(), any(), any());
        verify(notificationService, never()).sendPushNotification(any(), any(), any(), any());
    }
}
