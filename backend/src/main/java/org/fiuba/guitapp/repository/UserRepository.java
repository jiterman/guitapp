package org.fiuba.guitapp.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.fiuba.guitapp.model.NotificationFrequency;
import org.fiuba.guitapp.model.User;
import org.fiuba.guitapp.model.UserStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {

    Optional<User> findByEmail(String email);

    List<User> findByNotificationFrequencyAndStatus(NotificationFrequency notificationFrequency, UserStatus status);
}
