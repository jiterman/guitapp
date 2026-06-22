import React, { useEffect, useMemo, useState } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Text } from '@ui-kitten/components';
import { Ionicons } from '@expo/vector-icons';
import { useDialog } from '../../context/dialog';

type PersonalInfoEditorProps = {
  firstName: string;
  lastName: string;
  email: string;

  onSaveName: (firstName: string, lastName: string) => Promise<void>;
  onSaveEmail: (email: string) => Promise<void>;

  saving?: boolean;
};

const PersonalInfoEditor: React.FC<PersonalInfoEditorProps> = ({
  firstName,
  lastName,
  email,
  onSaveName,
  onSaveEmail,
  saving,
}) => {
  const [draftFirstName, setDraftFirstName] = useState(firstName);
  const [draftLastName, setDraftLastName] = useState(lastName);
  const [draftEmail, setDraftEmail] = useState(email);

  const [nameError, setNameError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);

  const { confirm } = useDialog();

  useEffect(() => setDraftFirstName(firstName), [firstName]);
  useEffect(() => setDraftLastName(lastName), [lastName]);
  useEffect(() => setDraftEmail(email), [email]);

  const normalizedLastName = useMemo(() => {
    const trimmed = draftLastName?.trim();
    return trimmed ? trimmed : '';
  }, [draftLastName]);

  // ---------------- NAME ----------------
  const handleSaveName = async () => {
    if (!draftFirstName.trim()) {
      setNameError('El nombre no puede estar vacío');
      return;
    }

    setNameError(null);

    try {
      await onSaveName(draftFirstName.trim(), normalizedLastName);
    } catch {
      setNameError('Error al guardar. Intentá nuevamente');
    }
  };

  // ---------------- EMAIL ----------------
  const handleSaveEmail = async () => {
    if (!draftEmail.trim() || !draftEmail.includes('@')) {
      setEmailError('Email inválido');
      return;
    }

    if (draftEmail === email) {
      setEmailError('El email es el mismo que el actual');
      return;
    }

    const confirmed = await confirm({
      title: 'Cambiar correo electrónico',
      message: 'Te enviaremos un enlace de verificación al nuevo correo para confirmar el cambio.',
      confirmText: 'Continuar',
      cancelText: 'Cancelar',
    });
    if (confirmed) {
      await confirmEmailChange();
    }
  };

  const confirmEmailChange = async () => {
    try {
      setEmailError(null);

      await onSaveEmail(draftEmail.trim());
    } catch (e: unknown) {
      console.error('Error cambiando email', e);

      setEmailError(e instanceof Error ? e.message : 'Error de red. Intentá nuevamente');
    }
  };

  // ---------------- INPUT HANDLERS ----------------
  const handleChangeFirstName = (value: string) => {
    if (nameError) setNameError(null);
    setDraftFirstName(value);
  };

  const handleChangeLastName = (value: string) => {
    if (nameError) setNameError(null);
    setDraftLastName(value);
  };

  const handleChangeEmail = (value: string) => {
    if (emailError) setEmailError(null);
    setDraftEmail(value);
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
              onChangeText={handleChangeFirstName}
              placeholder="Nombre"
              placeholderTextColor="#a0b8c8"
            />
          </View>
        </View>

        {nameError && <Text style={{ color: 'red', fontSize: 12, marginTop: 4 }}>{nameError}</Text>}

        <View style={styles.inputDivider} />

        <View style={styles.inputRow}>
          <Text style={styles.inputLabel}>
            Apellido <Text style={styles.optional}>(opcional)</Text>
          </Text>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              value={draftLastName}
              onChangeText={handleChangeLastName}
              placeholder="Apellido"
              placeholderTextColor="#a0b8c8"
            />
          </View>
        </View>

        <TouchableOpacity
          style={[styles.saveButton, saving && { opacity: 0.6 }]}
          onPress={handleSaveName}
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
              value={draftEmail}
              onChangeText={handleChangeEmail}
              placeholder="correo@ejemplo.com"
              placeholderTextColor="#a0b8c8"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
        </View>

        {emailError && (
          <Text style={{ color: 'red', fontSize: 12, marginTop: 4 }}>{emailError}</Text>
        )}

        <TouchableOpacity
          style={[styles.saveButton, saving && { opacity: 0.6 }]}
          onPress={handleSaveEmail}
          disabled={saving}
        >
          <Text style={styles.saveButtonText}>{saving ? 'Guardando...' : 'Guardar email'}</Text>
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
    gap: 8,
    marginBottom: 10,
  },
  editBlockTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#003366',
  },
  inputRow: {
    gap: 4,
    marginBottom: 11,
  },
  inputLabel: {
    fontSize: 12,
    color: '#6b8aa1',
    fontWeight: '600',
    marginBottom: 5,
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
    paddingVertical: 12,
    gap: 8,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#003366',
    fontWeight: '500',
    paddingVertical: 0,
  },
  inputDivider: {
    height: 1,
    backgroundColor: '#e0edf6',
    marginVertical: 12,
  },
  saveButton: {
    backgroundColor: '#FFBB00',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 12,
  },
  saveButtonText: {
    color: '#0c2b52',
    fontSize: 14,
    fontWeight: '700',
  },
  menuIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default PersonalInfoEditor;
