package org.fiuba.guitapp.service;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import org.fiuba.guitapp.dto.AddRecurringExpenseRequest;
import org.fiuba.guitapp.dto.RecurringExpenseResponse;
import org.fiuba.guitapp.dto.UpdateRecurringExpenseRequest;
import org.fiuba.guitapp.exception.AuthException;
import org.fiuba.guitapp.exception.ErrorCode;
import org.fiuba.guitapp.model.RecurringExpense;
import org.fiuba.guitapp.model.User;
import org.fiuba.guitapp.repository.RecurringExpenseRepository;
import org.fiuba.guitapp.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class RecurringExpenseService {

    private final RecurringExpenseRepository recurringExpenseRepository;
    private final UserRepository userRepository;

    @SuppressWarnings("null")
    private RecurringExpense findUserRecurringExpense(String email, UUID recurringExpenseId) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AuthException(ErrorCode.USER_NOT_FOUND, "User not found"));

        RecurringExpense recurringExpense = recurringExpenseRepository.findById(recurringExpenseId)
                .orElseThrow(() -> new AuthException(
                        ErrorCode.RECURRING_EXPENSE_NOT_FOUND, "Recurring expense not found"));

        if (recurringExpense.getUser() == null
                || recurringExpense.getUser().getId() == null
                || !recurringExpense.getUser().getId().equals(user.getId())) {
            throw new AuthException(
                    ErrorCode.RECURRING_EXPENSE_ACCESS_DENIED, "Recurring expense does not belong to user");
        }

        return recurringExpense;
    }

    @Transactional
    public RecurringExpenseResponse addRecurringExpense(String email, AddRecurringExpenseRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AuthException(ErrorCode.USER_NOT_FOUND, "User not found"));

        RecurringExpense recurringExpense = new RecurringExpense();
        recurringExpense.setAmount(request.amount());
        recurringExpense.setTitle(request.title());
        recurringExpense.setDescription(request.description());
        recurringExpense.setCategory(request.category());
        recurringExpense.setType(request.type());
        recurringExpense.setFrequency(request.frequency());
        recurringExpense.setStartDate(request.startDate());
        recurringExpense.setEndDate(request.endDate());
        recurringExpense.setActive(true);
        recurringExpense.setNextOccurrence(RecurrenceCalculator.firstOccurrenceOnOrAfter(
                request.startDate(), request.frequency(), LocalDate.now()));
        recurringExpense.setUser(user);

        RecurringExpense saved = recurringExpenseRepository.save(recurringExpense);
        return toResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<RecurringExpenseResponse> getRecurringExpenses(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AuthException(ErrorCode.USER_NOT_FOUND, "User not found"));

        return recurringExpenseRepository.findAllByUserOrderByStartDateDesc(user)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public RecurringExpenseResponse getRecurringExpenseById(String email, UUID recurringExpenseId) {
        return toResponse(findUserRecurringExpense(email, recurringExpenseId));
    }

    @SuppressWarnings("null")
    @Transactional
    public RecurringExpenseResponse updateRecurringExpense(
            String email, UUID recurringExpenseId, UpdateRecurringExpenseRequest request) {
        RecurringExpense recurringExpense = findUserRecurringExpense(email, recurringExpenseId);

        if (request.amount() != null) {
            recurringExpense.setAmount(request.amount());
        }
        if (request.title() != null) {
            recurringExpense.setTitle(request.title().isBlank() ? null : request.title());
        }
        if (request.description() != null) {
            recurringExpense.setDescription(request.description().isBlank() ? null : request.description());
        }
        if (request.category() != null) {
            recurringExpense.setCategory(request.category());
        }
        if (request.type() != null) {
            recurringExpense.setType(request.type());
        }
        if (request.active() != null) {
            recurringExpense.setActive(request.active());
        }

        boolean scheduleChanged = request.startDate() != null || request.frequency() != null;
        if (request.startDate() != null) {
            recurringExpense.setStartDate(request.startDate());
        }
        if (request.frequency() != null) {
            recurringExpense.setFrequency(request.frequency());
        }
        if (request.endDate() != null) {
            recurringExpense.setEndDate(request.endDate());
        }
        if (scheduleChanged) {
            recurringExpense.setNextOccurrence(RecurrenceCalculator.firstOccurrenceOnOrAfter(
                    recurringExpense.getStartDate(), recurringExpense.getFrequency(), LocalDate.now()));
        }

        RecurringExpense saved = recurringExpenseRepository.save(recurringExpense);
        return toResponse(saved);
    }

    @SuppressWarnings("null")
    @Transactional
    public void deleteRecurringExpense(String email, UUID recurringExpenseId) {
        RecurringExpense recurringExpense = findUserRecurringExpense(email, recurringExpenseId);
        recurringExpenseRepository.delete(recurringExpense);
    }

    private RecurringExpenseResponse toResponse(RecurringExpense recurringExpense) {
        return new RecurringExpenseResponse(
                recurringExpense.getId(),
                recurringExpense.getAmount(),
                recurringExpense.getTitle(),
                recurringExpense.getDescription(),
                recurringExpense.getCategory(),
                recurringExpense.getType(),
                recurringExpense.getFrequency(),
                recurringExpense.getStartDate(),
                recurringExpense.getEndDate(),
                recurringExpense.getNextOccurrence(),
                recurringExpense.isActive());
    }
}
