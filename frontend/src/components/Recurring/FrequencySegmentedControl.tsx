import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { Text } from '@ui-kitten/components';
import type { RecurrenceFrequency } from '../../services/recurringIncomeService';
import { RECURRENCE_FREQUENCY_OPTIONS } from '../../utils/recurrenceFrequency';
import { recurringFormStyles as styles } from '../../styles/recurringFormStyles';

interface Props {
  value: RecurrenceFrequency;
  onChange: (frequency: RecurrenceFrequency) => void;
}

const FrequencySegmentedControl: React.FC<Props> = ({ value, onChange }) => (
  <View style={styles.segmented}>
    {RECURRENCE_FREQUENCY_OPTIONS.map(option => {
      const isActive = value === option.value;
      return (
        <TouchableOpacity
          key={option.value}
          style={[styles.segment, isActive && styles.segmentActive]}
          onPress={() => onChange(option.value)}
        >
          <Text style={[styles.segmentText, isActive && styles.segmentTextActive]}>
            {option.label}
          </Text>
        </TouchableOpacity>
      );
    })}
  </View>
);

export default FrequencySegmentedControl;
