import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react-native';
import { ApplicationProvider } from '@ui-kitten/components';
import * as eva from '@eva-design/eva';
import NotificationFrequencyEditor from '../src/components/Profile/NotificationFrequencyEditor';

const renderWithTheme = (ui: React.ReactElement) =>
  render(
    <ApplicationProvider {...eva} theme={eva.light}>
      {ui}
    </ApplicationProvider>
  );

describe('NotificationFrequencyEditor', () => {
  it('renders all frequency options', () => {
    renderWithTheme(
      <NotificationFrequencyEditor currentFrequency="INSTANT" saving={false} onSave={jest.fn()} />
    );

    expect(screen.getByText('Instantáneas')).toBeTruthy();
    expect(screen.getByText('Diario')).toBeTruthy();
    expect(screen.getByText('Semanal')).toBeTruthy();
  });

  it('shows current frequency as selected', () => {
    renderWithTheme(
      <NotificationFrequencyEditor currentFrequency="DAILY" saving={false} onSave={jest.fn()} />
    );

    expect(screen.getByText('Diario')).toBeTruthy();
  });

  it('calls onSave with selected frequency', () => {
    const onSave = jest.fn();

    renderWithTheme(
      <NotificationFrequencyEditor currentFrequency="INSTANT" saving={false} onSave={onSave} />
    );

    fireEvent.press(screen.getByText('Semanal'));
    fireEvent.press(screen.getByText('Guardar cambios'));

    expect(onSave).toHaveBeenCalledWith('WEEKLY');
  });
});
