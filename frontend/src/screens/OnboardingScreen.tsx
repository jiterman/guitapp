import React, { useState } from 'react';
import { View, TouchableOpacity, TextInput, ScrollView, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Button } from '@ui-kitten/components';
import { router } from 'expo-router';
import { userService } from '../services/userService';
import { useUser } from '../context/user';
import { validateFirstName } from '../utils/validation';
import { loginStyles as styles } from '../styles/loginStyles';
import { OnboardingError } from '../types/errors';

import { authService } from '../services/authService';
import { useDialog } from '../context/dialog';
import ExpensesEditor from '../components/Profile/ExpensesEditor';

const CARD_MAX_HEIGHT = Dimensions.get('window').height * 0.65;

const OnboardingScreen = () => {
  const { alert } = useDialog();
  const { user, setUser } = useUser();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Step 1
  const [firstName, setFirstName] = useState('');
  const [firstNameError, setFirstNameError] = useState<string | null>(null);

  const handleNextStep = () => {
    const error = validateFirstName(firstName);
    if (error) {
      setFirstNameError(error);
      return;
    }
    setStep(2);
  };

  // Step 2
  const handleOnboardingSave = async (fixed: number, variable: number, income: number) => {
    setLoading(true);
    try {
      await userService.completeOnboarding(firstName, fixed, variable, income);
      const profile = await userService.getProfile();
      if (user?.email) {
        await authService.updateBiometricUserName(user.email, firstName);
      }
      setUser(profile);
      router.replace('/home');
    } catch (err) {
      const error = err as OnboardingError;
      await alert({
        title: 'Error',
        message: error.message || 'Ocurrió un error al guardar los datos.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text category="h1" style={[styles.title]}>
          {step === 1 ? '¡Bienvenido!' : 'Tus Objetivos'}
        </Text>
        <Text category="s1" style={styles.subtitle}>
          {step === 1 ? 'Queremos conocerte un poco más.' : 'Configurá tus objetivos financieros.'}
        </Text>
        {step === 2 && (
          <Text style={styles.hint}>
            {
              'Con estos datos calculamos tu porcentaje de ahorro y te avisamos cuando tu meta esté en riesgo o cuando tus gastos se disparen.'
            }
          </Text>
        )}

        <View style={[styles.card, step === 2 && { maxHeight: CARD_MAX_HEIGHT }]}>
          {step === 1 && (
            <>
              <Text style={[styles.label, { marginTop: 0, marginBottom: 8 }]}>
                ¿Cómo querés que te llamemos?
              </Text>
              <View
                style={[
                  styles.inputWrapper,
                  firstNameError ? { borderColor: '#FF3333' } : null,
                  loading ? { backgroundColor: '#F4F9FD' } : null,
                ]}
              >
                <TextInput
                  value={firstName}
                  placeholder="Ej. Chris"
                  placeholderTextColor="#a0b8c8"
                  onChangeText={text => {
                    setFirstName(text);
                    setFirstNameError(null);
                  }}
                  style={styles.textInput}
                  editable={!loading}
                />
              </View>
              {firstNameError && <Text style={styles.errorText}>{firstNameError}</Text>}

              <TouchableOpacity
                style={[styles.button, { alignItems: 'center', justifyContent: 'center' }]}
                onPress={handleNextStep}
                disabled={loading}
              >
                <Text style={styles.buttonText}>Continuar</Text>
              </TouchableOpacity>
            </>
          )}

          {step === 2 && (
            <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
              <ExpensesEditor
                fixedDefault={50}
                variableDefault={30}
                incomeDefault={0}
                onSave={handleOnboardingSave}
                buttonText={loading ? 'Guardando...' : 'Finalizar Onboarding'}
                showHeaders={true}
                showCard={false}
              />
              <Button
                appearance="ghost"
                onPress={() => setStep(1)}
                disabled={loading}
                style={{ marginTop: 10 }}
              >
                Atrás
              </Button>
            </ScrollView>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
};

export default OnboardingScreen;
