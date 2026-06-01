package org.fiuba.guitapp.controller;

import java.security.Principal;
import java.time.YearMonth;

import org.fiuba.guitapp.dto.MonthlySummaryResponse;
import org.fiuba.guitapp.service.MonthlySummaryService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/summary")
@RequiredArgsConstructor
public class MonthlySummaryController {

    private final MonthlySummaryService monthlySummaryService;

    @GetMapping("/monthly")
    public ResponseEntity<MonthlySummaryResponse> getMonthlySummary(
            Principal principal,
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) Integer month) {
        YearMonth target = resolveYearMonth(year, month);
        MonthlySummaryResponse response = monthlySummaryService.getSummary(
                principal.getName(), target.getYear(), target.getMonthValue());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/monthly/notify")
    public ResponseEntity<Void> sendMonthlySummaryNotifications(
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) Integer month) {
        YearMonth target = resolveYearMonth(year, month);
        monthlySummaryService.sendSummaryNotifications(target.getYear(), target.getMonthValue());
        return ResponseEntity.noContent().build();
    }

    private YearMonth resolveYearMonth(Integer year, Integer month) {
        YearMonth previous = YearMonth.now().minusMonths(1);
        int effectiveYear = year != null ? year : previous.getYear();
        int effectiveMonth = month != null ? month : previous.getMonthValue();
        return YearMonth.of(effectiveYear, effectiveMonth);
    }
}
