package org.fiuba.guitapp.dto;

import java.util.List;

public record HealthScoreResponse(int score, String title, String message, String level, List<HealthScoreFactor> factors) {
}
