package org.fiuba.guitapp.service;

import java.time.LocalDateTime;
import java.util.Objects;
import java.util.UUID;

import org.fiuba.guitapp.dto.AddIncomeRequest;
import org.fiuba.guitapp.dto.IncomeResponse;
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

    @Transactional
    public void deleteIncome(String email, UUID incomeId) {
        Objects.requireNonNull(incomeId, "incomeId");
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AuthException(ErrorCode.USER_NOT_FOUND, "User not found"));

        Income income = incomeRepository.findById(incomeId)
                .orElseThrow(() -> new AuthException(ErrorCode.INCOME_NOT_FOUND, "Income not found"));

        if (income.getUser() == null || income.getUser().getId() == null || !income.getUser().getId().equals(user.getId())) {
            throw new AuthException(ErrorCode.INCOME_ACCESS_DENIED, "Income does not belong to user");
        }

        incomeRepository.delete(income);
    }
}
