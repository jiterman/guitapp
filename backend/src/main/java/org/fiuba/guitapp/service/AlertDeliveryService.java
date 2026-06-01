package org.fiuba.guitapp.service;

import java.time.LocalDateTime;

import org.fiuba.guitapp.model.AlertType;
import org.fiuba.guitapp.model.Notification;
import org.fiuba.guitapp.model.NotificationChannel;
import org.fiuba.guitapp.model.User;
import org.fiuba.guitapp.repository.NotificationRepository;
import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AlertDeliveryService {

    private final NotificationService notificationService;
    private final EmailService emailService;
    private final NotificationRepository notificationRepository;

    public void deliverAlert(User user, AlertType alertType, String body) {
        saveNotification(user, alertType, body);

        NotificationChannel channel = resolveChannel(user);
        String title = alertType.getTitle();

        if (channel == NotificationChannel.EMAIL) {
            emailService.sendAlertEmail(user.getEmail(), title, body);
            return;
        }

        notificationService.sendPushNotification(user, title, body, alertType);
    }

    private void saveNotification(User user, AlertType alertType, String body) {
        Notification notification = Notification.builder()
                .user(user)
                .type(alertType)
                .title(alertType.getTitle())
                .body(body)
                .createdAt(LocalDateTime.now())
                .read(false)
                .build();
        notificationRepository.save(notification);
    }

    private NotificationChannel resolveChannel(User user) {
        if (user.getNotificationChannel() == null) {
            return NotificationChannel.PUSH;
        }
        return user.getNotificationChannel();
    }
}
