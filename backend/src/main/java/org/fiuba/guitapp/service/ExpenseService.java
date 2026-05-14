package org.fiuba.guitapp.service;

import java.time.LocalDateTime;
import java.util.UUID;

import org.fiuba.guitapp.dto.AddExpenseRequest;
import org.fiuba.guitapp.dto.ExpenseResponse;
import org.fiuba.guitapp.dto.UpdateExpenseRequest;
import org.fiuba.guitapp.event.ExpenseCreatedEvent;
import org.fiuba.guitapp.exception.AuthException;
import org.fiuba.guitapp.exception.ErrorCode;
import org.fiuba.guitapp.model.Expense;
import org.fiuba.guitapp.model.User;
import org.fiuba.guitapp.repository.ExpenseRepository;
import org.fiuba.guitapp.repository.UserRepository;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ExpenseService {

    private final ExpenseRepository expenseRepository;
    private final UserRepository userRepository;
    private final ApplicationEventPublisher applicationEventPublisher;

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

        applicationEventPublisher.publishEvent(new ExpenseCreatedEvent(
                saved.getId(),
                user.getEmail(),
                saved.getAmount(),
                saved.getDate()));

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
}
