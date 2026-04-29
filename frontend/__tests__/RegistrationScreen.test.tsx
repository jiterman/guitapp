import React from 'react';
import { render } from '@testing-library/react-native';
import { ApplicationProvider, IconRegistry } from '@ui-kitten/components';
import { EvaIconsPack } from '@ui-kitten/eva-icons';
import * as eva from '@eva-design/eva';
import RegistrationScreen from '../src/screens/RegistrationScreen';

jest.mock('expo-router', () => ({
  router: {
    push: jest.fn(),
  },
}));

const renderWithKitten = (component: React.ReactElement) => {
  return render(
    <>
      <IconRegistry icons={EvaIconsPack}/>
      <ApplicationProvider {...eva} theme={eva.light}>
        {component}
      </ApplicationProvider>
    </>
  );
};

describe('RegistrationScreen', () => {
  it('should render correctly', async () => {
    const { getByTestId } = renderWithKitten(<RegistrationScreen />);
    expect(getByTestId('registration-title')).toBeDefined();
    expect(getByTestId('register-button')).toBeDefined();
  });
});