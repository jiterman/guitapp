package org.fiuba.guitapp.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.fiuba.guitapp.dto.RegisterRequest;
import org.fiuba.guitapp.dto.VerifyRegistrationRequest;
import org.fiuba.guitapp.service.AuthService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.Map;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AuthControllerTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private AuthService authService;

    @Test
    void shouldReturnOkWhenRegistrationIsSuccessful() throws Exception {
        RegisterRequest request = new RegisterRequest("test@example.com", "Password123");
        when(authService.register(request.email(), request.password()))
                .thenReturn(Map.of("message", "Registration successful. Please check your email for the OTP.", "code", "REGISTRATION_SUCCESS"));

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk());
    }

    @Test
    void shouldReturnBadRequestWhenRegistrationDataIsInvalid() throws Exception {
        RegisterRequest request = new RegisterRequest("invalid-email", "short");

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void shouldReturnOkWhenVerificationIsSuccessful() throws Exception {
        VerifyRegistrationRequest request = new VerifyRegistrationRequest("test@example.com", "123456");
        doNothing().when(authService).verifyRegistration(request.email(), request.otp());

        mockMvc.perform(post("/api/auth/verify-registration")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk());
    }

    @Test
    void shouldReturnOkWithTokenWhenLoginIsSuccessful() throws Exception {
        Map<String, String> loginRequest = Map.of("email", "test@example.com", "password", "Password123");
        when(authService.login("test@example.com", "Password123"))
                .thenReturn(Map.of("token", "dummy-jwt-token"));

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk());
    }
}
