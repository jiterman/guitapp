package org.fiuba.guitapp.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Set;

import org.fiuba.guitapp.model.AlertType;
import org.fiuba.guitapp.model.Notification;
import org.fiuba.guitapp.model.NotificationChannel;
import org.fiuba.guitapp.model.NotificationFrequency;
import org.fiuba.guitapp.model.User;
import org.fiuba.guitapp.repository.NotificationRepository;
import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class AlertDeliveryService {

    private static final Set<AlertType> IMMEDIATE_SUMMARY_ALERT_TYPES = Set.of(AlertType.MONTHLY_SUMMARY);

    private final NotificationService notificationService;
    private final EmailService emailService;
    private final NotificationRepository notificationRepository;

    public void deliverAlert(User user, AlertType alertType, String body) {
        if (isAlreadySentThisMonth(user, alertType)) {
            log.info("Notificacion de tipo {} ya enviada este mes para el usuario {}", alertType, user.getEmail());
            return;
        }

        saveNotification(user, alertType, body);

        if (shouldSendImmediately(user, alertType)) {
            sendAlert(user, alertType, body);
        }
    }

    public void deliverSummaryNotification(User user, AlertType alertType, String body) {
        try {
            sendAlert(user, alertType, body);
            log.info("Resumen {} entregado a {}", alertType, user.getEmail());
        } catch (Exception e) {
            log.error(
                    "No se pudo enviar el resumen {} al usuario {}",
                    alertType,
                    user.getEmail(),
                    e);
        }
    }

    private void sendAlert(User user, AlertType alertType, String body) {
        NotificationChannel channel = resolveChannel(user);
        String title = alertType.getTitle();
        if (channel == NotificationChannel.EMAIL) {
            System.out.println("Enviando alerta a " + user.getEmail() + " por canal " + channel);
            emailService.sendAlertEmail(user.getEmail(), title, body);
            return;
        }
        System.out.println("Enviando notificación por canal " + channel);
        notificationService.sendPushNotification(user, title, body, alertType.getLogContext());
    }

    private boolean shouldSendImmediately(User user, AlertType alertType) {
        if (IMMEDIATE_SUMMARY_ALERT_TYPES.contains(alertType)) {
            return true;
        }
        NotificationFrequency frequency = user.getNotificationFrequency();
        if (frequency == null) {
            return true;
        }
        return frequency == NotificationFrequency.INSTANT;
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

    private boolean isAlreadySentThisMonth(User user, AlertType alertType) {
        LocalDateTime startOfMonth = LocalDate.now().withDayOfMonth(1).atStartOfDay();
        LocalDateTime endOfMonth = LocalDateTime.now();
        return notificationRepository.existsByUserAndTypeAndCreatedAtBetween(user, alertType, startOfMonth, endOfMonth);
    }
}
