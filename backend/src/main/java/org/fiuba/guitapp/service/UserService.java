package org.fiuba.guitapp.service;

import java.time.LocalDateTime;
import java.util.Map;

import org.fiuba.guitapp.dto.InitiateEmailChangeRequest;
import org.fiuba.guitapp.dto.OnboardingRequest;
import org.fiuba.guitapp.dto.UpdateUserProfileRequest;
import org.fiuba.guitapp.dto.UserProfileResponse;
import org.fiuba.guitapp.dto.VerifyEmailChangeRequest;
import org.fiuba.guitapp.exception.AuthException;
import org.fiuba.guitapp.exception.ErrorCode;
import org.fiuba.guitapp.model.User;
import org.fiuba.guitapp.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.cloudinary.Cloudinary;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final Cloudinary cloudinary;
    private final OtpService otpService;
    private final EmailService emailService;
    private static final long MAX_FILE_SIZE = 5 * 1024 * 1024;

    public UserProfileResponse getUserProfile(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AuthException(ErrorCode.USER_NOT_FOUND, "User not found"));

        return new UserProfileResponse(
                user.getId(),
                user.getEmail(),
                user.getFirstName(),
                user.getLastName(),
                user.getAvatarUrl(),
                user.isOnboardingCompleted(),
                user.getTargetFixedExpenses(),
                user.getTargetVariableExpenses(),
                user.getTargetSavings());
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

        return new UserProfileResponse(
                user.getId(),
                user.getEmail(),
                user.getFirstName(),
                user.getLastName(),
                user.getAvatarUrl(),
                user.isOnboardingCompleted(),
                user.getTargetFixedExpenses(),
                user.getTargetVariableExpenses(),
                user.getTargetSavings());
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
            return new UserProfileResponse(
                    user.getId(),
                    user.getEmail(),
                    user.getFirstName(),
                    user.getLastName(),
                    user.getAvatarUrl(),
                    user.isOnboardingCompleted(),
                    user.getTargetFixedExpenses(),
                    user.getTargetVariableExpenses(),
                    user.getTargetSavings());

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
}
