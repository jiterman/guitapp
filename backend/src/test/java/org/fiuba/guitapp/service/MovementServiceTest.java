package org.fiuba.guitapp.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
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
import org.fiuba.guitapp.exception.AuthException;
import org.fiuba.guitapp.model.Expense;
import org.fiuba.guitapp.model.ExpenseCategory;
import org.fiuba.guitapp.model.ExpenseType;
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
        expense1.setType(ExpenseType.FIXED);
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
        assertEquals("FIXED", first.expenseType());
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

    @Test
        void throwsWhenUserNotFound() {
        when(userRepository.findByEmail(anyString())).thenReturn(Optional.empty());

        assertThrows(AuthException.class, () -> movementService.getAllMovements(user.getEmail()));
        assertThrows(AuthException.class,
            () -> movementService.getMovementsByDay(user.getEmail(), LocalDateTime.now().toLocalDate()));
        assertThrows(AuthException.class,
            () -> movementService.getMovementsByMonth(user.getEmail(), 2026, 5));
        assertThrows(AuthException.class,
            () -> movementService.getMovementsByYear(user.getEmail(), 2026));
        }

    @Test
    void getMovementsByDayMonthYear() {
        when(userRepository.findByEmail(anyString())).thenReturn(Optional.of(user));

        LocalDateTime now = LocalDateTime.now();

        Income income = new Income();
        income.setId(UUID.randomUUID());
        income.setAmount(BigDecimal.valueOf(200));
        income.setDescription("Freelance");
        income.setCategory(IncomeCategory.FREELANCE);
        income.setDate(now);
        income.setUser(user);

        Expense expense = new Expense();
        expense.setId(UUID.randomUUID());
        expense.setAmount(BigDecimal.valueOf(10));
        expense.setDescription("Snack");
        expense.setCategory(org.fiuba.guitapp.model.ExpenseCategory.CAFE);
        expense.setType(ExpenseType.VARIABLE);
        expense.setDate(now.minusMonths(1));
        expense.setUser(user);

        when(incomeRepository.findAllByUserOrderByDateDesc(user)).thenReturn(List.of(income));
        when(expenseRepository.findAllByUserOrderByDateDesc(user)).thenReturn(List.of(expense));

        // by day -> should include income only
        List<MovementResponse> day = movementService.getMovementsByDay(user.getEmail(), now.toLocalDate());
        assertEquals(1, day.size());

        // by month -> income in current month (month of 'now'), expense in previous month
        List<MovementResponse> month = movementService.getMovementsByMonth(user.getEmail(), now.getYear(), now.getMonthValue());
        assertEquals(1, month.size());

        // by year -> both (same year)
        List<MovementResponse> year = movementService.getMovementsByYear(user.getEmail(), now.getYear());
        assertEquals(2, year.size());
    }

    @Test
    void getMovementsByDayFiltersAndSorts() {
        when(userRepository.findByEmail(anyString())).thenReturn(Optional.of(user));

        LocalDateTime base = LocalDateTime.of(2026, 5, 10, 10, 0);

        Income incomeMatch = new Income();
        incomeMatch.setId(UUID.randomUUID());
        incomeMatch.setAmount(BigDecimal.valueOf(120));
        incomeMatch.setDescription("Bonus");
        incomeMatch.setCategory(IncomeCategory.OTHER);
        incomeMatch.setDate(base.plusHours(1));
        incomeMatch.setUser(user);

        Income incomeOther = new Income();
        incomeOther.setId(UUID.randomUUID());
        incomeOther.setAmount(BigDecimal.valueOf(80));
        incomeOther.setDescription("Old");
        incomeOther.setCategory(IncomeCategory.SALARY);
        incomeOther.setDate(base.minusDays(1));
        incomeOther.setUser(user);

        Expense expenseMatch = new Expense();
        expenseMatch.setId(UUID.randomUUID());
        expenseMatch.setAmount(BigDecimal.valueOf(20));
        expenseMatch.setDescription("Lunch");
        expenseMatch.setCategory(ExpenseCategory.CAFE);
        expenseMatch.setType(ExpenseType.VARIABLE);
        expenseMatch.setDate(base.plusHours(2));
        expenseMatch.setUser(user);

        Expense expenseOther = new Expense();
        expenseOther.setId(UUID.randomUUID());
        expenseOther.setAmount(BigDecimal.valueOf(5));
        expenseOther.setDescription("Snack");
        expenseOther.setCategory(ExpenseCategory.CAFE);
        expenseOther.setType(ExpenseType.FIXED);
        expenseOther.setDate(base.minusDays(2));
        expenseOther.setUser(user);

        when(incomeRepository.findAllByUserOrderByDateDesc(user)).thenReturn(List.of(incomeMatch, incomeOther));
        when(expenseRepository.findAllByUserOrderByDateDesc(user))
                .thenReturn(List.of(expenseMatch, expenseOther));

        List<MovementResponse> day = movementService.getMovementsByDay(user.getEmail(), base.toLocalDate());

        assertEquals(2, day.size());
        assertEquals("EXPENSE", day.get(0).type());
        assertEquals(expenseMatch.getAmount(), day.get(0).amount());
        assertEquals("INCOME", day.get(1).type());
        assertEquals(incomeMatch.getAmount(), day.get(1).amount());
    }

    @Test
    void getMovementsByMonthFiltersBothTypes() {
        when(userRepository.findByEmail(anyString())).thenReturn(Optional.of(user));

        LocalDateTime base = LocalDateTime.of(2026, 5, 15, 9, 0);

        Income incomeMatch = new Income();
        incomeMatch.setId(UUID.randomUUID());
        incomeMatch.setAmount(BigDecimal.valueOf(150));
        incomeMatch.setDescription("Project");
        incomeMatch.setCategory(IncomeCategory.FREELANCE);
        incomeMatch.setDate(base.plusDays(1));
        incomeMatch.setUser(user);

        Income incomeOther = new Income();
        incomeOther.setId(UUID.randomUUID());
        incomeOther.setAmount(BigDecimal.valueOf(70));
        incomeOther.setDescription("Past");
        incomeOther.setCategory(IncomeCategory.OTHER);
        incomeOther.setDate(base.minusMonths(2));
        incomeOther.setUser(user);

        Expense expenseMatch = new Expense();
        expenseMatch.setId(UUID.randomUUID());
        expenseMatch.setAmount(BigDecimal.valueOf(30));
        expenseMatch.setDescription("Transport");
        expenseMatch.setCategory(ExpenseCategory.PUBLIC_TRANSPORT);
        expenseMatch.setType(ExpenseType.FIXED);
        expenseMatch.setDate(base);
        expenseMatch.setUser(user);

        Expense expenseOther = new Expense();
        expenseOther.setId(UUID.randomUUID());
        expenseOther.setAmount(BigDecimal.valueOf(12));
        expenseOther.setDescription("Old ride");
        expenseOther.setCategory(ExpenseCategory.PUBLIC_TRANSPORT);
        expenseOther.setType(ExpenseType.VARIABLE);
        expenseOther.setDate(base.minusMonths(1));
        expenseOther.setUser(user);

        when(incomeRepository.findAllByUserOrderByDateDesc(user)).thenReturn(List.of(incomeMatch, incomeOther));
        when(expenseRepository.findAllByUserOrderByDateDesc(user))
                .thenReturn(List.of(expenseMatch, expenseOther));

        List<MovementResponse> month = movementService.getMovementsByMonth(user.getEmail(), 2026, 5);

        assertEquals(2, month.size());
        assertEquals("INCOME", month.get(0).type());
        assertEquals(incomeMatch.getAmount(), month.get(0).amount());
        assertEquals("EXPENSE", month.get(1).type());
        assertEquals(expenseMatch.getAmount(), month.get(1).amount());
    }

    @Test
    void getMovementsByYearFiltersBothTypes() {
        when(userRepository.findByEmail(anyString())).thenReturn(Optional.of(user));

        LocalDateTime base = LocalDateTime.of(2026, 3, 20, 14, 0);

        Income incomeMatch = new Income();
        incomeMatch.setId(UUID.randomUUID());
        incomeMatch.setAmount(BigDecimal.valueOf(90));
        incomeMatch.setDescription("Sale");
        incomeMatch.setCategory(IncomeCategory.OTHER);
        incomeMatch.setDate(base);
        incomeMatch.setUser(user);

        Income incomeOther = new Income();
        incomeOther.setId(UUID.randomUUID());
        incomeOther.setAmount(BigDecimal.valueOf(40));
        incomeOther.setDescription("Old sale");
        incomeOther.setCategory(IncomeCategory.OTHER);
        incomeOther.setDate(base.minusYears(1));
        incomeOther.setUser(user);

        Expense expenseMatch = new Expense();
        expenseMatch.setId(UUID.randomUUID());
        expenseMatch.setAmount(BigDecimal.valueOf(22));
        expenseMatch.setDescription("Books");
        expenseMatch.setCategory(ExpenseCategory.EDUCATION);
        expenseMatch.setType(ExpenseType.FIXED);
        expenseMatch.setDate(base.plusDays(2));
        expenseMatch.setUser(user);

        Expense expenseOther = new Expense();
        expenseOther.setId(UUID.randomUUID());
        expenseOther.setAmount(BigDecimal.valueOf(18));
        expenseOther.setDescription("Old books");
        expenseOther.setCategory(ExpenseCategory.EDUCATION);
        expenseOther.setType(ExpenseType.VARIABLE);
        expenseOther.setDate(base.minusYears(2));
        expenseOther.setUser(user);

        when(incomeRepository.findAllByUserOrderByDateDesc(user)).thenReturn(List.of(incomeMatch, incomeOther));
        when(expenseRepository.findAllByUserOrderByDateDesc(user))
                .thenReturn(List.of(expenseMatch, expenseOther));

        List<MovementResponse> year = movementService.getMovementsByYear(user.getEmail(), 2026);

        assertEquals(2, year.size());
        assertEquals("EXPENSE", year.get(0).type());
        assertEquals(expenseMatch.getAmount(), year.get(0).amount());
        assertEquals("INCOME", year.get(1).type());
        assertEquals(incomeMatch.getAmount(), year.get(1).amount());
    }
}
