package org.fiuba.guitapp.service;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class JwtServiceTests {

    private JwtService jwtService;

    @BeforeEach
    void setUp() {
        jwtService = new JwtService();
    }

    @Test
    void shouldGenerateValidToken() {
        String email = "test@example.com";
        String token = jwtService.generateToken(email);

        assertThat(token).isNotBlank();
    }

    @Test
    void shouldExtractEmailFromToken() {
        String email = "test@example.com";
        String token = jwtService.generateToken(email);

        String extractedEmail = jwtService.extractEmail(token);
        assertThat(extractedEmail).isEqualTo(email);
    }

    @Test
    void shouldValidateTokenCorrectly() {
        String email = "test@example.com";
        String token = jwtService.generateToken(email);

        assertThat(jwtService.isTokenValid(token, email)).isTrue();
        assertThat(jwtService.isTokenValid(token, "other@example.com")).isFalse();
    }
}
