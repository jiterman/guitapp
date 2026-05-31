package org.fiuba.guitapp.service;

import org.fiuba.guitapp.model.User;
import org.springframework.stereotype.Service;

import com.google.firebase.messaging.AndroidConfig;
import com.google.firebase.messaging.AndroidNotification;
import com.google.firebase.messaging.FirebaseMessaging;
import com.google.firebase.messaging.Message;
import com.google.firebase.messaging.Notification;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
public class NotificationService {

    public void sendExpenseThresholdExceededNotification(User user, String body) {
        sendPushNotification(user, "Se nos fue la mano \uD83D\uDCB8", body, "limite de gastos excedido");
    }

    public void sendSavingsGoalAtRiskNotification(User user, String body) {
        sendPushNotification(user, "Se nos fue la mano \uD83D\uDCB8", body, "meta de ahorro en riesgo");
    }

    public void sendNegativeBalanceRiskNotification(User user, String body) {
        sendPushNotification(user, "Se nos fue la mano \uD83D\uDCB8", body, "saldo negativo proyectado");
    }

    public void sendCategoryOverspendingNotification(User user, String body) {
        sendPushNotification(user, "Venimos gastando un poco más 📈", body,
                "gasto por categoria superior al mes anterior");
    }

    public void sendPushNotification(User user, String title, String body, String logContext) {
        if (user.getFcmToken() == null || user.getFcmToken().isEmpty()) {
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
                    .build();

            String response = FirebaseMessaging.getInstance().send(message);
            log.info("Notificacion enviada correctamente ({}): {}", logContext, response);
        } catch (Exception e) {
            log.error("Error al enviar notificacion FCM ({}) al usuario {}", logContext, user.getEmail(), e);
        }
    }
}
