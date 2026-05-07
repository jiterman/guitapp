package org.fiuba.guitapp.dto;

import static org.junit.jupiter.api.Assertions.*;

import java.util.UUID;

import org.junit.jupiter.api.Test;

class UserProfileResponseTests {

    @Test
    void userProfileResponse_ShouldCreateWithAllFields() {
        UUID id = UUID.randomUUID();
        String email = "test@example.com";
        String firstName = "John";
        boolean onboardingCompleted = true;
        Integer targetFixed = 30;
        Integer targetVariable = 50;
        Integer targetSavings = 20;

        UserProfileResponse response = new UserProfileResponse(
                id,
                email,
                firstName,
                onboardingCompleted,
                targetFixed,
                targetVariable,
                targetSavings);

        assertEquals(id, response.id());
        assertEquals(email, response.email());
        assertEquals(firstName, response.firstName());
        assertTrue(response.onboardingCompleted());
        assertEquals(targetFixed, response.targetFixedExpenses());
        assertEquals(targetVariable, response.targetVariableExpenses());
        assertEquals(targetSavings, response.targetSavings());
    }

    @Test
    void userProfileResponse_ShouldCreateWithNullValues() {
        UUID id = UUID.randomUUID();
        String email = "test@example.com";

        UserProfileResponse response = new UserProfileResponse(
                id,
                email,
                null,
                false,
                null,
                null,
                null);

        assertEquals(id, response.id());
        assertEquals(email, response.email());
        assertNull(response.firstName());
        assertFalse(response.onboardingCompleted());
        assertNull(response.targetFixedExpenses());
        assertNull(response.targetVariableExpenses());
        assertNull(response.targetSavings());
    }

    @Test
    void userProfileResponse_ShouldSupportEquality() {
        UUID id = UUID.randomUUID();
        UserProfileResponse response1 = new UserProfileResponse(
                id,
                "test@example.com",
                "John",
                true,
                30,
                50,
                20);

        UserProfileResponse response2 = new UserProfileResponse(
                id,
                "test@example.com",
                "John",
                true,
                30,
                50,
                20);

        assertEquals(response1, response2);
        assertEquals(response1.hashCode(), response2.hashCode());
    }

    @Test
    void userProfileResponse_ShouldHandleToString() {
        UUID id = UUID.randomUUID();
        UserProfileResponse response = new UserProfileResponse(
                id,
                "test@example.com",
                "John",
                true,
                30,
                50,
                20);

        String toString = response.toString();

        assertNotNull(toString);
        assertTrue(toString.contains("test@example.com"));
        assertTrue(toString.contains("John"));
    }
}
