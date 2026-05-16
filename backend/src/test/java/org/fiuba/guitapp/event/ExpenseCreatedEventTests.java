package org.fiuba.guitapp.event;

import static org.junit.jupiter.api.Assertions.assertEquals;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

import org.fiuba.guitapp.model.ExpenseType;
import org.junit.jupiter.api.Test;

class ExpenseCreatedEventTests {

    @Test
    void constructorAndGetters_ShouldWorkCorrectly() {
        UUID expenseId = UUID.randomUUID();
        String userEmail = "test@example.com";
        BigDecimal amount = new BigDecimal("100.00");
        LocalDateTime date = LocalDateTime.now();
        ExpenseType type = ExpenseType.FIXED;

        ExpenseCreatedEvent event = new ExpenseCreatedEvent(expenseId, userEmail, amount, date, type);

        assertEquals(expenseId, event.getExpenseId());
        assertEquals(userEmail, event.getUserEmail());
        assertEquals(amount, event.getAmount());
        assertEquals(date, event.getDate());
        assertEquals(type, event.getType());
    }
}
