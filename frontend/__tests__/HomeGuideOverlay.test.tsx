import React from 'react';
import { View as MockView } from 'react-native';
import { render, fireEvent } from '@testing-library/react-native';
import { HomeGuideOverlay } from '../src/components/HomeGuideOverlay/HomeGuideOverlay';

// Mock react-native-safe-area-context to provide mocked safe area insets
jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 40, bottom: 20, left: 0, right: 0 }),
}));

// Mock Ionicons to prevent vector-icons render errors in tests
jest.mock('@expo/vector-icons', () => {
  return {
    Ionicons: (props: { name: string }) => <MockView {...props} testID={`icon-${props.name}`} />,
  };
});

describe('HomeGuideOverlay', () => {
  const mockOnFinish = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders nothing when visible is false', () => {
    const { queryByTestId } = render(<HomeGuideOverlay visible={false} onFinish={mockOnFinish} />);
    expect(queryByTestId('guide-overlay-container')).toBeNull();
  });

  it('renders Step 1 when visible is true and transitions to Step 2 upon pressing Entendido', () => {
    const { getByTestId, queryByTestId, getByText } = render(
      <HomeGuideOverlay visible={true} onFinish={mockOnFinish} />
    );

    // Step 1 should be visible
    expect(getByTestId('step-1-tooltip')).toBeTruthy();
    expect(queryByTestId('step-2-tooltip')).toBeNull();
    expect(getByText('Tu Perfil')).toBeTruthy();

    // Click "Entendido" for Step 1
    const nextBtn = getByTestId('btn-step-1-next');
    fireEvent.press(nextBtn);

    // Step 2 should now be visible
    expect(queryByTestId('step-1-tooltip')).toBeNull();
    expect(getByTestId('step-2-tooltip')).toBeTruthy();
    expect(getByText('Cargar Gastos')).toBeTruthy();

    // Click "Entendido" for Step 2
    const finishBtn = getByTestId('btn-step-2-finish');
    fireEvent.press(finishBtn);

    // onFinish should have been called
    expect(mockOnFinish).toHaveBeenCalledTimes(1);
  });
});
