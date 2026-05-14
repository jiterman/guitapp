import { useState } from 'react';

interface UseCurrencyInputReturn {
  formattedAmount: string;
  amount: string;
  handleAmountChange: (text: string) => void;
  setAmount: (value: string) => void;
}

export const useCurrencyInput = (initialValue = ''): UseCurrencyInputReturn => {
  const [amount, setAmountInternal] = useState(initialValue);

  const formatCurrency = (value: string): string => {
    // Remove all non-numeric characters except comma and dot
    const cleaned = value.replace(/[^\d.,]/g, '');

    // Split into integer and decimal parts
    const parts = cleaned.split(/[.,]/);
    let integerPart = parts[0] || '';
    let decimalPart = parts[1] || '';

    // Remove leading zeros but keep at least one digit
    integerPart = integerPart.replace(/^0+/, '') || '0';

    // Limit decimal to 2 digits
    decimalPart = decimalPart.slice(0, 2);

    // Add thousands separator
    const withSeparator = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');

    // Always show 2 decimal places, padding with zeros if needed
    const paddedDecimal = decimalPart.padEnd(2, '0');

    return `$ ${withSeparator},${paddedDecimal}`;
  };

  const handleAmountChange = (text: string) => {
    // Remove currency symbol, spaces, and dots (thousands separators from formatting)
    let cleaned = text.replace(/[$\s.]/g, '');

    // Replace comma with dot for internal representation
    cleaned = cleaned.replace(/,/g, '.');

    // Truncate decimals to 2 places if needed
    if (cleaned.includes('.')) {
      const [integerPart, decimalPart] = cleaned.split('.');
      if (decimalPart && decimalPart.length > 2) {
        cleaned = `${integerPart}.${decimalPart.slice(0, 2)}`;
      }
    }

    // Validate it's a valid number format
    if (cleaned && !/^\d*\.?\d{0,2}$/.test(cleaned)) {
      return; // Don't update if invalid format
    }

    setAmountInternal(cleaned);
  };

  const setAmount = (value: string) => {
    setAmountInternal(value);
  };

  const formattedAmount = formatCurrency(amount);

  return {
    formattedAmount,
    amount,
    handleAmountChange,
    setAmount,
  };
};
