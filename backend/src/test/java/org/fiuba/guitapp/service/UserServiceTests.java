package org.fiuba.guitapp.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import org.fiuba.guitapp.dto.ConfirmPasswordChangeRequest;
import org.fiuba.guitapp.dto.InitiateEmailChangeRequest;
import org.fiuba.guitapp.dto.InitiatePasswordChangeRequest;
import org.fiuba.guitapp.dto.OnboardingRequest;
import org.fiuba.guitapp.dto.UpdateUserProfileRequest;
import org.fiuba.guitapp.dto.UserProfileResponse;
import org.fiuba.guitapp.dto.VerifyEmailChangeRequest;
import org.fiuba.guitapp.exception.AuthException;
import org.fiuba.guitapp.exception.ErrorCode;
import org.fiuba.guitapp.model.NotificationFrequency;
import org.fiuba.guitapp.model.User;
import org.fiuba.guitapp.model.UserStatus;
import org.fiuba.guitapp.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.cloudinary.Cloudinary;
import com.cloudinary.Uploader;

@ExtendWith(MockitoExtension.class)
class UserServiceTests {

    @Mock
    private UserRepository userRepository;

    @Mock
    private Cloudinary cloudinary;

    @Mock
    private Uploader uploader;

    @Mock
    private OtpService otpService;

    @Mock
    private EmailService emailService;

    @InjectMocks
    private UserService userService;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private UserNotificationService userNotificationService;

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
        testUser.setEstimatedMonthlyIncome(java.math.BigDecimal.valueOf(5000));
        testUser.setOnboardingCompleted(true);

        when(userRepository.findByEmail(testEmail)).thenReturn(Optional.of(testUser));

        UserProfileResponse response = userService.getUserProfile(testEmail);

        assertNotNull(response);
        assertEquals(testUser.getId(), response.id());
        assertEquals(testUser.getEmail(), response.email());
        assertEquals(testUser.getFirstName(), response.firstName());
        assertEquals(NotificationFrequency.INSTANT, response.notificationFrequency());
        assertTrue(response.onboardingCompleted());
        assertEquals(java.math.BigDecimal.valueOf(5000), response.estimatedMonthlyIncome());
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
        OnboardingRequest request = new OnboardingRequest("Maria", 30, 50, java.math.BigDecimal.valueOf(5000));
        when(userRepository.findByEmail(testEmail)).thenReturn(Optional.of(testUser));
        when(userRepository.save(any(User.class))).thenReturn(testUser);

        userService.completeOnboarding(testEmail, request);

        verify(userRepository, times(1)).findByEmail(testEmail);
        verify(userRepository, times(1)).save(testUser);
        assertEquals("Maria", testUser.getFirstName());
        assertEquals(30, testUser.getTargetFixedExpenses());
        assertEquals(50, testUser.getTargetVariableExpenses());
        assertEquals(20, testUser.getTargetSavings());
        assertEquals(java.math.BigDecimal.valueOf(5000), testUser.getEstimatedMonthlyIncome());
        assertTrue(testUser.isOnboardingCompleted());
    }

    @Test
    void completeOnboarding_ShouldCalculateSavingsCorrectly_WithDifferentExpenses() {
        OnboardingRequest request = new OnboardingRequest("John", 40, 40, java.math.BigDecimal.valueOf(5000));
        when(userRepository.findByEmail(testEmail)).thenReturn(Optional.of(testUser));
        when(userRepository.save(any(User.class))).thenReturn(testUser);

        userService.completeOnboarding(testEmail, request);

        assertEquals(20, testUser.getTargetSavings());
        verify(userRepository, times(1)).save(testUser);
    }

    @Test
    void completeOnboarding_ShouldThrowException_WhenUserNotFound() {
        OnboardingRequest request = new OnboardingRequest("John", 30, 50, java.math.BigDecimal.valueOf(5000));
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
        OnboardingRequest request = new OnboardingRequest("John", 30, 50, java.math.BigDecimal.valueOf(5000));
        when(userRepository.findByEmail(testEmail)).thenReturn(Optional.of(testUser));

        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> {
            userService.completeOnboarding(testEmail, request);
        });

        assertEquals("Onboarding already completed", exception.getMessage());
        verify(userRepository, times(1)).findByEmail(testEmail);
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void completeOnboarding_ShouldAllowZeroSavings_WhenExpensesEqualTo100() {
        OnboardingRequest request = new OnboardingRequest("John", 50, 50, java.math.BigDecimal.valueOf(5000));
        when(userRepository.findByEmail(testEmail)).thenReturn(Optional.of(testUser));
        when(userRepository.save(any(User.class))).thenReturn(testUser);

        userService.completeOnboarding(testEmail, request);

        assertEquals(0, testUser.getTargetSavings());
        assertTrue(testUser.isOnboardingCompleted());
        verify(userRepository, times(1)).save(testUser);
    }

    @Test
    void completeOnboarding_ShouldThrowException_WhenExpensesGreaterThan100() {
        OnboardingRequest request = new OnboardingRequest("John", 60, 50, java.math.BigDecimal.valueOf(5000));
        when(userRepository.findByEmail(testEmail)).thenReturn(Optional.of(testUser));

        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> {
            userService.completeOnboarding(testEmail, request);
        });

        assertEquals("Sum of expenses cannot exceed 100", exception.getMessage());
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void completeOnboarding_ShouldAllowMinimumSavings_WithExpensesAt99() {
        OnboardingRequest request = new OnboardingRequest("John", 49, 50, java.math.BigDecimal.valueOf(5000));
        when(userRepository.findByEmail(testEmail)).thenReturn(Optional.of(testUser));
        when(userRepository.save(any(User.class))).thenReturn(testUser);

        userService.completeOnboarding(testEmail, request);

        assertEquals(1, testUser.getTargetSavings());
        assertTrue(testUser.isOnboardingCompleted());
        verify(userRepository, times(1)).save(testUser);
    }

    @Test
    void updateUserProfile_ShouldUpdateProfile_WhenUserExistsAndValidData() {
        UpdateUserProfileRequest request = new UpdateUserProfileRequest("Jane", "Doe");
        when(userRepository.findByEmail(testEmail)).thenReturn(Optional.of(testUser));
        when(userRepository.save(any(User.class))).thenReturn(testUser);

        UserProfileResponse response = userService.updateUserProfile(testEmail, request);

        assertEquals("Jane", testUser.getFirstName());
        assertEquals("Doe", testUser.getLastName());
        assertEquals("Jane", response.firstName());
        assertEquals("Doe", response.lastName());
        verify(userRepository, times(1)).save(testUser);
    }

    @Test
    void updateUserProfile_ShouldSetLastNameToNull_WhenLastNameIsBlank() {
        UpdateUserProfileRequest request = new UpdateUserProfileRequest("Jane", "   ");
        when(userRepository.findByEmail(testEmail)).thenReturn(Optional.of(testUser));
        when(userRepository.save(any(User.class))).thenReturn(testUser);

        UserProfileResponse response = userService.updateUserProfile(testEmail, request);

        assertEquals("Jane", testUser.getFirstName());
        assertNull(testUser.getLastName());
        assertNull(response.lastName());
        verify(userRepository, times(1)).save(testUser);
    }

    @Test
    void updateUserProfile_ShouldSetLastNameToNull_WhenLastNameIsNull() {
        UpdateUserProfileRequest request = new UpdateUserProfileRequest("Jane", null);
        when(userRepository.findByEmail(testEmail)).thenReturn(Optional.of(testUser));
        when(userRepository.save(any(User.class))).thenReturn(testUser);

        UserProfileResponse response = userService.updateUserProfile(testEmail, request);

        assertEquals("Jane", testUser.getFirstName());
        assertNull(testUser.getLastName());
        assertNull(response.lastName());
        verify(userRepository, times(1)).save(testUser);
    }

    @Test
    void updateUserProfile_ShouldThrowAuthException_WhenUserNotFound() {
        UpdateUserProfileRequest request = new UpdateUserProfileRequest("Jane", "Doe");
        when(userRepository.findByEmail(testEmail)).thenReturn(Optional.empty());

        AuthException exception = assertThrows(AuthException.class, () -> {
            userService.updateUserProfile(testEmail, request);
        });

        assertEquals(ErrorCode.USER_NOT_FOUND, exception.getErrorCode());
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void updateAvatar_ShouldUpdateAvatar_WhenFileIsValid() throws Exception {
        MockMultipartFile file = new MockMultipartFile("file", "test.jpg", "image/jpeg", "test image content".getBytes());
        when(userRepository.findByEmail(testEmail)).thenReturn(Optional.of(testUser));
        when(userRepository.save(any(User.class))).thenReturn(testUser);
        when(cloudinary.uploader()).thenReturn(uploader);
        when(uploader.upload(any(byte[].class), anyMap())).thenReturn(Map.of("secure_url", "http://example.com/avatar.jpg"));

        UserProfileResponse response = userService.updateAvatar(testEmail, file);

        assertEquals("http://example.com/avatar.jpg", testUser.getAvatarUrl());
        assertEquals("http://example.com/avatar.jpg", response.avatarUrl());
        verify(userRepository, times(1)).save(testUser);
    }

    @Test
    void updateAvatar_ShouldThrowIllegalArgumentException_WhenFileIsEmpty() {
        MockMultipartFile file = new MockMultipartFile("file", "test.jpg", "image/jpeg", new byte[0]);

        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> {
            userService.updateAvatar(testEmail, file);
        });

        assertEquals("File is empty", exception.getMessage());
        verify(userRepository, never()).findByEmail(anyString());
    }

    @Test
    void updateAvatar_ShouldThrowIllegalArgumentException_WhenFileIsTooLarge() {
        byte[] largeContent = new byte[(5 * 1024 * 1024) + 1]; // 5MB + 1 byte
        MockMultipartFile file = new MockMultipartFile("file", "test.jpg", "image/jpeg", largeContent);

        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> {
            userService.updateAvatar(testEmail, file);
        });

        assertEquals("Max file size is 5MB", exception.getMessage());
        verify(userRepository, never()).findByEmail(anyString());
    }

    @Test
    void updateAvatar_ShouldThrowIllegalArgumentException_WhenContentTypeIsInvalid() {
        MockMultipartFile file = new MockMultipartFile("file", "test.txt", "text/plain", "test".getBytes());

        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> {
            userService.updateAvatar(testEmail, file);
        });

        assertEquals("Only PNG, JPG or WEBP images are allowed", exception.getMessage());
        verify(userRepository, never()).findByEmail(anyString());
    }

    @Test
    void updateAvatar_ShouldThrowIllegalArgumentException_WhenContentTypeIsNull() {
        MockMultipartFile file = new MockMultipartFile("file", "test.jpg", null, "test".getBytes());

        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> {
            userService.updateAvatar(testEmail, file);
        });

        assertEquals("Only PNG, JPG or WEBP images are allowed", exception.getMessage());
        verify(userRepository, never()).findByEmail(anyString());
    }

    @Test
    void updateAvatar_ShouldThrowAuthException_WhenUserNotFound() {
        MockMultipartFile file = new MockMultipartFile("file", "test.jpg", "image/jpeg", "test".getBytes());
        when(userRepository.findByEmail(testEmail)).thenReturn(Optional.empty());

        AuthException exception = assertThrows(AuthException.class, () -> {
            userService.updateAvatar(testEmail, file);
        });

        assertEquals(ErrorCode.USER_NOT_FOUND, exception.getErrorCode());
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void updateAvatar_ShouldThrowRuntimeException_WhenCloudinaryFails() throws Exception {
        MockMultipartFile file = new MockMultipartFile("file", "test.jpg", "image/jpeg", "test".getBytes());
        when(userRepository.findByEmail(testEmail)).thenReturn(Optional.of(testUser));
        when(cloudinary.uploader()).thenReturn(uploader);
        when(uploader.upload(any(byte[].class), anyMap())).thenThrow(new RuntimeException("Cloudinary error"));

        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            userService.updateAvatar(testEmail, file);
        });

        assertEquals("Error uploading avatar", exception.getMessage());
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void initiateEmailChange_ShouldInitiateChange_WhenValidData() {
        String newEmail = "new@example.com";
        InitiateEmailChangeRequest request = new InitiateEmailChangeRequest(newEmail);
        String otp = "123456";

        when(userRepository.findByEmail(testEmail)).thenReturn(Optional.of(testUser));
        when(userRepository.findByEmail(newEmail)).thenReturn(Optional.empty());
        when(otpService.generateOtp()).thenReturn(otp);

        userService.initiateEmailChange(testEmail, request);

        assertEquals(newEmail, testUser.getPendingEmail());
        assertEquals(otp, testUser.getVerificationOtp());
        assertNotNull(testUser.getOtpCreatedAt());
        verify(userRepository, times(1)).save(testUser);
        verify(emailService, times(1)).sendEmailChangeOtp(newEmail, otp);
    }

    @Test
    void initiateEmailChange_ShouldThrowException_WhenNewEmailSameAsCurrent() {
        InitiateEmailChangeRequest request = new InitiateEmailChangeRequest(testEmail);
        when(userRepository.findByEmail(testEmail)).thenReturn(Optional.of(testUser));

        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> {
            userService.initiateEmailChange(testEmail, request);
        });

        assertEquals("El nuevo email debe ser diferente al actual", exception.getMessage());
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void initiateEmailChange_ShouldThrowException_WhenNewEmailAlreadyUsed() {
        String newEmail = "used@example.com";
        InitiateEmailChangeRequest request = new InitiateEmailChangeRequest(newEmail);
        when(userRepository.findByEmail(testEmail)).thenReturn(Optional.of(testUser));
        when(userRepository.findByEmail(newEmail)).thenReturn(Optional.of(new User()));

        AuthException exception = assertThrows(AuthException.class, () -> {
            userService.initiateEmailChange(testEmail, request);
        });

        assertEquals(ErrorCode.MAIL_ALREADY_USED, exception.getErrorCode());
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void verifyEmailChange_ShouldUpdateEmail_WhenValidOtp() {
        String newEmail = "new@example.com";
        String otp = "123456";
        testUser.setPendingEmail(newEmail);
        testUser.setVerificationOtp(otp);
        testUser.setOtpCreatedAt(LocalDateTime.now());

        VerifyEmailChangeRequest request = new VerifyEmailChangeRequest(otp);

        when(userRepository.findByEmail(testEmail)).thenReturn(Optional.of(testUser));
        when(otpService.isOtpExpired(any())).thenReturn(false);

        userService.verifyEmailChange(testEmail, request);

        assertEquals(newEmail, testUser.getEmail());
        assertNull(testUser.getPendingEmail());
        assertNull(testUser.getVerificationOtp());
        assertNull(testUser.getOtpCreatedAt());
        verify(userRepository, times(1)).save(testUser);
    }

    @Test
    void verifyEmailChange_ShouldThrowException_WhenNoPendingEmail() {
        VerifyEmailChangeRequest request = new VerifyEmailChangeRequest("123456");
        when(userRepository.findByEmail(testEmail)).thenReturn(Optional.of(testUser));

        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> {
            userService.verifyEmailChange(testEmail, request);
        });

        assertEquals("No hay un cambio de email pendiente", exception.getMessage());
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void verifyEmailChange_ShouldThrowException_WhenInvalidOtp() {
        testUser.setPendingEmail("new@example.com");
        testUser.setVerificationOtp("123456");
        VerifyEmailChangeRequest request = new VerifyEmailChangeRequest("wrong");

        when(userRepository.findByEmail(testEmail)).thenReturn(Optional.of(testUser));

        AuthException exception = assertThrows(AuthException.class, () -> {
            userService.verifyEmailChange(testEmail, request);
        });

        assertEquals(ErrorCode.INVALID_OTP, exception.getErrorCode());
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void verifyEmailChange_ShouldThrowException_WhenOtpExpired() {
        testUser.setPendingEmail("new@example.com");
        testUser.setVerificationOtp("123456");
        testUser.setOtpCreatedAt(LocalDateTime.now().minusMinutes(11));
        VerifyEmailChangeRequest request = new VerifyEmailChangeRequest("123456");

        when(userRepository.findByEmail(testEmail)).thenReturn(Optional.of(testUser));
        when(otpService.isOtpExpired(any())).thenReturn(true);

        AuthException exception = assertThrows(AuthException.class, () -> {
            userService.verifyEmailChange(testEmail, request);
        });

        assertEquals(ErrorCode.OTP_EXPIRED, exception.getErrorCode());
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void initiatePasswordChange_ShouldThrowException_WhenUserNotFound() {
        InitiatePasswordChangeRequest request = new InitiatePasswordChangeRequest("currentPassword", "newPassword123");

        when(userRepository.findByEmail(testEmail)).thenReturn(Optional.empty());

        AuthException exception = assertThrows(AuthException.class, () -> {
            userService.initiatePasswordChange(testEmail, request);
        });

        assertEquals(ErrorCode.USER_NOT_FOUND, exception.getErrorCode());
        assertEquals("User not found", exception.getMessage());
        verify(passwordEncoder, never()).matches(anyString(), anyString());
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void initiatePasswordChange_ShouldThrowException_WhenCurrentPasswordIsIncorrect() {
        InitiatePasswordChangeRequest request = new InitiatePasswordChangeRequest("wrongPassword", "newPassword123");

        when(userRepository.findByEmail(testEmail)).thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches("wrongPassword", testUser.getPassword()))
                .thenReturn(false);

        AuthException exception = assertThrows(AuthException.class, () -> {
            userService.initiatePasswordChange(testEmail, request);
        });

        assertEquals(ErrorCode.INVALID_CREDENTIALS, exception.getErrorCode());
        assertEquals("La contraseña actual es incorrecta", exception.getMessage());
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void initiatePasswordChange_ShouldThrowException_WhenNewPasswordIsSameAsCurrent() {
        InitiatePasswordChangeRequest request = new InitiatePasswordChangeRequest("currentPassword", "currentPassword");

        when(userRepository.findByEmail(testEmail)).thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches("currentPassword", testUser.getPassword()))
                .thenReturn(true);

        IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> userService.initiatePasswordChange(testEmail, request));

        assertEquals(
                "La nueva contraseña debe ser diferente a la actual",
                exception.getMessage());

        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void initiatePasswordChange_ShouldSavePendingPassword_WhenRequestIsValid() {
        String currentPassword = "currentPassword";
        String newPassword = "newPassword123";
        String encodedNewPassword = "encodedNewPassword";

        InitiatePasswordChangeRequest request = new InitiatePasswordChangeRequest(currentPassword, newPassword);

        when(userRepository.findByEmail(testEmail)).thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches(currentPassword, testUser.getPassword()))
                .thenReturn(true);
        when(passwordEncoder.matches(newPassword, testUser.getPassword()))
                .thenReturn(false);
        when(passwordEncoder.encode(newPassword))
                .thenReturn(encodedNewPassword);

        userService.initiatePasswordChange(testEmail, request);

        assertEquals(encodedNewPassword, testUser.getPendingPassword());
        verify(userRepository).save(testUser);
        verify(passwordEncoder).encode(newPassword);
    }

    @Test
    void confirmPasswordChange_ShouldThrowException_WhenUserNotFound() {
        ConfirmPasswordChangeRequest request = new ConfirmPasswordChangeRequest(true);

        when(userRepository.findByEmail(testEmail)).thenReturn(Optional.empty());

        AuthException exception = assertThrows(AuthException.class, () -> {
            userService.confirmPasswordChange(testEmail, request);
        });

        assertEquals(ErrorCode.USER_NOT_FOUND, exception.getErrorCode());
        assertEquals("User not found", exception.getMessage());
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void confirmPasswordChange_ShouldThrowException_WhenNoPendingPassword() {
        testUser.setPendingPassword(null);
        ConfirmPasswordChangeRequest request = new ConfirmPasswordChangeRequest(true);

        when(userRepository.findByEmail(testEmail))
                .thenReturn(Optional.of(testUser));

        IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> userService.confirmPasswordChange(testEmail, request));

        assertEquals(
                "No hay un cambio de contraseña pendiente",
                exception.getMessage());
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void confirmPasswordChange_ShouldUpdatePasswordAndClearPendingPassword_WhenConfirmed() {
        String currentPassword = "encodedCurrentPassword";
        String pendingPassword = "encodedNewPassword";

        testUser.setPassword(currentPassword);
        testUser.setPendingPassword(pendingPassword);

        ConfirmPasswordChangeRequest request = new ConfirmPasswordChangeRequest(true);

        when(userRepository.findByEmail(testEmail))
                .thenReturn(Optional.of(testUser));

        userService.confirmPasswordChange(testEmail, request);

        assertEquals(pendingPassword, testUser.getPassword());
        assertNull(testUser.getPendingPassword());
        verify(userRepository).save(testUser);
    }

    @Test
    void confirmPasswordChange_ShouldKeepCurrentPasswordAndClearPendingPassword_WhenRejected() {
        String currentPassword = "encodedCurrentPassword";
        String pendingPassword = "encodedNewPassword";

        testUser.setPassword(currentPassword);
        testUser.setPendingPassword(pendingPassword);

        ConfirmPasswordChangeRequest request = new ConfirmPasswordChangeRequest(false);

        when(userRepository.findByEmail(testEmail))
                .thenReturn(Optional.of(testUser));

        userService.confirmPasswordChange(testEmail, request);

        assertEquals(currentPassword, testUser.getPassword());
        assertNull(testUser.getPendingPassword());
        verify(userRepository).save(testUser);
    }

    @Test
    void updateFcmToken_ShouldUpdateToken_WhenUserExists() {
        String fcmToken = "new-fcm-token";
        when(userRepository.findByEmail(testEmail)).thenReturn(Optional.of(testUser));

        userService.updateFcmToken(testEmail, fcmToken);

        assertEquals(fcmToken, testUser.getFcmToken());
        verify(userRepository, times(1)).save(testUser);
    }

    @Test
    void updateEstimatedMonthlyIncome_ShouldUpdateIncome_WhenValidValue() {
        BigDecimal income = BigDecimal.valueOf(75000);
        testUser.setEstimatedMonthlyIncome(BigDecimal.ZERO);

        when(userRepository.findByEmail(testEmail)).thenReturn(Optional.of(testUser));

        UserProfileResponse response = userService.updateEstimatedMonthlyIncome(testEmail, income);

        assertEquals(income, testUser.getEstimatedMonthlyIncome());
        verify(userRepository).save(testUser);
        assertNotNull(response);
        assertEquals(income, response.estimatedMonthlyIncome());
    }

    @Test
    void updateEstimatedMonthlyIncome_ShouldAllowZero() {
        BigDecimal income = BigDecimal.ZERO;

        when(userRepository.findByEmail(testEmail)).thenReturn(Optional.of(testUser));

        userService.updateEstimatedMonthlyIncome(testEmail, income);

        assertEquals(BigDecimal.ZERO, testUser.getEstimatedMonthlyIncome());
        verify(userRepository).save(testUser);
    }

    @Test
    void updateEstimatedMonthlyIncome_ShouldThrowException_WhenValueIsNull() {
        when(userRepository.findByEmail(testEmail)).thenReturn(Optional.of(testUser));

        IllegalArgumentException ex = assertThrows(
                IllegalArgumentException.class,
                () -> userService.updateEstimatedMonthlyIncome(testEmail, null));

        assertEquals("Estimated monthly income cannot be null", ex.getMessage());
        verify(userRepository, never()).save(any());
    }

    @Test
    void updateEstimatedMonthlyIncome_ShouldThrowException_WhenValueIsNegative() {
        when(userRepository.findByEmail(testEmail)).thenReturn(Optional.of(testUser));

        IllegalArgumentException ex = assertThrows(
                IllegalArgumentException.class,
                () -> userService.updateEstimatedMonthlyIncome(testEmail, BigDecimal.valueOf(-100)));

        assertEquals("Estimated monthly income cannot be negative", ex.getMessage());
        verify(userRepository, never()).save(any());
    }

    @Test
    void updateEstimatedMonthlyIncome_ShouldThrowException_WhenUserNotFound() {
        when(userRepository.findByEmail(testEmail)).thenReturn(Optional.empty());

        AuthException ex = assertThrows(
                AuthException.class,
                () -> userService.updateEstimatedMonthlyIncome(testEmail, BigDecimal.valueOf(5000)));

        assertEquals(ErrorCode.USER_NOT_FOUND, ex.getErrorCode());
        verify(userRepository, never()).save(any());
    }

    @Test
    void updateExpensesStructure_ShouldUpdateUserAndSavings_WhenValidValues() {
        Integer fixed = 50;
        Integer variable = 30;

        testUser.setTargetFixedExpenses(0);
        testUser.setTargetVariableExpenses(0);
        testUser.setTargetSavings(0);

        when(userRepository.findByEmail(testEmail))
                .thenReturn(Optional.of(testUser));

        UserProfileResponse response = userService.updateExpensesStructure(
                testEmail,
                fixed,
                variable);

        assertEquals(fixed, testUser.getTargetFixedExpenses());
        assertEquals(variable, testUser.getTargetVariableExpenses());
        assertEquals(20, testUser.getTargetSavings());

        verify(userRepository).save(testUser);

        assertNotNull(response);
        assertEquals(fixed, response.targetFixedExpenses());
        assertEquals(variable, response.targetVariableExpenses());
        assertEquals(20, response.targetSavings());
    }

    @Test
    void updateExpensesStructure_ShouldThrowException_WhenValuesAreNull() {
        when(userRepository.findByEmail(testEmail))
                .thenReturn(Optional.of(testUser));

        IllegalArgumentException ex = assertThrows(
                IllegalArgumentException.class,
                () -> userService.updateExpensesStructure(testEmail, null, null)
        );

        assertEquals("Targets cannot be null", ex.getMessage());

        verify(userRepository, times(0)).save(any());
    }

    @Test
    void updateExpensesStructure_ShouldThrowException_WhenValuesAreNegative() {
        when(userRepository.findByEmail(testEmail))
                .thenReturn(Optional.of(testUser));

        IllegalArgumentException ex = assertThrows(
                IllegalArgumentException.class,
                () -> userService.updateExpensesStructure(testEmail, -10, 20)
        );

        assertEquals("Targets cannot be negative", ex.getMessage());

        verify(userRepository, times(0)).save(any());
    }

    @Test
    void updateExpensesStructure_ShouldThrowException_WhenSumExceeds100() {
        when(userRepository.findByEmail(testEmail))
                .thenReturn(Optional.of(testUser));

        IllegalArgumentException ex = assertThrows(
                IllegalArgumentException.class,
                () -> userService.updateExpensesStructure(testEmail, 80, 30)
        );

        assertEquals("Sum of expenses cannot exceed 100", ex.getMessage());

        verify(userRepository, times(0)).save(any());
    }

    @Test
    void updateNotificationChannel_ShouldUpdateUser_WhenValidChannel() {
        when(userRepository.findByEmail(testEmail)).thenReturn(Optional.of(testUser));

        UserProfileResponse response = userService.updateNotificationChannel(
                testEmail,
                org.fiuba.guitapp.model.NotificationChannel.EMAIL);

        assertEquals(org.fiuba.guitapp.model.NotificationChannel.EMAIL, testUser.getNotificationChannel());
        verify(userRepository).save(testUser);
        assertEquals(org.fiuba.guitapp.model.NotificationChannel.EMAIL, response.notificationChannel());
    }

    @Test
    void updateNotificationChannel_ShouldThrowException_WhenUserNotFound() {
        when(userRepository.findByEmail(testEmail)).thenReturn(Optional.empty());

        AuthException ex = assertThrows(
                AuthException.class,
                () -> userService.updateNotificationChannel(
                        testEmail,
                        org.fiuba.guitapp.model.NotificationChannel.PUSH));

        assertEquals(ErrorCode.USER_NOT_FOUND, ex.getErrorCode());
        verify(userRepository, never()).save(any());
    }

    @Test
    void updateNotificationFrequency_ShouldUpdateUser_WhenValidFrequency() {
        when(userRepository.findByEmail(testEmail)).thenReturn(Optional.of(testUser));

        UserProfileResponse response = userService.updateNotificationFrequency(
                testEmail,
                NotificationFrequency.WEEKLY);

        assertEquals(NotificationFrequency.WEEKLY, testUser.getNotificationFrequency());
        verify(userRepository).save(testUser);
        assertEquals(NotificationFrequency.WEEKLY, response.notificationFrequency());
        verify(userNotificationService, never()).releasePendingNotifications(any());
    }

    @Test
    void updateNotificationFrequency_ShouldReleasePendingNotifications_WhenSwitchingToInstantFromDaily() {
        testUser.setNotificationFrequency(NotificationFrequency.DAILY);
        when(userRepository.findByEmail(testEmail)).thenReturn(Optional.of(testUser));

        userService.updateNotificationFrequency(testEmail, NotificationFrequency.INSTANT);

        verify(userNotificationService).releasePendingNotifications(testUser);
    }

    @Test
    void updateNotificationFrequency_ShouldReleasePendingNotifications_WhenSwitchingToInstantFromWeekly() {
        testUser.setNotificationFrequency(NotificationFrequency.WEEKLY);
        when(userRepository.findByEmail(testEmail)).thenReturn(Optional.of(testUser));

        userService.updateNotificationFrequency(testEmail, NotificationFrequency.INSTANT);

        verify(userNotificationService).releasePendingNotifications(testUser);
    }

    @Test
    void updateNotificationFrequency_ShouldThrowException_WhenUserNotFound() {
        when(userRepository.findByEmail(testEmail)).thenReturn(Optional.empty());

        AuthException ex = assertThrows(
                AuthException.class,
                () -> userService.updateNotificationFrequency(testEmail, NotificationFrequency.DAILY));

        assertEquals(ErrorCode.USER_NOT_FOUND, ex.getErrorCode());
        verify(userRepository, never()).save(any());
    }
}
