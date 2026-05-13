package org.fiuba.guitapp.service;

import org.fiuba.guitapp.model.Expense;
import org.fiuba.guitapp.model.User;
import org.springframework.stereotype.Service;

import com.google.firebase.messaging.FirebaseMessaging;
import com.google.firebase.messaging.Message;
import com.google.firebase.messaging.Notification;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
public class NotificationService {

    public void sendExpenseNotification(User user, Expense expense) {
        if (user.getFcmToken() == null || user.getFcmToken().isEmpty()) {
            log.info("User {} has no FCM token. Skipping notification.", user.getEmail());
            return;
        }

        try {
            Notification notification = Notification.builder()
                    .setTitle("Nuevo gasto cargado")
                    .setBody(String.format("Has cargado un gasto de %.2f en %s",
                            expense.getAmount(), expense.getCategory()))
                    .build();

            Message message = Message.builder()
                    .setToken(user.getFcmToken())
                    .setNotification(notification)
                    .putData("expenseId", expense.getId().toString())
                    .putData("amount", expense.getAmount().toString())
                    .build();

            String response = FirebaseMessaging.getInstance().send(message);
            log.info("Successfully sent notification: {}", response);
        } catch (Exception e) {
            log.error("Error sending FCM notification to user {}", user.getEmail(), e);
        }
    }
}
