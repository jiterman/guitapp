package org.fiuba.guitapp.model;

import static org.junit.jupiter.api.Assertions.assertEquals;

import org.junit.jupiter.api.Test;

class NotificationSentStateTest {

    @Test
    void notificationSentState_ShouldContainPendingAndSentValues() {
        assertEquals("PENDING", NotificationSentState.PENDING.name());
        assertEquals("SENT", NotificationSentState.SENT.name());
    }
}
