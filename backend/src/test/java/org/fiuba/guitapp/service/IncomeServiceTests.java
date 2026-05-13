package org.fiuba.guitapp.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

import org.fiuba.guitapp.dto.AddIncomeRequest;
import org.fiuba.guitapp.dto.IncomeResponse;
import org.fiuba.guitapp.exception.AuthException;
import org.fiuba.guitapp.exception.ErrorCode;
import org.fiuba.guitapp.model.Income;
import org.fiuba.guitapp.model.IncomeCategory;
import org.fiuba.guitapp.model.User;
import org.fiuba.guitapp.model.UserStatus;
import org.fiuba.guitapp.repository.IncomeRepository;
import org.fiuba.guitapp.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
@SuppressWarnings("null")
class IncomeServiceTests {

    @Mock
    private IncomeRepository incomeRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private IncomeService incomeService;

    private User testUser;
    private final String testEmail = "test@example.com";

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setId(UUID.randomUUID());
        testUser.setEmail(testEmail);
        testUser.setFirstName("John");
        testUser.setStatus(UserStatus.ACTIVE);
    }

    @Test
    void addIncome_ShouldReturnIncomeResponse_WhenUserExists() {
        AddIncomeRequest request = new AddIncomeRequest(
                new BigDecimal("1500.00"), "Freelance work", IncomeCategory.FREELANCE);

        Income savedIncome = new Income();
        savedIncome.setId(UUID.randomUUID());
        savedIncome.setAmount(request.amount());
        savedIncome.setDescription(request.description());
        savedIncome.setCategory(request.category());
        savedIncome.setDate(LocalDateTime.now());
        savedIncome.setUser(testUser);

        when(userRepository.findByEmail(testEmail)).thenReturn(Optional.of(testUser));
        when(incomeRepository.save(any(Income.class))).thenReturn(savedIncome);

        IncomeResponse response = incomeService.addIncome(testEmail, request);

        assertNotNull(response);
        assertEquals(savedIncome.getId(), response.id());
        assertEquals(new BigDecimal("1500.00"), response.amount());
        assertEquals("Freelance work", response.description());
        assertEquals(IncomeCategory.FREELANCE, response.category());
        assertNotNull(response.date());
        verify(userRepository, times(1)).findByEmail(testEmail);
        verify(incomeRepository, times(1)).save(any(Income.class));
    }

    @Test
    void addIncome_ShouldThrowAuthException_WhenUserNotFound() {
        AddIncomeRequest request = new AddIncomeRequest(
                new BigDecimal("100.00"), null, IncomeCategory.OTHER);

        when(userRepository.findByEmail(testEmail)).thenReturn(Optional.empty());

        AuthException exception = assertThrows(AuthException.class, () -> incomeService.addIncome(testEmail, request));

        assertEquals(ErrorCode.USER_NOT_FOUND, exception.getErrorCode());
        verify(incomeRepository, never()).save(any(Income.class));
    }

    @Test
    void addIncome_ShouldSaveIncomeWithNullDescription_WhenDescriptionIsNull() {
        AddIncomeRequest request = new AddIncomeRequest(
                new BigDecimal("500.00"), null, IncomeCategory.SALARY);

        Income savedIncome = new Income();
        savedIncome.setId(UUID.randomUUID());
        savedIncome.setAmount(request.amount());
        savedIncome.setDescription(null);
        savedIncome.setCategory(request.category());
        savedIncome.setDate(LocalDateTime.now());
        savedIncome.setUser(testUser);

        when(userRepository.findByEmail(testEmail)).thenReturn(Optional.of(testUser));
        when(incomeRepository.save(any(Income.class))).thenReturn(savedIncome);

        IncomeResponse response = incomeService.addIncome(testEmail, request);

        assertNull(response.description());
        verify(incomeRepository, times(1)).save(any(Income.class));
    }

    @Test
    void addIncome_ShouldAssociateIncomeWithUser() {
        AddIncomeRequest request = new AddIncomeRequest(
                new BigDecimal("200.00"), "Bonus", IncomeCategory.SALARY);

        Income savedIncome = new Income();
        savedIncome.setId(UUID.randomUUID());
        savedIncome.setAmount(request.amount());
        savedIncome.setCategory(request.category());
        savedIncome.setDate(LocalDateTime.now());
        savedIncome.setUser(testUser);

        when(userRepository.findByEmail(testEmail)).thenReturn(Optional.of(testUser));
        when(incomeRepository.save(any(Income.class))).thenAnswer(invocation -> {
            Income income = invocation.getArgument(0);
            assertEquals(testUser, income.getUser());
            return savedIncome;
        });

        incomeService.addIncome(testEmail, request);

        verify(incomeRepository, times(1)).save(any(Income.class));
    }

    @Test
    void deleteIncome_ShouldDeleteIncome_WhenIncomeBelongsToUser() {
        UUID incomeId = UUID.randomUUID();

        Income income = new Income();
        income.setId(incomeId);
        income.setUser(testUser);

        when(userRepository.findByEmail(testEmail)).thenReturn(Optional.of(testUser));
        when(incomeRepository.findById(incomeId)).thenReturn(Optional.of(income));

        incomeService.deleteIncome(testEmail, incomeId);

        verify(incomeRepository, times(1)).delete(income);
    }

    @Test
    void deleteIncome_ShouldThrowAuthException_WhenIncomeNotFound() {
        UUID incomeId = UUID.randomUUID();

        when(userRepository.findByEmail(testEmail)).thenReturn(Optional.of(testUser));
        when(incomeRepository.findById(incomeId)).thenReturn(Optional.empty());

        AuthException exception = assertThrows(AuthException.class, () -> incomeService.deleteIncome(testEmail, incomeId));

        assertEquals(ErrorCode.INCOME_NOT_FOUND, exception.getErrorCode());
        verify(incomeRepository, never()).delete(any(Income.class));
    }

    @Test
    void deleteIncome_ShouldThrowAuthException_WhenIncomeBelongsToAnotherUser() {
        UUID incomeId = UUID.randomUUID();

        User otherUser = new User();
        otherUser.setId(UUID.randomUUID());
        otherUser.setEmail("other@example.com");
        otherUser.setStatus(UserStatus.ACTIVE);

        Income income = new Income();
        income.setId(incomeId);
        income.setUser(otherUser);

        when(userRepository.findByEmail(testEmail)).thenReturn(Optional.of(testUser));
        when(incomeRepository.findById(incomeId)).thenReturn(Optional.of(income));

        AuthException exception = assertThrows(AuthException.class, () -> incomeService.deleteIncome(testEmail, incomeId));

        assertEquals(ErrorCode.INCOME_ACCESS_DENIED, exception.getErrorCode());
        verify(incomeRepository, never()).delete(any(Income.class));
    }
}
