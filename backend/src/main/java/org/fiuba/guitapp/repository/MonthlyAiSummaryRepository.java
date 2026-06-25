package org.fiuba.guitapp.repository;

import java.util.Optional;

import org.fiuba.guitapp.model.MonthlyAiSummary;
import org.fiuba.guitapp.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MonthlyAiSummaryRepository extends JpaRepository<MonthlyAiSummary, Long> {

    Optional<MonthlyAiSummary> findByUserAndYearAndMonth(User user, int year, int month);
}
