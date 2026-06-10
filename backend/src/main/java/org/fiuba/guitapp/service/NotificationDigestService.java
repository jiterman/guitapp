package org.fiuba.guitapp.service;

import java.util.List;

import org.fiuba.guitapp.model.AlertType;
import org.fiuba.guitapp.model.NotificationFrequency;
import org.fiuba.guitapp.model.User;
import org.fiuba.guitapp.model.UserStatus;
import org.fiuba.guitapp.repository.UserRepository;
import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationDigestService {

    static final String DAILY_SUMMARY_MESSAGE = "¿Cómo va tu día financiero? 👀 Revisá la app para ver tus notificaciones.";

    static final String WEEKLY_SUMMARY_MESSAGE = "¿Cómo vienen los movimientos de la semana? 👀. Revisa la app.";

    private final UserRepository userRepository;
    private final UserNotificationService userNotificationService;
    private final NotificationSummarySender notificationSummarySender;

    public int processDailySummaries() {
        return sendSummaryReminders(
                NotificationFrequency.DAILY, AlertType.DAILY_SUMMARY, DAILY_SUMMARY_MESSAGE);
    }

    public int processWeeklySummaries() {
        return sendSummaryReminders(
                NotificationFrequency.WEEKLY, AlertType.WEEKLY_SUMMARY, WEEKLY_SUMMARY_MESSAGE);
    }

    private int sendSummaryReminders(
            NotificationFrequency frequency, AlertType summaryType, String summaryMessage) {
        List<User> users = userRepository.findByNotificationFrequencyAndStatus(frequency, UserStatus.ACTIVE);

        for (User user : users) {
            userNotificationService.releasePendingNotifications(user);
            notificationSummarySender.sendSummary(user, summaryType, summaryMessage);
            log.info("Recordatorio {} enviado a {}", summaryType, user.getEmail());
        }

        return users.size();
    }
}
