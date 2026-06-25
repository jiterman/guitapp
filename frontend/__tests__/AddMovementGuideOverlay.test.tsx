import React from 'react';
import { View as MockView } from 'react-native';
import { render, fireEvent } from '@testing-library/react-native';
import { AddMovementGuideOverlay } from '../src/components/AddMovementGuideOverlay/AddMovementGuideOverlay';

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

describe('AddMovementGuideOverlay', () => {
  const mockOnFinish = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders nothing when visible is false', () => {
    const { queryByTestId } = render(
      <AddMovementGuideOverlay visible={false} onFinish={mockOnFinish} />
    );
    expect(queryByTestId('guide-overlay-container')).toBeNull();
  });

  it('renders guide and calls onFinish when Entendido is pressed', () => {
    const { getByTestId, getByText } = render(
      <AddMovementGuideOverlay visible={true} onFinish={mockOnFinish} />
    );

    expect(getByTestId('step-1-tooltip')).toBeTruthy();
    expect(getByText('Cargar con Foto')).toBeTruthy();

    const finishBtn = getByTestId('btn-finish');
    fireEvent.press(finishBtn);

    expect(mockOnFinish).toHaveBeenCalledTimes(1);
  });
});
