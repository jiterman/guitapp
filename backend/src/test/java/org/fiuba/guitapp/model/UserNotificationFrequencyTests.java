package org.fiuba.guitapp.model;

import static org.junit.jupiter.api.Assertions.assertEquals;

import org.junit.jupiter.api.Test;

class UserNotificationFrequencyTests {

    @Test
    void newUser_ShouldDefaultNotificationFrequencyToInstant() {
        User user = new User();

        assertEquals(NotificationFrequency.INSTANT, user.getNotificationFrequency());
    }
}
