package org.fiuba.guitapp.service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

import org.fiuba.guitapp.dto.MovementResponse;
import org.fiuba.guitapp.exception.AuthException;
import org.fiuba.guitapp.exception.ErrorCode;
import org.fiuba.guitapp.model.Expense;
import org.fiuba.guitapp.model.Income;
import org.fiuba.guitapp.model.User;
import org.fiuba.guitapp.repository.ExpenseRepository;
import org.fiuba.guitapp.repository.IncomeRepository;
import org.fiuba.guitapp.repository.UserRepository;
import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class MovementService {

    private final IncomeRepository incomeRepository;
    private final ExpenseRepository expenseRepository;
    private final UserRepository userRepository;

    public List<MovementResponse> getAllMovements(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AuthException(ErrorCode.USER_NOT_FOUND, "User not found"));

        List<Income> incomes = incomeRepository.findAllByUserOrderByDateDesc(user);
        List<Expense> expenses = expenseRepository.findAllByUserOrderByDateDesc(user);

        List<MovementResponse> movements = new ArrayList<>();

        for (Income i : incomes) {
            movements.add(new MovementResponse(
                    i.getId(),
                    "INCOME",
                    i.getAmount(),
                    i.getDescription(),
                    i.getCategory().name(),
                    null,
                    i.getDate()));
        }

        for (Expense e : expenses) {
            movements.add(new MovementResponse(
                    e.getId(),
                    "EXPENSE",
                    e.getAmount(),
                    e.getDescription(),
                    e.getCategory().name(),
                    e.getType().name(),
                    e.getDate()));
        }

        movements.sort(Comparator.comparing(MovementResponse::date).reversed());

        return movements;
    }

    public List<MovementResponse> getMovementsByDay(String email, java.time.LocalDate day) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AuthException(ErrorCode.USER_NOT_FOUND, "User not found"));

        List<Income> incomes = incomeRepository.findAllByUserOrderByDateDesc(user);
        List<Expense> expenses = expenseRepository.findAllByUserOrderByDateDesc(user);

        List<MovementResponse> movements = new ArrayList<>();

        for (Income i : incomes) {
            if (i.getDate().toLocalDate().equals(day)) {
                movements.add(new MovementResponse(
                        i.getId(),
                        "INCOME",
                        i.getAmount(),
                        i.getDescription(),
                        i.getCategory().name(),
                        null,
                        i.getDate()));
            }
        }

        for (Expense e : expenses) {
            if (e.getDate().toLocalDate().equals(day)) {
                movements.add(new MovementResponse(
                        e.getId(),
                        "EXPENSE",
                        e.getAmount(),
                        e.getDescription(),
                        e.getCategory().name(),
                        e.getType().name(),
                        e.getDate()));
            }
        }

        movements.sort(Comparator.comparing(MovementResponse::date).reversed());
        return movements;
    }

    public List<MovementResponse> getMovementsByMonth(String email, int year, int month) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AuthException(ErrorCode.USER_NOT_FOUND, "User not found"));

        List<Income> incomes = incomeRepository.findAllByUserOrderByDateDesc(user);
        List<Expense> expenses = expenseRepository.findAllByUserOrderByDateDesc(user);

        List<MovementResponse> movements = new ArrayList<>();

        for (Income i : incomes) {
            if (i.getDate().getYear() == year && i.getDate().getMonthValue() == month) {
                movements.add(new MovementResponse(
                        i.getId(),
                        "INCOME",
                        i.getAmount(),
                        i.getDescription(),
                        i.getCategory().name(),
                        null,
                        i.getDate()));
            }
        }

        for (Expense e : expenses) {
            if (e.getDate().getYear() == year && e.getDate().getMonthValue() == month) {
                movements.add(new MovementResponse(
                        e.getId(),
                        "EXPENSE",
                        e.getAmount(),
                        e.getDescription(),
                        e.getCategory().name(),
                        e.getType().name(),
                        e.getDate()));
            }
        }

        movements.sort(Comparator.comparing(MovementResponse::date).reversed());
        return movements;
    }

    public List<MovementResponse> getMovementsByYear(String email, int year) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AuthException(ErrorCode.USER_NOT_FOUND, "User not found"));

        List<Income> incomes = incomeRepository.findAllByUserOrderByDateDesc(user);
        List<Expense> expenses = expenseRepository.findAllByUserOrderByDateDesc(user);

        List<MovementResponse> movements = new ArrayList<>();

        for (Income i : incomes) {
            if (i.getDate().getYear() == year) {
                movements.add(new MovementResponse(
                        i.getId(),
                        "INCOME",
                        i.getAmount(),
                        i.getDescription(),
                        i.getCategory().name(),
                        null,
                        i.getDate()));
            }
        }

        for (Expense e : expenses) {
            if (e.getDate().getYear() == year) {
                movements.add(new MovementResponse(
                        e.getId(),
                        "EXPENSE",
                        e.getAmount(),
                        e.getDescription(),
                        e.getCategory().name(),
                        e.getType().name(),
                        e.getDate()));
            }
        }

        movements.sort(Comparator.comparing(MovementResponse::date).reversed());
        return movements;
    }
}
