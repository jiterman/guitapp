package org.fiuba.guitapp.dto;

public record HealthScoreFactor(String key, String label, int score, int maxScore, String explanation) {
}
