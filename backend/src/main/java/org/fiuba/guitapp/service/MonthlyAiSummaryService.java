package org.fiuba.guitapp.service;

import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.Optional;

import org.fiuba.guitapp.dto.AiSummaryResponse;
import org.fiuba.guitapp.dto.MonthlySummaryResponse;
import org.fiuba.guitapp.exception.AuthException;
import org.fiuba.guitapp.exception.ErrorCode;
import org.fiuba.guitapp.model.MonthlyAiSummary;
import org.fiuba.guitapp.model.User;
import org.fiuba.guitapp.repository.MonthlyAiSummaryRepository;
import org.fiuba.guitapp.repository.UserRepository;
import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class MonthlyAiSummaryService {

    private final MonthlyAiSummaryRepository monthlyAiSummaryRepository;
    private final GeminiService geminiService;
    private final UserRepository userRepository;
    private final MonthlySummaryService monthlySummaryService;

    public AiSummaryResponse getAiSummary(String email, int year, int month) {
        YearMonth requested = YearMonth.of(year, month);
        YearMonth current = YearMonth.now();
        if (!requested.isBefore(current)) {
            throw new AuthException(
                    ErrorCode.INVALID_PERIOD,
                    "AI summary is only available for completed months");
        }

        User user = userRepository
                .findByEmail(email)
                .orElseThrow(() -> new AuthException(ErrorCode.USER_NOT_FOUND, "User not found"));

        Optional<MonthlyAiSummary> existing = monthlyAiSummaryRepository
                .findByUserAndYearAndMonth(user, year, month);
        if (existing.isPresent()) {
            return new AiSummaryResponse(existing.get().getSummaryText());
        }

        MonthlySummaryResponse summary = monthlySummaryService.getSummary(email, year, month);
        if (summary.totalExpenses().compareTo(java.math.BigDecimal.ZERO) == 0
                && summary.totalIncome().compareTo(java.math.BigDecimal.ZERO) == 0) {
            throw new AuthException(ErrorCode.INVALID_PERIOD, "No data available for this period");
        }
        String generatedText = geminiService.generateMonthlySummary(summary, user);

        MonthlyAiSummary entity = MonthlyAiSummary.builder()
                .user(user)
                .year(year)
                .month(month)
                .summaryText(generatedText)
                .createdAt(LocalDateTime.now())
                .build();
        MonthlyAiSummary saved = monthlyAiSummaryRepository.save(entity);

        return new AiSummaryResponse(saved.getSummaryText());
    }

    public void deleteAiSummary(String email, int year, int month) {
        User user = userRepository
                .findByEmail(email)
                .orElseThrow(() -> new AuthException(ErrorCode.USER_NOT_FOUND, "User not found"));
        monthlyAiSummaryRepository
                .findByUserAndYearAndMonth(user, year, month)
                .ifPresent(monthlyAiSummaryRepository::delete);
    }
}
