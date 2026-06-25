package org.fiuba.guitapp.service;

import java.time.LocalDate;
import java.time.YearMonth;
import java.time.temporal.ChronoUnit;

import org.fiuba.guitapp.model.RecurrenceFrequency;

/**
 * Pure date math for recurring movements. Monthly recurrences anchor on the start date's day of month (clamped for shorter months). Quincena (BIWEEKLY) recurrences occur on the
 * 1st and 15th of each month.
 */
final class RecurrenceCalculator {

    private static final int QUINCENA_FIRST_DAY = 1;
    private static final int QUINCENA_SECOND_DAY = 15;

    private RecurrenceCalculator() {
    }

    static LocalDate firstOccurrenceOnOrAfter(
            LocalDate startDate, RecurrenceFrequency frequency, LocalDate reference) {
        if (frequency == RecurrenceFrequency.BIWEEKLY) {
            LocalDate from = startDate.isBefore(reference) ? reference : startDate;
            return nextQuincenaOnOrAfter(from);
        }

        if (!startDate.isBefore(reference)) {
            return startDate;
        }

        return switch (frequency) {
        case WEEKLY -> {
            long days = ChronoUnit.DAYS.between(startDate, reference);
            long weeksToAdd = (days + 6) / 7;
            yield startDate.plusWeeks(weeksToAdd);
        }
        case BIWEEKLY -> throw new IllegalStateException("Handled above");
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
        case BIWEEKLY -> nextQuincenaAfter(current);
        case MONTHLY -> atDayOfMonth(YearMonth.from(current).plusMonths(1), anchorDayOfMonth);
        };
    }

    private static LocalDate nextQuincenaOnOrAfter(LocalDate date) {
        LocalDate first = date.withDayOfMonth(QUINCENA_FIRST_DAY);
        if (!first.isBefore(date)) {
            return first;
        }
        LocalDate fifteenth = date.withDayOfMonth(QUINCENA_SECOND_DAY);
        if (!fifteenth.isBefore(date)) {
            return fifteenth;
        }
        return date.plusMonths(1).withDayOfMonth(QUINCENA_FIRST_DAY);
    }

    private static LocalDate nextQuincenaAfter(LocalDate current) {
        if (current.getDayOfMonth() < QUINCENA_SECOND_DAY) {
            return current.withDayOfMonth(QUINCENA_SECOND_DAY);
        }
        return current.plusMonths(1).withDayOfMonth(QUINCENA_FIRST_DAY);
    }

    private static LocalDate atDayOfMonth(YearMonth month, int anchorDay) {
        int day = Math.min(anchorDay, month.lengthOfMonth());
        return month.atDay(day);
    }
}
