package org.fiuba.guitapp.service;

import org.fiuba.guitapp.dto.OnboardingRequest;
import org.fiuba.guitapp.dto.UserProfileResponse;
import org.fiuba.guitapp.exception.AuthException;
import org.fiuba.guitapp.exception.ErrorCode;
import org.fiuba.guitapp.model.User;
import org.fiuba.guitapp.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    public UserProfileResponse getUserProfile(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AuthException(ErrorCode.USER_NOT_FOUND, "User not found"));

        return new UserProfileResponse(
                user.getId(),
                user.getEmail(),
                user.getFirstName(),
                user.isOnboardingCompleted(),
                user.getTargetFixedExpenses(),
                user.getTargetVariableExpenses(),
                user.getTargetSavings());
    }

    @Transactional
    public void completeOnboarding(String email, OnboardingRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AuthException(ErrorCode.USER_NOT_FOUND, "User not found"));

        if (user.isOnboardingCompleted()) {
            throw new IllegalArgumentException("Onboarding already completed");
        }

        int total = request.targetFixedExpenses() + request.targetVariableExpenses();
        if (total >= 100) {
            throw new IllegalArgumentException("Sum of expenses must be strictly less than 100 to allow savings");
        }
        int savings = 100 - total;

        user.setFirstName(request.firstName());
        user.setTargetFixedExpenses(request.targetFixedExpenses());
        user.setTargetVariableExpenses(request.targetVariableExpenses());
        user.setTargetSavings(savings);
        user.setOnboardingCompleted(true);

        userRepository.save(user);
    }
}
