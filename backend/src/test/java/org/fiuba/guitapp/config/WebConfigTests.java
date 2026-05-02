package org.fiuba.guitapp.config;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.ApplicationContext;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class WebConfigTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ApplicationContext applicationContext;

    @Autowired
    private WebConfig webConfig;

    @Test
    void webConfig_ShouldBeLoadedInContext() {
        assertTrue(applicationContext.containsBean("webConfig"));
    }

    @Test
    void webConfig_ShouldImplementWebMvcConfigurer() {
        assertNotNull(webConfig);
        assertTrue(webConfig instanceof WebMvcConfigurer);
    }

    @Test
    void cors_ShouldAllowPreflightRequestsFromAnyOrigin() throws Exception {
        mockMvc.perform(options("/api/auth/register")
                .header("Origin", "http://example.com")
                .header("Access-Control-Request-Method", "POST"))
                .andExpect(status().isOk())
                .andExpect(header().exists("Access-Control-Allow-Origin"));
    }

    @Test
    void cors_ShouldAllowDifferentOrigins() throws Exception {
        mockMvc.perform(options("/api/auth/login")
                .header("Origin", "http://localhost:3000")
                .header("Access-Control-Request-Method", "POST"))
                .andExpect(status().isOk())
                .andExpect(header().exists("Access-Control-Allow-Origin"));
    }

    @Test
    void cors_ShouldAllowPreflightForGetMethod() throws Exception {
        mockMvc.perform(options("/api/auth/register")
                .header("Origin", "http://example.com")
                .header("Access-Control-Request-Method", "GET"))
                .andExpect(status().isOk());
    }

    @Test
    void cors_ShouldAllowPreflightForPostMethod() throws Exception {
        mockMvc.perform(options("/api/auth/register")
                .header("Origin", "http://example.com")
                .header("Access-Control-Request-Method", "POST"))
                .andExpect(status().isOk());
    }

    @Test
    void cors_ShouldAllowPreflightForPutMethod() throws Exception {
        mockMvc.perform(options("/api/users/me")
                .header("Origin", "http://example.com")
                .header("Access-Control-Request-Method", "PUT"))
                .andExpect(status().isOk());
    }

    @Test
    void cors_ShouldAllowPreflightForDeleteMethod() throws Exception {
        mockMvc.perform(options("/api/users/1")
                .header("Origin", "http://example.com")
                .header("Access-Control-Request-Method", "DELETE"))
                .andExpect(status().isOk());
    }

    @Test
    void cors_ShouldAllowPreflightWithCustomHeaders() throws Exception {
        mockMvc.perform(options("/api/auth/register")
                .header("Origin", "http://example.com")
                .header("Access-Control-Request-Method", "POST")
                .header("Access-Control-Request-Headers", "Authorization, Content-Type"))
                .andExpect(status().isOk());
    }
}
