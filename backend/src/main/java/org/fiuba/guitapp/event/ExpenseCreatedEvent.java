package org.fiuba.guitapp.event;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public class ExpenseCreatedEvent {

    private final UUID expenseId;
    private final String userEmail;
    private final BigDecimal amount;
    private final LocalDateTime date;
}
