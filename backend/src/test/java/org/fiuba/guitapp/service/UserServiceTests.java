package org.fiuba.guitapp.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

import java.util.Optional;
import java.util.UUID;

import org.fiuba.guitapp.dto.OnboardingRequest;
import org.fiuba.guitapp.dto.UserProfileResponse;
import org.fiuba.guitapp.exception.AuthException;
import org.fiuba.guitapp.exception.ErrorCode;
import org.fiuba.guitapp.model.User;
import org.fiuba.guitapp.model.UserStatus;
import org.fiuba.guitapp.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class UserServiceTests {

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private UserService userService;

    private User testUser;
    private String testEmail = "test@example.com";

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setId(UUID.randomUUID());
        testUser.setEmail(testEmail);
        testUser.setFirstName("John");
        testUser.setPassword("hashedPassword");
        testUser.setStatus(UserStatus.ACTIVE);
        testUser.setOnboardingCompleted(false);
    }

    @Test
    void getUserProfile_ShouldReturnUserProfile_WhenUserExists() {
        testUser.setTargetFixedExpenses(30);
        testUser.setTargetVariableExpenses(50);
        testUser.setTargetSavings(20);
        testUser.setOnboardingCompleted(true);

        when(userRepository.findByEmail(testEmail)).thenReturn(Optional.of(testUser));

        UserProfileResponse response = userService.getUserProfile(testEmail);

        assertNotNull(response);
        assertEquals(testUser.getId(), response.id());
        assertEquals(testUser.getEmail(), response.email());
        assertEquals(testUser.getFirstName(), response.firstName());
        assertTrue(response.onboardingCompleted());
        assertEquals(30, response.targetFixedExpenses());
        assertEquals(50, response.targetVariableExpenses());
        assertEquals(20, response.targetSavings());
        verify(userRepository, times(1)).findByEmail(testEmail);
    }

    @Test
    void getUserProfile_ShouldThrowAuthException_WhenUserNotFound() {
        when(userRepository.findByEmail(testEmail)).thenReturn(Optional.empty());

        AuthException exception = assertThrows(AuthException.class, () -> {
            userService.getUserProfile(testEmail);
        });

        assertEquals(ErrorCode.USER_NOT_FOUND, exception.getErrorCode());
        assertEquals("User not found", exception.getMessage());
        verify(userRepository, times(1)).findByEmail(testEmail);
    }

    @Test
    void completeOnboarding_ShouldCompleteOnboarding_WithValidData() {
        OnboardingRequest request = new OnboardingRequest("Maria", 30, 50);
        when(userRepository.findByEmail(testEmail)).thenReturn(Optional.of(testUser));
        when(userRepository.save(any(User.class))).thenReturn(testUser);

        userService.completeOnboarding(testEmail, request);

        verify(userRepository, times(1)).findByEmail(testEmail);
        verify(userRepository, times(1)).save(testUser);
        assertEquals("Maria", testUser.getFirstName());
        assertEquals(30, testUser.getTargetFixedExpenses());
        assertEquals(50, testUser.getTargetVariableExpenses());
        assertEquals(20, testUser.getTargetSavings());
        assertTrue(testUser.isOnboardingCompleted());
    }

    @Test
    void completeOnboarding_ShouldCalculateSavingsCorrectly_WithDifferentExpenses() {
        OnboardingRequest request = new OnboardingRequest("John", 40, 40);
        when(userRepository.findByEmail(testEmail)).thenReturn(Optional.of(testUser));
        when(userRepository.save(any(User.class))).thenReturn(testUser);

        userService.completeOnboarding(testEmail, request);

        assertEquals(20, testUser.getTargetSavings());
        verify(userRepository, times(1)).save(testUser);
    }

    @Test
    void completeOnboarding_ShouldThrowException_WhenUserNotFound() {
        OnboardingRequest request = new OnboardingRequest("John", 30, 50);
        when(userRepository.findByEmail(testEmail)).thenReturn(Optional.empty());

        AuthException exception = assertThrows(AuthException.class, () -> {
            userService.completeOnboarding(testEmail, request);
        });

        assertEquals(ErrorCode.USER_NOT_FOUND, exception.getErrorCode());
        verify(userRepository, times(1)).findByEmail(testEmail);
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void completeOnboarding_ShouldThrowException_WhenOnboardingAlreadyCompleted() {
        testUser.setOnboardingCompleted(true);
        OnboardingRequest request = new OnboardingRequest("John", 30, 50);
        when(userRepository.findByEmail(testEmail)).thenReturn(Optional.of(testUser));

        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> {
            userService.completeOnboarding(testEmail, request);
        });

        assertEquals("Onboarding already completed", exception.getMessage());
        verify(userRepository, times(1)).findByEmail(testEmail);
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void completeOnboarding_ShouldThrowException_WhenExpensesEqualTo100() {
        OnboardingRequest request = new OnboardingRequest("John", 50, 50);
        when(userRepository.findByEmail(testEmail)).thenReturn(Optional.of(testUser));

        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> {
            userService.completeOnboarding(testEmail, request);
        });

        assertEquals("Sum of expenses must be strictly less than 100 to allow savings", exception.getMessage());
        verify(userRepository, times(1)).findByEmail(testEmail);
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void completeOnboarding_ShouldThrowException_WhenExpensesGreaterThan100() {
        OnboardingRequest request = new OnboardingRequest("John", 60, 50);
        when(userRepository.findByEmail(testEmail)).thenReturn(Optional.of(testUser));

        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> {
            userService.completeOnboarding(testEmail, request);
        });

        assertEquals("Sum of expenses must be strictly less than 100 to allow savings", exception.getMessage());
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void completeOnboarding_ShouldAllowMinimumSavings_WithExpensesAt99() {
        OnboardingRequest request = new OnboardingRequest("John", 49, 50);
        when(userRepository.findByEmail(testEmail)).thenReturn(Optional.of(testUser));
        when(userRepository.save(any(User.class))).thenReturn(testUser);

        userService.completeOnboarding(testEmail, request);

        assertEquals(1, testUser.getTargetSavings());
        assertTrue(testUser.isOnboardingCompleted());
        verify(userRepository, times(1)).save(testUser);
    }
}
