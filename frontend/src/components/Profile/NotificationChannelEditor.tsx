import React, { useEffect, useState } from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Text } from '@ui-kitten/components';
import { Ionicons } from '@expo/vector-icons';
import type { NotificationChannel } from '../../context/user';
import { profileSharedStyles } from '../../styles/profileStyles';
import { notificationChannelStyles as styles } from '../../styles/notificationChannelStyles';

type Props = {
  currentChannel?: NotificationChannel;
  saving: boolean;
  externalError?: string | null;
  onSave: (channel: NotificationChannel) => void;
  onChange?: () => void;
};

const OPTIONS: {
  value: NotificationChannel;
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
}[] = [
  {
    value: 'PUSH',
    title: 'Celular',
    subtitle: 'Recibí los avisos en tu celular',
    icon: 'phone-portrait-outline',
  },
  {
    value: 'EMAIL',
    title: 'Correo electrónico',
    subtitle: 'Recibí los avisos por mail',
    icon: 'mail-outline',
  },
];

const NotificationChannelEditor: React.FC<Props> = ({
  currentChannel,
  saving,
  externalError,
  onSave,
  onChange,
}) => {
  const [selected, setSelected] = useState<NotificationChannel>(currentChannel ?? 'PUSH');

  useEffect(() => {
    setSelected(currentChannel ?? 'PUSH');
  }, [currentChannel]);

  const handleSelect = (channel: NotificationChannel) => {
    setSelected(channel);
    onChange?.();
  };

  return (
    <View style={styles.block}>
      {OPTIONS.map(option => {
        const isSelected = selected === option.value;
        return (
          <TouchableOpacity
            key={option.value}
            style={[styles.option, isSelected && styles.optionSelected]}
            onPress={() => handleSelect(option.value)}
            activeOpacity={0.8}
          >
            <View style={styles.optionIconCircle}>
              <Ionicons name={option.icon} size={20} color="#07a3e4" />
            </View>
            <View style={styles.optionTextContainer}>
              <Text style={styles.optionTitle}>{option.title}</Text>
              <Text style={styles.optionSubtitle}>{option.subtitle}</Text>
            </View>
            <Ionicons
              name={isSelected ? 'radio-button-on' : 'radio-button-off'}
              size={22}
              color={isSelected ? '#07a3e4' : '#c8dff0'}
            />
          </TouchableOpacity>
        );
      })}

      {selected === 'PUSH' && (
        <Text style={styles.hint}>
          Para recibir avisos en el celular, asegurate de habilitar las notificaciones de la aplicación.
        </Text>
      )}

      {externalError && <Text style={profileSharedStyles.errorText}>{externalError}</Text>}

      <TouchableOpacity
        style={[styles.button, saving && styles.buttonDisabled]}
        onPress={() => onSave(selected)}
        disabled={saving}
      >
        <Text style={styles.buttonText}>{saving ? 'Guardando...' : 'Guardar cambios'}</Text>
      </TouchableOpacity>
    </View>
  );
};

export default NotificationChannelEditor;
