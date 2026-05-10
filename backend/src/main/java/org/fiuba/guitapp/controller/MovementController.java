package org.fiuba.guitapp.controller;

import java.security.Principal;
import java.util.List;

import org.fiuba.guitapp.dto.MovementResponse;
import org.fiuba.guitapp.service.MovementService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/movements")
@RequiredArgsConstructor
public class MovementController {

    private final MovementService movementService;

    @GetMapping
    public ResponseEntity<List<MovementResponse>> getAllMovements(Principal principal) {
        List<MovementResponse> movements = movementService.getAllMovements(principal.getName());
        return ResponseEntity.ok(movements);
    }

    @GetMapping("/day")
    public ResponseEntity<List<MovementResponse>> getMovementsByDay(Principal principal,
            @RequestParam("date") String date) {
        java.time.LocalDate d = java.time.LocalDate.parse(date);
        List<MovementResponse> movements = movementService.getMovementsByDay(principal.getName(), d);
        return ResponseEntity.ok(movements);
    }

    @GetMapping("/month")
    public ResponseEntity<List<MovementResponse>> getMovementsByMonth(Principal principal,
            @RequestParam("year") int year, @RequestParam("month") int month) {
        List<MovementResponse> movements = movementService.getMovementsByMonth(principal.getName(), year, month);
        return ResponseEntity.ok(movements);
    }

    @GetMapping("/year")
    public ResponseEntity<List<MovementResponse>> getMovementsByYear(Principal principal,
            @RequestParam("year") int year) {
        List<MovementResponse> movements = movementService.getMovementsByYear(principal.getName(), year);
        return ResponseEntity.ok(movements);
    }
}
