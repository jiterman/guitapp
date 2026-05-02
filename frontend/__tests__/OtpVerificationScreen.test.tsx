import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { ApplicationProvider, IconRegistry } from '@ui-kitten/components';
import { EvaIconsPack } from '@ui-kitten/eva-icons';
import * as eva from '@eva-design/eva';
import OtpVerificationScreen from '../src/screens/OtpVerificationScreen';
import { authService } from '../src/services/authService';
import { router } from 'expo-router';

jest.mock('expo-router', () => ({
  router: {
    push: jest.fn(),
  },
  useLocalSearchParams: jest.fn(() => ({ email: 'test@example.com' })),
}));

jest.mock('../src/services/authService', () => ({
  authService: {
    verifyOtp: jest.fn(),
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

describe('OtpVerificationScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render correctly', async () => {
    const { getByTestId } = renderWithKitten(<OtpVerificationScreen />);
    expect(getByTestId('otp-verification-title')).toBeDefined();
    expect(getByTestId('@otp-input/input')).toBeDefined();
    expect(getByTestId('verify-otp-button')).toBeDefined();
  });

  it('should navigate to verification-success on successful verification', async () => {
    (authService.verifyOtp as jest.Mock).mockResolvedValueOnce({ success: true });

    const { getByTestId } = renderWithKitten(<OtpVerificationScreen />);
    const otpInput = getByTestId('@otp-input/input');
    const verifyButton = getByTestId('verify-otp-button');

    fireEvent.changeText(otpInput, '123456');
    fireEvent.press(verifyButton);

    await waitFor(() => {
      expect(authService.verifyOtp).toHaveBeenCalledWith('test@example.com', '123456');
      expect(router.push).toHaveBeenCalledWith('/verification-success');
    });
  });
});
