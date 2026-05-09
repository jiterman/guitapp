import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { ApplicationProvider } from '@ui-kitten/components';
import * as eva from '@eva-design/eva';
import OnboardingScreen from '../src/screens/OnboardingScreen';
import { userService } from '../src/services/userService';
import { router } from 'expo-router';
import { UserProvider } from '../src/context/UserContext';

// Mock router
jest.mock('expo-router', () => ({
  router: {
    replace: jest.fn(),
  },
}));

// Mock userService
jest.mock('../src/services/userService', () => ({
  userService: {
    completeOnboarding: jest.fn(),
    getProfile: jest.fn(),
  },
}));

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <ApplicationProvider {...eva} theme={eva.light}>
    <UserProvider>{children}</UserProvider>
  </ApplicationProvider>
);

describe('OnboardingScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (userService.getProfile as jest.Mock).mockResolvedValue({
      firstName: '',
      email: 'test@test.com',
      onboardingCompleted: false,
    });
  });

  it('should render step 1 initially', () => {
    const { getByText, getByPlaceholderText } = render(
      <Wrapper>
        <OnboardingScreen />
      </Wrapper>
    );

    expect(getByText('¡Bienvenido!')).toBeTruthy();
    expect(getByPlaceholderText('Ej. Chris')).toBeTruthy();
  });

  it('should show error if name is empty and next is pressed', () => {
    const { getByText } = render(
      <Wrapper>
        <OnboardingScreen />
      </Wrapper>
    );

    fireEvent.press(getByText('Continuar'));
    expect(getByText('Este campo es obligatorio.')).toBeTruthy();
  });

  it('should transition to step 2 if name is valid', () => {
    const { getByText, getByPlaceholderText } = render(
      <Wrapper>
        <OnboardingScreen />
      </Wrapper>
    );

    fireEvent.changeText(getByPlaceholderText('Ej. Chris'), 'Chris');
    fireEvent.press(getByText('Continuar'));

    expect(getByText('Tus Objetivos')).toBeTruthy();
    expect(getByText('Gastos Fijos (%)')).toBeTruthy();
  });

  it('should show error if expenses sum is 100 or more', async () => {
    const { getByText, getByPlaceholderText } = render(
      <Wrapper>
        <OnboardingScreen />
      </Wrapper>
    );

    fireEvent.changeText(getByPlaceholderText('Ej. Chris'), 'Chris');
    fireEvent.press(getByText('Continuar'));

    // We are in step 2
    fireEvent.changeText(getByPlaceholderText('Ej. 50'), '60');
    fireEvent.changeText(getByPlaceholderText('Ej. 30'), '50'); // 110 total
    fireEvent.press(getByText('Finalizar Onboarding'));

    await waitFor(() => {
      expect(getByText('La suma de gastos fijos y variables no puede superar 100.')).toBeTruthy();
    });
  });

  it('should show error if expenses are 0', async () => {
    const { getByText, getByPlaceholderText } = render(
      <Wrapper>
        <OnboardingScreen />
      </Wrapper>
    );

    fireEvent.changeText(getByPlaceholderText('Ej. Chris'), 'Chris');
    fireEvent.press(getByText('Continuar'));

    fireEvent.changeText(getByPlaceholderText('Ej. 50'), '0');
    fireEvent.changeText(getByPlaceholderText('Ej. 30'), '30');
    fireEvent.press(getByText('Finalizar Onboarding'));

    await waitFor(() => {
      expect(getByText('Los porcentajes deben ser mayores a 0.')).toBeTruthy();
    });
  });

  it('should call userService and redirect on success', async () => {
    (userService.completeOnboarding as jest.Mock).mockResolvedValueOnce({});

    const { getByText, getByPlaceholderText } = render(
      <Wrapper>
        <OnboardingScreen />
      </Wrapper>
    );

    fireEvent.changeText(getByPlaceholderText('Ej. Chris'), 'Chris');
    fireEvent.press(getByText('Continuar'));

    fireEvent.changeText(getByPlaceholderText('Ej. 50'), '50');
    fireEvent.changeText(getByPlaceholderText('Ej. 30'), '30');
    fireEvent.press(getByText('Finalizar Onboarding'));

    await waitFor(() => {
      expect(userService.completeOnboarding).toHaveBeenCalledWith('Chris', 50, 30);
      expect(router.replace).toHaveBeenCalledWith('/home');
    });
  });
});
