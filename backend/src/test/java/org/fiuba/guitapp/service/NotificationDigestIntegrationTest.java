package org.fiuba.guitapp.service;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;

import java.util.UUID;

import org.fiuba.guitapp.model.AlertType;
import org.fiuba.guitapp.model.NotificationChannel;
import org.fiuba.guitapp.model.NotificationFrequency;
import org.fiuba.guitapp.model.User;
import org.fiuba.guitapp.model.UserStatus;
import org.fiuba.guitapp.repository.NotificationRepository;
import org.fiuba.guitapp.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

@SpringBootTest
@ActiveProfiles("test")
class NotificationDigestIntegrationTest {

    @Autowired
    private NotificationDigestService notificationDigestService;

    @Autowired
    private AlertDeliveryService alertDeliveryService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @MockBean
    private NotificationService notificationService;

    private User dailyUser;
    private User weeklyUser;
    private User instantUser;

    @BeforeEach
    void setUp() {
        dailyUser = createUser(NotificationFrequency.DAILY, "daily");
        weeklyUser = createUser(NotificationFrequency.WEEKLY, "weekly");
        instantUser = createUser(NotificationFrequency.INSTANT, "instant");
    }

    @Test
    @Transactional
    void deliverAlert_ShouldPersistNotificationWithoutPush_ForDailyUser() {
        alertDeliveryService.deliverAlert(
                dailyUser, AlertType.CATEGORY_OVERSPENDING, "Gasto elevado en supermercado");

        assertEquals(1, notificationRepository.count());
        verify(notificationService, never()).sendPushNotification(any(), anyString(), anyString(), anyString());
    }

    @Test
    @Transactional
    void deliverAlert_ShouldPersistNotificationWithoutPush_ForWeeklyUser() {
        alertDeliveryService.deliverAlert(
                weeklyUser, AlertType.SAVINGS_GOAL_AT_RISK, "Meta de ahorro en riesgo");

        assertEquals(1, notificationRepository.count());
        verify(notificationService, never()).sendPushNotification(any(), anyString(), anyString(), anyString());
    }

    @Test
    @Transactional
    void deliverAlert_ShouldPersistAndSendPush_ForInstantUser() {
        alertDeliveryService.deliverAlert(
                instantUser, AlertType.NEGATIVE_BALANCE_RISK, "Saldo negativo proyectado");

        assertEquals(1, notificationRepository.count());
        verify(notificationService, times(1)).sendPushNotification(any(), anyString(), anyString(), anyString());
    }

    @Test
    @Transactional
    void processDailySummaries_ShouldSendReminderWithoutCreatingNotifications() {
        alertDeliveryService.deliverAlert(
                dailyUser, AlertType.CATEGORY_OVERSPENDING, "Gasto elevado en supermercado");
        long notificationsBeforeJob = notificationRepository.count();

        int usersNotified = assertDoesNotThrow(() -> notificationDigestService.processDailySummaries());

        assertEquals(1, usersNotified);
        assertEquals(notificationsBeforeJob, notificationRepository.count());
        verify(notificationService, times(1)).sendPushNotification(any(), anyString(), anyString(), anyString());
    }

    @Test
    @Transactional
    void processWeeklySummaries_ShouldSendReminderWithoutCreatingNotifications() {
        alertDeliveryService.deliverAlert(
                weeklyUser, AlertType.VARIABLE_EXPENSE_THRESHOLD_EXCEEDED, "Límite de gastos variables excedido");
        long notificationsBeforeJob = notificationRepository.count();

        int usersNotified = assertDoesNotThrow(() -> notificationDigestService.processWeeklySummaries());

        assertEquals(1, usersNotified);
        assertEquals(notificationsBeforeJob, notificationRepository.count());
        verify(notificationService, times(1)).sendPushNotification(any(), anyString(), anyString(), anyString());
    }

    private User createUser(NotificationFrequency frequency, String prefix) {
        User user = new User();
        user.setEmail(prefix + "-" + UUID.randomUUID() + "@example.com");
        user.setPassword(passwordEncoder.encode("password"));
        user.setStatus(UserStatus.ACTIVE);
        user.setNotificationFrequency(frequency);
        user.setNotificationChannel(NotificationChannel.PUSH);
        user.setFcmToken("test-fcm-token");
        return userRepository.save(user);
    }
}
