package org.fiuba.guitapp.service;

import java.time.LocalDate;
import java.time.YearMonth;
import java.time.temporal.ChronoUnit;

import org.fiuba.guitapp.model.RecurrenceFrequency;

/**
 * Pure date math for recurring incomes. Anchors monthly recurrences on the start date's day of month and clamps it to the last valid day of shorter months (e.g. day 31 becomes Feb
 * 28/29).
 */
final class RecurrenceCalculator {

    private RecurrenceCalculator() {
    }

    static LocalDate firstOccurrenceOnOrAfter(
            LocalDate startDate, RecurrenceFrequency frequency, LocalDate reference) {
        if (!startDate.isBefore(reference)) {
            return startDate;
        }

        return switch (frequency) {
        case WEEKLY -> {
            long days = ChronoUnit.DAYS.between(startDate, reference);
            long weeksToAdd = (days + 6) / 7;
            yield startDate.plusWeeks(weeksToAdd);
        }
        case MONTHLY -> {
            int anchorDay = startDate.getDayOfMonth();
            LocalDate candidate = atDayOfMonth(YearMonth.from(reference), anchorDay);
            if (candidate.isBefore(reference)) {
                candidate = atDayOfMonth(YearMonth.from(reference).plusMonths(1), anchorDay);
            }
            yield candidate;
        }
        };
    }

    static LocalDate next(LocalDate current, RecurrenceFrequency frequency, int anchorDayOfMonth) {
        return switch (frequency) {
        case WEEKLY -> current.plusWeeks(1);
        case MONTHLY -> atDayOfMonth(YearMonth.from(current).plusMonths(1), anchorDayOfMonth);
        };
    }

    private static LocalDate atDayOfMonth(YearMonth month, int anchorDay) {
        int day = Math.min(anchorDay, month.lengthOfMonth());
        return month.atDay(day);
    }
}
