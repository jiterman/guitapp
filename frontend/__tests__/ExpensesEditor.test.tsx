import React from 'react';
import { render, fireEvent, screen, waitFor } from '@testing-library/react-native';
import { ApplicationProvider } from '@ui-kitten/components';
import * as eva from '@eva-design/eva';
import { DialogProvider } from '../src/context/dialog';
import ExpensesEditor from '../src/components/Profile/ExpensesEditor';

const renderWithTheme = (ui: React.ReactElement) =>
  render(
    <ApplicationProvider {...eva} theme={eva.light}>
      <DialogProvider>{ui}</DialogProvider>
    </ApplicationProvider>
  );

describe('ExpensesEditor', () => {
  it('renders all inputs with initial values', () => {
    renderWithTheme(
      <ExpensesEditor
        fixedDefault={40}
        variableDefault={30}
        incomeDefault={500000}
        onSave={jest.fn()}
      />
    );

    // Check titles
    expect(screen.getByText('Ingresos mensuales')).toBeTruthy();
    expect(screen.getByText('Distribución de ingresos')).toBeTruthy();

    // Check helper text (Ahorro autocalculated)
    expect(
      screen.getByText('Autocalculado: 100 − 40 (fijos) − 30 (variables) = 30 %')
    ).toBeTruthy();
  });

  it('updates fixed amount when fixed percentage is changed', async () => {
    renderWithTheme(
      <ExpensesEditor
        fixedDefault={40}
        variableDefault={30}
        incomeDefault={500000}
        onSave={jest.fn()}
      />
    );

    const fixedPercentInput = screen.getByPlaceholderText('Ej. 50');
    fireEvent.changeText(fixedPercentInput, '50');

    // Expected amount is 50% of 500.000 = 250.000
    await waitFor(() => {
      const fixedAmountInput = screen.getByPlaceholderText('Ej. 250.000');
      expect(fixedAmountInput.props.value).toBe('250.000,00');
    });
  });

  it('has three "Equivale a" labels and amount inputs are read-only', () => {
    renderWithTheme(
      <ExpensesEditor
        fixedDefault={40}
        variableDefault={30}
        incomeDefault={500000}
        onSave={jest.fn()}
      />
    );

    // Verify labels
    const equivaleALabels = screen.getAllByText('Equivale a');
    expect(equivaleALabels.length).toBe(3);

    // Verify amount inputs are not editable
    const fixedAmountInput = screen.getByTestId('fixed-amount-input');
    const variableAmountInput = screen.getByTestId('variable-amount-input');
    const savingsAmountInput = screen.getByTestId('savings-amount-input');

    expect(fixedAmountInput.props.editable).toBe(false);
    expect(variableAmountInput.props.editable).toBe(false);
    expect(savingsAmountInput.props.editable).toBe(false);
  });

  it('recalculates amounts when income changes', async () => {
    renderWithTheme(
      <ExpensesEditor
        fixedDefault={50}
        variableDefault={30}
        incomeDefault={500000}
        onSave={jest.fn()}
      />
    );

    const incomeInput = screen.getByPlaceholderText('Ej. 500.000');
    fireEvent.changeText(incomeInput, '1.000.000');

    // Fixed amount should update to 50% of 1.000.000 = 500.000
    await waitFor(() => {
      const fixedAmountInput = screen.getByPlaceholderText('Ej. 250.000');
      expect(fixedAmountInput.props.value).toBe('500.000,00');
    });

    // Variable amount should update to 30% of 1.000.000 = 300.000
    await waitFor(() => {
      const variableAmountInput = screen.getByPlaceholderText('Ej. 150.000');
      expect(variableAmountInput.props.value).toBe('300.000,00');
    });
  });

  it('saves correct percentage and income on submit', async () => {
    const onSave = jest.fn();
    renderWithTheme(
      <ExpensesEditor
        fixedDefault={40}
        variableDefault={30}
        incomeDefault={500000}
        onSave={onSave}
      />
    );

    const fixedPercentInput = screen.getByPlaceholderText('Ej. 50');
    fireEvent.changeText(fixedPercentInput, '45');

    // Make sure percentage updates to 45 first
    await waitFor(() => {
      expect(fixedPercentInput.props.value).toBe('45');
    });

    fireEvent.press(screen.getByText('Guardar cambios'));

    await waitFor(() => {
      expect(onSave).toHaveBeenCalledWith(45, 30, 500000);
    });
  });
});
