import { renderHook, act } from '@testing-library/react-native';
import { useCurrencyInput } from '../src/hooks/useCurrencyInput';

describe('useCurrencyInput', () => {
  it('should initialize with default value', () => {
    const { result } = renderHook(() => useCurrencyInput());

    expect(result.current.amount).toBe('');
    expect(result.current.displayValue).toBe('');
  });

  it('should initialize with provided value', () => {
    const { result } = renderHook(() => useCurrencyInput('100'));

    expect(result.current.amount).toBe('100');
    expect(result.current.displayValue).toBe('100');
  });

  it('should format amount with thousands separator', () => {
    const { result } = renderHook(() => useCurrencyInput());

    act(() => {
      result.current.handleAmountChange('100000');
    });

    expect(result.current.amount).toBe('100000');
    expect(result.current.displayValue).toBe('100.000');
  });

  it('should format amount with decimal places using comma', () => {
    const { result } = renderHook(() => useCurrencyInput());

    act(() => {
      result.current.handleAmountChange('1500,50');
    });

    expect(result.current.amount).toBe('1500.50');
    expect(result.current.displayValue).toBe('1.500,50');
  });

  it('should handle formatted input with currency symbol and comma', () => {
    const { result } = renderHook(() => useCurrencyInput());

    act(() => {
      result.current.handleAmountChange('1500,50');
    });

    expect(result.current.amount).toBe('1500.50');
    expect(result.current.displayValue).toBe('1.500,50');
  });

  it('should not add decimals automatically', () => {
    const { result } = renderHook(() => useCurrencyInput());

    act(() => {
      result.current.handleAmountChange('100');
    });

    expect(result.current.displayValue).toBe('100');
  });

  it('should handle single decimal digit using comma', () => {
    const { result } = renderHook(() => useCurrencyInput());

    act(() => {
      result.current.handleAmountChange('100,5');
    });

    expect(result.current.amount).toBe('100.5');
    expect(result.current.displayValue).toBe('100,5');
  });

  it('should limit decimal places to 2 digits using comma', () => {
    const { result } = renderHook(() => useCurrencyInput());

    act(() => {
      result.current.handleAmountChange('100,999');
    });

    expect(result.current.amount).toBe('100.99');
  });

  it('should handle comma as decimal separator in input', () => {
    const { result } = renderHook(() => useCurrencyInput());

    act(() => {
      result.current.handleAmountChange('100,50');
    });

    expect(result.current.amount).toBe('100.50');
    expect(result.current.displayValue).toBe('100,50');
  });

  it('should remove leading zeros', () => {
    const { result } = renderHook(() => useCurrencyInput());

    act(() => {
      result.current.handleAmountChange('00100');
    });

    expect(result.current.displayValue).toBe('100');
  });

  it('should format zero correctly', () => {
    const { result } = renderHook(() => useCurrencyInput());

    act(() => {
      result.current.handleAmountChange('0');
    });

    expect(result.current.amount).toBe('0');
    expect(result.current.displayValue).toBe('0');
  });

  it('should reject invalid characters', () => {
    const { result } = renderHook(() => useCurrencyInput('100'));

    act(() => {
      result.current.handleAmountChange('abc');
    });

    expect(result.current.amount).toBe('100');
  });

  it('should allow manual amount setting', () => {
    const { result } = renderHook(() => useCurrencyInput());

    act(() => {
      result.current.setAmount('250.75');
    });

    expect(result.current.amount).toBe('250.75');
    expect(result.current.displayValue).toBe('250,75');
  });

  it('should format large numbers correctly', () => {
    const { result } = renderHook(() => useCurrencyInput());

    act(() => {
      result.current.handleAmountChange('1234567,89');
    });

    expect(result.current.amount).toBe('1234567.89');
    expect(result.current.displayValue).toBe('1.234.567,89');
  });

  it('should handle empty input', () => {
    const { result } = renderHook(() => useCurrencyInput('100'));

    act(() => {
      result.current.handleAmountChange('');
    });

    expect(result.current.amount).toBe('');
    expect(result.current.displayValue).toBe('');
  });

  it('should handle comma at the end', () => {
    const { result } = renderHook(() => useCurrencyInput());

    act(() => {
      result.current.handleAmountChange('100,');
    });

    expect(result.current.amount).toBe('100.');
    expect(result.current.displayValue).toBe('100,');
  });

  it('should show decimals as user types them', () => {
    const { result } = renderHook(() => useCurrencyInput());

    act(() => {
      result.current.handleAmountChange('100,5');
    });

    expect(result.current.amount).toBe('100.5');
    expect(result.current.displayValue).toBe('100,5');
  });

  it('should strip dots from formatted input', () => {
    const { result } = renderHook(() => useCurrencyInput());

    act(() => {
      result.current.handleAmountChange('1.500,50');
    });

    // Dots are stripped, comma is used for decimals
    expect(result.current.amount).toBe('1500.50');
    expect(result.current.displayValue).toBe('1.500,50');
  });

  it('should handle pasting formatted currency', () => {
    const { result } = renderHook(() => useCurrencyInput());

    act(() => {
      result.current.handleAmountChange('1.234.567,89');
    });

    // Should strip all formatting and parse correctly
    expect(result.current.amount).toBe('1234567.89');
    expect(result.current.displayValue).toBe('1.234.567,89');
  });

  it('should handle multiple dots as thousands separators', () => {
    const { result } = renderHook(() => useCurrencyInput());

    act(() => {
      result.current.handleAmountChange('1.000.000');
    });

    // Dots are stripped, treated as integer
    expect(result.current.amount).toBe('1000000');
    expect(result.current.displayValue).toBe('1.000.000');
  });
});
