import React, { useState, useEffect } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Text } from '@ui-kitten/components';
import { Ionicons } from '@expo/vector-icons';

interface PasswordEditorProps {
  onSave: (currentPassword: string, newPassword: string) => Promise<void>;
  saving?: boolean;
  error?: string | null;
  externalError?: string | null;
  onChangeInput?: () => void;
}

const PasswordEditor: React.FC<PasswordEditorProps> = ({
  onSave,
  saving = false,
  externalError,
  onChangeInput,
}) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const displayError = externalError || error;

  useEffect(() => {
    setError(null);
  }, [currentPassword, newPassword]);

  const handleSave = async () => {
    if (!currentPassword.trim()) {
      setError('Debés ingresar tu contraseña actual');
      return;
    }

    if (!newPassword.trim()) {
      setError('Debés ingresar una nueva contraseña');
      return;
    }

    if (newPassword.length < 8) {
      setError('La nueva contraseña debe tener al menos 8 caracteres');
      return;
    }

    if (currentPassword === newPassword) {
      setError('La nueva contraseña debe ser distinta de la actual');
      return;
    }

    setError(null);

    try {
      await onSave(currentPassword, newPassword);
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : 'Error al cambiar la contraseña';
      setError(errorMessage);
    }
  };

  return (
    <View style={styles.editBlock}>
      <View style={styles.inputRow}>
        <Text style={styles.inputLabel}>Contraseña actual</Text>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            value={currentPassword}
            onChangeText={text => {
              setCurrentPassword(text);
              onChangeInput?.();
            }}
            placeholder="Ingresá tu contraseña actual"
            placeholderTextColor="#a0b8c8"
            secureTextEntry={!showCurrent}
          />

          <TouchableOpacity onPress={() => setShowCurrent(!showCurrent)}>
            <Ionicons
              name={showCurrent ? 'eye-off-outline' : 'eye-outline'}
              size={18}
              color="#07a3e4"
            />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.inputDivider} />

      <View style={styles.inputRow}>
        <Text style={styles.inputLabel}>Nueva contraseña</Text>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            value={newPassword}
            onChangeText={text => {
              setNewPassword(text);
              onChangeInput?.();
            }}
            placeholder="Ingresá tu nueva contraseña"
            placeholderTextColor="#a0b8c8"
            secureTextEntry={!showNew}
          />

          <TouchableOpacity onPress={() => setShowNew(!showNew)}>
            <Ionicons
              name={showNew ? 'eye-off-outline' : 'eye-outline'}
              size={18}
              color="#07a3e4"
            />
          </TouchableOpacity>
        </View>
      </View>

      {displayError && <Text style={styles.errorText}>{displayError}</Text>}

      <TouchableOpacity
        style={[styles.saveButton, saving && { opacity: 0.6 }]}
        onPress={handleSave}
        disabled={saving}
      >
        {saving ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.saveButtonText}>Guardar contraseña</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  editBlock: {
    backgroundColor: '#F4F9FD',
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e0edf6',
  },
  editBlockHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  editBlockTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#003366',
  },
  inputRow: {
    gap: 4,
    marginBottom: 8,
  },
  inputLabel: {
    fontSize: 12,
    color: '#6b8aa1',
    fontWeight: '600',
    marginBottom: 4,
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
    gap: 8,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#003366',
    fontWeight: '500',
  },
  inputDivider: {
    height: 1,
    backgroundColor: '#e0edf6',
    marginVertical: 12,
  },
  saveButton: {
    backgroundColor: '#07a3e4',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 12,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 12,
    marginTop: 4,
  },
  menuIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default PasswordEditor;
