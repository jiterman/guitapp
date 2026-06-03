package org.fiuba.guitapp.service;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;

import java.util.UUID;

import org.fiuba.guitapp.model.AlertType;
import org.fiuba.guitapp.model.NotificationFrequency;
import org.fiuba.guitapp.model.User;
import org.fiuba.guitapp.model.UserStatus;
import org.fiuba.guitapp.repository.NotificationRepository;
import org.fiuba.guitapp.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.SpyBean;
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

    @SpyBean
    private NotificationSummarySender notificationSummarySender;

    private User dailyUser;
    private static final String ALERT_BODY = "Tu gasto en la categoría Supermercado supera al mes anterior. Revisá tus gastos.";

    @BeforeEach
    void setUp() {
        dailyUser = new User();
        dailyUser.setEmail("digest-" + UUID.randomUUID() + "@example.com");
        dailyUser.setPassword(passwordEncoder.encode("password"));
        dailyUser.setStatus(UserStatus.ACTIVE);
        dailyUser.setNotificationFrequency(NotificationFrequency.DAILY);
        dailyUser.setFcmToken("test-fcm-token");
        dailyUser = userRepository.save(dailyUser);
    }

    @Test
    @Transactional
    void processDailySummaries_ShouldSendReminderOnly_WithoutCreatingNotifications() {
        alertDeliveryService.deliverAlert(dailyUser, AlertType.CATEGORY_OVERSPENDING, ALERT_BODY);

        long notificationsBeforeJob = notificationRepository.findAll()
                .stream()
                .filter(n -> n.getUser().getId().equals(dailyUser.getId()))
                .count();
        assertEquals(1, notificationsBeforeJob);

        var result = assertDoesNotThrow(() -> notificationDigestService.processDailySummaries());

        assertEquals(1, result.usersNotified());
        verify(notificationSummarySender)
                .sendSummary(
                        any(User.class),
                        eq(AlertType.DAILY_SUMMARY),
                        eq("No dejes los gastos de hoy sin registrar👀. Revisa tus movimientos."));

        long notificationsAfterJob = notificationRepository.findAll()
                .stream()
                .filter(n -> n.getUser().getId().equals(dailyUser.getId()))
                .count();
        assertEquals(notificationsBeforeJob, notificationsAfterJob);
    }
}
