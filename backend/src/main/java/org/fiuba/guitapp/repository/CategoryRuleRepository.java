package org.fiuba.guitapp.repository;

import java.util.List;
import java.util.Optional;

import org.fiuba.guitapp.model.CategoryRule;
import org.fiuba.guitapp.model.ExpenseCategory;
import org.fiuba.guitapp.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CategoryRuleRepository extends JpaRepository<CategoryRule, Long> {

    List<CategoryRule> findByUser(User user);

    Optional<CategoryRule> findByUserAndCategory(User user, ExpenseCategory category);
}
