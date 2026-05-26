package org.fiuba.guitapp.dto;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ExpenseEvent implements Serializable {

    private UUID expenseId;
    private String userEmail;
    private BigDecimal amount;
    private LocalDateTime date;
}
