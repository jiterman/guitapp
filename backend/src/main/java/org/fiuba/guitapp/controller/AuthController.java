package org.fiuba.guitapp.controller;

import java.util.Map;

import org.fiuba.guitapp.dto.ForgotPasswordRequest;
import org.fiuba.guitapp.dto.LoginRequest;
import org.fiuba.guitapp.dto.RegisterRequest;
import org.fiuba.guitapp.dto.ResetPasswordRequest;
import org.fiuba.guitapp.dto.VerifyRegistrationRequest;
import org.fiuba.guitapp.dto.VerifyResetOtpRequest;
import org.fiuba.guitapp.service.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request) {
        Map<String, Object> response = authService.register(request.email(), request.password());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/verify-registration")
    public ResponseEntity<?> verifyRegistration(@Valid @RequestBody VerifyRegistrationRequest request) {
        authService.verifyRegistration(request.email(), request.otp());
        return ResponseEntity.ok(Map.of("message", "Account activated successfully. You can now log in."));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {
        Map<String, Object> response = authService.login(request.email(), request.password());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        authService.forgotPassword(request.email());
        return ResponseEntity.ok(Map.of("message", "If an account exists for this email, a reset code has been sent."));
    }

    @PostMapping("/verify-reset-otp")
    public ResponseEntity<?> verifyResetOtp(@Valid @RequestBody VerifyResetOtpRequest request) {
        authService.verifyResetOtp(request.email(), request.otp());
        return ResponseEntity.ok(Map.of("message", "OTP verified successfully."));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        authService.resetPassword(request.email(), request.otp(), request.newPassword());
        return ResponseEntity.ok(Map.of("message", "Password reset successfully."));
    }
}
