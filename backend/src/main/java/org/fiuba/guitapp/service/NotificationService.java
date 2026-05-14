package org.fiuba.guitapp.service;

import java.math.BigDecimal;

import org.fiuba.guitapp.model.User;
import org.springframework.stereotype.Service;

import com.google.firebase.messaging.FirebaseMessaging;
import com.google.firebase.messaging.Message;
import com.google.firebase.messaging.Notification;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
public class NotificationService {

    public void sendExpenseThresholdExceededNotification(User user, BigDecimal totalMonthlyExpenses) {
        if (user.getFcmToken() == null || user.getFcmToken().isEmpty()) {
            return;
        }

        try {
            Notification notification = Notification.builder()
                    .setTitle("Límite de gastos excedido")
                    .setBody(String.format("Tus gastos mensuales han superado los %.2f con un total de %.2f",
                            new BigDecimal("100000"), totalMonthlyExpenses))
                    .build();

            Message message = Message.builder()
                    .setToken(user.getFcmToken())
                    .setNotification(notification)
                    .putData("totalMonthlyExpenses", totalMonthlyExpenses.toString())
                    .build();

            String response = FirebaseMessaging.getInstance().send(message);
            log.info("Successfully sent expense threshold exceeded notification: {}", response);
        } catch (Exception e) {
            log.error("Error sending FCM expense threshold exceeded notification to user {}", user.getEmail(), e);
        }
    }
}
