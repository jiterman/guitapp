package org.fiuba.guitapp.service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Map;

import org.fiuba.guitapp.dto.ConfirmPasswordChangeRequest;
import org.fiuba.guitapp.dto.InitiateEmailChangeRequest;
import org.fiuba.guitapp.dto.InitiatePasswordChangeRequest;
import org.fiuba.guitapp.dto.OnboardingRequest;
import org.fiuba.guitapp.dto.UpdateUserProfileRequest;
import org.fiuba.guitapp.dto.UserProfileResponse;
import org.fiuba.guitapp.dto.VerifyEmailChangeRequest;
import org.fiuba.guitapp.exception.AuthException;
import org.fiuba.guitapp.exception.ErrorCode;
import org.fiuba.guitapp.model.NotificationChannel;
import org.fiuba.guitapp.model.NotificationFrequency;
import org.fiuba.guitapp.model.User;
import org.fiuba.guitapp.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.cloudinary.Cloudinary;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final UserNotificationService userNotificationService;
    private final Cloudinary cloudinary;
    private final OtpService otpService;
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;
    private static final long MAX_FILE_SIZE = 5 * 1024 * 1024;

    public UserProfileResponse getUserProfile(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AuthException(ErrorCode.USER_NOT_FOUND, "User not found"));

        return toUserProfileResponse(user);
    }

    private UserProfileResponse toUserProfileResponse(User user) {
        return new UserProfileResponse(
                user.getId(),
                user.getEmail(),
                user.getFirstName(),
                user.getLastName(),
                user.getAvatarUrl(),
                user.isOnboardingCompleted(),
                user.getEstimatedMonthlyIncome(),
                user.getTargetFixedExpenses(),
                user.getTargetVariableExpenses(),
                user.getTargetSavings(),
                user.getNotificationChannel(),
                user.getNotificationFrequency(),
                user.getCreatedAt());
    }

    @Transactional
    public UserProfileResponse updateNotificationFrequency(String email, NotificationFrequency notificationFrequency) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AuthException(ErrorCode.USER_NOT_FOUND, "User not found"));

        NotificationFrequency previousFrequency = user.getNotificationFrequency();
        user.setNotificationFrequency(notificationFrequency);
        userRepository.save(user);

        if (notificationFrequency == NotificationFrequency.INSTANT
                && (previousFrequency == NotificationFrequency.DAILY
                        || previousFrequency == NotificationFrequency.WEEKLY)) {
            userNotificationService.releasePendingNotifications(user);
        }

        return toUserProfileResponse(user);
    }

    @Transactional
    public UserProfileResponse updateNotificationChannel(String email, NotificationChannel notificationChannel) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AuthException(ErrorCode.USER_NOT_FOUND, "User not found"));

        user.setNotificationChannel(notificationChannel);
        userRepository.save(user);

        return toUserProfileResponse(user);
    }

    @Transactional
    public void completeOnboarding(String email, OnboardingRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AuthException(ErrorCode.USER_NOT_FOUND, "User not found"));

        if (user.isOnboardingCompleted()) {
            throw new IllegalArgumentException("Onboarding already completed");
        }

        int total = request.targetFixedExpenses() + request.targetVariableExpenses();
        if (total > 100) {
            throw new IllegalArgumentException("Sum of expenses cannot exceed 100");
        }
        int savings = 100 - total;

        user.setFirstName(request.firstName());
        user.setTargetFixedExpenses(request.targetFixedExpenses());
        user.setTargetVariableExpenses(request.targetVariableExpenses());
        user.setTargetSavings(savings);
        user.setEstimatedMonthlyIncome(request.estimatedMonthlyIncome());
        user.setOnboardingCompleted(true);

        userRepository.save(user);
    }

    @Transactional
    public UserProfileResponse updateUserProfile(String email, UpdateUserProfileRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AuthException(ErrorCode.USER_NOT_FOUND, "User not found"));

        user.setFirstName(request.firstName());

        if (request.lastName() == null || request.lastName().isBlank()) {
            user.setLastName(null);
        } else {
            user.setLastName(request.lastName());
        }
        userRepository.save(user);

        return toUserProfileResponse(user);
    }

    private void validateAvatarFile(MultipartFile file) {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("File is empty");
        }
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new IllegalArgumentException("Max file size is 5MB");
        }
        String contentType = file.getContentType();
        if (contentType == null ||
                !(contentType.equals("image/png")
                        || contentType.equals("image/jpeg")
                        || contentType.equals("image/webp"))) {

            throw new IllegalArgumentException("Only PNG, JPG or WEBP images are allowed");
        }
    }

    @Transactional
    public UserProfileResponse updateAvatar(String email, MultipartFile file) {
        validateAvatarFile(file);
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AuthException(
                        ErrorCode.USER_NOT_FOUND,
                        "User not found"));
        try {
            Map uploadResult = cloudinary.uploader()
                    .upload(
                            file.getBytes(),
                            Map.of("folder", "avatars"));
            String url = uploadResult.get("secure_url").toString();
            user.setAvatarUrl(url);
            userRepository.save(user);
            return toUserProfileResponse(user);

        } catch (Exception e) {
            throw new RuntimeException("Error uploading avatar", e);
        }
    }

    @Transactional
    public void initiateEmailChange(String currentEmail, InitiateEmailChangeRequest request) {
        User user = userRepository.findByEmail(currentEmail)
                .orElseThrow(() -> new AuthException(ErrorCode.USER_NOT_FOUND, "User not found"));

        if (user.getEmail().equals(request.newEmail())) {
            throw new IllegalArgumentException("El nuevo email debe ser diferente al actual");
        }

        if (userRepository.findByEmail(request.newEmail()).isPresent()) {
            throw new AuthException(ErrorCode.MAIL_ALREADY_USED, "El email ya está en uso");
        }

        String otp = otpService.generateOtp();
        user.setPendingEmail(request.newEmail());
        user.setVerificationOtp(otp);
        user.setOtpCreatedAt(LocalDateTime.now());

        userRepository.save(user);
        emailService.sendEmailChangeOtp(request.newEmail(), otp);
    }

    @Transactional
    public void verifyEmailChange(String currentEmail, VerifyEmailChangeRequest request) {
        User user = userRepository.findByEmail(currentEmail)
                .orElseThrow(() -> new AuthException(ErrorCode.USER_NOT_FOUND, "User not found"));

        if (user.getPendingEmail() == null) {
            throw new IllegalArgumentException("No hay un cambio de email pendiente");
        }

        if (!user.getVerificationOtp().equals(request.otp())) {
            throw new AuthException(ErrorCode.INVALID_OTP, "Código OTP inválido");
        }

        if (otpService.isOtpExpired(user.getOtpCreatedAt())) {
            throw new AuthException(ErrorCode.OTP_EXPIRED, "El código OTP ha expirado");
        }

        user.setEmail(user.getPendingEmail());
        user.setPendingEmail(null);
        user.setVerificationOtp(null);
        user.setOtpCreatedAt(null);

        userRepository.save(user);
    }

    @Transactional
    public void initiatePasswordChange(String email, InitiatePasswordChangeRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AuthException(
                        ErrorCode.USER_NOT_FOUND,
                        "User not found"));

        if (!passwordEncoder.matches(
                request.currentPassword(),
                user.getPassword())) {
            throw new AuthException(
                    ErrorCode.INVALID_CREDENTIALS,
                    "La contraseña actual es incorrecta");
        }

        if (passwordEncoder.matches(
                request.newPassword(),
                user.getPassword())) {
            throw new IllegalArgumentException(
                    "La nueva contraseña debe ser diferente a la actual");
        }
        user.setPendingPassword(passwordEncoder.encode(request.newPassword()));
        userRepository.save(user);
    }

    @Transactional
    public void confirmPasswordChange(
            String email,
            ConfirmPasswordChangeRequest request) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AuthException(
                        ErrorCode.USER_NOT_FOUND,
                        "User not found"));

        if (user.getPendingPassword() == null) {
            throw new IllegalArgumentException(
                    "No hay un cambio de contraseña pendiente");
        }

        if (request.confirmed()) {
            user.setPassword(user.getPendingPassword());
        }

        user.setPendingPassword(null);

        userRepository.save(user);
    }

    @Transactional
    public void updateFcmToken(String email, String fcmToken) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AuthException(ErrorCode.USER_NOT_FOUND, "User not found"));

        user.setFcmToken(fcmToken);
        userRepository.save(user);
    }

    @Transactional
    public UserProfileResponse updateEstimatedMonthlyIncome(String email, BigDecimal estimatedMonthlyIncome) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AuthException(ErrorCode.USER_NOT_FOUND, "User not found"));

        if (estimatedMonthlyIncome == null) {
            throw new IllegalArgumentException("Estimated monthly income cannot be null");
        }
        if (estimatedMonthlyIncome.compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("Estimated monthly income cannot be negative");
        }

        user.setEstimatedMonthlyIncome(estimatedMonthlyIncome);
        userRepository.save(user);

        return toUserProfileResponse(user);
    }

    @Transactional
    public UserProfileResponse updateExpensesStructure(
            String email,
            Integer targetFixedExpenses,
            Integer targetVariableExpenses) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AuthException(
                        ErrorCode.USER_NOT_FOUND,
                        "User not found"));

        if (targetFixedExpenses == null || targetVariableExpenses == null) {
            throw new IllegalArgumentException("Targets cannot be null");
        }
        if (targetFixedExpenses < 0 || targetVariableExpenses < 0) {
            throw new IllegalArgumentException("Targets cannot be negative");
        }
        if (targetFixedExpenses > 100 || targetVariableExpenses > 100) {
            throw new IllegalArgumentException("Targets must be between 0 and 100");
        }

        int total = targetFixedExpenses + targetVariableExpenses;

        if (total > 100) {
            throw new IllegalArgumentException("Sum of expenses cannot exceed 100");
        }

        int savings = 100 - total;

        user.setTargetFixedExpenses(targetFixedExpenses);
        user.setTargetVariableExpenses(targetVariableExpenses);
        user.setTargetSavings(savings);

        userRepository.save(user);

        return toUserProfileResponse(user);
    }
}
