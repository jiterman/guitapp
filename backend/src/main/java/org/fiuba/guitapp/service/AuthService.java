package org.fiuba.guitapp.service;

import java.time.LocalDateTime;
import java.util.Map;

import org.fiuba.guitapp.exception.AuthException;
import org.fiuba.guitapp.exception.ErrorCode;
import org.fiuba.guitapp.model.User;
import org.fiuba.guitapp.model.UserStatus;
import org.fiuba.guitapp.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final OtpService otpService;
    private final EmailService emailService;

    @Transactional
    public Map<String, Object> register(String email, String password) {
        return userRepository.findByEmail(email).map(existingUser -> {
            if (existingUser.getStatus() == UserStatus.PENDING_VERIFICATION) {
                String newOtp = otpService.generateOtp();
                existingUser.setVerificationOtp(newOtp);
                existingUser.setOtpCreatedAt(LocalDateTime.now());
                userRepository.save(existingUser);
                emailService.sendRegistrationOtp(email, newOtp);
                return Map.<String, Object> of("message", "User already exists but pending verification. New OTP sent.",
                        "code", "OTP_RESENT");
            } else {
                throw new AuthException(ErrorCode.MAIL_ALREADY_USED, "Email already exists");
            }
        }).orElseGet(() -> {
            User user = new User();
            user.setEmail(email);
            user.setPassword(passwordEncoder.encode(password));
            user.setStatus(UserStatus.PENDING_VERIFICATION);

            String otp = otpService.generateOtp();
            user.setVerificationOtp(otp);
            user.setOtpCreatedAt(LocalDateTime.now());

            userRepository.save(user);
            emailService.sendRegistrationOtp(email, otp);
            return Map.<String, Object> of("message", "Registration successful. Please check your email for the OTP.",
                    "code", "REGISTRATION_SUCCESS");
        });
    }

    @Transactional
    public void verifyRegistration(String email, String otp) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AuthException(ErrorCode.USER_NOT_FOUND, "User not found"));

        if (user.getStatus() == UserStatus.ACTIVE) {
            throw new AuthException(ErrorCode.USER_ALREADY_VERIFIED, "User already verified");
        }

        if (!user.getVerificationOtp().equals(otp)) {
            throw new AuthException(ErrorCode.INVALID_OTP, "Invalid OTP");
        }

        if (otpService.isOtpExpired(user.getOtpCreatedAt())) {
            throw new AuthException(ErrorCode.OTP_EXPIRED, "OTP expired");
        }

        user.setStatus(UserStatus.ACTIVE);
        user.setVerificationOtp(null);
        user.setOtpCreatedAt(null);
        userRepository.save(user);
    }
}
