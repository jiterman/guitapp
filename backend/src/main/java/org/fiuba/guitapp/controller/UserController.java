package org.fiuba.guitapp.controller;

import java.security.Principal;
import java.util.Map;

import org.fiuba.guitapp.dto.OnboardingRequest;
import org.fiuba.guitapp.dto.UserProfileResponse;
import org.fiuba.guitapp.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

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
}
