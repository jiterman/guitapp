package org.fiuba.guitapp.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.argThat;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;

import java.util.List;
import java.util.UUID;

import org.fiuba.guitapp.model.AlertType;
import org.fiuba.guitapp.model.Notification;
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
@Transactional
class NotificationFrequencyBehaviorTest {

    private static final String BODY = "Alert body for frequency test";

    @Autowired
    private AlertDeliveryService alertDeliveryService;

    @Autowired
    private NotificationDigestService notificationDigestService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @MockBean
    private NotificationService notificationService;

    @MockBean
    private EmailService emailService;

    private User instantUser;
    private User dailyUser;
    private User weeklyUser;

    @BeforeEach
    void setUp() {
        instantUser = createUser(NotificationFrequency.INSTANT, "instant");
        dailyUser = createUser(NotificationFrequency.DAILY, "daily");
        weeklyUser = createUser(NotificationFrequency.WEEKLY, "weekly");
    }

    @Test
    void newUser_ShouldDefaultNotificationFrequencyToInstant() {
        User user = new User();
        assertEquals(NotificationFrequency.INSTANT, user.getNotificationFrequency());
    }

    @Test
    @Transactional
    void deliverAlert_ShouldPersistNotification_ForInstantUser() {
        alertDeliveryService.deliverAlert(instantUser, AlertType.CATEGORY_OVERSPENDING, BODY);

        List<Notification> notifications = findNotificationsFor(instantUser);
        assertEquals(1, notifications.size());
        assertEquals(AlertType.CATEGORY_OVERSPENDING, notifications.get(0).getType());
    }

    @Test
    @Transactional
    void deliverAlert_ShouldPersistNotification_ForDailyUser() {
        alertDeliveryService.deliverAlert(dailyUser, AlertType.SAVINGS_GOAL_AT_RISK, BODY);

        List<Notification> notifications = findNotificationsFor(dailyUser);
        assertEquals(1, notifications.size());
        assertFalse(notifications.get(0).isRead());
    }

    @Test
    @Transactional
    void deliverAlert_ShouldPersistNotification_ForWeeklyUser() {
        alertDeliveryService.deliverAlert(weeklyUser, AlertType.NEGATIVE_BALANCE_RISK, BODY);

        assertEquals(1, findNotificationsFor(weeklyUser).size());
    }

    @Test
    @Transactional
    void deliverAlert_ShouldSendPushImmediately_ForInstantUser() {
        instantUser.setNotificationChannel(NotificationChannel.PUSH);
        userRepository.save(instantUser);

        alertDeliveryService.deliverAlert(instantUser, AlertType.CATEGORY_OVERSPENDING, BODY);

        verify(notificationService)
                .sendPushNotification(
                        argThat(u -> u.getId().equals(instantUser.getId())),
                        eq(AlertType.CATEGORY_OVERSPENDING.getTitle()),
                        eq(BODY),
                        eq(AlertType.CATEGORY_OVERSPENDING.getLogContext()));
    }

    @Test
    @Transactional
    void deliverAlert_ShouldNotSendPushImmediately_ForDailyUser() {
        dailyUser.setNotificationChannel(NotificationChannel.PUSH);
        userRepository.save(dailyUser);

        alertDeliveryService.deliverAlert(dailyUser, AlertType.CATEGORY_OVERSPENDING, BODY);

        verify(notificationService, never()).sendPushNotification(any(), any(), any(), any());
        verify(emailService, never()).sendAlertEmail(any(), any(), any());
        assertEquals(1, findNotificationsFor(dailyUser).size());
    }

    @Test
    @Transactional
    void deliverAlert_ShouldNotSendPushImmediately_ForWeeklyUser() {
        weeklyUser.setNotificationChannel(NotificationChannel.PUSH);
        userRepository.save(weeklyUser);

        alertDeliveryService.deliverAlert(weeklyUser, AlertType.CATEGORY_OVERSPENDING, BODY);

        verify(notificationService, never()).sendPushNotification(any(), any(), any(), any());
        assertEquals(1, findNotificationsFor(weeklyUser).size());
    }

    @Test
    @Transactional
    void processDailySummaries_ShouldOnlySendSummaryReminder() {
        alertDeliveryService.deliverAlert(dailyUser, AlertType.CATEGORY_OVERSPENDING, BODY);
        long countBefore = findNotificationsFor(dailyUser).size();

        var response = notificationDigestService.processDailySummaries();

        assertEquals(1, response.usersNotified());
        assertEquals(countBefore, findNotificationsFor(dailyUser).size());
        verify(notificationService)
                .sendPushNotification(
                        argThat(u -> u.getId().equals(dailyUser.getId())),
                        eq(AlertType.DAILY_SUMMARY.getTitle()),
                        eq("No dejes los gastos de hoy sin registrar👀. Revisa tus movimientos."),
                        eq(AlertType.DAILY_SUMMARY.getLogContext()));
    }

    @Test
    @Transactional
    void processWeeklySummaries_ShouldOnlySendSummaryReminder() {
        alertDeliveryService.deliverAlert(weeklyUser, AlertType.SAVINGS_GOAL_AT_RISK, BODY);
        long countBefore = findNotificationsFor(weeklyUser).size();

        var response = notificationDigestService.processWeeklySummaries();

        assertEquals(1, response.usersNotified());
        assertEquals(countBefore, findNotificationsFor(weeklyUser).size());
        verify(notificationService)
                .sendPushNotification(
                        argThat(u -> u.getId().equals(weeklyUser.getId())),
                        eq(AlertType.WEEKLY_SUMMARY.getTitle()),
                        eq("¿Cómo vienen los movimientos de la semana? 👀. Revisa la app."),
                        eq(AlertType.WEEKLY_SUMMARY.getLogContext()));
    }

    private User createUser(NotificationFrequency frequency, String prefix) {
        User user = new User();
        user.setEmail(prefix + "-" + UUID.randomUUID() + "@example.com");
        user.setPassword(passwordEncoder.encode("password"));
        user.setStatus(UserStatus.ACTIVE);
        user.setNotificationFrequency(frequency);
        user.setNotificationChannel(NotificationChannel.PUSH);
        user.setFcmToken("fcm-" + prefix);
        return userRepository.save(user);
    }

    private List<Notification> findNotificationsFor(User user) {
        return notificationRepository.findAll()
                .stream()
                .filter(n -> n.getUser().getId().equals(user.getId()))
                .toList();
    }
}
