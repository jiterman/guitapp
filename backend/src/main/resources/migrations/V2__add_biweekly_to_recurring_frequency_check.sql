-- Allow BIWEEKLY (quincena: 1st and 15th of each month) on recurring movement templates.
-- Hibernate created the original CHECK constraints before BIWEEKLY existed in RecurrenceFrequency.

ALTER TABLE recurring_incomes
    DROP CONSTRAINT IF EXISTS recurring_incomes_frequency_check;

ALTER TABLE recurring_incomes
    ADD CONSTRAINT recurring_incomes_frequency_check
        CHECK (frequency IN ('WEEKLY', 'BIWEEKLY', 'MONTHLY'));

ALTER TABLE recurring_expenses
    DROP CONSTRAINT IF EXISTS recurring_expenses_frequency_check;

ALTER TABLE recurring_expenses
    ADD CONSTRAINT recurring_expenses_frequency_check
        CHECK (frequency IN ('WEEKLY', 'BIWEEKLY', 'MONTHLY'));
