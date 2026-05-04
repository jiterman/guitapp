package org.fiuba.guitapp.controller;

import java.security.Principal;
import java.util.List;

import org.fiuba.guitapp.dto.MovementResponse;
import org.fiuba.guitapp.service.MovementService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
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
}
