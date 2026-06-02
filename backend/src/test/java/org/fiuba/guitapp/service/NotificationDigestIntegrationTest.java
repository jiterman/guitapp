package org.fiuba.guitapp.service;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertEquals;

import java.time.LocalDateTime;
import java.util.UUID;

import org.fiuba.guitapp.model.AlertType;
import org.fiuba.guitapp.model.NotificationEvent;
import org.fiuba.guitapp.model.NotificationFrequency;
import org.fiuba.guitapp.model.User;
import org.fiuba.guitapp.model.UserStatus;
import org.fiuba.guitapp.repository.NotificationEventRepository;
import org.fiuba.guitapp.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

@SpringBootTest
@ActiveProfiles("test")
class NotificationDigestIntegrationTest {

    @Autowired
    private NotificationDigestService notificationDigestService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private NotificationEventRepository notificationEventRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private User dailyUser;

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
    void processDailySummaries_ShouldComplete_WhenPendingEventsExist() {
        notificationEventRepository.save(NotificationEvent.builder()
                .user(dailyUser)
                .alertType(AlertType.CATEGORY_OVERSPENDING)
                .body("Tu gasto en la categoría Supermercado supera al mes anterior. Revisá tus gastos.")
                .createdAt(LocalDateTime.now())
                .processed(false)
                .build());

        var result = assertDoesNotThrow(() -> notificationDigestService.processDailySummaries());

        assertEquals(1, result.usersNotified());
        assertEquals(1, result.eventsProcessed());
    }
}
