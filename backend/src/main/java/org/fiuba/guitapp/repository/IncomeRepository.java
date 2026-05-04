package org.fiuba.guitapp.repository;

import java.util.UUID;

import org.fiuba.guitapp.model.Income;
import org.springframework.data.jpa.repository.JpaRepository;

public interface IncomeRepository extends JpaRepository<Income, UUID> {
}
