import React, { useEffect, useState, useMemo } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Text } from '@ui-kitten/components';
import { Ionicons } from '@expo/vector-icons';
import { profileSharedStyles } from '../../styles/profileStyles';

type Props = {
  fixedDefault: number;
  variableDefault: number;
  onSave: (fixed: number, variable: number) => void;
};

const ExpensesEditor: React.FC<Props> = ({ fixedDefault, variableDefault, onSave }) => {
  const [fixed, setFixed] = useState('');
  const [variable, setVariable] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setFixed(String(fixedDefault ?? 0));
    setVariable(String(variableDefault ?? 0));
    setError(null);
  }, [fixedDefault, variableDefault]);

  const parse = (v: string) => {
    const n = parseInt(v, 10);
    return isNaN(n) ? 0 : n;
  };

  const fixedNum = parse(fixed);
  const variableNum = parse(variable);

  const savings = useMemo(() => {
    return Math.max(0, 100 - (fixedNum + variableNum));
  }, [fixedNum, variableNum]);

  const validate = (f: number, v: number) => {
    if (f + v > 100) {
      return 'La suma de gastos no puede superar 100%.';
    }
    return null;
  };

  const handleFixed = (text: string) => {
    setFixed(text);
    setError(validate(parse(text), variableNum));
  };

  const handleVariable = (text: string) => {
    setVariable(text);
    setError(validate(fixedNum, parse(text)));
  };

  return (
    <View style={styles.block}>
      {/* HEADER */}
      <View style={styles.header}>
        <View style={[styles.iconCircle, { backgroundColor: '#E6F2FC' }]}>
          <Ionicons name="pie-chart-outline" size={18} color="#07a3e4" />
        </View>
        <Text style={styles.title}>Gastos mensuales</Text>
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
      {error && <Text style={styles.error}>{error}</Text>}

      {/* BUTTON */}
      <TouchableOpacity
        style={[styles.button, error && { opacity: 0.6 }]}
        onPress={() => onSave(fixedNum, variableNum)}
        disabled={!!error}
      >
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
    borderWidth: 1,
    borderColor: '#e0edf6',
    marginTop: 12,
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

  savingsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
    marginBottom: 10,
  },

  savingsValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#003366',
  },

  error: {
    color: '#FF3B30',
    fontSize: 12,
    marginBottom: 10,
    fontWeight: '500',
  },

  button: {
    backgroundColor: '#07a3e4',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },

  buttonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
});

export default ExpensesEditor;
