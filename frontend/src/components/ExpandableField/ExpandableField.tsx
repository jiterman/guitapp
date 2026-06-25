import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text } from '@ui-kitten/components';
import { Ionicons } from '@expo/vector-icons';
import { detailScreenStyles as styles } from '../../styles/detailScreenStyles';

interface Props {
  label: string;
  value?: string;
  backgroundColor: string;
  iconName: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  iconContainerStyle: object;
}

const ExpandableField: React.FC<Props> = ({
  label,
  value,
  backgroundColor,
  iconName,
  iconColor,
  iconContainerStyle,
}) => {
  const [expanded, setExpanded] = useState(false);
  const hasContent = !!value?.trim();

  if (!hasContent) return null;

  return (
    <View style={localStyles.wrapper}>
      {expanded ? (
        <View style={[styles.detailRow, styles.detailRowWithBg, { backgroundColor }]}>
          <View style={[styles.iconContainer, iconContainerStyle]}>
            <Ionicons name={iconName} size={24} color={iconColor} />
          </View>
          <View style={styles.detailContent}>
            <Text style={styles.detailLabel}>{label}</Text>
            <Text style={styles.detailValue}>{value}</Text>
          </View>
          <TouchableOpacity onPress={() => setExpanded(false)} style={localStyles.collapseBtn}>
            <Ionicons name="eye-off-outline" size={18} color="#999" />
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity
          onPress={() => setExpanded(true)}
          style={localStyles.peekRow}
          activeOpacity={0.7}
        >
          <Ionicons name="eye-outline" size={16} color="#07a3e4" />
          <Text style={localStyles.peekText}>Ver descripción</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const localStyles = StyleSheet.create({
  wrapper: {
    marginBottom: 0,
  },
  peekRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 4,
    marginBottom: 12,
  },
  peekText: {
    fontSize: 13,
    color: '#07a3e4',
    fontWeight: '500',
  },
  collapseBtn: {
    padding: 4,
  },
});

export default ExpandableField;
