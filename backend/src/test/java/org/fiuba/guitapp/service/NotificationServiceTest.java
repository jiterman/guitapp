package org.fiuba.guitapp.service;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import java.util.UUID;

import org.fiuba.guitapp.model.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.MockedStatic;
import org.mockito.junit.jupiter.MockitoExtension;

import com.google.firebase.messaging.FirebaseMessaging;
import com.google.firebase.messaging.Message;

@ExtendWith(MockitoExtension.class)
class NotificationServiceTest {

    private NotificationService notificationService;

    @Mock
    private FirebaseMessaging firebaseMessaging;

    private User testUser;

    @BeforeEach
    void setUp() {
        notificationService = new NotificationService();
        testUser = new User();
        testUser.setId(UUID.randomUUID());
        testUser.setEmail("test@example.com");
        testUser.setFcmToken("test-token");
    }

    @Test
    void sendExpenseThresholdExceededNotification_ShouldSendMessage_WhenTokenIsPresent() throws Exception {
        try (MockedStatic<FirebaseMessaging> mockedFirebaseMessaging = mockStatic(FirebaseMessaging.class)) {
            mockedFirebaseMessaging.when(FirebaseMessaging::getInstance).thenReturn(firebaseMessaging);
            when(firebaseMessaging.send(any(Message.class))).thenReturn("response-id");

            notificationService.sendExpenseThresholdExceededNotification(testUser, "Test Message");

            verify(firebaseMessaging, times(1)).send(any(Message.class));
        }
    }

    @Test
    void sendExpenseThresholdExceededNotification_ShouldNotSendMessage_WhenTokenIsMissing() throws Exception {
        testUser.setFcmToken(null);

        notificationService.sendExpenseThresholdExceededNotification(testUser, "Test Message");

        // FirebaseMessaging.getInstance() should not even be called
        try (MockedStatic<FirebaseMessaging> mockedFirebaseMessaging = mockStatic(FirebaseMessaging.class)) {
            mockedFirebaseMessaging.when(FirebaseMessaging::getInstance).thenReturn(firebaseMessaging);

            notificationService.sendExpenseThresholdExceededNotification(testUser, "Test Message");

            verify(firebaseMessaging, never()).send(any(Message.class));
        }
    }
}
