package org.fiuba.guitapp.service;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import java.util.List;
import java.util.UUID;

import org.fiuba.guitapp.model.AlertType;
import org.fiuba.guitapp.model.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.MockedStatic;
import org.mockito.junit.jupiter.MockitoExtension;

import com.google.firebase.FirebaseApp;
import com.google.firebase.messaging.FirebaseMessaging;
import com.google.firebase.messaging.Message;

@ExtendWith(MockitoExtension.class)
class NotificationServiceTest {

    private NotificationService notificationService;

    @Mock
    private FirebaseMessaging firebaseMessaging;

    @Mock
    private FirebaseApp firebaseApp;

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
    void sendPushNotification_ShouldSendMessage_WhenTokenIsPresent() throws Exception {
        try (MockedStatic<FirebaseApp> mockedFirebaseApp = mockStatic(FirebaseApp.class);
                MockedStatic<FirebaseMessaging> mockedFirebaseMessaging = mockStatic(FirebaseMessaging.class)) {

            mockedFirebaseApp.when(FirebaseApp::getApps).thenReturn(List.of(firebaseApp));
            mockedFirebaseMessaging.when(FirebaseMessaging::getInstance).thenReturn(firebaseMessaging);
            when(firebaseMessaging.send(any(Message.class))).thenReturn("response-id");

            notificationService.sendPushNotification(testUser, "Title", "Body", AlertType.MONTHLY_SUMMARY);

            verify(firebaseMessaging, times(1)).send(any(Message.class));
        }
    }

    @Test
    void sendPushNotification_ShouldNotSendMessage_WhenTokenIsMissing() throws Exception {
        testUser.setFcmToken(null);

        try (MockedStatic<FirebaseApp> mockedFirebaseApp = mockStatic(FirebaseApp.class);
                MockedStatic<FirebaseMessaging> mockedFirebaseMessaging = mockStatic(FirebaseMessaging.class)) {

            mockedFirebaseApp.when(FirebaseApp::getApps).thenReturn(List.of(firebaseApp));
            mockedFirebaseMessaging.when(FirebaseMessaging::getInstance).thenReturn(firebaseMessaging);

            notificationService.sendPushNotification(testUser, "Title", "Body", AlertType.MONTHLY_SUMMARY);

            verify(firebaseMessaging, never()).send(any(Message.class));
        }
    }

    @Test
    void sendPushNotification_ShouldLogAndHandleException_WhenFirebaseFails() throws Exception {
        try (MockedStatic<FirebaseApp> mockedFirebaseApp = mockStatic(FirebaseApp.class);
                MockedStatic<FirebaseMessaging> mockedFirebaseMessaging = mockStatic(FirebaseMessaging.class)) {

            mockedFirebaseApp.when(FirebaseApp::getApps).thenReturn(List.of(firebaseApp));
            mockedFirebaseMessaging.when(FirebaseMessaging::getInstance).thenReturn(firebaseMessaging);
            when(firebaseMessaging.send(any(Message.class))).thenThrow(new RuntimeException("Firebase error"));

            // Should not throw exception
            notificationService.sendPushNotification(testUser, "Title", "Body", AlertType.MONTHLY_SUMMARY);

            verify(firebaseMessaging, times(1)).send(any(Message.class));
        }
    }

    @Test
    void sendPushNotification_ShouldNotSendMessage_WhenTokenIsEmpty() throws Exception {
        testUser.setFcmToken("");

        try (MockedStatic<FirebaseApp> mockedFirebaseApp = mockStatic(FirebaseApp.class);
                MockedStatic<FirebaseMessaging> mockedFirebaseMessaging = mockStatic(FirebaseMessaging.class)) {

            mockedFirebaseApp.when(FirebaseApp::getApps).thenReturn(List.of(firebaseApp));
            mockedFirebaseMessaging.when(FirebaseMessaging::getInstance).thenReturn(firebaseMessaging);

            notificationService.sendPushNotification(testUser, "Title", "Body", AlertType.MONTHLY_SUMMARY);

            verify(firebaseMessaging, never()).send(any(Message.class));
        }
    }
}
