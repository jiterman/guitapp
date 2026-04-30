package org.fiuba.guitapp.config;

import java.io.IOException;
import java.time.Duration;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import org.fiuba.guitapp.exception.RateLimitException;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.Getter;

@Component
public class RateLimitFilter extends OncePerRequestFilter {

    private final Map<String, Bucket> cache = new ConcurrentHashMap<>();
    private final List<RateLimitRule> rules;

    public RateLimitFilter() {
        this.rules = List.of(
                new RateLimitRule("/api/auth/register", 5),
                new RateLimitRule("/api/auth/verify-registration", 5),
                new RateLimitRule("/api/auth/", 10),
                new RateLimitRule("/api/", 100),
                new RateLimitRule("/", 50) // Default
        );
    }

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request, @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain) throws ServletException, IOException {

        String ip = getClientIP(request);
        String path = request.getRequestURI();
        RateLimitRule rule = findMatchingRule(path);

        String bucketKey = ip + ":" + rule.getPathPattern();
        Bucket bucket = resolveBucket(bucketKey, rule);

        if (!bucket.tryConsume(1)) {
            throw new RateLimitException();
        }

        filterChain.doFilter(request, response);
    }

    private RateLimitRule findMatchingRule(String path) {
        return rules.stream()
                .filter(rule -> rule.matches(path))
                .findFirst()
                .orElse(rules.getLast()); // Default rule
    }

    private Bucket resolveBucket(String key, RateLimitRule rule) {
        return cache.computeIfAbsent(key, k -> createBucket(rule.getRequestsPerMinute()));
    }

    private Bucket createBucket(int requestsPerMinute) {
        Bandwidth limit = Bandwidth.builder()
                .capacity(requestsPerMinute)
                .refillIntervally(requestsPerMinute, Duration.ofMinutes(1))
                .build();
        return Bucket.builder().addLimit(limit).build();
    }

    private String getClientIP(HttpServletRequest request) {
        String xfHeader = request.getHeader("X-Forwarded-For");
        if (xfHeader == null) {
            return request.getRemoteAddr();
        }
        return xfHeader.split(",")[0];
    }

    @Getter
    private static class RateLimitRule {

        private final String pathPattern;
        private final int requestsPerMinute;
        private final boolean exactMatch;

        public RateLimitRule(String pathPattern, int requestsPerMinute) {
            this.pathPattern = pathPattern;
            this.requestsPerMinute = requestsPerMinute;
            this.exactMatch = !pathPattern.endsWith("/");
        }

        public boolean matches(String path) {
            if (exactMatch) {
                return path.equals(pathPattern);
            }
            return path.startsWith(pathPattern);
        }
    }
}
