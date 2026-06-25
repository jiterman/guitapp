package org.fiuba.guitapp.service;

import static org.junit.jupiter.api.Assertions.assertEquals;

import java.time.LocalDate;

import org.fiuba.guitapp.model.RecurrenceFrequency;
import org.junit.jupiter.api.Test;

class RecurrenceCalculatorTest {

    @Test
    void firstOccurrenceOnOrAfter_ShouldReturnStartDate_WhenStartDateIsInTheFuture() {
        LocalDate startDate = LocalDate.of(2026, 6, 10);
        LocalDate reference = LocalDate.of(2026, 6, 1);

        assertEquals(startDate, RecurrenceCalculator.firstOccurrenceOnOrAfter(
                startDate, RecurrenceFrequency.MONTHLY, reference));
    }

    @Test
    void firstOccurrenceOnOrAfter_ShouldReturnStartDate_WhenStartDateEqualsReference() {
        LocalDate date = LocalDate.of(2026, 6, 10);

        assertEquals(date, RecurrenceCalculator.firstOccurrenceOnOrAfter(
                date, RecurrenceFrequency.WEEKLY, date));
    }

    @Test
    void firstOccurrenceOnOrAfter_Weekly_ShouldLandExactlyOnReference_WhenMultipleOfSevenDays() {
        LocalDate startDate = LocalDate.of(2026, 1, 1);
        LocalDate reference = LocalDate.of(2026, 1, 15);

        assertEquals(LocalDate.of(2026, 1, 15), RecurrenceCalculator.firstOccurrenceOnOrAfter(
                startDate, RecurrenceFrequency.WEEKLY, reference));
    }

    @Test
    void firstOccurrenceOnOrAfter_Weekly_ShouldSkipToNextWeek_WhenReferenceBetweenOccurrences() {
        LocalDate startDate = LocalDate.of(2026, 1, 1);
        LocalDate reference = LocalDate.of(2026, 1, 16);

        assertEquals(LocalDate.of(2026, 1, 22), RecurrenceCalculator.firstOccurrenceOnOrAfter(
                startDate, RecurrenceFrequency.WEEKLY, reference));
    }

    @Test
    void firstOccurrenceOnOrAfter_Monthly_ShouldClampDayToShorterMonth() {
        LocalDate startDate = LocalDate.of(2026, 1, 31);
        LocalDate reference = LocalDate.of(2026, 2, 1);

        assertEquals(LocalDate.of(2026, 2, 28), RecurrenceCalculator.firstOccurrenceOnOrAfter(
                startDate, RecurrenceFrequency.MONTHLY, reference));
    }

    @Test
    void firstOccurrenceOnOrAfter_Monthly_ShouldAdvanceToNextMonth_WhenCandidateBeforeReference() {
        LocalDate startDate = LocalDate.of(2026, 1, 10);
        LocalDate reference = LocalDate.of(2026, 3, 15);

        assertEquals(LocalDate.of(2026, 4, 10), RecurrenceCalculator.firstOccurrenceOnOrAfter(
                startDate, RecurrenceFrequency.MONTHLY, reference));
    }

    @Test
    void firstOccurrenceOnOrAfter_Biweekly_ShouldReturnFirstOfMonth_WhenReferenceIsFirst() {
        assertEquals(LocalDate.of(2026, 3, 1), RecurrenceCalculator.firstOccurrenceOnOrAfter(
                LocalDate.of(2026, 1, 10), RecurrenceFrequency.BIWEEKLY, LocalDate.of(2026, 3, 1)));
    }

    @Test
    void firstOccurrenceOnOrAfter_Biweekly_ShouldReturnFifteenth_WhenReferenceIsMidMonth() {
        assertEquals(LocalDate.of(2026, 3, 15), RecurrenceCalculator.firstOccurrenceOnOrAfter(
                LocalDate.of(2026, 1, 1), RecurrenceFrequency.BIWEEKLY, LocalDate.of(2026, 3, 10)));
    }

    @Test
    void firstOccurrenceOnOrAfter_Biweekly_ShouldReturnNextFirst_WhenReferenceIsAfterFifteenth() {
        assertEquals(LocalDate.of(2026, 4, 1), RecurrenceCalculator.firstOccurrenceOnOrAfter(
                LocalDate.of(2026, 1, 1), RecurrenceFrequency.BIWEEKLY, LocalDate.of(2026, 3, 20)));
    }

    @Test
    void firstOccurrenceOnOrAfter_Biweekly_ShouldSnapFutureStartDateToNextQuincenaDay() {
        assertEquals(LocalDate.of(2026, 6, 15), RecurrenceCalculator.firstOccurrenceOnOrAfter(
                LocalDate.of(2026, 6, 10), RecurrenceFrequency.BIWEEKLY, LocalDate.of(2026, 6, 1)));
    }

    @Test
    void next_Biweekly_ShouldAdvanceFromFirstToFifteenth() {
        assertEquals(LocalDate.of(2026, 1, 15), RecurrenceCalculator.next(
                LocalDate.of(2026, 1, 1), RecurrenceFrequency.BIWEEKLY, 1));
    }

    @Test
    void next_Biweekly_ShouldAdvanceFromFifteenthToNextFirst() {
        assertEquals(LocalDate.of(2026, 2, 1), RecurrenceCalculator.next(
                LocalDate.of(2026, 1, 15), RecurrenceFrequency.BIWEEKLY, 1));
    }

    @Test
    void next_Weekly_ShouldAddSevenDays() {
        assertEquals(LocalDate.of(2026, 1, 8), RecurrenceCalculator.next(
                LocalDate.of(2026, 1, 1), RecurrenceFrequency.WEEKLY, 1));
    }

    @Test
    void next_Monthly_ShouldKeepAnchorDayWithClamp() {
        LocalDate jan31 = LocalDate.of(2026, 1, 31);
        LocalDate feb28 = RecurrenceCalculator.next(jan31, RecurrenceFrequency.MONTHLY, 31);
        assertEquals(LocalDate.of(2026, 2, 28), feb28);

        LocalDate mar31 = RecurrenceCalculator.next(feb28, RecurrenceFrequency.MONTHLY, 31);
        assertEquals(LocalDate.of(2026, 3, 31), mar31);
    }
}
