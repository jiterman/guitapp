import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ApplicationProvider, IconRegistry } from '@ui-kitten/components';
import { EvaIconsPack } from '@ui-kitten/eva-icons';
import * as eva from '@eva-design/eva';
import VerificationSuccessScreen from '../src/screens/VerificationSuccessScreen';
import { router } from 'expo-router';

jest.mock('expo-router', () => ({
  router: {
    push: jest.fn(),
  },
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
  it('should render correctly with expected content', () => {
    const { getByTestId, getByText } = renderWithKitten(<VerificationSuccessScreen />);

    expect(getByTestId('success-title')).toBeDefined();
    expect(getByText('¡Cuenta verificada existosamente!')).toBeDefined();

    expect(getByTestId('success-subtitle')).toBeDefined();
    expect(
      getByText('Ya podés ingresar a la aplicación para gestionar tus gastos de forma inteligente')
    ).toBeDefined();

    expect(getByTestId('success-text')).toBeDefined();
    expect(
      getByText(
        'Hacé click en el botón Ingresar. Te llevará a la pantalla de Login para que puedas ingresar'
      )
    ).toBeDefined();

    expect(getByTestId('login-button')).toBeDefined();
  });

  it('should navigate to login when pressing the Ingresar button', () => {
    const { getByTestId } = renderWithKitten(<VerificationSuccessScreen />);
    const loginButton = getByTestId('login-button');

    fireEvent.press(loginButton);

    expect(router.push).toHaveBeenCalledWith('/login');
  });
});
