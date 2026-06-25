package org.fiuba.guitapp.service;

import java.util.List;

import org.fiuba.guitapp.model.Notification;
import org.fiuba.guitapp.model.NotificationSentState;
import org.fiuba.guitapp.model.User;
import org.fiuba.guitapp.repository.NotificationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserNotificationService {

    private final NotificationRepository notificationRepository;

    public List<Notification> getNotificationsForUser(User user) {
        return notificationRepository.findByUserAndSentStateOrderByCreatedAtDesc(user, NotificationSentState.SENT);
    }

    public long getUnreadCount(User user) {
        return notificationRepository.countByUserAndReadFalseAndSentState(user, NotificationSentState.SENT);
    }

    @Transactional
    public void releasePendingNotifications(User user) {
        List<Notification> pendingNotifications = notificationRepository.findByUserAndSentState(user, NotificationSentState.PENDING);
        pendingNotifications.forEach(notification -> notification.setSentState(NotificationSentState.SENT));
        notificationRepository.saveAll(pendingNotifications);
    }

    @Transactional
    public void markAsRead(Long notificationId, User user) {
        notificationRepository.findById(notificationId).ifPresent(notification -> {
            if (notification.getUser().getId().equals(user.getId())) {
                notification.setRead(true);
                notificationRepository.save(notification);
            }
        });
    }

    @Transactional
    public void deleteAllNotificationsForUser(User user) {
        notificationRepository.deleteByUser(user);
    }

    @Transactional
    public void markAllAsRead(User user) {
        List<Notification> unread = notificationRepository
                .findByUserAndSentStateOrderByCreatedAtDesc(user, NotificationSentState.SENT)
                .stream()
                .filter(notification -> !notification.isRead())
                .toList();
        unread.forEach(notification -> notification.setRead(true));
        notificationRepository.saveAll(unread);
    }
}
