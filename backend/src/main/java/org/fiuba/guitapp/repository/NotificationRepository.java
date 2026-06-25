package org.fiuba.guitapp.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.fiuba.guitapp.model.AlertType;
import org.fiuba.guitapp.model.Notification;
import org.fiuba.guitapp.model.NotificationSentState;
import org.fiuba.guitapp.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    List<Notification> findByUserAndSentStateOrderByCreatedAtDesc(User user, NotificationSentState sentState);

    List<Notification> findByUserAndSentState(User user, NotificationSentState sentState);

    long countByUserAndReadFalseAndSentState(User user, NotificationSentState sentState);

    boolean existsByUserAndTypeAndCreatedAtBetween(User user, AlertType type, LocalDateTime start, LocalDateTime end);

    void deleteByUser(User user);
}
