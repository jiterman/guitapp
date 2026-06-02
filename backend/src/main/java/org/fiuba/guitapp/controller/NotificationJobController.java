package org.fiuba.guitapp.controller;

import org.fiuba.guitapp.dto.NotificationDigestJobResponse;
import org.fiuba.guitapp.service.NotificationDigestService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationJobController {

    private final NotificationDigestService notificationDigestService;

    @PostMapping("/daily/notify")
    public ResponseEntity<NotificationDigestJobResponse> sendDailySummaryNotifications() {
        NotificationDigestJobResponse response = notificationDigestService.processDailySummaries();
        return ResponseEntity.ok(response);
    }

    @PostMapping("/weekly/notify")
    public ResponseEntity<NotificationDigestJobResponse> sendWeeklySummaryNotifications() {
        NotificationDigestJobResponse response = notificationDigestService.processWeeklySummaries();
        return ResponseEntity.ok(response);
    }
}
