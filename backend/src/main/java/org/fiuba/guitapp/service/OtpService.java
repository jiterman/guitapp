package org.fiuba.guitapp.service;

import java.time.LocalDateTime;
import java.util.Random;

import org.springframework.stereotype.Service;

@Service
public class OtpService {

    private static final int OTP_LENGTH = 6;
    private static final int EXPIRATION_MINUTES = 10;
    private final Random random = new Random();

    public String generateOtp() {
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < OTP_LENGTH; i++) {
            sb.append(random.nextInt(10));
        }
        return sb.toString();
    }

    public boolean isOtpExpired(LocalDateTime createdAt) {
        return createdAt.plusMinutes(EXPIRATION_MINUTES).isBefore(LocalDateTime.now());
    }
}
