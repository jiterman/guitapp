package org.fiuba.guitapp.dto;

import static org.junit.jupiter.api.Assertions.*;

import java.util.Set;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;

class OnboardingRequestTests {

    private Validator validator;

    @BeforeEach
    void setUp() {
        ValidatorFactory factory = Validation.buildDefaultValidatorFactory();
        validator = factory.getValidator();
    }

    @Test
    void validOnboardingRequest_ShouldPassValidation() {
        OnboardingRequest request = new OnboardingRequest("Maria", 30, 50);

        Set<ConstraintViolation<OnboardingRequest>> violations = validator.validate(request);

        assertTrue(violations.isEmpty());
    }

    @Test
    void onboardingRequest_ShouldFailValidation_WhenFirstNameIsBlank() {
        OnboardingRequest request = new OnboardingRequest("", 30, 50);

        Set<ConstraintViolation<OnboardingRequest>> violations = validator.validate(request);

        assertFalse(violations.isEmpty());
        assertTrue(violations.stream()
                .anyMatch(v -> v.getMessage().equals("First name is required")));
    }

    @Test
    void onboardingRequest_ShouldFailValidation_WhenFirstNameContainsSpaces() {
        OnboardingRequest request = new OnboardingRequest("Maria Jose", 30, 50);

        Set<ConstraintViolation<OnboardingRequest>> violations = validator.validate(request);

        assertFalse(violations.isEmpty());
        assertTrue(violations.stream()
                .anyMatch(v -> v.getMessage().equals("First name must contain only letters and no spaces")));
    }

    @Test
    void onboardingRequest_ShouldFailValidation_WhenFirstNameContainsNumbers() {
        OnboardingRequest request = new OnboardingRequest("Maria123", 30, 50);

        Set<ConstraintViolation<OnboardingRequest>> violations = validator.validate(request);

        assertFalse(violations.isEmpty());
    }

    @Test
    void onboardingRequest_ShouldPassValidation_WithAccentedCharacters() {
        OnboardingRequest request = new OnboardingRequest("María", 30, 50);

        Set<ConstraintViolation<OnboardingRequest>> violations = validator.validate(request);

        assertTrue(violations.isEmpty());
    }

    @Test
    void onboardingRequest_ShouldPassValidation_WithÑCharacter() {
        OnboardingRequest request = new OnboardingRequest("Nuño", 30, 50);

        Set<ConstraintViolation<OnboardingRequest>> violations = validator.validate(request);

        assertTrue(violations.isEmpty());
    }

    @Test
    void onboardingRequest_ShouldFailValidation_WhenFixedExpensesIsNull() {
        OnboardingRequest request = new OnboardingRequest("Maria", null, 50);

        Set<ConstraintViolation<OnboardingRequest>> violations = validator.validate(request);

        assertFalse(violations.isEmpty());
        assertTrue(violations.stream()
                .anyMatch(v -> v.getMessage().equals("Fixed expenses target is required")));
    }

    @Test
    void onboardingRequest_ShouldFailValidation_WhenVariableExpensesIsNull() {
        OnboardingRequest request = new OnboardingRequest("Maria", 30, null);

        Set<ConstraintViolation<OnboardingRequest>> violations = validator.validate(request);

        assertFalse(violations.isEmpty());
        assertTrue(violations.stream()
                .anyMatch(v -> v.getMessage().equals("Variable expenses target is required")));
    }

    @Test
    void onboardingRequest_ShouldFailValidation_WhenFixedExpensesIsZero() {
        OnboardingRequest request = new OnboardingRequest("Maria", 0, 50);

        Set<ConstraintViolation<OnboardingRequest>> violations = validator.validate(request);

        assertFalse(violations.isEmpty());
        assertTrue(violations.stream()
                .anyMatch(v -> v.getMessage().equals("Target must be greater than 0")));
    }

    @Test
    void onboardingRequest_ShouldFailValidation_WhenFixedExpensesIsTooHigh() {
        OnboardingRequest request = new OnboardingRequest("Maria", 99, 50);

        Set<ConstraintViolation<OnboardingRequest>> violations = validator.validate(request);

        assertFalse(violations.isEmpty());
        assertTrue(violations.stream()
                .anyMatch(v -> v.getMessage().equals("Target must be less than 100")));
    }

    @Test
    void onboardingRequest_ShouldPassValidation_WithMinimumValues() {
        OnboardingRequest request = new OnboardingRequest("Maria", 1, 1);

        Set<ConstraintViolation<OnboardingRequest>> violations = validator.validate(request);

        assertTrue(violations.isEmpty());
    }

    @Test
    void onboardingRequest_ShouldPassValidation_WithMaximumValues() {
        OnboardingRequest request = new OnboardingRequest("Maria", 98, 98);

        Set<ConstraintViolation<OnboardingRequest>> violations = validator.validate(request);

        assertTrue(violations.isEmpty());
    }

    @Test
    void onboardingRequest_ShouldHaveCorrectRecordValues() {
        OnboardingRequest request = new OnboardingRequest("John", 40, 40);

        assertEquals("John", request.firstName());
        assertEquals(40, request.targetFixedExpenses());
        assertEquals(40, request.targetVariableExpenses());
    }
}
