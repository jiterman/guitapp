import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { ApplicationProvider, IconRegistry } from '@ui-kitten/components';
import { EvaIconsPack } from '@ui-kitten/eva-icons';
import * as eva from '@eva-design/eva';
import VerifyEmailChangeOtpScreen from '../src/screens/VerifyEmailChangeOtpScreen';
import { userService } from '../src/services/userService';
import { authService } from '../src/services/authService';
import { useUser } from '../src/context/UserContext';
import { router } from 'expo-router';

jest.mock('expo-router', () => ({
  router: {
    replace: jest.fn(),
  },
  useLocalSearchParams: jest.fn(() => ({ email: 'new@example.com' })),
}));

jest.mock('../src/services/userService', () => ({
  userService: {
    verifyEmailChange: jest.fn(),
  },
}));

jest.mock('../src/services/authService', () => ({
  authService: {
    removeBiometricUser: jest.fn(),
    removeToken: jest.fn(),
  },
}));

jest.mock('../src/context/UserContext', () => ({
  useUser: jest.fn(),
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

describe('VerifyEmailChangeOtpScreen', () => {
  const mockSetUser = jest.fn();
  const mockUser = { email: 'old@example.com', firstName: 'Test' };

  beforeEach(() => {
    jest.clearAllMocks();
    (useUser as jest.Mock).mockReturnValue({
      user: mockUser,
      setUser: mockSetUser,
    });
  });

  it('should render correctly', () => {
    const { getByText, getByPlaceholderText } = renderWithKitten(<VerifyEmailChangeOtpScreen />);
    expect(getByText('Confirmar nuevo mail')).toBeDefined();
    expect(getByText('new@example.com')).toBeDefined();
    expect(getByPlaceholderText('123456')).toBeDefined();
  });

  it('should navigate to verification-success on successful verification', async () => {
    (userService.verifyEmailChange as jest.Mock).mockResolvedValueOnce({});

    const { getByTestId } = renderWithKitten(<VerifyEmailChangeOtpScreen />);
    const otpInput = getByTestId('@otp-input/input');
    const verifyButton = getByTestId('verify-button');

    fireEvent.changeText(otpInput, '123456');
    fireEvent.press(verifyButton);

    await waitFor(() => {
      expect(userService.verifyEmailChange).toHaveBeenCalledWith('123456');
      expect(authService.removeBiometricUser).toHaveBeenCalledWith('old@example.com');
      expect(authService.removeToken).toHaveBeenCalled();
      expect(mockSetUser).toHaveBeenCalledWith(null);
      expect(router.replace).toHaveBeenCalledWith({
        pathname: '/verification-success',
        params: {
          title: '¡Email verificado!',
          subtitle:
            'Tu correo electrónico ha sido actualizado correctamente. Por favor, iniciá sesión nuevamente con tu nuevo email.',
          securityNote: 'Por razones de seguridad, se ha desactivado el ingreso biométrico.',
        },
      });
    });
  });
});
