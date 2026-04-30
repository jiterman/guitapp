package org.fiuba.guitapp.service;

import org.springframework.stereotype.Service;

@Service
public class JwtService {
    public String generateToken(String email) {
        return null;
    }
    public String extractEmail(String token) {
        return null;
    }
    public boolean isTokenValid(String token, String email) {
        return false;
    }
}
