package org.fiuba.guitapp.service;

import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;

import org.fiuba.guitapp.model.AlertType;
import org.fiuba.guitapp.model.NotificationChannel;
import org.fiuba.guitapp.model.User;
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

        alertDeliveryService.deliverAlert(testUser, AlertType.EXPENSE_THRESHOLD_EXCEEDED, BODY);

        verify(emailService).sendAlertEmail(
                testUser.getEmail(),
                AlertType.EXPENSE_THRESHOLD_EXCEEDED.getTitle(),
                BODY);
        verify(notificationService, never()).sendPushNotification(
                org.mockito.ArgumentMatchers.any(),
                org.mockito.ArgumentMatchers.any(),
                org.mockito.ArgumentMatchers.any(),
                org.mockito.ArgumentMatchers.any());
    }

    @Test
    void deliverAlert_ShouldSendPush_WhenChannelIsPushAndTokenPresent() {
        testUser.setNotificationChannel(NotificationChannel.PUSH);

        alertDeliveryService.deliverAlert(testUser, AlertType.CATEGORY_OVERSPENDING, BODY);

        verify(notificationService).sendPushNotification(
                testUser,
                AlertType.CATEGORY_OVERSPENDING.getTitle(),
                BODY,
                AlertType.CATEGORY_OVERSPENDING.getLogContext());
        verify(emailService, never()).sendAlertEmail(
                org.mockito.ArgumentMatchers.any(),
                org.mockito.ArgumentMatchers.any(),
                org.mockito.ArgumentMatchers.any());
    }

    @Test
    void deliverAlert_ShouldDefaultToPush_WhenChannelIsNull() {
        testUser.setNotificationChannel(null);

        alertDeliveryService.deliverAlert(testUser, AlertType.NEGATIVE_BALANCE_RISK, BODY);

        verify(notificationService).sendPushNotification(
                testUser,
                AlertType.NEGATIVE_BALANCE_RISK.getTitle(),
                BODY,
                AlertType.NEGATIVE_BALANCE_RISK.getLogContext());
        verify(emailService, never()).sendAlertEmail(
                org.mockito.ArgumentMatchers.any(),
                org.mockito.ArgumentMatchers.any(),
                org.mockito.ArgumentMatchers.any());
    }

    @Test
    void deliverAlert_ShouldNotSendEmail_WhenChannelIsPush() {
        testUser.setNotificationChannel(NotificationChannel.PUSH);

        alertDeliveryService.deliverAlert(testUser, AlertType.SAVINGS_GOAL_AT_RISK, BODY);

        verify(emailService, never()).sendAlertEmail(
                org.mockito.ArgumentMatchers.any(),
                org.mockito.ArgumentMatchers.any(),
                org.mockito.ArgumentMatchers.any());
    }
}
