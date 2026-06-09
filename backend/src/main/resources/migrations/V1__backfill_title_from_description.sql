-- Run once after deploying the title/description split.
-- Moves existing description values into the new title column (truncated to 20 chars) and clears description.
UPDATE expenses SET title = LEFT(description, 20), description = NULL WHERE title IS NULL AND description IS NOT NULL;
UPDATE incomes  SET title = LEFT(description, 20), description = NULL WHERE title IS NULL AND description IS NOT NULL;
