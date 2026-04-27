package org.fiuba.guitapp.repository;

import org.fiuba.guitapp.model.User;
import org.fiuba.guitapp.model.UserStatus;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.dao.DataIntegrityViolationException;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;

@DataJpaTest
class UserRepositoryTests {

    @Autowired
    private UserRepository userRepository;

    @Test
    void shouldSaveUser() {
        User user = new User();
        user.setEmail("test@example.com");
        user.setPassword("hashed_password");
        user.setStatus(UserStatus.PENDING_VERIFICATION);

        User savedUser = userRepository.save(user);

        assertThat(savedUser.getId()).isNotNull();
        assertThat(savedUser.getEmail()).isEqualTo("test@example.com");
    }

    @Test
    void shouldFindUserByEmail() {
        User user = new User();
        user.setEmail("findme@example.com");
        user.setPassword("password");
        user.setStatus(UserStatus.ACTIVE);
        userRepository.save(user);

        Optional<User> found = userRepository.findByEmail("findme@example.com");

        assertThat(found).isPresent();
        assertThat(found.get().getEmail()).isEqualTo("findme@example.com");
    }

    @Test
    void shouldNotAllowDuplicateEmails() {
        User user1 = new User();
        user1.setEmail("duplicate@example.com");
        user1.setPassword("pass1");
        user1.setStatus(UserStatus.ACTIVE);
        userRepository.save(user1);

        User user2 = new User();
        user2.setEmail("duplicate@example.com");
        user2.setPassword("pass2");
        user2.setStatus(UserStatus.ACTIVE);

        assertThrows(DataIntegrityViolationException.class, () -> {
            userRepository.saveAndFlush(user2);
        });
    }
}
