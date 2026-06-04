package org.fiuba.guitapp.service;

import org.fiuba.guitapp.model.AlertType;
import org.fiuba.guitapp.model.User;
import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;

/**
 * Sends digest summary push/email reminders without persisting new Notification records.
 */
@Service
@RequiredArgsConstructor
public class NotificationSummarySender {

    private final AlertDeliveryService alertDeliveryService;

    public void sendSummary(User user, AlertType summaryType, String summaryMessage) {
        alertDeliveryService.deliverSummaryNotification(user, summaryType, summaryMessage);
    }
}
