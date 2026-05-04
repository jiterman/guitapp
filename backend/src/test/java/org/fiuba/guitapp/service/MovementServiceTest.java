package org.fiuba.guitapp.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.fiuba.guitapp.dto.MovementResponse;
import org.fiuba.guitapp.model.Expense;
import org.fiuba.guitapp.model.ExpenseCategory;
import org.fiuba.guitapp.model.Income;
import org.fiuba.guitapp.model.IncomeCategory;
import org.fiuba.guitapp.model.User;
import org.fiuba.guitapp.repository.ExpenseRepository;
import org.fiuba.guitapp.repository.IncomeRepository;
import org.fiuba.guitapp.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

class MovementServiceTest {

    @Mock
    private IncomeRepository incomeRepository;

    @Mock
    private ExpenseRepository expenseRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private MovementService movementService;

    private User user;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        user = new User();
        user.setId(UUID.randomUUID());
        user.setEmail("test@example.com");
    }

    @Test
    void returnsMergedAndSortedMovements() {
        when(userRepository.findByEmail(anyString())).thenReturn(Optional.of(user));

        Income income1 = new Income();
        income1.setId(UUID.randomUUID());
        income1.setAmount(BigDecimal.valueOf(100));
        income1.setDescription("Salary");
        income1.setCategory(IncomeCategory.SALARY);
        income1.setDate(LocalDateTime.now().minusDays(1));
        income1.setUser(user);

        Income income2 = new Income();
        income2.setId(UUID.randomUUID());
        income2.setAmount(BigDecimal.valueOf(50));
        income2.setDescription("Gift");
        income2.setCategory(IncomeCategory.OTHER);
        income2.setDate(LocalDateTime.now().minusDays(3));
        income2.setUser(user);

        Expense expense1 = new Expense();
        expense1.setId(UUID.randomUUID());
        expense1.setAmount(BigDecimal.valueOf(25));
        expense1.setDescription("Coffee");
        expense1.setCategory(ExpenseCategory.CAFE);
        expense1.setDate(LocalDateTime.now());
        expense1.setUser(user);

        when(incomeRepository.findAllByUserOrderByDateDesc(user)).thenReturn(List.of(income1, income2));
        when(expenseRepository.findAllByUserOrderByDateDesc(user)).thenReturn(List.of(expense1));

        List<MovementResponse> movements = movementService.getAllMovements(user.getEmail());

        // should contain 3 movements
        assertEquals(3, movements.size());

        // first should be the most recent (expense1)
        MovementResponse first = movements.get(0);
        assertEquals("EXPENSE", first.type());
        assertEquals(expense1.getAmount(), first.amount());

        // check that incomes are present
        boolean hasIncome = movements.stream().anyMatch(m -> "INCOME".equals(m.type()));
        assertTrue(hasIncome);
    }

    @Test
    void handlesEmptyLists() {
        when(userRepository.findByEmail(anyString())).thenReturn(Optional.of(user));
        when(incomeRepository.findAllByUserOrderByDateDesc(user)).thenReturn(new ArrayList<>());
        when(expenseRepository.findAllByUserOrderByDateDesc(user)).thenReturn(new ArrayList<>());

        List<MovementResponse> movements = movementService.getAllMovements(user.getEmail());
        assertEquals(0, movements.size());
    }
}
