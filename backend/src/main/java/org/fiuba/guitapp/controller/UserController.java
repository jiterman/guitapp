package org.fiuba.guitapp.controller;

import java.security.Principal;
import java.util.Map;

import org.fiuba.guitapp.dto.InitiateEmailChangeRequest;
import org.fiuba.guitapp.dto.OnboardingRequest;
import org.fiuba.guitapp.dto.UpdateUserProfileRequest;
import org.fiuba.guitapp.dto.UserProfileResponse;
import org.fiuba.guitapp.dto.VerifyEmailChangeRequest;
import org.fiuba.guitapp.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    public ResponseEntity<UserProfileResponse> getMe(Principal principal) {
        UserProfileResponse response = userService.getUserProfile(principal.getName());
        return ResponseEntity.ok(response);
    }

    @PutMapping("/me/onboarding")
    public ResponseEntity<?> completeOnboarding(Principal principal, @Valid @RequestBody OnboardingRequest request) {
        userService.completeOnboarding(principal.getName(), request);
        return ResponseEntity.ok(Map.of("message", "Onboarding completed successfully"));
    }

    @PatchMapping("/me/profile")
    public ResponseEntity<UserProfileResponse> updateProfile(
            Principal principal,
            @Valid @RequestBody UpdateUserProfileRequest request) {

        UserProfileResponse response = userService.updateUserProfile(principal.getName(), request);

        return ResponseEntity.ok(response);
    }

    @PostMapping("/me/avatar")
    public ResponseEntity<UserProfileResponse> uploadAvatar(
            Principal principal,
            @RequestParam("file") MultipartFile file) {

        UserProfileResponse response = userService.updateAvatar(principal.getName(), file);

        return ResponseEntity.ok(response);
    }

    @PostMapping("/me/email/initiate")
    public ResponseEntity<?> initiateEmailChange(
            Principal principal,
            @Valid @RequestBody InitiateEmailChangeRequest request) {

        userService.initiateEmailChange(principal.getName(), request);
        return ResponseEntity.ok(Map.of("message", "OTP sent to new email"));
    }

    @PostMapping("/me/email/verify")
    public ResponseEntity<?> verifyEmailChange(
            Principal principal,
            @Valid @RequestBody VerifyEmailChangeRequest request) {

        userService.verifyEmailChange(principal.getName(), request);
        return ResponseEntity.ok(Map.of("message", "Email updated successfully"));
    }
}
