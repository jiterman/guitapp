package org.fiuba.guitapp.repository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import org.fiuba.guitapp.model.Income;
import org.fiuba.guitapp.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

public interface IncomeRepository extends JpaRepository<Income, UUID> {

    List<Income> findAllByUserOrderByDateDesc(User user);

    List<Income> findAllByUserAndDateBetween(User user, LocalDate startDate, LocalDate endDate);

    List<Income> findAllByUser(User user);

}
