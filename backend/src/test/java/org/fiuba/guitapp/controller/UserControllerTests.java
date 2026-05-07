package org.fiuba.guitapp.controller;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import java.util.UUID;

import org.fiuba.guitapp.dto.OnboardingRequest;
import org.fiuba.guitapp.dto.UpdateUserProfileRequest;
import org.fiuba.guitapp.dto.UserProfileResponse;
import org.fiuba.guitapp.service.UserService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import com.fasterxml.jackson.databind.ObjectMapper;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class UserControllerTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private UserService userService;

    @Test
    @WithMockUser(username = "test@example.com")
    void getMe_ShouldReturnUserProfile() throws Exception {
        UUID userId = UUID.randomUUID();
        UserProfileResponse response = new UserProfileResponse(
                userId,
                "test@example.com",
                "John",
                "Doe",
                "https://avatar.png",
                true,
                30,
                50,
                20);

        when(userService.getUserProfile("test@example.com")).thenReturn(response);

        mockMvc.perform(get("/api/users/me")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(userId.toString()))
                .andExpect(jsonPath("$.email").value("test@example.com"))
                .andExpect(jsonPath("$.firstName").value("John"))
                .andExpect(jsonPath("$.lastName").value("Doe"))
                .andExpect(jsonPath("$.avatarUrl").value("https://avatar.png"))
                .andExpect(jsonPath("$.onboardingCompleted").value(true))
                .andExpect(jsonPath("$.targetFixedExpenses").value(30))
                .andExpect(jsonPath("$.targetVariableExpenses").value(50))
                .andExpect(jsonPath("$.targetSavings").value(20));

        verify(userService, times(1)).getUserProfile("test@example.com");
    }

    @Test
    @WithMockUser(username = "test@example.com")
    void completeOnboarding_ShouldReturnSuccessMessage() throws Exception {
        OnboardingRequest request = new OnboardingRequest("Maria", 30, 50);

        doNothing().when(userService).completeOnboarding(eq("test@example.com"), any(OnboardingRequest.class));

        mockMvc.perform(put("/api/users/me/onboarding")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Onboarding completed successfully"));

        verify(userService, times(1)).completeOnboarding(eq("test@example.com"), any(OnboardingRequest.class));
    }

    @Test
    @WithMockUser(username = "test@example.com")
    void completeOnboarding_ShouldReturnBadRequest_WithInvalidData() throws Exception {
        OnboardingRequest request = new OnboardingRequest("", 30, 50);

        mockMvc.perform(put("/api/users/me/onboarding")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());

        verify(userService, never()).completeOnboarding(anyString(), any(OnboardingRequest.class));
    }

    @Test
    @WithMockUser(username = "test@example.com")
    void completeOnboarding_ShouldReturnBadRequest_WhenExpensesTooHigh() throws Exception {
        OnboardingRequest request = new OnboardingRequest("John", 99, 50);

        mockMvc.perform(put("/api/users/me/onboarding")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());

        verify(userService, never()).completeOnboarding(anyString(), any(OnboardingRequest.class));
    }

    @Test
    @WithMockUser(username = "test@example.com")
    void updateProfile_ShouldReturnUpdatedProfile() throws Exception {
        UpdateUserProfileRequest request = new UpdateUserProfileRequest(
                "John",
                "Doe");

        UUID userId = UUID.randomUUID();

        UserProfileResponse response = new UserProfileResponse(
                userId,
                "test@example.com",
                "John",
                "Doe",
                "https://avatar.png",
                true,
                30,
                50,
                20);

        when(userService.updateUserProfile(
                eq("test@example.com"),
                any(UpdateUserProfileRequest.class)))
                .thenReturn(response);

        mockMvc.perform(patch("/api/users/me/profile")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(userId.toString()))
                .andExpect(jsonPath("$.email").value("test@example.com"))
                .andExpect(jsonPath("$.firstName").value("John"))
                .andExpect(jsonPath("$.onboardingCompleted").value(true));

        verify(userService, times(1))
                .updateUserProfile(eq("test@example.com"), any(UpdateUserProfileRequest.class));
    }

    @Test
    @WithMockUser(username = "test@example.com")
    void uploadAvatar_ShouldReturnUpdatedProfile() throws Exception {
        UUID userId = UUID.randomUUID();

        UserProfileResponse response = new UserProfileResponse(
                userId,
                "test@example.com",
                "John",
                "Doe",
                "https://avatar.png",
                true,
                30,
                50,
                20);

        MockMultipartFile file = new MockMultipartFile(
                "file",
                "avatar.png",
                MediaType.IMAGE_PNG_VALUE,
                "fake-image-content".getBytes());

        when(userService.updateAvatar(eq("test@example.com"), any()))
                .thenReturn(response);

        mockMvc.perform(multipart("/api/users/me/avatar")
                .file(file))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(userId.toString()))
                .andExpect(jsonPath("$.email").value("test@example.com"))
                .andExpect(jsonPath("$.firstName").value("John"));

        verify(userService, times(1))
                .updateAvatar(eq("test@example.com"), any());
    }
}
