package org.fiuba.guitapp.service;

import org.fiuba.guitapp.model.AlertType;
import org.fiuba.guitapp.model.User;
import org.springframework.stereotype.Service;

import com.google.firebase.FirebaseApp;
import com.google.firebase.messaging.AndroidConfig;
import com.google.firebase.messaging.AndroidNotification;
import com.google.firebase.messaging.FirebaseMessaging;
import com.google.firebase.messaging.Message;
import com.google.firebase.messaging.Notification;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
public class NotificationService {

    public void sendPushNotification(User user, String title, String body, AlertType alertType) {
        String logContext = alertType.getLogContext();
        if (user.getFcmToken() == null || user.getFcmToken().isEmpty()) {
            log.warn("Push omitido para {}: sin token FCM registrado", user.getEmail());
            return;
        }

        if (!isFirebaseInitialized()) {
            log.warn("Push omitido para {} ({}): Firebase no está inicializado", user.getEmail(), logContext);
            return;
        }

        try {
            Notification notification = Notification.builder()
                    .setTitle(title)
                    .setBody(body)
                    .build();

            AndroidNotification androidNotification = AndroidNotification.builder()
                    .setColor("#dff3ff")
                    .build();

            AndroidConfig androidConfig = AndroidConfig.builder()
                    .setNotification(androidNotification)
                    .build();

            Message message = Message.builder()
                    .setToken(user.getFcmToken())
                    .setNotification(notification)
                    .setAndroidConfig(androidConfig)
                    .putData("alertType", alertType.name())
                    .build();

            String response = FirebaseMessaging.getInstance().send(message);
            log.info("Notificacion enviada correctamente ({}): {}", logContext, response);
        } catch (Exception e) {
            log.error("Error al enviar notificacion FCM ({}) al usuario {}", logContext, user.getEmail(), e);
        }
    }

    private boolean isFirebaseInitialized() {
        return !FirebaseApp.getApps().isEmpty();
    }
}
