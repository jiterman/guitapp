package org.fiuba.guitapp.service;

import java.util.List;

import org.fiuba.guitapp.dto.NotificationDigestJobResponse;
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

    private final UserRepository userRepository;
    private final NotificationSummarySender notificationSummarySender;

    public NotificationDigestJobResponse processDailySummaries() {
        return runSummaryReminderJob(
                NotificationFrequency.DAILY,
                AlertType.DAILY_SUMMARY,
                "No dejes los gastos de hoy sin registrar👀. Revisa tus movimientos.");
    }

    public NotificationDigestJobResponse processWeeklySummaries() {
        return runSummaryReminderJob(
                NotificationFrequency.WEEKLY,
                AlertType.WEEKLY_SUMMARY,
                "¿Cómo vienen los movimientos de la semana? 👀. Revisa la app.");
    }

    private NotificationDigestJobResponse runSummaryReminderJob(
            NotificationFrequency frequency,
            AlertType summaryType,
            String summaryMessage) {
        List<User> users = userRepository.findByNotificationFrequencyAndStatus(frequency, UserStatus.ACTIVE);

        for (User user : users) {
            notificationSummarySender.sendSummary(user, summaryType, summaryMessage);
            log.info("Resumen {} enviado a {}", summaryType, user.getEmail());
        }

        return new NotificationDigestJobResponse(users.size());
    }
}
