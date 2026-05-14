import { useState } from 'react';

interface UseCurrencyInputReturn {
  displayValue: string;
  amount: string;
  handleAmountChange: (text: string) => void;
  setAmount: (value: string) => void;
}

/**
 * Custom hook for handling currency input with automatic formatting.
 * Formats numbers with thousands separators and decimal places while typing.
 *
 * @param initialValue - Initial amount value (as string number, e.g., "1500.50")
 * @returns Object with displayValue (formatted), amount (raw), and handlers
 */
export const useCurrencyInput = (initialValue = ''): UseCurrencyInputReturn => {
  const [amount, setAmountInternal] = useState(initialValue);

  /**
   * Formats a numeric string to display with thousands separators and decimals.
   * Example: "1500.5" -> "1.500,5"
   */
  const formatCurrency = (value: string): string => {
    if (!value) {
      return '';
    }

    const cleaned = value.replace(/[^\d.]/g, '');
    const parts = cleaned.split('.');
    let integerPart = parts[0] || '';
    const decimalPart = parts[1];

    integerPart = integerPart.replace(/^0+/, '') || '0';
    const withSeparator = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');

    if (decimalPart !== undefined) {
      const limitedDecimal = decimalPart.slice(0, 2);
      return `${withSeparator},${limitedDecimal}`;
    }

    return withSeparator;
  };

  /**
   * Handles text input changes, removing formatting and validating numeric input.
   * Accepts commas as decimal separator and limits to 2 decimal places.
   */
  const handleAmountChange = (text: string) => {
    let cleaned = text.replace(/[$\s.]/g, '');
    cleaned = cleaned.replace(/,/g, '.');

    if (cleaned.includes('.')) {
      const [integerPart, decimalPart] = cleaned.split('.');
      if (decimalPart && decimalPart.length > 2) {
        cleaned = `${integerPart}.${decimalPart.slice(0, 2)}`;
      }
    }

    if (cleaned && !/^\d*\.?\d{0,2}$/.test(cleaned)) {
      return;
    }

    setAmountInternal(cleaned);
  };

  /**
   * Sets the amount directly (used for programmatic updates like loading existing values).
   */
  const setAmount = (value: string) => {
    setAmountInternal(value);
  };

  const displayValue = formatCurrency(amount);

  return {
    displayValue,
    amount,
    handleAmountChange,
    setAmount,
  };
};
