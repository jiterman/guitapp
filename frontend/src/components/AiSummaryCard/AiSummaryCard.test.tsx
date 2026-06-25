import React from 'react';
import { ActivityIndicator } from 'react-native';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { ApplicationProvider } from '@ui-kitten/components';
import * as eva from '@eva-design/eva';
import AiSummaryCard from './AiSummaryCard';

const renderWithTheme = (ui: React.ReactElement) =>
  render(
    <ApplicationProvider {...eva} theme={eva.light}>
      {ui}
    </ApplicationProvider>
  );

describe('AiSummaryCard', () => {
  it('renders an ActivityIndicator when loading', () => {
    const { UNSAFE_getByType } = renderWithTheme(<AiSummaryCard text={null} loading={true} />);

    expect(UNSAFE_getByType(ActivityIndicator)).toBeTruthy();
  });

  it('renders the text when not loading and text is provided', () => {
    renderWithTheme(<AiSummaryCard text="Tu mes estuvo equilibrado." loading={false} />);

    expect(screen.getByText('Tu mes estuvo equilibrado.')).toBeTruthy();
  });

  it('renders nothing when not loading and text is null', () => {
    const { toJSON } = renderWithTheme(<AiSummaryCard text={null} loading={false} />);

    expect(toJSON()).toBeNull();
  });

  it('renders bold segments for **marked** text', () => {
    renderWithTheme(<AiSummaryCard text="Gastaste **mucho** este mes." loading={false} />);

    expect(screen.getByText('mucho')).toBeTruthy();
  });

  it('renders each bullet as a separate row', () => {
    renderWithTheme(
      <AiSummaryCard
        text="• Primer punto con **dato** importante.• Segundo punto con más info."
        loading={false}
      />
    );

    expect(screen.getByText('dato')).toBeTruthy();
    expect(screen.getByText('Segundo punto con más info.')).toBeTruthy();
  });

  it('shows "Ver más" by default and expands on press', () => {
    renderWithTheme(<AiSummaryCard text="Contenido visible." loading={false} />);

    expect(screen.getByText('Ver más')).toBeTruthy();

    fireEvent.press(screen.getByText('Ver más'));
    expect(screen.getByText('Ver menos')).toBeTruthy();
  });
});
