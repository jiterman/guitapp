import React, { useState, useEffect } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Text } from '@ui-kitten/components';
import { Ionicons } from '@expo/vector-icons';

interface PersonalInfoEditorProps {
  firstName: string;
  setFirstName: (name: string) => void;
  lastName: string;
  setLastName: (name: string) => void;
  email: string;
  setEmail: (email: string) => void;
  onSaveName: (firstName: string, lastName: string) => Promise<void>;
  saving?: boolean;
}

const PersonalInfoEditor: React.FC<PersonalInfoEditorProps> = ({
  firstName,
  lastName,
  setEmail,
  email,
  onSaveName,
  saving,
}) => {
  const [draftFirstName, setDraftFirstName] = useState(firstName);
  const [draftLastName, setDraftLastName] = useState(lastName);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setDraftFirstName(firstName);
    setDraftLastName(lastName);
  }, [firstName, lastName]);

  useEffect(() => {
    if (error) {
      setError(null);
    }
  }, [draftFirstName, draftLastName]);

  const handleSave = async () => {
    if (!draftFirstName.trim()) {
      setError('El nombre no puede estar vacío');
      return;
    }

    setError(null);

    try {
      await onSaveName(draftFirstName, draftLastName);
    } catch {
      setError('Error al guardar. Intentá nuevamente');
    }
  };

  return (
    <>
      {/* BLOQUE NOMBRE */}
      <View style={styles.editBlock}>
        <View style={styles.editBlockHeader}>
          <View style={[styles.menuIconCircle, { backgroundColor: '#E6F2FC' }]}>
            <Ionicons name="person-outline" size={18} color="#07a3e4" />
          </View>
          <Text style={styles.editBlockTitle}>Nombre completo</Text>
        </View>

        <View style={styles.inputRow}>
          <Text style={styles.inputLabel}>Nombre</Text>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              value={draftFirstName}
              onChangeText={setDraftFirstName}
              placeholder="Nombre"
              placeholderTextColor="#a0b8c8"
            />
            <Ionicons name="pencil-outline" size={16} color="#07a3e4" />
          </View>
        </View>
        {error && <Text style={{ color: 'red', fontSize: 12, marginTop: 4 }}>{error}</Text>}

        <View style={styles.inputDivider} />

        <View style={styles.inputRow}>
          <Text style={styles.inputLabel}>
            Apellido <Text style={styles.optional}>(opcional)</Text>
          </Text>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              value={draftLastName}
              onChangeText={setDraftLastName}
              placeholder="Apellido"
              placeholderTextColor="#a0b8c8"
            />
            <Ionicons name="pencil-outline" size={16} color="#07a3e4" />
          </View>
        </View>

        <TouchableOpacity
          style={[styles.saveButton, saving && { opacity: 0.6 }]}
          onPress={handleSave}
          disabled={saving}
        >
          <Text style={styles.saveButtonText}>{saving ? 'Guardando...' : 'Guardar nombre'}</Text>
        </TouchableOpacity>
      </View>

      {/* BLOQUE EMAIL */}
      <View style={styles.editBlock}>
        <View style={styles.editBlockHeader}>
          <View style={[styles.menuIconCircle, { backgroundColor: '#E6F2FC' }]}>
            <Ionicons name="mail-outline" size={18} color="#07a3e4" />
          </View>
          <Text style={styles.editBlockTitle}>Correo electrónico</Text>
        </View>

        <View style={styles.inputRow}>
          <Text style={styles.inputLabel}>Email</Text>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="correo@ejemplo.com"
              placeholderTextColor="#a0b8c8"
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <Ionicons name="pencil-outline" size={16} color="#07a3e4" />
          </View>
        </View>

        <TouchableOpacity style={styles.saveButton}>
          <Text style={styles.saveButtonText}>Guardar email</Text>
        </TouchableOpacity>
      </View>
    </>
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
  optional: {
    fontSize: 12,
    color: '#a0b8c8',
    fontWeight: '400',
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
  menuIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default PersonalInfoEditor;
