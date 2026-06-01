package org.fiuba.guitapp.model;

import static org.junit.jupiter.api.Assertions.*;

import java.time.LocalDateTime;
import java.util.UUID;

import org.junit.jupiter.api.Test;

class NotificationTest {

    @Test
    void testNotificationGettersAndSetters() {
        Notification notification = new Notification();
        User user = new User();
        user.setId(UUID.randomUUID());
        LocalDateTime now = LocalDateTime.now();
        AlertType type = AlertType.FIXED_EXPENSE_THRESHOLD_EXCEEDED;
        String title = "Title";
        String body = "Body";

        notification.setId(1L);
        notification.setUser(user);
        notification.setType(type);
        notification.setTitle(title);
        notification.setBody(body);
        notification.setCreatedAt(now);
        notification.setRead(true);

        assertEquals(1L, notification.getId());
        assertEquals(user, notification.getUser());
        assertEquals(type, notification.getType());
        assertEquals(title, notification.getTitle());
        assertEquals(body, notification.getBody());
        assertEquals(now, notification.getCreatedAt());
        assertTrue(notification.isRead());
    }

    @Test
    void testNotificationBuilder() {
        User user = new User();
        user.setId(UUID.randomUUID());
        LocalDateTime now = LocalDateTime.now();
        AlertType type = AlertType.FIXED_EXPENSE_THRESHOLD_EXCEEDED;

        Notification notification = Notification.builder()
                .id(1L)
                .user(user)
                .type(type)
                .title("Title")
                .body("Body")
                .createdAt(now)
                .read(false)
                .build();

        assertEquals(1L, notification.getId());
        assertEquals(user, notification.getUser());
        assertEquals(type, notification.getType());
        assertEquals("Title", notification.getTitle());
        assertEquals("Body", notification.getBody());
        assertEquals(now, notification.getCreatedAt());
        assertFalse(notification.isRead());
    }

    @Test
    void testNotificationNoArgsConstructor() {
        Notification notification = new Notification();
        assertNotNull(notification);
        assertNull(notification.getId());
        assertNull(notification.getUser());
        assertNull(notification.getType());
        assertNull(notification.getTitle());
        assertNull(notification.getBody());
        assertNull(notification.getCreatedAt());
        assertFalse(notification.isRead());
    }
}
