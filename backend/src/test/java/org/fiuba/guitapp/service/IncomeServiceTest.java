package org.fiuba.guitapp.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
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
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class IncomeServiceTest {

    @Mock
    private IncomeRepository incomeRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private IncomeService incomeService;

    @Captor
    private ArgumentCaptor<LocalDateTime> startCaptor;

    @Captor
    private ArgumentCaptor<LocalDateTime> endCaptor;

    private User user;

    @BeforeEach
    void setUp() {
        user = new User();
        user.setId(UUID.randomUUID());
        user.setEmail("test@example.com");
    }

    @Test
    void addIncome_ShouldSaveAndReturnResponse() {
        AddIncomeRequest req = new AddIncomeRequest(new BigDecimal("1200.00"), "Salary", null, LocalDate.of(2023, 5, 10));

        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(user));

        Income saved = new Income();
        UUID id = UUID.randomUUID();
        saved.setId(id);
        saved.setAmount(req.amount());
        saved.setDescription(req.description());
        saved.setDate(req.date());

        when(incomeRepository.save(any(Income.class))).thenReturn(saved);

        IncomeResponse resp = incomeService.addIncome("test@example.com", req);

        assertNotNull(resp);
        assertEquals(id, resp.id());
        assertEquals(new BigDecimal("1200.00"), resp.amount());
        verify(incomeRepository, times(1)).save(any(Income.class));
    }

    @Test
    void deleteIncome_ShouldThrowUserNotFound_WhenUserMissing() {
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.empty());

        UUID id = UUID.randomUUID();

        AuthException ex = assertThrows(AuthException.class, () -> incomeService.deleteIncome("test@example.com", id));
        assertEquals(ErrorCode.USER_NOT_FOUND, ex.getErrorCode());
    }

    @Test
    void getIncomeById_ShouldThrowIncomeNotFound_WhenMissing() {
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(user));
        when(incomeRepository.findById(any(UUID.class))).thenReturn(Optional.empty());

        UUID id = UUID.randomUUID();

        AuthException ex = assertThrows(AuthException.class, () -> incomeService.getIncomeById("test@example.com", id));
        assertEquals(ErrorCode.INCOME_NOT_FOUND, ex.getErrorCode());
    }

    @Test
    void updateIncome_ShouldUpdateNonNullFields() {
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(user));

        UUID id = UUID.randomUUID();
        Income stored = new Income();
        stored.setId(id);
        stored.setUser(user);
        stored.setAmount(new BigDecimal("100.00"));
        stored.setDescription("Old");
        stored.setDate(LocalDate.of(2023, 1, 1));

        when(incomeRepository.findById(id)).thenReturn(Optional.of(stored));

        UpdateIncomeRequest req = new UpdateIncomeRequest(new BigDecimal("200.00"), "New desc", null, LocalDate.of(2023, 6, 1));

        Income saved = new Income();
        saved.setId(id);
        saved.setUser(user);
        saved.setAmount(req.amount());
        saved.setDescription(req.description());
        saved.setDate(req.date());

        when(incomeRepository.save(any(Income.class))).thenReturn(saved);

        IncomeResponse resp = incomeService.updateIncome("test@example.com", id, req);

        assertEquals(new BigDecimal("200.00"), resp.amount());
        assertEquals("New desc", resp.description());
        assertEquals(req.date(), resp.date());
        verify(incomeRepository, times(1)).save(any(Income.class));
    }

    @Test
    void getIncomeStatistics_ShouldAggregateDailyMonthlyAndAll() {
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(user));

        Income i1 = new Income();
        i1.setAmount(new BigDecimal("10.00"));
        Income i2 = new Income();
        i2.setAmount(new BigDecimal("15.50"));

        // daily
        when(incomeRepository.findAllByUserAndDateBetween(eq(user), any(LocalDateTime.class), any(LocalDateTime.class)))
                .thenReturn(List.of(i1, i2));

        IncomeStatisticsResponse daily = incomeService.getIncomeStatistics("test@example.com", "daily", 2023, 5, 10);
        assertEquals(new BigDecimal("25.50"), daily.totalAmount());

        // monthly: reuse same mock (method is same signature)
        IncomeStatisticsResponse monthly = incomeService.getIncomeStatistics("test@example.com", "monthly", 2023, 5, null);
        assertEquals(new BigDecimal("25.50"), monthly.totalAmount());

        // all
        when(incomeRepository.findAllByUser(eq(user))).thenReturn(List.of(i1));
        IncomeStatisticsResponse all = incomeService.getIncomeStatistics("test@example.com", "all", null, null, null);
        assertEquals(new BigDecimal("10.00"), all.totalAmount());
    }

    @Test
    void getIncomeStatistics_ShouldThrowForInvalidPeriod() {
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(user));

        assertThrows(IllegalArgumentException.class, () ->
                incomeService.getIncomeStatistics("test@example.com", "unknown", null, null, null));
    }
}
