package org.fiuba.guitapp.repository;

import java.util.UUID;

import org.fiuba.guitapp.model.Expense;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ExpenseRepository extends JpaRepository<Expense, UUID> {
}
