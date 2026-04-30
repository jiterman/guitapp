package org.fiuba.guitapp.service;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.LocalDateTime;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class OtpServiceTests {

    private OtpService otpService;

    @BeforeEach
    void setUp() {
        otpService = new OtpService();
    }

    @Test
    void shouldGenerateSixDigitCode() {
        String otp = otpService.generateOtp();
        assertThat(otp).hasSize(6);
        assertThat(otp).containsOnlyDigits();
    }

    @Test
    void shouldValidateNonExpiredOtp() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime createdAt = now.minusMinutes(5); // 5 minutes ago

        boolean isValid = otpService.isOtpExpired(createdAt);

        assertThat(isValid).isFalse();
    }

    @Test
    void shouldInvalidateExpiredOtp() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime createdAt = now.minusMinutes(11); // 11 minutes ago

        boolean isValid = otpService.isOtpExpired(createdAt);

        assertThat(isValid).isTrue();
    }
}
