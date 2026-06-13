package org.fiuba.guitapp.repository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import org.fiuba.guitapp.model.RecurringExpense;
import org.fiuba.guitapp.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RecurringExpenseRepository extends JpaRepository<RecurringExpense, UUID> {

    List<RecurringExpense> findAllByUserOrderByStartDateDesc(User user);

    List<RecurringExpense> findAllByActiveTrueAndNextOccurrenceLessThanEqual(LocalDate date);
}
