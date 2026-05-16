package org.fiuba.guitapp.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

import org.fiuba.guitapp.dto.AddExpenseRequest;
import org.fiuba.guitapp.dto.ExpenseCategoryStatistics;
import org.fiuba.guitapp.dto.ExpenseResponse;
import org.fiuba.guitapp.dto.ExpenseStatisticsResponse;
import org.fiuba.guitapp.dto.UpdateExpenseRequest;
import org.fiuba.guitapp.exception.AuthException;
import org.fiuba.guitapp.exception.ErrorCode;
import org.fiuba.guitapp.model.Expense;
import org.fiuba.guitapp.model.ExpenseCategory;
import org.fiuba.guitapp.model.User;
import org.fiuba.guitapp.repository.ExpenseRepository;
import org.fiuba.guitapp.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ExpenseService {

    private final ExpenseRepository expenseRepository;
    private final UserRepository userRepository;

    @SuppressWarnings("null")
    private Expense findUserExpense(String email, UUID expenseId) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AuthException(ErrorCode.USER_NOT_FOUND, "User not found"));

        Expense expense = expenseRepository.findById(expenseId)
                .orElseThrow(() -> new AuthException(ErrorCode.EXPENSE_NOT_FOUND, "Expense not found"));

        if (expense.getUser() == null
                || expense.getUser().getId() == null
                || !expense.getUser().getId().equals(user.getId())) {
            throw new AuthException(ErrorCode.EXPENSE_ACCESS_DENIED, "Expense does not belong to user");
        }

        return expense;
    }

    @Transactional
    public ExpenseResponse addExpense(String email, AddExpenseRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AuthException(ErrorCode.USER_NOT_FOUND, "User not found"));

        Expense expense = new Expense();
        expense.setAmount(request.amount());
        expense.setDescription(request.description());
        expense.setCategory(request.category());
        expense.setType(request.type());
        expense.setDate(LocalDateTime.now());
        expense.setUser(user);

        Expense saved = expenseRepository.save(expense);

        return new ExpenseResponse(
                saved.getId(),
                saved.getAmount(),
                saved.getDescription(),
                saved.getCategory(),
                saved.getType(),
                saved.getDate());
    }

    @SuppressWarnings("null")
    @Transactional
    public void deleteExpense(String email, UUID expenseId) {
        Expense expense = findUserExpense(email, expenseId);
        expenseRepository.delete(expense);
    }

    @Transactional(readOnly = true)
    public ExpenseResponse getExpenseById(String email, UUID expenseId) {
        Expense expense = findUserExpense(email, expenseId);
        return new ExpenseResponse(
                expense.getId(),
                expense.getAmount(),
                expense.getDescription(),
                expense.getCategory(),
                expense.getType(),
                expense.getDate());
    }

    @SuppressWarnings("null")
    @Transactional
    public ExpenseResponse updateExpense(String email, UUID expenseId, UpdateExpenseRequest request) {
        Expense expense = findUserExpense(email, expenseId);

        if (request.amount() != null) {
            expense.setAmount(request.amount());
        }
        if (request.description() != null) {
            expense.setDescription(request.description());
        }
        if (request.category() != null) {
            expense.setCategory(request.category());
        }
        if (request.type() != null) {
            expense.setType(request.type());
        }

        Expense saved = expenseRepository.save(expense);
        return new ExpenseResponse(
                saved.getId(),
                saved.getAmount(),
                saved.getDescription(),
                saved.getCategory(),
                saved.getType(),
                saved.getDate());
    }

    @Transactional(readOnly = true)
    public ExpenseStatisticsResponse getExpenseStatistics(
            String email, String period, Integer year, Integer month, Integer day) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AuthException(ErrorCode.USER_NOT_FOUND, "User not found"));

        List<Expense> expenses = getExpensesByPeriod(user, period, year, month, day);

        BigDecimal totalAmount = expenses.stream()
                .map(Expense::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        Map<ExpenseCategory, List<Expense>> expensesByCategory = expenses.stream()
                .collect(Collectors.groupingBy(Expense::getCategory));

        List<ExpenseCategoryStatistics> categoryStats = expensesByCategory.entrySet()
                .stream()
                .map(entry -> {
                    ExpenseCategory category = entry.getKey();
                    List<Expense> categoryExpenses = entry.getValue();
                    BigDecimal categoryTotal = categoryExpenses.stream()
                            .map(Expense::getAmount)
                            .reduce(BigDecimal.ZERO, BigDecimal::add);
                    Long count = (long) categoryExpenses.size();
                    Double percentage = totalAmount.compareTo(BigDecimal.ZERO) > 0
                            ? categoryTotal.divide(totalAmount, 4, RoundingMode.HALF_UP)
                                    .multiply(new BigDecimal("100"))
                                    .doubleValue()
                            : 0.0;
                    return new ExpenseCategoryStatistics(category, categoryTotal, count, percentage);
                })
                .sorted((a, b) -> b.totalAmount().compareTo(a.totalAmount()))
                .toList();

        return new ExpenseStatisticsResponse(totalAmount, categoryStats);
    }

    private List<Expense> getExpensesByPeriod(
            User user, String period, Integer year, Integer month, Integer day) {
        LocalDateTime referenceDate = buildReferenceDate(year, month, day);
        return switch (period.toLowerCase()) {
        case "daily" -> {
            LocalDateTime startOfDay = referenceDate.toLocalDate().atStartOfDay();
            LocalDateTime endOfDay = startOfDay.plusDays(1);
            yield expenseRepository.findAllByUserAndDateBetween(user, startOfDay, endOfDay);
        }
        case "monthly" -> {
            LocalDateTime startOfMonth = referenceDate.toLocalDate().withDayOfMonth(1).atStartOfDay();
            LocalDateTime endOfMonth = startOfMonth.plusMonths(1);
            yield expenseRepository.findAllByUserAndDateBetween(user, startOfMonth, endOfMonth);
        }
        case "all" -> expenseRepository.findAllByUser(user);
        default -> throw new IllegalArgumentException("Invalid period: " + period);
        };
    }

    private LocalDateTime buildReferenceDate(Integer year, Integer month, Integer day) {
        LocalDate now = LocalDate.now();
        int effectiveYear = year != null ? year : now.getYear();
        int effectiveMonth = month != null ? month : now.getMonthValue();
        int effectiveDay = day != null ? day : now.getDayOfMonth();
        return LocalDate.of(effectiveYear, effectiveMonth, effectiveDay).atStartOfDay();
    }
}
