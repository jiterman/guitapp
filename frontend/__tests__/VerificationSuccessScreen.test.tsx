import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ApplicationProvider, IconRegistry } from '@ui-kitten/components';
import { EvaIconsPack } from '@ui-kitten/eva-icons';
import * as eva from '@eva-design/eva';
import VerificationSuccessScreen from '../src/screens/VerificationSuccessScreen';
import { router, useLocalSearchParams } from 'expo-router';

jest.mock('expo-router', () => ({
  router: {
    push: jest.fn(),
  },
  useLocalSearchParams: jest.fn(),
}));

const renderWithKitten = (component: React.ReactElement) => {
  return render(
    <>
      <IconRegistry icons={EvaIconsPack} />
      <ApplicationProvider {...eva} theme={eva.light}>
        {component}
      </ApplicationProvider>
    </>
  );
};

describe('VerificationSuccessScreen', () => {
  beforeEach(() => {
    (useLocalSearchParams as jest.Mock).mockReturnValue({});
  });

  it('should render correctly with expected content', () => {
    const { getByTestId, getByText } = renderWithKitten(<VerificationSuccessScreen />);

    expect(getByTestId('success-title')).toBeDefined();
    expect(getByText('¡Cuenta verificada exitosamente!')).toBeDefined();

    expect(getByTestId('success-subtitle')).toBeDefined();
    expect(
      getByText('Tocá el botón Ingresar para ir a la pantalla de Inicio de Sesión.')
    ).toBeDefined();

    expect(getByTestId('login-button')).toBeDefined();
  });

  it('should render with custom content when params are provided', () => {
    (useLocalSearchParams as jest.Mock).mockReturnValue({
      title: 'Custom Title',
      subtitle: 'Custom Subtitle',
    });

    const { getByText } = renderWithKitten(<VerificationSuccessScreen />);

    expect(getByText('Custom Title')).toBeDefined();
    expect(getByText('Custom Subtitle')).toBeDefined();
  });

  it('should navigate to login when pressing the Ingresar button', () => {
    const { getByTestId } = renderWithKitten(<VerificationSuccessScreen />);
    const loginButton = getByTestId('login-button');

    fireEvent.press(loginButton);

    expect(router.push).toHaveBeenCalledWith('/login');
  });
});
