package org.fiuba.guitapp.config;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockFilterChain;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.test.util.ReflectionTestUtils;

import jakarta.servlet.FilterChain;

class InternalApiKeyFilterTest {

    private InternalApiKeyFilter filter;
    private MockHttpServletResponse response;
    private FilterChain filterChain;

    @BeforeEach
    void setUp() {
        filter = new InternalApiKeyFilter();
        ReflectionTestUtils.setField(filter, "expectedKey", "test-internal-key");
        response = new MockHttpServletResponse();
        filterChain = mock(FilterChain.class);
    }

    @Test
    void doFilterInternal_ShouldReturnUnauthorized_WhenApiKeyIsMissing() throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest("POST", "/api/notifications/daily/notify");

        filter.doFilterInternal(request, response, filterChain);

        assertEquals(401, response.getStatus());
        verify(filterChain, never()).doFilter(request, response);
    }

    @Test
    void doFilterInternal_ShouldContinueChain_WhenApiKeyIsValid() throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest("POST", "/api/notifications/weekly/notify");
        request.addHeader("X-Internal-Key", "test-internal-key");
        MockFilterChain chain = new MockFilterChain();

        filter.doFilterInternal(request, response, chain);

        assertEquals(200, response.getStatus());
    }

    @Test
    void shouldNotFilter_ShouldSkipNonInternalPaths() {
        MockHttpServletRequest request = new MockHttpServletRequest("GET", "/api/users/me");

        assertEquals(true, filter.shouldNotFilter(request));
    }

    @Test
    void doFilterInternal_ShouldReturnUnauthorized_WhenApiKeyIsInvalid() throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest("POST", "/api/notifications/daily/notify");
        request.addHeader("X-Internal-Key", "wrong-key");

        filter.doFilterInternal(request, response, filterChain);

        assertEquals(401, response.getStatus());
        verify(filterChain, never()).doFilter(request, response);
    }

    @Test
    void doFilterInternal_ShouldReturnUnauthorized_WhenApiKeyIsIncorrect() throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest("POST", "/api/summary/monthly/notify");
        request.addHeader("X-Internal-Key", "invalid");

        filter.doFilterInternal(request, response, filterChain);

        assertEquals(401, response.getStatus());
    }

    @Test
    void shouldNotFilter_ShouldReturnFalse_ForInternalPaths() {
        MockHttpServletRequest dailyPath = new MockHttpServletRequest();
        dailyPath.setServletPath("/api/notifications/daily/notify");

        MockHttpServletRequest weeklyPath = new MockHttpServletRequest();
        weeklyPath.setServletPath("/api/notifications/weekly/notify");

        MockHttpServletRequest monthlyPath = new MockHttpServletRequest();
        monthlyPath.setServletPath("/api/summary/monthly/notify");

        assertEquals(false, filter.shouldNotFilter(dailyPath));
        assertEquals(false, filter.shouldNotFilter(weeklyPath));
        assertEquals(false, filter.shouldNotFilter(monthlyPath));
    }
}
