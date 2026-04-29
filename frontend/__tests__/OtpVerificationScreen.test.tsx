import React from 'react';
import { render } from '@testing-library/react-native';
import { ApplicationProvider, IconRegistry } from '@ui-kitten/components';
import { EvaIconsPack } from '@ui-kitten/eva-icons';
import * as eva from '@eva-design/eva';
import OtpVerificationScreen from '../src/screens/OtpVerificationScreen';

jest.mock('expo-router', () => ({
  router: {
    push: jest.fn(),
  },
  useLocalSearchParams: jest.fn(() => ({ email: 'test@example.com' })),
}));

const renderWithKitten = (component) => {
  return render(
    <>
      <IconRegistry icons={EvaIconsPack}/>
      <ApplicationProvider {...eva} theme={eva.light}>
        {component}
      </ApplicationProvider>
    </>
  );
};

describe('OtpVerificationScreen', () => {
  it('should render correctly', async () => {
    const { getByTestId } = renderWithKitten(<OtpVerificationScreen />);
    expect(getByTestId('otp-verification-title')).toBeDefined();
    expect(getByTestId('@otp-input/input')).toBeDefined();
    expect(getByTestId('verify-otp-button')).toBeDefined();
  });
});