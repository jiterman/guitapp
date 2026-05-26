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
        sendNotification(user, "Se nos fue la mano \uD83D\uDCB8", body,
                "expense threshold exceeded");
    }

    public void sendSavingsGoalAtRiskNotification(User user, String body) {
        sendNotification(user, "Se nos fue la mano \uD83D\uDCB8", body,
                "savings goal at risk");
    }

    public void sendNegativeBalanceRiskNotification(User user, String body) {
        sendNotification(user, "Se nos fue la mano \uD83D\uDCB8", body,
                "negative balance risk");
    }

    public void sendCategoryOverspendingNotification(User user, String body) {
        sendNotification(user, "Venimos gastando un poco más 📈", body,
                "category overspending");
    }

    private void sendNotification(User user, String title, String body, String logContext) {
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
            log.info("Successfully sent {} notification: {}", logContext, response);
        } catch (Exception e) {
            log.error("Error sending FCM {} notification to user {}", logContext, user.getEmail(), e);
        }
    }
}
