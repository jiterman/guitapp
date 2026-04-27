package org.fiuba.guitapp.config;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@org.springframework.test.context.ActiveProfiles("test")
class SecurityConfigTests {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void shouldAllowPublicAccessToRegisterEndpoint() throws Exception {
        // We don't have the controller yet, so this should return 404 but NOT 403/401
        mockMvc.perform(post("/api/auth/register"))
                .andExpect(status().isNotFound());
    }

    @Test
    void shouldDenyAccessToProtectedEndpoints() throws Exception {
        mockMvc.perform(post("/api/protected-resource"))
                .andDo(org.springframework.test.web.servlet.result.MockMvcResultHandlers.print())
                .andExpect(status().isUnauthorized());
    }
}
