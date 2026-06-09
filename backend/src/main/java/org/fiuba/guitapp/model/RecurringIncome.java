package org.fiuba.guitapp.model;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "recurring_incomes")
public class RecurringIncome {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @NotNull
    @Positive
    @Column(nullable = false)
    private BigDecimal amount;

    @Column
    private String description;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private IncomeCategory category;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RecurrenceFrequency frequency;

    @NotNull
    @Column(nullable = false)
    private LocalDate startDate;

    @Column
    private LocalDate endDate;

    @NotNull
    @Column(nullable = false)
    private LocalDate nextOccurrence;

    @NotNull
    @Column(nullable = false)
    private boolean active = true;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
}
