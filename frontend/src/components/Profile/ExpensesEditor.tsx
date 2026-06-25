import React, { useEffect, useState, useMemo, useRef } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Text } from '@ui-kitten/components';
import { Ionicons } from '@expo/vector-icons';
import { profileSharedStyles } from '../../styles/profileStyles';
import { useDialog } from '../../context/dialog';
import { useCurrencyInput } from '../../hooks/useCurrencyInput';

type Props = {
  fixedDefault: number;
  variableDefault: number;
  incomeDefault: number;
  onSave: (fixed: number, variable: number, income: number) => void;
  externalError?: string | null;
  onChangeInput?: () => void;
  buttonText?: string;
  showHeaders?: boolean;
  showCard?: boolean;
};

const ExpensesEditor: React.FC<Props> = ({
  fixedDefault,
  variableDefault,
  incomeDefault,
  onSave,
  externalError,
  onChangeInput,
  buttonText = 'Guardar cambios',
  showHeaders = true,
  showCard = true,
}) => {
  const { alert } = useDialog();
  const [fixed, setFixed] = useState(String(fixedDefault ?? 0));
  const [variable, setVariable] = useState(String(variableDefault ?? 0));
  const [error, setError] = useState<string | null>(null);
  const prevProps = useRef({ fixedDefault, variableDefault, incomeDefault });

  const {
    displayValue: incomeDisplay,
    amount: incomeAmount,
    handleAmountChange: handleIncomeChange,
    setAmount: setIncomeAmount,
    handleFocus: handleIncomeFocus,
    handleBlur: handleIncomeBlur,
  } = useCurrencyInput(String(incomeDefault ?? 0));

  useEffect(() => {
    if (
      prevProps.current.fixedDefault !== fixedDefault ||
      prevProps.current.variableDefault !== variableDefault ||
      prevProps.current.incomeDefault !== incomeDefault
    ) {
      setFixed(String(fixedDefault ?? 0));
      setVariable(String(variableDefault ?? 0));
      setIncomeAmount(String(incomeDefault ?? 0));

      setError(null);
      prevProps.current = { fixedDefault, variableDefault, incomeDefault };
    }
  }, [fixedDefault, variableDefault, incomeDefault, setIncomeAmount]);

  const parseIntSafe = (v: string) => {
    const n = Number.parseInt(v, 10);
    return Number.isNaN(n) ? 0 : n;
  };

  const parseFloatSafe = (v: string) => {
    const n = Number.parseFloat(v);
    return Number.isNaN(n) ? 0 : n;
  };

  const formatCurrency = (value: string | number): string => {
    const numVal = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(numVal) || numVal === 0) {
      return '0,00';
    }

    const parts = numVal.toFixed(2).split('.');
    let integerPart = parts[0] || '';
    const decimalPart = parts[1] || '00';

    integerPart = integerPart.replace(/^0+/, '') || '0';
    const withSeparator = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');

    return `${withSeparator},${decimalPart}`;
  };

  const fixedNum = parseIntSafe(fixed);
  const variableNum = parseIntSafe(variable);

  const fixedAmount = useMemo(() => {
    const incomeVal = parseFloatSafe(incomeAmount);
    return Math.max(0, incomeVal * (fixedNum / 100));
  }, [incomeAmount, fixedNum]);

  const variableAmount = useMemo(() => {
    const incomeVal = parseFloatSafe(incomeAmount);
    return Math.max(0, incomeVal * (variableNum / 100));
  }, [incomeAmount, variableNum]);

  const savings = useMemo(() => {
    return Math.max(0, 100 - (fixedNum + variableNum));
  }, [fixedNum, variableNum]);

  const savingsAmount = useMemo(() => {
    const incomeVal = parseFloatSafe(incomeAmount);
    return Math.max(0, incomeVal * (savings / 100));
  }, [incomeAmount, savings]);

  const validate = (f: number, v: number, inc: number) => {
    if (f + v > 100) {
      return 'La suma de gastos fijos y variables no puede superar 100.';
    }
    if (f <= 0 || v <= 0) {
      return 'Los porcentajes deben ser mayores a 0.';
    }
    if (inc <= 0) {
      return 'El ingreso estimado debe ser mayor a 0.';
    }
    return null;
  };

  const handleSave = () => {
    const incomeVal = parseFloatSafe(incomeAmount);
    const validationError = validate(fixedNum, variableNum, incomeVal);

    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    onSave(fixedNum, variableNum, incomeVal);
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
    <View style={showCard ? styles.block : null}>
      {/* INGRESOS */}
      {showHeaders && (
        <View style={styles.header}>
          <View style={[styles.iconCircle, { backgroundColor: '#E6F2FC' }]}>
            <Ionicons name="wallet-outline" size={18} color="#07a3e4" />
          </View>
          <Text style={styles.title}>Ingresos mensuales</Text>
        </View>
      )}

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Ingresos estimados</Text>
        <View style={styles.inputWrapper}>
          <Text style={styles.currencySymbol}>$</Text>
          <TextInput
            value={incomeDisplay}
            onChangeText={handleIncome}
            onFocus={handleIncomeFocus}
            onBlur={handleIncomeBlur}
            keyboardType="numeric"
            placeholder="Ej. 500.000"
            placeholderTextColor="#a0b8c8"
            style={styles.input}
          />
        </View>
      </View>

      {showHeaders && <View style={styles.divider} />}

      {/* GASTOS */}
      {showHeaders && (
        <View style={[styles.header, { marginTop: 8 }]}>
          <View style={[styles.iconCircle, { backgroundColor: '#E6F2FC' }]}>
            <Ionicons name="pie-chart-outline" size={18} color="#07a3e4" />
          </View>
          <Text style={styles.title}>Distribución de ingresos</Text>
        </View>
      )}

      {/* FIJOS */}
      <View style={styles.row}>
        <View style={[styles.inputGroup, { flex: 1 }]}>
          <Text style={styles.label}>Gastos fijos</Text>
          <View style={styles.inputWrapper}>
            <TextInput
              value={fixed}
              onChangeText={handleFixed}
              keyboardType="numeric"
              placeholder="Ej. 50"
              placeholderTextColor="#a0b8c8"
              style={styles.input}
              maxLength={3}
            />
            <Text style={styles.percentSymbol}>%</Text>
          </View>
        </View>
        <View style={[styles.inputGroup, { flex: 1.5 }]}>
          <Text style={styles.label}>Equivale a</Text>
          <View style={[styles.inputWrapper, profileSharedStyles.readonly]}>
            <Text style={styles.currencySymbol}>$</Text>
            <TextInput
              value={formatCurrency(fixedAmount)}
              editable={false}
              selectTextOnFocus={false}
              placeholder="Ej. 250.000"
              placeholderTextColor="#a0b8c8"
              style={styles.input}
              testID="fixed-amount-input"
            />
          </View>
        </View>
      </View>

      {/* VARIABLES */}
      <View style={styles.row}>
        <View style={[styles.inputGroup, { flex: 1 }]}>
          <Text style={styles.label}>Gastos variables</Text>
          <View style={styles.inputWrapper}>
            <TextInput
              value={variable}
              onChangeText={handleVariable}
              keyboardType="numeric"
              placeholder="Ej. 30"
              placeholderTextColor="#a0b8c8"
              style={styles.input}
              maxLength={3}
            />
            <Text style={styles.percentSymbol}>%</Text>
          </View>
        </View>
        <View style={[styles.inputGroup, { flex: 1.5 }]}>
          <Text style={styles.label}>Equivale a</Text>
          <View style={[styles.inputWrapper, profileSharedStyles.readonly]}>
            <Text style={styles.currencySymbol}>$</Text>
            <TextInput
              value={formatCurrency(variableAmount)}
              editable={false}
              selectTextOnFocus={false}
              placeholder="Ej. 150.000"
              placeholderTextColor="#a0b8c8"
              style={styles.input}
              testID="variable-amount-input"
            />
          </View>
        </View>
      </View>

      {/* AHORRO */}
      <View style={styles.row}>
        <View style={[styles.inputGroup, { flex: 1 }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 5 }}>
            <Text style={[styles.label, { marginBottom: 0 }]}>Ahorro</Text>
            <TouchableOpacity
              onPress={() =>
                alert({
                  title: 'Porcentaje de ahorro',
                  message:
                    'Este valor se calcula automáticamente restando tus gastos fijos y variables del 100% de tus ingresos.',
                })
              }
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="information-circle-outline" size={14} color="#6b8aa1" />
            </TouchableOpacity>
          </View>
          <View style={[styles.inputWrapper, profileSharedStyles.readonly]}>
            <TextInput
              value={String(savings)}
              editable={false}
              selectTextOnFocus={false}
              style={styles.input}
            />
            <Text style={styles.percentSymbol}>%</Text>
          </View>
        </View>
        <View style={[styles.inputGroup, { flex: 1.5 }]}>
          <Text style={styles.label}>Equivale a</Text>
          <View style={[styles.inputWrapper, profileSharedStyles.readonly]}>
            <Text style={styles.currencySymbol}>$</Text>
            <TextInput
              value={formatCurrency(savingsAmount)}
              editable={false}
              selectTextOnFocus={false}
              style={styles.input}
              testID="savings-amount-input"
            />
          </View>
        </View>
      </View>
      <Text style={styles.helperText}>
        Autocalculado: 100 − {fixedNum} (fijos) − {variableNum} (variables) = {savings} %
      </Text>

      {/* ERROR */}
      {displayError && <Text style={styles.error}>{displayError}</Text>}

      {/* BUTTON */}
      <TouchableOpacity style={styles.button} onPress={handleSave}>
        <Text style={styles.buttonText}>{buttonText}</Text>
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
    gap: 8,
    marginBottom: 10,
  },
  iconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
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
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  inputGroup: {
    marginBottom: 11,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b8aa1',
    marginBottom: 5,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#c8dff0',
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#003366',
    fontWeight: '500',
    paddingVertical: 0,
  },
  currencySymbol: {
    fontSize: 15,
    fontWeight: '600',
    color: '#6b8aa1',
    marginRight: 6,
  },
  percentSymbol: {
    fontSize: 15,
    fontWeight: '600',
    color: '#6b8aa1',
    marginLeft: 6,
  },
  helperText: {
    fontSize: 14,
    color: '#6b8aa1',
    marginTop: 6,
  },
  error: {
    color: '#FF3B30',
    fontSize: 14,
    marginTop: 12,
    marginBottom: 10,
    fontWeight: '500',
  },
  button: {
    backgroundColor: '#FFBB00',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: '#0c2b52',
    fontWeight: '700',
    fontSize: 14,
  },
});

export default ExpensesEditor;
