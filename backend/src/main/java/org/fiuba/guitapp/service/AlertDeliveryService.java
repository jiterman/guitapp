package org.fiuba.guitapp.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Set;

import org.fiuba.guitapp.model.AlertType;
import org.fiuba.guitapp.model.Notification;
import org.fiuba.guitapp.model.NotificationChannel;
import org.fiuba.guitapp.model.NotificationEvent;
import org.fiuba.guitapp.model.NotificationFrequency;
import org.fiuba.guitapp.model.User;
import org.fiuba.guitapp.repository.NotificationEventRepository;
import org.fiuba.guitapp.repository.NotificationRepository;
import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class AlertDeliveryService {

    private static final Set<AlertType> SUMMARY_ALERT_TYPES = Set.of(
            AlertType.MONTHLY_SUMMARY,
            AlertType.DAILY_SUMMARY,
            AlertType.WEEKLY_SUMMARY);

    private final NotificationService notificationService;
    private final EmailService emailService;
    private final NotificationRepository notificationRepository;
    private final NotificationEventRepository notificationEventRepository;

    public void deliverAlert(User user, AlertType alertType, String body) {
        if (isAlreadySentThisMonth(user, alertType)) {
            log.info("Notificacion de tipo {} ya enviada este mes para el usuario {}", alertType, user.getEmail());
            return;
        }

        if (shouldDeferInstantAlert(user, alertType)) {
            recordPendingEvent(user, alertType, body);
            return;
        }

        deliverImmediately(user, alertType, body);
    }

    public void persistNotification(User user, AlertType alertType, String body) {
        saveNotification(user, alertType, body);
    }

    public void deliverSummaryNotification(User user, AlertType alertType, String body) {
        try {
            deliverSummaryImmediately(user, alertType, body);
            log.info("Resumen {} entregado a {}", alertType, user.getEmail());
        } catch (Exception e) {
            log.error(
                    "No se pudo enviar el resumen {} al usuario {}",
                    alertType,
                    user.getEmail(),
                    e);
        }
    }

    private void deliverImmediately(User user, AlertType alertType, String body) {
        saveNotification(user, alertType, body);

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

    private void deliverSummaryImmediately(User user, AlertType alertType, String body) {
        NotificationChannel channel = resolveChannel(user);
        String title = alertType.getTitle();
        if (channel == NotificationChannel.EMAIL) {
            emailService.sendAlertEmail(user.getEmail(), title, body);
            return;
        }
        notificationService.sendPushNotification(user, title, body, alertType.getLogContext());
    }

    private boolean shouldDeferInstantAlert(User user, AlertType alertType) {
        if (SUMMARY_ALERT_TYPES.contains(alertType)) {
            return false;
        }
        NotificationFrequency frequency = user.getNotificationFrequency();
        if (frequency == null) {
            frequency = NotificationFrequency.INSTANT;
        }
        return frequency != NotificationFrequency.INSTANT;
    }

    private void recordPendingEvent(User user, AlertType alertType, String body) {
        NotificationEvent event = NotificationEvent.builder()
                .user(user)
                .alertType(alertType)
                .body(body)
                .createdAt(LocalDateTime.now())
                .processed(false)
                .build();
        notificationEventRepository.save(event);
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
