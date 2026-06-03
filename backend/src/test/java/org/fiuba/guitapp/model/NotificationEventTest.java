package org.fiuba.guitapp.model;

import static org.junit.jupiter.api.Assertions.*;

import java.time.LocalDateTime;
import java.util.UUID;

import org.junit.jupiter.api.Test;

class NotificationEventTest {

    @Test
    void testNotificationEventGettersAndSetters() {
        NotificationEvent event = new NotificationEvent();
        User user = new User();
        user.setId(UUID.randomUUID());
        LocalDateTime now = LocalDateTime.now();
        AlertType alertType = AlertType.CATEGORY_OVERSPENDING;
        String body = "Event body";

        event.setId(1L);
        event.setUser(user);
        event.setAlertType(alertType);
        event.setBody(body);
        event.setCreatedAt(now);
        event.setProcessed(true);

        assertEquals(1L, event.getId());
        assertEquals(user, event.getUser());
        assertEquals(alertType, event.getAlertType());
        assertEquals(body, event.getBody());
        assertEquals(now, event.getCreatedAt());
        assertTrue(event.isProcessed());
    }

    @Test
    void testNotificationEventBuilder() {
        User user = new User();
        user.setId(UUID.randomUUID());
        LocalDateTime now = LocalDateTime.now();
        AlertType alertType = AlertType.SAVINGS_GOAL_AT_RISK;

        NotificationEvent event = NotificationEvent.builder()
                .id(2L)
                .user(user)
                .alertType(alertType)
                .body("Builder event body")
                .createdAt(now)
                .processed(false)
                .build();

        assertEquals(2L, event.getId());
        assertEquals(user, event.getUser());
        assertEquals(alertType, event.getAlertType());
        assertEquals("Builder event body", event.getBody());
        assertEquals(now, event.getCreatedAt());
        assertFalse(event.isProcessed());
    }

    @Test
    void testNotificationEventNoArgsConstructor() {
        NotificationEvent event = new NotificationEvent();
        assertNotNull(event);
        assertNull(event.getId());
        assertNull(event.getUser());
        assertNull(event.getAlertType());
        assertNull(event.getBody());
        assertNull(event.getCreatedAt());
        assertFalse(event.isProcessed());
    }
}
