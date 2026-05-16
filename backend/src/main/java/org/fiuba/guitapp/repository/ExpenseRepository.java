package org.fiuba.guitapp.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import org.fiuba.guitapp.model.Expense;
import org.fiuba.guitapp.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ExpenseRepository extends JpaRepository<Expense, UUID> {

    List<Expense> findAllByUserOrderByDateDesc(User user);

    List<Expense> findAllByUserAndDateBetween(User user, LocalDateTime startDate, LocalDateTime endDate);

    List<Expense> findAllByUser(User user);

}
