package org.fiuba.guitapp.service;

import org.fiuba.guitapp.model.User;
import org.fiuba.guitapp.model.UserStatus;
import org.fiuba.guitapp.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTests {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private OtpService otpService;

    @Mock
    private EmailService emailService;

    @InjectMocks
    private AuthService authService;

    @Test
    void shouldRegisterUserSuccessfully() {
        String email = "newuser@example.com";
        String password = "Password123";
        String encodedPassword = "encoded_password";
        String otp = "123456";

        when(userRepository.findByEmail(email)).thenReturn(Optional.empty());
        when(passwordEncoder.encode(password)).thenReturn(encodedPassword);
        when(otpService.generateOtp()).thenReturn(otp);
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        authService.register(email, password);

        verify(userRepository).save(argThat(user -> 
            user.getEmail().equals(email) &&
            user.getPassword().equals(encodedPassword) &&
            user.getStatus() == UserStatus.PENDING_VERIFICATION &&
            user.getVerificationOtp().equals(otp)
        ));
        verify(emailService).sendRegistrationOtp(email, otp);
    }

    @Test
    void shouldThrowExceptionWhenEmailAlreadyExists() {
        String email = "existing@example.com";
        when(userRepository.findByEmail(email)).thenReturn(Optional.of(new User()));

        assertThatThrownBy(() -> authService.register(email, "password"))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Email already exists");
    }

    @Test
    void shouldVerifyRegistrationSuccessfully() {
        String email = "verify@example.com";
        String otp = "123456";
        User user = new User();
        user.setEmail(email);
        user.setVerificationOtp(otp);
        user.setStatus(UserStatus.PENDING_VERIFICATION);
        user.setOtpCreatedAt(java.time.LocalDateTime.now());

        when(userRepository.findByEmail(email)).thenReturn(Optional.of(user));
        when(otpService.isOtpExpired(any())).thenReturn(false);

        authService.verifyRegistration(email, otp);

        assertThat(user.getStatus()).isEqualTo(UserStatus.ACTIVE);
        verify(userRepository).save(user);
    }

    @Test
    void shouldThrowExceptionWhenOtpIsInvalid() {
        String email = "verify@example.com";
        User user = new User();
        user.setEmail(email);
        user.setVerificationOtp("123456");

        when(userRepository.findByEmail(email)).thenReturn(Optional.of(user));

        assertThatThrownBy(() -> authService.verifyRegistration(email, "wrong_otp"))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Invalid OTP");
    }

    @Test
    void shouldThrowExceptionWhenOtpIsExpired() {
        String email = "verify@example.com";
        String otp = "123456";
        User user = new User();
        user.setEmail(email);
        user.setVerificationOtp(otp);

        when(userRepository.findByEmail(email)).thenReturn(Optional.of(user));
        when(otpService.isOtpExpired(any())).thenReturn(true);

        assertThatThrownBy(() -> authService.verifyRegistration(email, otp))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("OTP expired");
    }
}
