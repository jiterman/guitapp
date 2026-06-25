import type { RecurrenceFrequency } from '../services/recurringIncomeService';

export const RECURRENCE_FREQUENCY_OPTIONS: ReadonlyArray<{
  value: RecurrenceFrequency;
  label: string;
}> = [
  { value: 'WEEKLY', label: 'Semanal' },
  { value: 'BIWEEKLY', label: 'Quincena' }, // 1st and 15th of each month
  { value: 'MONTHLY', label: 'Mensual' },
];

export const getRecurrenceFrequencyLabel = (frequency: RecurrenceFrequency): string =>
  RECURRENCE_FREQUENCY_OPTIONS.find(option => option.value === frequency)?.label ?? frequency;
