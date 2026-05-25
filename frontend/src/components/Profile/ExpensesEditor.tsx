import React, { useEffect, useState, useMemo } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Text } from '@ui-kitten/components';
import { Ionicons } from '@expo/vector-icons';
import { profileSharedStyles } from '../../styles/profileStyles';
import { useCurrencyInput } from '../../hooks/useCurrencyInput';

type Props = {
  fixedDefault: number;
  variableDefault: number;
  incomeDefault: number;
  onSave: (fixed: number, variable: number, income: number) => void;
  externalError?: string | null;
  onChangeInput?: () => void;
};

const ExpensesEditor: React.FC<Props> = ({
  fixedDefault,
  variableDefault,
  incomeDefault,
  onSave,
  externalError,
  onChangeInput,
}) => {
  const [fixed, setFixed] = useState('');
  const [variable, setVariable] = useState('');
  const [error, setError] = useState<string | null>(null);
  const {
    displayValue: incomeDisplay,
    amount: incomeAmount,
    handleAmountChange: handleIncomeChange,
    setAmount: setIncomeAmount,
  } = useCurrencyInput();

  useEffect(() => {
    setFixed(String(fixedDefault ?? 0));
    setVariable(String(variableDefault ?? 0));
    setIncomeAmount(String(incomeDefault ?? 0));
    setError(null);
  }, [fixedDefault, variableDefault, incomeDefault]);

  const parseIntSafe = (v: string) => {
    const n = Number.parseInt(v, 10);
    return Number.isNaN(n) ? 0 : n;
  };

  const parseFloatSafe = (v: string) => {
    const n = Number.parseFloat(v);
    return Number.isNaN(n) ? 0 : n;
  };

  const fixedNum = parseIntSafe(fixed);
  const variableNum = parseIntSafe(variable);

  const savings = useMemo(() => {
    return Math.max(0, 100 - (fixedNum + variableNum));
  }, [fixedNum, variableNum]);

  const validate = (f: number, v: number) => {
    if (f + v > 100) {
      return 'La suma de gastos no puede superar 100%.';
    }
    return null;
  };

  const handleSave = () => {
    const validationError = validate(fixedNum, variableNum);

    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    onSave(fixedNum, variableNum, parseFloatSafe(incomeAmount));
  };

  const handleFixed = (text: string) => {
    setFixed(text);
    setError(null);
    onChangeInput?.();
  };

  const handleVariable = (text: string) => {
    setVariable(text);
    setError(null);
    onChangeInput?.();
  };

  const handleIncome = (text: string) => {
    handleIncomeChange(text);
    setError(null);
    onChangeInput?.();
  };

  const displayError = externalError || error;

  return (
    <View style={styles.block}>
      {/* INGRESOS */}
      <View style={styles.header}>
        <View style={[styles.iconCircle, { backgroundColor: '#E6F2FC' }]}>
          <Ionicons name="wallet-outline" size={18} color="#07a3e4" />
        </View>
        <Text style={styles.title}>Ingresos mensuales</Text>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Ingresos estimados</Text>
        <View style={styles.inputWrapper}>
          <Text style={styles.currencySymbol}>$</Text>
          <TextInput
            value={incomeDisplay}
            onChangeText={handleIncome}
            keyboardType="numeric"
            placeholder="Ej. 500.000"
            placeholderTextColor="#a0b8c8"
            style={styles.input}
          />
          <Ionicons name="pencil-outline" size={16} color="#07a3e4" />
        </View>
      </View>

      <View style={styles.divider} />

      {/* GASTOS */}
      <View style={[styles.header, { marginTop: 14 }]}>
        <View style={[styles.iconCircle, { backgroundColor: '#E6F2FC' }]}>
          <Ionicons name="pie-chart-outline" size={18} color="#07a3e4" />
        </View>
        <Text style={styles.title}>Distribución de gastos</Text>
      </View>

      {/* FIJOS */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Fijos (%)</Text>
        <View style={styles.inputWrapper}>
          <TextInput
            value={fixed}
            onChangeText={handleFixed}
            keyboardType="numeric"
            placeholder="Ej. 50"
            placeholderTextColor="#a0b8c8"
            style={styles.input}
          />
          <Ionicons name="pencil-outline" size={16} color="#07a3e4" />
        </View>
      </View>

      {/* VARIABLES */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Variables (%)</Text>
        <View style={styles.inputWrapper}>
          <TextInput
            value={variable}
            onChangeText={handleVariable}
            keyboardType="numeric"
            placeholder="Ej. 30"
            placeholderTextColor="#a0b8c8"
            style={styles.input}
          />
          <Ionicons name="pencil-outline" size={16} color="#07a3e4" />
        </View>
      </View>

      {/* AHORRO */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Ahorro (%)</Text>
        <View style={[styles.inputWrapper, profileSharedStyles.readonly]}>
          <TextInput
            value={String(savings)}
            editable={false}
            selectTextOnFocus={false}
            style={styles.input}
          />
          <Ionicons name="lock-closed-outline" size={16} color="#6b8aa1" />
        </View>
      </View>

      {/* ERROR */}
      {displayError && <Text style={styles.error}>{displayError}</Text>}

      {/* BUTTON */}
      <TouchableOpacity style={styles.button} onPress={handleSave}>
        <Text style={styles.buttonText}>Guardar cambios</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  block: {
    backgroundColor: '#F4F9FD',
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e0edf6',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 14,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: '#003366',
  },
  divider: {
    height: 1,
    backgroundColor: '#e0edf6',
    marginBottom: 14,
  },
  inputGroup: {
    marginBottom: 12,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b8aa1',
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#c8dff0',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#003366',
    fontWeight: '500',
  },
  currencySymbol: {
    fontSize: 15,
    fontWeight: '600',
    color: '#6b8aa1',
    marginRight: 6,
  },
  error: {
    color: '#FF3B30',
    fontSize: 12,
    marginBottom: 10,
    fontWeight: '500',
  },
  button: {
    backgroundColor: '#FFBB00',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 6,
  },
  buttonText: {
    color: '#0c2b52',
    fontWeight: '700',
    fontSize: 14,
  },
});

export default ExpensesEditor;
