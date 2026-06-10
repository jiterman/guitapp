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
import org.fiuba.guitapp.model.Notification;
import org.fiuba.guitapp.model.NotificationChannel;
import org.fiuba.guitapp.model.NotificationFrequency;
import org.fiuba.guitapp.model.NotificationSentState;
import org.fiuba.guitapp.model.User;
import org.fiuba.guitapp.model.UserStatus;
import org.fiuba.guitapp.repository.NotificationRepository;
import org.fiuba.guitapp.repository.UserRepository;
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
    private UserNotificationService userNotificationService;

    @Autowired
    private UserService userService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @MockBean
    private NotificationService notificationService;

    @Test
    @Transactional
    void deliverAlert_ShouldPersistPendingNotificationWithoutPush_ForDailyUser() {
        User dailyUser = createUser(NotificationFrequency.DAILY, "daily");

        alertDeliveryService.deliverAlert(
                dailyUser, AlertType.CATEGORY_OVERSPENDING, "Gasto elevado en supermercado");

        assertEquals(1, notificationRepository.count());
        assertEquals(NotificationSentState.PENDING, notificationRepository.findAll().get(0).getSentState());
        assertEquals(0, userNotificationService.getUnreadCount(dailyUser));
        verify(notificationService, never()).sendPushNotification(any(), anyString(), anyString(), any(AlertType.class));
    }

    @Test
    @Transactional
    void deliverAlert_ShouldPersistPendingNotificationWithoutPush_ForWeeklyUser() {
        User weeklyUser = createUser(NotificationFrequency.WEEKLY, "weekly");

        alertDeliveryService.deliverAlert(
                weeklyUser, AlertType.SAVINGS_GOAL_AT_RISK, "Meta de ahorro en riesgo");

        assertEquals(1, notificationRepository.count());
        assertEquals(NotificationSentState.PENDING, notificationRepository.findAll().get(0).getSentState());
        assertEquals(0, userNotificationService.getUnreadCount(weeklyUser));
        verify(notificationService, never()).sendPushNotification(any(), anyString(), anyString(), any(AlertType.class));
    }

    @Test
    @Transactional
    void deliverAlert_ShouldPersistSentNotificationAndSendPush_ForInstantUser() {
        User instantUser = createUser(NotificationFrequency.INSTANT, "instant");

        alertDeliveryService.deliverAlert(
                instantUser, AlertType.NEGATIVE_BALANCE_RISK, "Saldo negativo proyectado");

        assertEquals(1, notificationRepository.count());
        assertEquals(NotificationSentState.SENT, notificationRepository.findAll().get(0).getSentState());
        assertEquals(1, userNotificationService.getUnreadCount(instantUser));
        verify(notificationService, times(1)).sendPushNotification(any(), anyString(), anyString(), any(AlertType.class));
    }

    @Test
    @Transactional
    void processDailySummaries_ShouldReleasePendingNotificationsAndSendReminder() {
        User dailyUser = createUser(NotificationFrequency.DAILY, "daily");
        alertDeliveryService.deliverAlert(
                dailyUser, AlertType.CATEGORY_OVERSPENDING, "Gasto elevado en supermercado");
        long notificationsBeforeJob = notificationRepository.count();
        assertEquals(0, userNotificationService.getUnreadCount(dailyUser));

        int usersNotified = assertDoesNotThrow(() -> notificationDigestService.processDailySummaries());

        assertEquals(1, usersNotified);
        assertEquals(notificationsBeforeJob, notificationRepository.count());
        assertEquals(NotificationSentState.SENT, findNotificationForUser(dailyUser).getSentState());
        assertEquals(1, userNotificationService.getUnreadCount(dailyUser));
        verify(notificationService, times(1)).sendPushNotification(any(), anyString(), anyString(), any(AlertType.class));
    }

    @Test
    @Transactional
    void processWeeklySummaries_ShouldReleasePendingNotificationsAndSendReminder() {
        User weeklyUser = createUser(NotificationFrequency.WEEKLY, "weekly");
        alertDeliveryService.deliverAlert(
                weeklyUser, AlertType.VARIABLE_EXPENSE_THRESHOLD_EXCEEDED, "Límite de gastos variables excedido");
        long notificationsBeforeJob = notificationRepository.count();
        assertEquals(0, userNotificationService.getUnreadCount(weeklyUser));

        int usersNotified = assertDoesNotThrow(() -> notificationDigestService.processWeeklySummaries());

        assertEquals(1, usersNotified);
        assertEquals(notificationsBeforeJob, notificationRepository.count());
        assertEquals(NotificationSentState.SENT, findNotificationForUser(weeklyUser).getSentState());
        assertEquals(1, userNotificationService.getUnreadCount(weeklyUser));
        verify(notificationService, times(1)).sendPushNotification(any(), anyString(), anyString(), any(AlertType.class));
    }

    @Test
    @Transactional
    void updateNotificationFrequency_ShouldReleasePendingNotifications_WhenSwitchingFromDailyToInstant() {
        User dailyUser = createUser(NotificationFrequency.DAILY, "daily");
        alertDeliveryService.deliverAlert(
                dailyUser, AlertType.CATEGORY_OVERSPENDING, "Gasto elevado en supermercado");
        assertEquals(0, userNotificationService.getUnreadCount(dailyUser));

        userService.updateNotificationFrequency(dailyUser.getEmail(), NotificationFrequency.INSTANT);

        assertEquals(NotificationSentState.SENT, findNotificationForUser(dailyUser).getSentState());
        assertEquals(1, userNotificationService.getUnreadCount(dailyUser));
        verify(notificationService, never()).sendPushNotification(any(), anyString(), anyString(), any(AlertType.class));
    }

    @Test
    @Transactional
    void updateNotificationFrequency_ShouldReleasePendingNotifications_WhenSwitchingFromWeeklyToInstant() {
        User weeklyUser = createUser(NotificationFrequency.WEEKLY, "weekly");
        alertDeliveryService.deliverAlert(
                weeklyUser, AlertType.NEGATIVE_BALANCE_RISK, "Saldo negativo proyectado");
        assertEquals(0, userNotificationService.getUnreadCount(weeklyUser));

        userService.updateNotificationFrequency(weeklyUser.getEmail(), NotificationFrequency.INSTANT);

        assertEquals(NotificationSentState.SENT, findNotificationForUser(weeklyUser).getSentState());
        assertEquals(1, userNotificationService.getUnreadCount(weeklyUser));
        verify(notificationService, never()).sendPushNotification(any(), anyString(), anyString(), any(AlertType.class));
    }

    @Test
    void newNotification_ShouldDefaultSentStateToSent() {
        Notification notification = new Notification();

        assertEquals(NotificationSentState.SENT, notification.getSentState());
    }

    private Notification findNotificationForUser(User user) {
        return notificationRepository.findAll()
                .stream()
                .filter(notification -> notification.getUser().getId().equals(user.getId()))
                .findFirst()
                .orElseThrow();
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
