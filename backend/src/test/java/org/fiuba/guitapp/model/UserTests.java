package org.fiuba.guitapp.model;

import static org.junit.jupiter.api.Assertions.*;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.core.GrantedAuthority;

class UserTests {

    private User user;

    @BeforeEach
    void setUp() {
        user = new User();
    }

    @Test
    void testUserGettersAndSetters() {
        UUID id = UUID.randomUUID();
        String email = "test@example.com";
        String password = "hashedPassword";
        String firstName = "John";
        Integer targetFixed = 30;
        Integer targetVariable = 50;
        Integer targetSavings = 20;

        user.setId(id);
        user.setEmail(email);
        user.setPassword(password);
        user.setStatus(UserStatus.ACTIVE);
        user.setFirstName(firstName);
        user.setOnboardingCompleted(true);
        user.setTargetFixedExpenses(targetFixed);
        user.setTargetVariableExpenses(targetVariable);
        user.setTargetSavings(targetSavings);

        assertEquals(id, user.getId());
        assertEquals(email, user.getEmail());
        assertEquals(password, user.getPassword());
        assertEquals(UserStatus.ACTIVE, user.getStatus());
        assertEquals(firstName, user.getFirstName());
        assertTrue(user.isOnboardingCompleted());
        assertEquals(targetFixed, user.getTargetFixedExpenses());
        assertEquals(targetVariable, user.getTargetVariableExpenses());
        assertEquals(targetSavings, user.getTargetSavings());
    }

    @Test
    void testOtpGettersAndSetters() {
        String otp = "123456";
        LocalDateTime otpCreatedAt = LocalDateTime.now();
        String pendingEmail = "new@example.com";

        user.setVerificationOtp(otp);
        user.setOtpCreatedAt(otpCreatedAt);
        user.setPendingEmail(pendingEmail);

        assertEquals(otp, user.getVerificationOtp());
        assertEquals(otpCreatedAt, user.getOtpCreatedAt());
        assertEquals(pendingEmail, user.getPendingEmail());
    }

    @Test
    void getAuthorities_ShouldReturnRoleUser() {
        Collection<? extends GrantedAuthority> authorities = user.getAuthorities();

        assertNotNull(authorities);
        assertEquals(1, authorities.size());
        assertTrue(authorities.stream()
                .anyMatch(auth -> auth.getAuthority().equals("ROLE_USER")));
    }

    @Test
    void getUsername_ShouldReturnEmail() {
        String email = "test@example.com";
        user.setEmail(email);

        assertEquals(email, user.getUsername());
    }

    @Test
    void isAccountNonExpired_ShouldReturnTrue() {
        assertTrue(user.isAccountNonExpired());
    }

    @Test
    void isAccountNonLocked_ShouldReturnTrue() {
        assertTrue(user.isAccountNonLocked());
    }

    @Test
    void isCredentialsNonExpired_ShouldReturnTrue() {
        assertTrue(user.isCredentialsNonExpired());
    }

    @Test
    void isEnabled_ShouldReturnTrue_WhenStatusIsActive() {
        user.setStatus(UserStatus.ACTIVE);

        assertTrue(user.isEnabled());
    }

    @Test
    void isEnabled_ShouldReturnFalse_WhenStatusIsPendingVerification() {
        user.setStatus(UserStatus.PENDING_VERIFICATION);

        assertFalse(user.isEnabled());
    }

    @Test
    void defaultOnboardingCompleted_ShouldBeFalse() {
        User newUser = new User();

        assertFalse(newUser.isOnboardingCompleted());
    }

    @Test
    void testUserWithNullValues() {
        assertNull(user.getId());
        assertNull(user.getEmail());
        assertNull(user.getPassword());
        assertNull(user.getStatus());
        assertNull(user.getFirstName());
        assertNull(user.getTargetFixedExpenses());
        assertNull(user.getTargetVariableExpenses());
        assertNull(user.getTargetSavings());
        assertNull(user.getVerificationOtp());
        assertNull(user.getOtpCreatedAt());
    }
}
