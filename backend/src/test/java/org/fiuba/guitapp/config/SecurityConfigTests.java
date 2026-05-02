package org.fiuba.guitapp.config;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.ApplicationContext;
import org.springframework.http.MediaType;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class SecurityConfigTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ApplicationContext applicationContext;

    @Autowired
    private SecurityFilterChain securityFilterChain;

    @Test
    void securityFilterChain_ShouldBeConfigured() {
        assertNotNull(securityFilterChain);
    }

    @Test
    void securityConfig_ShouldBeLoadedInContext() {
        assertTrue(applicationContext.containsBean("securityConfig"));
    }

    @Test
    void shouldAllowPublicAccessToRegisterEndpoint() throws Exception {
        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void shouldAllowPublicAccessToLoginEndpoint() throws Exception {
        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void shouldAllowPublicAccessToVerifyRegistrationEndpoint() throws Exception {
        mockMvc.perform(post("/api/auth/verify-registration")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void shouldAllowAccessToErrorEndpoint() throws Exception {
        // /error endpoint is public - we just verify it's not forbidden (403)
        // It may return 404, 500, or other status codes depending on context
        mockMvc.perform(get("/error"))
                .andExpect(result -> assertTrue(result.getResponse().getStatus() != 403,
                        "Error endpoint should not return 403 Forbidden"));
    }

    @Test
    void shouldDenyAccessToProtectedEndpointsWithoutAuthentication() throws Exception {
        mockMvc.perform(post("/api/protected-resource"))
                .andExpect(status().isForbidden());
    }

    @Test
    void shouldDenyAccessToUserEndpointsWithoutAuthentication() throws Exception {
        mockMvc.perform(get("/api/users/me"))
                .andExpect(status().isForbidden());
    }

    @Test
    void shouldDenyAccessToProtectedPutEndpointsWithoutAuthentication() throws Exception {
        mockMvc.perform(put("/api/users/me/onboarding")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{}"))
                .andExpect(status().isForbidden());
    }

    @Test
    void shouldDenyAccessWithInvalidToken() throws Exception {
        mockMvc.perform(get("/api/users/me")
                .header("Authorization", "Bearer invalid-token"))
                .andExpect(status().isForbidden());
    }

    @Test
    void shouldDenyAccessWithMalformedAuthorizationHeader() throws Exception {
        mockMvc.perform(get("/api/users/me")
                .header("Authorization", "InvalidFormat"))
                .andExpect(status().isForbidden());
    }
}
