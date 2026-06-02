import React, { useEffect, useState } from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Text } from '@ui-kitten/components';
import { Ionicons } from '@expo/vector-icons';
import type { NotificationFrequency } from '../../context/user';
import { profileSharedStyles } from '../../styles/profileStyles';
import { notificationChannelStyles as styles } from '../../styles/notificationChannelStyles';

type Props = {
  currentFrequency?: NotificationFrequency;
  saving: boolean;
  externalError?: string | null;
  onSave: (frequency: NotificationFrequency) => void;
  onChange?: () => void;
};

const OPTIONS: {
  value: NotificationFrequency;
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
}[] = [
  {
    value: 'INSTANT',
    title: 'Instantáneas',
    subtitle: 'Recibí cada aviso en el momento en que ocurre',
    icon: 'flash-outline',
  },
  {
    value: 'DAILY',
    title: 'Diario',
    subtitle: 'Un resumen diario con todos tus avisos pendientes',
    icon: 'today-outline',
  },
  {
    value: 'WEEKLY',
    title: 'Semanal',
    subtitle: 'Un resumen semanal con todos tus avisos pendientes',
    icon: 'calendar-outline',
  },
];

const NotificationFrequencyEditor: React.FC<Props> = ({
  currentFrequency,
  saving,
  externalError,
  onSave,
  onChange,
}) => {
  const [selected, setSelected] = useState<NotificationFrequency>(currentFrequency ?? 'INSTANT');

  useEffect(() => {
    setSelected(currentFrequency ?? 'INSTANT');
  }, [currentFrequency]);

  const handleSelect = (frequency: NotificationFrequency) => {
    setSelected(frequency);
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

      {selected !== 'INSTANT' && (
        <Text style={styles.hint}>
          Los avisos de gastos y metas se agruparán y recibirás un único resumen cuando se ejecute
          el job correspondiente.
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

export default NotificationFrequencyEditor;
