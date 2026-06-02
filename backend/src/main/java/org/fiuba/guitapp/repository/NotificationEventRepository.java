package org.fiuba.guitapp.repository;

import java.util.List;

import org.fiuba.guitapp.model.NotificationEvent;
import org.fiuba.guitapp.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface NotificationEventRepository extends JpaRepository<NotificationEvent, Long> {

    List<NotificationEvent> findByUserAndProcessedFalse(User user);
}
