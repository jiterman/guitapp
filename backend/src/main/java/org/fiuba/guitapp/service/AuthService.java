package org.fiuba.guitapp.service;

import lombok.RequiredArgsConstructor;
import org.fiuba.guitapp.model.User;
import org.fiuba.guitapp.model.UserStatus;
import org.fiuba.guitapp.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final OtpService otpService;
    private final EmailService emailService;

    @Transactional
    public void register(String email, String password) {
        if (userRepository.findByEmail(email).isPresent()) {
            throw new RuntimeException("Email already exists");
        }

        User user = new User();
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(password));
        user.setStatus(UserStatus.PENDING_VERIFICATION);
        
        String otp = otpService.generateOtp();
        user.setVerificationOtp(otp);
        user.setOtpCreatedAt(LocalDateTime.now());

        userRepository.save(user);
        emailService.sendRegistrationOtp(email, otp);
    }

    @Transactional
    public void verifyRegistration(String email, String otp) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getStatus() == UserStatus.ACTIVE) {
            throw new RuntimeException("User already verified");
        }

        if (!user.getVerificationOtp().equals(otp)) {
            throw new RuntimeException("Invalid OTP");
        }

        if (otpService.isOtpExpired(user.getOtpCreatedAt())) {
            throw new RuntimeException("OTP expired");
        }

        user.setStatus(UserStatus.ACTIVE);
        user.setVerificationOtp(null);
        user.setOtpCreatedAt(null);
        userRepository.save(user);
    }
}
