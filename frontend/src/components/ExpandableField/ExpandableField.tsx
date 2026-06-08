import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text } from '@ui-kitten/components';
import { Ionicons } from '@expo/vector-icons';
import { detailScreenStyles as styles } from '../../styles/detailScreenStyles';

interface Props {
  label: string;
  value?: string;
  emptyText: string;
  backgroundColor: string;
  iconName: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  iconContainerStyle: object;
}

const ExpandableField: React.FC<Props> = ({
  label,
  value,
  emptyText,
  backgroundColor,
  iconName,
  iconColor,
  iconContainerStyle,
}) => {
  const [expanded, setExpanded] = useState(false);
  const [isTruncated, setIsTruncated] = useState(false);
  const hasContent = !!value?.trim();

  return (
    <View style={[styles.detailRow, styles.detailRowWithBg, { backgroundColor }]}>
      <View style={[styles.iconContainer, iconContainerStyle]}>
        <Ionicons name={iconName} size={24} color={iconColor} />
      </View>
      <View style={styles.detailContent}>
        <Text style={styles.detailLabel}>{label}</Text>

        {/* Hidden text with no line limit — used only to measure real line count */}
        {hasContent && (
          <Text
            style={measureStyle.hidden}
            onTextLayout={e => setIsTruncated(e.nativeEvent.lines.length > 1)}
          >
            {value}
          </Text>
        )}

        <Text
          style={[styles.detailValue, !hasContent && styles.detailValueItalic]}
          numberOfLines={expanded ? undefined : 1}
        >
          {hasContent ? value : emptyText}
        </Text>
      </View>
      {hasContent && isTruncated && (
        <TouchableOpacity onPress={() => setExpanded(e => !e)} hitSlop={8}>
          <Ionicons name={expanded ? 'chevron-up' : 'chevron-down'} size={18} color="#999" />
        </TouchableOpacity>
      )}
    </View>
  );
};

const measureStyle = StyleSheet.create({
  hidden: {
    position: 'absolute',
    opacity: 0,
  },
});

export default ExpandableField;
