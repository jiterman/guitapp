package org.fiuba.guitapp.service;

import java.util.ArrayList;
import java.util.List;

import org.fiuba.guitapp.dto.NotificationDigestJobResponse;
import org.fiuba.guitapp.model.AlertType;
import org.fiuba.guitapp.model.NotificationEvent;
import org.fiuba.guitapp.model.NotificationFrequency;
import org.fiuba.guitapp.model.User;
import org.fiuba.guitapp.model.UserStatus;
import org.fiuba.guitapp.repository.NotificationEventRepository;
import org.fiuba.guitapp.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationDigestService {

    private final UserRepository userRepository;
    private final NotificationEventRepository notificationEventRepository;
    private final AlertDeliveryService alertDeliveryService;
    private final NotificationSummarySender notificationSummarySender;

    public NotificationDigestJobResponse processDailySummaries() {
        return runDigestJob(
                NotificationFrequency.DAILY,
                AlertType.DAILY_SUMMARY,
                "Tus notificaciones diarias ya están disponibles");
    }

    public NotificationDigestJobResponse processWeeklySummaries() {
        return runDigestJob(
                NotificationFrequency.WEEKLY,
                AlertType.WEEKLY_SUMMARY,
                "Tus notificaciones de la semana ya están disponibles");
    }

    private NotificationDigestJobResponse runDigestJob(
            NotificationFrequency frequency,
            AlertType summaryType,
            String summaryMessage) {
        PendingEventsResult pendingResult = processPendingEvents(frequency);

        for (User user : pendingResult.usersToNotify()) {
            notificationSummarySender.sendSummary(user, summaryType, summaryMessage);
            log.info("Resumen {} enviado a {}", summaryType, user.getEmail());
        }

        return new NotificationDigestJobResponse(
                pendingResult.usersToNotify().size(),
                pendingResult.eventsProcessed());
    }

    @Transactional
    PendingEventsResult processPendingEvents(NotificationFrequency frequency) {
        List<User> users = userRepository.findByNotificationFrequencyAndStatus(frequency, UserStatus.ACTIVE);
        List<User> usersToNotify = new ArrayList<>();
        int eventsProcessed = 0;

        for (User user : users) {
            List<NotificationEvent> pendingEvents = notificationEventRepository.findByUserAndProcessedFalse(user);
            if (pendingEvents.isEmpty()) {
                continue;
            }

            for (NotificationEvent event : pendingEvents) {
                alertDeliveryService.persistNotification(user, event.getAlertType(), event.getBody());
                event.setProcessed(true);
                eventsProcessed++;
            }
            notificationEventRepository.saveAll(pendingEvents);
            usersToNotify.add(user);
        }

        return new PendingEventsResult(usersToNotify, eventsProcessed);
    }

    private record PendingEventsResult(List<User> usersToNotify, int eventsProcessed) {
    }
}
