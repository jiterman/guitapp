import React, { useState } from 'react';
import { TextInput, TouchableOpacity, View } from 'react-native';
import { Text } from '@ui-kitten/components';
import { Ionicons } from '@expo/vector-icons';
import {
  transactionFormStyles as styles,
  ICON_SIZES,
  ICON_COLORS,
} from '../../styles/transactionFormStyles';

interface Props {
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  label: string;
}

const ExpandableTextInput: React.FC<Props> = ({ value, onChangeText, placeholder, label }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputWithIcon}>
        <View style={styles.inputIconContainer}>
          <Ionicons name="document-text-outline" size={ICON_SIZES.small} color={ICON_COLORS.gray} />
        </View>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          style={[styles.textInput, expanded && styles.textInputMultiline]}
          placeholderTextColor="#B0BEC5"
          maxLength={255}
          multiline={expanded}
          numberOfLines={expanded ? undefined : 1}
        />
        <TouchableOpacity onPress={() => setExpanded(e => !e)} hitSlop={8}>
          <Ionicons name={expanded ? 'chevron-up' : 'chevron-down'} size={18} color="#999" />
        </TouchableOpacity>
      </View>
    </>
  );
};

export default ExpandableTextInput;
