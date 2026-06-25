package org.fiuba.guitapp.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.fiuba.guitapp.dto.AiSummaryResponse;
import org.fiuba.guitapp.dto.MonthlySummaryResponse;
import org.fiuba.guitapp.exception.AuthException;
import org.fiuba.guitapp.exception.ErrorCode;
import org.fiuba.guitapp.model.MonthlyAiSummary;
import org.fiuba.guitapp.model.User;
import org.fiuba.guitapp.repository.MonthlyAiSummaryRepository;
import org.fiuba.guitapp.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class MonthlyAiSummaryServiceTest {

    @Mock
    private MonthlyAiSummaryRepository monthlyAiSummaryRepository;

    @Mock
    private GeminiService geminiService;

    @Mock
    private UserRepository userRepository;

    @Mock
    private MonthlySummaryService monthlySummaryService;

    @InjectMocks
    private MonthlyAiSummaryService monthlyAiSummaryService;

    private User user;
    private YearMonth pastMonth;

    @BeforeEach
    void setUp() {
        user = new User();
        user.setId(UUID.randomUUID());
        user.setEmail("test@example.com");
        pastMonth = YearMonth.now().minusMonths(1);
    }

    @Test
    void getAiSummary_shouldReturnCachedSummary_whenAlreadyExists() {
        MonthlyAiSummary cached = MonthlyAiSummary.builder()
                .id(1L)
                .user(user)
                .year(pastMonth.getYear())
                .month(pastMonth.getMonthValue())
                .summaryText("cached text")
                .createdAt(LocalDateTime.now())
                .build();

        when(userRepository.findByEmail(user.getEmail())).thenReturn(Optional.of(user));
        when(monthlyAiSummaryRepository.findByUserAndYearAndMonth(user, pastMonth.getYear(), pastMonth.getMonthValue()))
                .thenReturn(Optional.of(cached));

        AiSummaryResponse response = monthlyAiSummaryService.getAiSummary(
                user.getEmail(), pastMonth.getYear(), pastMonth.getMonthValue());

        assertEquals("cached text", response.summaryText());
        verify(geminiService, never()).generateMonthlySummary(any(), any());
        verify(monthlySummaryService, never()).getSummary(anyString(), anyInt(), anyInt());
        verify(monthlyAiSummaryRepository, never()).save(any());
    }

    @Test
    void getAiSummary_shouldGenerateAndSave_whenNoCachedSummaryExists() {
        MonthlySummaryResponse summary = new MonthlySummaryResponse(
                pastMonth.getYear(),
                pastMonth.getMonthValue(),
                new BigDecimal("100000"),
                new BigDecimal("60000"),
                new BigDecimal("40000"),
                List.of(),
                List.of());

        when(userRepository.findByEmail(user.getEmail())).thenReturn(Optional.of(user));
        when(monthlyAiSummaryRepository.findByUserAndYearAndMonth(user, pastMonth.getYear(), pastMonth.getMonthValue()))
                .thenReturn(Optional.empty());
        when(monthlySummaryService.getSummary(
                eq(user.getEmail()), eq(pastMonth.getYear()), eq(pastMonth.getMonthValue())))
                .thenReturn(summary);
        when(geminiService.generateMonthlySummary(eq(summary), eq(user)))
                .thenReturn("generated text");
        when(monthlyAiSummaryRepository.save(any(MonthlyAiSummary.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        AiSummaryResponse response = monthlyAiSummaryService.getAiSummary(
                user.getEmail(), pastMonth.getYear(), pastMonth.getMonthValue());

        assertEquals("generated text", response.summaryText());
        verify(geminiService, times(1)).generateMonthlySummary(summary, user);
        verify(monthlyAiSummaryRepository, times(1)).save(any(MonthlyAiSummary.class));
    }

    @Test
    void getAiSummary_shouldThrow_whenRequestedMonthIsNotCompleted() {
        YearMonth currentMonth = YearMonth.now();

        AuthException ex = assertThrows(AuthException.class, () -> monthlyAiSummaryService.getAiSummary(
                user.getEmail(), currentMonth.getYear(), currentMonth.getMonthValue()));

        assertEquals(ErrorCode.INVALID_PERIOD, ex.getErrorCode());
        verify(userRepository, never()).findByEmail(anyString());
    }

    @Test
    void getAiSummary_shouldThrow_whenUserDoesNotExist() {
        when(userRepository.findByEmail("missing@example.com")).thenReturn(Optional.empty());

        AuthException ex = assertThrows(AuthException.class, () -> monthlyAiSummaryService.getAiSummary(
                "missing@example.com", pastMonth.getYear(), pastMonth.getMonthValue()));

        assertEquals(ErrorCode.USER_NOT_FOUND, ex.getErrorCode());
    }

    @Test
    void getAiSummary_shouldThrow_whenMonthHasNoData() {
        MonthlySummaryResponse emptyMonth = new MonthlySummaryResponse(
                pastMonth.getYear(),
                pastMonth.getMonthValue(),
                BigDecimal.ZERO,
                BigDecimal.ZERO,
                BigDecimal.ZERO,
                List.of(),
                List.of());

        when(userRepository.findByEmail(user.getEmail())).thenReturn(Optional.of(user));
        when(monthlyAiSummaryRepository.findByUserAndYearAndMonth(user, pastMonth.getYear(), pastMonth.getMonthValue()))
                .thenReturn(Optional.empty());
        when(monthlySummaryService.getSummary(
                eq(user.getEmail()), eq(pastMonth.getYear()), eq(pastMonth.getMonthValue())))
                .thenReturn(emptyMonth);

        AuthException ex = assertThrows(AuthException.class, () -> monthlyAiSummaryService.getAiSummary(
                user.getEmail(), pastMonth.getYear(), pastMonth.getMonthValue()));

        assertEquals(ErrorCode.INVALID_PERIOD, ex.getErrorCode());
        verify(geminiService, never()).generateMonthlySummary(any(), any());
    }

    @Test
    void deleteAiSummary_shouldDeleteExisting() {
        MonthlyAiSummary existing = MonthlyAiSummary.builder()
                .id(1L)
                .user(user)
                .year(pastMonth.getYear())
                .month(pastMonth.getMonthValue())
                .summaryText("some text")
                .createdAt(LocalDateTime.now())
                .build();

        when(userRepository.findByEmail(user.getEmail())).thenReturn(Optional.of(user));
        when(monthlyAiSummaryRepository.findByUserAndYearAndMonth(user, pastMonth.getYear(), pastMonth.getMonthValue()))
                .thenReturn(Optional.of(existing));

        monthlyAiSummaryService.deleteAiSummary(user.getEmail(), pastMonth.getYear(), pastMonth.getMonthValue());

        verify(monthlyAiSummaryRepository, times(1)).delete(existing);
    }

    @Test
    void deleteAiSummary_shouldDoNothing_whenNoSummaryExists() {
        when(userRepository.findByEmail(user.getEmail())).thenReturn(Optional.of(user));
        when(monthlyAiSummaryRepository.findByUserAndYearAndMonth(user, pastMonth.getYear(), pastMonth.getMonthValue()))
                .thenReturn(Optional.empty());

        monthlyAiSummaryService.deleteAiSummary(user.getEmail(), pastMonth.getYear(), pastMonth.getMonthValue());

        verify(monthlyAiSummaryRepository, never()).delete(any());
    }

    @Test
    void deleteAiSummary_shouldThrow_whenUserDoesNotExist() {
        when(userRepository.findByEmail("missing@example.com")).thenReturn(Optional.empty());

        AuthException ex = assertThrows(AuthException.class, () -> monthlyAiSummaryService.deleteAiSummary(
                "missing@example.com", pastMonth.getYear(), pastMonth.getMonthValue()));

        assertEquals(ErrorCode.USER_NOT_FOUND, ex.getErrorCode());
    }
}
