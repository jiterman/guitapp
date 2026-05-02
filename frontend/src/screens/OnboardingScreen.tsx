import React, { useState } from 'react';
import { SafeAreaView, View, Alert } from 'react-native';
import { Layout, Text, Input, Button } from '@ui-kitten/components';
import { router } from 'expo-router';
import { userService } from '../services/userService';
import { validateFirstName } from '../utils/validation';
import { loginStyles as styles } from '../styles/loginStyles';

const OnboardingScreen = () => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Step 1
  const [firstName, setFirstName] = useState('');
  const [firstNameError, setFirstNameError] = useState<string | null>(null);

  // Step 2
  const [fixedExpenses, setFixedExpenses] = useState('');
  const [variableExpenses, setVariableExpenses] = useState('');
  const [expensesError, setExpensesError] = useState<string | null>(null);

  const calculateSavings = () => {
    const fixed = parseInt(fixedExpenses || '0', 10);
    const variable = parseInt(variableExpenses || '0', 10);
    return 100 - (fixed + variable);
  };

  const handleNextStep = () => {
    const error = validateFirstName(firstName);
    if (error) {
      setFirstNameError(error);
      return;
    }
    setStep(2);
  };

  const handleFinish = async () => {
    setExpensesError(null);
    const fixed = parseInt(fixedExpenses, 10);
    const variable = parseInt(variableExpenses, 10);

    if (isNaN(fixed) || isNaN(variable)) {
      setExpensesError('Debes ingresar números válidos para los gastos.');
      return;
    }
    if (fixed <= 0 || variable <= 0) {
      setExpensesError('Los porcentajes deben ser mayores a 0.');
      return;
    }
    const savings = 100 - (fixed + variable);
    if (savings <= 0) {
      setExpensesError('La suma de gastos fijos y variables debe ser menor a 100.');
      return;
    }

    setLoading(true);
    try {
      await userService.completeOnboarding(firstName, fixed, variable);
      router.replace('/home');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Ocurrió un error al guardar los datos.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Layout style={styles.container}>
        <Text category="h1" style={styles.title}>
          {step === 1 ? '¡Bienvenido!' : 'Tus Objetivos'}
        </Text>
        <Text category="s1" style={styles.subtitle}>
          {step === 1
            ? 'Queremos conocerte un poco más.'
            : 'Configurá tus metas de gastos (opcional).'}
        </Text>

        <View style={styles.card}>
          {step === 1 && (
            <>
              <Text style={styles.label}>¿Cómo te llamas?</Text>
              <Input
                value={firstName}
                placeholder="Ej. Chris"
                onChangeText={text => {
                  setFirstName(text);
                  setFirstNameError(null);
                }}
                style={styles.input}
                status={firstNameError ? 'danger' : 'basic'}
                disabled={loading}
              />
              {firstNameError && <Text style={styles.errorText}>{firstNameError}</Text>}

              <Button style={styles.button} onPress={handleNextStep}>
                <Text style={styles.buttonText}>Continuar</Text>
              </Button>
            </>
          )}

          {step === 2 && (
            <>
              <Text style={styles.label}>Gastos Fijos (%)</Text>
              <Input
                value={fixedExpenses}
                placeholder="Ej. 50"
                keyboardType="numeric"
                onChangeText={text => {
                  setFixedExpenses(text);
                  setExpensesError(null);
                }}
                style={styles.input}
                disabled={loading}
              />

              <Text style={styles.label}>Gastos Variables (%)</Text>
              <Input
                value={variableExpenses}
                placeholder="Ej. 30"
                keyboardType="numeric"
                onChangeText={text => {
                  setVariableExpenses(text);
                  setExpensesError(null);
                }}
                style={styles.input}
                disabled={loading}
              />

              <Text style={styles.label}>Ahorro (%) - Autocalculado</Text>
              <Input value={String(calculateSavings())} style={styles.input} disabled={true} />
              {expensesError && <Text style={styles.errorText}>{expensesError}</Text>}

              <Button style={styles.button} onPress={handleFinish} disabled={loading}>
                <Text style={styles.buttonText}>
                  {loading ? 'Guardando...' : 'Finalizar Onboarding'}
                </Text>
              </Button>
              <Button appearance="ghost" onPress={() => setStep(1)} disabled={loading}>
                Atrás
              </Button>
            </>
          )}
        </View>
      </Layout>
    </SafeAreaView>
  );
};

export default OnboardingScreen;
