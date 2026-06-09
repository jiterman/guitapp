package org.fiuba.guitapp.service;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import org.fiuba.guitapp.dto.AddRecurringIncomeRequest;
import org.fiuba.guitapp.dto.RecurringIncomeResponse;
import org.fiuba.guitapp.dto.UpdateRecurringIncomeRequest;
import org.fiuba.guitapp.exception.AuthException;
import org.fiuba.guitapp.exception.ErrorCode;
import org.fiuba.guitapp.model.RecurringIncome;
import org.fiuba.guitapp.model.User;
import org.fiuba.guitapp.repository.RecurringIncomeRepository;
import org.fiuba.guitapp.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class RecurringIncomeService {

    private final RecurringIncomeRepository recurringIncomeRepository;
    private final UserRepository userRepository;

    @SuppressWarnings("null")
    private RecurringIncome findUserRecurringIncome(String email, UUID recurringIncomeId) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AuthException(ErrorCode.USER_NOT_FOUND, "User not found"));

        RecurringIncome recurringIncome = recurringIncomeRepository.findById(recurringIncomeId)
                .orElseThrow(() -> new AuthException(
                        ErrorCode.RECURRING_INCOME_NOT_FOUND, "Recurring income not found"));

        if (recurringIncome.getUser() == null
                || recurringIncome.getUser().getId() == null
                || !recurringIncome.getUser().getId().equals(user.getId())) {
            throw new AuthException(
                    ErrorCode.RECURRING_INCOME_ACCESS_DENIED, "Recurring income does not belong to user");
        }

        return recurringIncome;
    }

    @Transactional
    public RecurringIncomeResponse addRecurringIncome(String email, AddRecurringIncomeRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AuthException(ErrorCode.USER_NOT_FOUND, "User not found"));

        RecurringIncome recurringIncome = new RecurringIncome();
        recurringIncome.setAmount(request.amount());
        recurringIncome.setDescription(request.description());
        recurringIncome.setCategory(request.category());
        recurringIncome.setFrequency(request.frequency());
        recurringIncome.setStartDate(request.startDate());
        recurringIncome.setEndDate(request.endDate());
        recurringIncome.setActive(true);
        recurringIncome.setNextOccurrence(RecurrenceCalculator.firstOccurrenceOnOrAfter(
                request.startDate(), request.frequency(), LocalDate.now()));
        recurringIncome.setUser(user);

        RecurringIncome saved = recurringIncomeRepository.save(recurringIncome);
        return toResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<RecurringIncomeResponse> getRecurringIncomes(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AuthException(ErrorCode.USER_NOT_FOUND, "User not found"));

        return recurringIncomeRepository.findAllByUserOrderByStartDateDesc(user)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public RecurringIncomeResponse getRecurringIncomeById(String email, UUID recurringIncomeId) {
        return toResponse(findUserRecurringIncome(email, recurringIncomeId));
    }

    @SuppressWarnings("null")
    @Transactional
    public RecurringIncomeResponse updateRecurringIncome(
            String email, UUID recurringIncomeId, UpdateRecurringIncomeRequest request) {
        RecurringIncome recurringIncome = findUserRecurringIncome(email, recurringIncomeId);

        if (request.amount() != null) {
            recurringIncome.setAmount(request.amount());
        }
        if (request.description() != null) {
            recurringIncome.setDescription(request.description());
        }
        if (request.category() != null) {
            recurringIncome.setCategory(request.category());
        }
        if (request.active() != null) {
            recurringIncome.setActive(request.active());
        }

        boolean scheduleChanged = request.startDate() != null || request.frequency() != null;
        if (request.startDate() != null) {
            recurringIncome.setStartDate(request.startDate());
        }
        if (request.frequency() != null) {
            recurringIncome.setFrequency(request.frequency());
        }
        if (request.endDate() != null) {
            recurringIncome.setEndDate(request.endDate());
        }
        if (scheduleChanged) {
            recurringIncome.setNextOccurrence(RecurrenceCalculator.firstOccurrenceOnOrAfter(
                    recurringIncome.getStartDate(), recurringIncome.getFrequency(), LocalDate.now()));
        }

        RecurringIncome saved = recurringIncomeRepository.save(recurringIncome);
        return toResponse(saved);
    }

    @SuppressWarnings("null")
    @Transactional
    public void deleteRecurringIncome(String email, UUID recurringIncomeId) {
        RecurringIncome recurringIncome = findUserRecurringIncome(email, recurringIncomeId);
        recurringIncomeRepository.delete(recurringIncome);
    }

    private RecurringIncomeResponse toResponse(RecurringIncome recurringIncome) {
        return new RecurringIncomeResponse(
                recurringIncome.getId(),
                recurringIncome.getAmount(),
                recurringIncome.getDescription(),
                recurringIncome.getCategory(),
                recurringIncome.getFrequency(),
                recurringIncome.getStartDate(),
                recurringIncome.getEndDate(),
                recurringIncome.getNextOccurrence(),
                recurringIncome.isActive());
    }
}
