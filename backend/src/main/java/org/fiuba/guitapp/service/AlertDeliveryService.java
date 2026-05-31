package org.fiuba.guitapp.service;

import org.fiuba.guitapp.model.AlertType;
import org.fiuba.guitapp.model.NotificationChannel;
import org.fiuba.guitapp.model.User;
import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AlertDeliveryService {

    private final NotificationService notificationService;
    private final EmailService emailService;

    public void deliverAlert(User user, AlertType alertType, String body) {
        NotificationChannel channel = resolveChannel(user);
        String title = alertType.getTitle();

        if (channel == NotificationChannel.EMAIL) {
            emailService.sendAlertEmail(user.getEmail(), title, body);
            return;
        }

        notificationService.sendPushNotification(user, title, body, alertType.getLogContext());
    }

    private NotificationChannel resolveChannel(User user) {
        if (user.getNotificationChannel() == null) {
            return NotificationChannel.PUSH;
        }
        return user.getNotificationChannel();
    }
}
