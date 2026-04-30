package org.fiuba.guitapp.config;

import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.io.PrintWriter;
import java.io.StringWriter;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;

import jakarta.servlet.FilterChain;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@ExtendWith(MockitoExtension.class)
class RateLimitFilterTests {

    @Mock
    private HttpServletRequest request;

    @Mock
    private HttpServletResponse response;

    @Mock
    private FilterChain filterChain;

    private RateLimitFilter rateLimitFilter;

    @BeforeEach
    void setUp() {
        rateLimitFilter = new RateLimitFilter();
    }

    private void setupResponseWriter() throws Exception {
        StringWriter responseWriter = new StringWriter();
        when(response.getWriter()).thenReturn(new PrintWriter(responseWriter));
    }

    @Test
    void testAllowsRequestWithinLimit() throws Exception {
        when(request.getRequestURI()).thenReturn("/api/auth/register");
        when(request.getRemoteAddr()).thenReturn("127.0.0.1");

        rateLimitFilter.doFilter(request, response, filterChain);

        verify(filterChain).doFilter(request, response);
        verify(response, never()).setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
    }

    @Test
    void testBlocksRequestExceedingLimit() throws Exception {
        setupResponseWriter();
        when(request.getRequestURI()).thenReturn("/api/auth/register");
        when(request.getRemoteAddr()).thenReturn("192.168.1.1");

        // Consume all 5 allowed requests
        for (int i = 0; i < 5; i++) {
            rateLimitFilter.doFilter(request, response, filterChain);
        }

        // 6th request should be blocked
        rateLimitFilter.doFilter(request, response, filterChain);

        verify(response).setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
        verify(response).setContentType("application/json");
        verify(response).getWriter();
    }

    @Test
    void testDifferentIPsHaveSeparateLimits() throws Exception {
        when(request.getRequestURI()).thenReturn("/api/auth/register");

        // First IP uses all requests
        when(request.getRemoteAddr()).thenReturn("10.0.0.1");
        for (int i = 0; i < 5; i++) {
            rateLimitFilter.doFilter(request, response, filterChain);
        }

        // Second IP should still be able to make requests
        when(request.getRemoteAddr()).thenReturn("10.0.0.2");
        rateLimitFilter.doFilter(request, response, filterChain);

        verify(filterChain, times(6)).doFilter(request, response);
    }

    @Test
    void testDifferentPathsHaveDifferentLimits() throws Exception {
        when(request.getRemoteAddr()).thenReturn("172.16.0.1");

        // Use 5 requests on /api/auth/register
        when(request.getRequestURI()).thenReturn("/api/auth/register");
        for (int i = 0; i < 5; i++) {
            rateLimitFilter.doFilter(request, response, filterChain);
        }

        // Should still be able to access /api/auth/verify-registration
        when(request.getRequestURI()).thenReturn("/api/auth/verify-registration");
        rateLimitFilter.doFilter(request, response, filterChain);

        verify(filterChain, times(6)).doFilter(request, response);
    }

    @Test
    void testUsesXForwardedForHeader() throws Exception {
        when(request.getRequestURI()).thenReturn("/api/auth/register");
        when(request.getHeader("X-Forwarded-For")).thenReturn("203.0.113.1, 198.51.100.1");

        rateLimitFilter.doFilter(request, response, filterChain);

        verify(filterChain).doFilter(request, response);
    }

    @Test
    void testOtpVerificationEndpointLimit() throws Exception {
        when(request.getRequestURI()).thenReturn("/api/auth/verify-registration");
        when(request.getRemoteAddr()).thenReturn("192.168.2.1");

        // Should allow 5 requests for OTP verification
        for (int i = 0; i < 5; i++) {
            rateLimitFilter.doFilter(request, response, filterChain);
        }

        verify(filterChain, times(5)).doFilter(request, response);
        verify(response, never()).setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
    }

    @Test
    void testGeneralAuthEndpointLimit() throws Exception {
        when(request.getRequestURI()).thenReturn("/api/auth/some-other-endpoint");
        when(request.getRemoteAddr()).thenReturn("192.168.3.1");

        // Should allow 10 requests for general auth endpoints
        for (int i = 0; i < 10; i++) {
            rateLimitFilter.doFilter(request, response, filterChain);
        }

        verify(filterChain, times(10)).doFilter(request, response);
        verify(response, never()).setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
    }

    @Test
    void testApiGeneralEndpointLimit() throws Exception {
        when(request.getRequestURI()).thenReturn("/api/users/profile");
        when(request.getRemoteAddr()).thenReturn("192.168.4.1");

        // Should allow 100 requests for general API endpoints
        for (int i = 0; i < 100; i++) {
            rateLimitFilter.doFilter(request, response, filterChain);
        }

        verify(filterChain, times(100)).doFilter(request, response);
        verify(response, never()).setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
    }

    @Test
    void testDefaultEndpointLimit() throws Exception {
        when(request.getRequestURI()).thenReturn("/health");
        when(request.getRemoteAddr()).thenReturn("192.168.5.1");

        // Should allow 50 requests for default endpoints
        for (int i = 0; i < 50; i++) {
            rateLimitFilter.doFilter(request, response, filterChain);
        }

        verify(filterChain, times(50)).doFilter(request, response);
        verify(response, never()).setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
    }

    @Test
    void testRateLimitResponseFormat() throws Exception {
        StringWriter responseWriter = new StringWriter();
        when(response.getWriter()).thenReturn(new PrintWriter(responseWriter));
        when(request.getRequestURI()).thenReturn("/api/auth/register");
        when(request.getRemoteAddr()).thenReturn("192.168.6.1");

        // Exceed rate limit
        for (int i = 0; i < 6; i++) {
            rateLimitFilter.doFilter(request, response, filterChain);
        }

        verify(response).setStatus(429);
        verify(response).setContentType("application/json");

        String responseBody = responseWriter.toString();
        assert responseBody.contains("\"message\"");
        assert responseBody.contains("\"code\"");
        assert responseBody.contains("RATE_LIMIT_EXCEEDED");
    }
}
