package org.fiuba.guitapp.repository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import org.fiuba.guitapp.model.RecurringIncome;
import org.fiuba.guitapp.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RecurringIncomeRepository extends JpaRepository<RecurringIncome, UUID> {

    List<RecurringIncome> findAllByUserOrderByStartDateDesc(User user);

    List<RecurringIncome> findAllByActiveTrueAndNextOccurrenceLessThanEqual(LocalDate date);

}
