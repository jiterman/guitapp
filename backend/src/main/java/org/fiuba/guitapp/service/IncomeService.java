package org.fiuba.guitapp.service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import org.fiuba.guitapp.dto.AddIncomeRequest;
import org.fiuba.guitapp.dto.IncomeResponse;
import org.fiuba.guitapp.dto.IncomeStatisticsResponse;
import org.fiuba.guitapp.dto.UpdateIncomeRequest;
import org.fiuba.guitapp.exception.AuthException;
import org.fiuba.guitapp.exception.ErrorCode;
import org.fiuba.guitapp.model.Income;
import org.fiuba.guitapp.model.User;
import org.fiuba.guitapp.repository.IncomeRepository;
import org.fiuba.guitapp.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class IncomeService {

    private final IncomeRepository incomeRepository;
    private final UserRepository userRepository;

    @SuppressWarnings("null")
    private Income findUserIncome(String email, UUID incomeId) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AuthException(ErrorCode.USER_NOT_FOUND, "User not found"));

        Income income = incomeRepository.findById(incomeId)
                .orElseThrow(() -> new AuthException(ErrorCode.INCOME_NOT_FOUND, "Income not found"));

        if (income.getUser() == null
                || income.getUser().getId() == null
                || !income.getUser().getId().equals(user.getId())) {
            throw new AuthException(ErrorCode.INCOME_ACCESS_DENIED, "Income does not belong to user");
        }

        return income;
    }

    @Transactional
    public IncomeResponse addIncome(String email, AddIncomeRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AuthException(ErrorCode.USER_NOT_FOUND, "User not found"));

        Income income = new Income();
        income.setAmount(request.amount());
        income.setDescription(request.description());
        income.setCategory(request.category());
        income.setDate(LocalDateTime.now());
        income.setUser(user);

        Income saved = incomeRepository.save(income);

        return new IncomeResponse(
                saved.getId(),
                saved.getAmount(),
                saved.getDescription(),
                saved.getCategory(),
                saved.getDate());
    }

    @SuppressWarnings("null")
    @Transactional
    public void deleteIncome(String email, UUID incomeId) {
        Income income = findUserIncome(email, incomeId);
        incomeRepository.delete(income);
    }

    @Transactional(readOnly = true)
    public IncomeResponse getIncomeById(String email, UUID incomeId) {
        Income income = findUserIncome(email, incomeId);
        return new IncomeResponse(
                income.getId(),
                income.getAmount(),
                income.getDescription(),
                income.getCategory(),
                income.getDate());
    }

    @SuppressWarnings("null")
    @Transactional
    public IncomeResponse updateIncome(String email, UUID incomeId, UpdateIncomeRequest request) {
        Income income = findUserIncome(email, incomeId);

        if (request.amount() != null) {
            income.setAmount(request.amount());
        }
        if (request.description() != null) {
            income.setDescription(request.description());
        }
        if (request.category() != null) {
            income.setCategory(request.category());
        }

        Income saved = incomeRepository.save(income);
        return new IncomeResponse(
                saved.getId(),
                saved.getAmount(),
                saved.getDescription(),
                saved.getCategory(),
                saved.getDate());
    }

    @Transactional(readOnly = true)
    public IncomeStatisticsResponse getIncomeStatistics(
            String email, String period, Integer year, Integer month, Integer day) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AuthException(ErrorCode.USER_NOT_FOUND, "User not found"));

        List<Income> incomes = getIncomesByPeriod(user, period, year, month, day);

        BigDecimal totalAmount = incomes.stream()
                .map(Income::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return new IncomeStatisticsResponse(totalAmount);
    }

    private List<Income> getIncomesByPeriod(
            User user, String period, Integer year, Integer month, Integer day) {
        LocalDateTime referenceDate = buildReferenceDate(year, month, day);
        return switch (period.toLowerCase()) {
        case "daily" -> {
            LocalDateTime startOfDay = referenceDate.toLocalDate().atStartOfDay();
            LocalDateTime endOfDay = startOfDay.plusDays(1);
            yield incomeRepository.findAllByUserAndDateBetween(user, startOfDay, endOfDay);
        }
        case "monthly" -> {
            LocalDateTime startOfMonth = referenceDate.toLocalDate().withDayOfMonth(1).atStartOfDay();
            LocalDateTime endOfMonth = startOfMonth.plusMonths(1);
            yield incomeRepository.findAllByUserAndDateBetween(user, startOfMonth, endOfMonth);
        }
        case "all" -> incomeRepository.findAllByUser(user);
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
