import React, { useState } from 'react';
import { ActivityIndicator, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text } from '@ui-kitten/components';
import { Ionicons } from '@expo/vector-icons';

const COLLAPSED_LINES = 3;

interface AiSummaryCardProps {
  text: string | null;
  loading: boolean;
}

const renderBoldText = (raw: string) => {
  const parts = raw.split(/\*\*(.+?)\*\*/g);
  return (
    <Text style={styles.body}>
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <Text key={i} style={styles.bold}>
            {part}
          </Text>
        ) : (
          part
        )
      )}
    </Text>
  );
};

const AiSummaryCard: React.FC<AiSummaryCardProps> = ({ text, loading }) => {
  const [expanded, setExpanded] = useState(false);

  if (!loading && text === null) {
    return null;
  }

  const bullets = text
    ? text
        .split('•')
        .map(s => s.trim())
        .filter(s => s.length > 0)
    : [];

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Ionicons name="sparkles" size={18} color="#07a3e4" />
        <Text style={styles.title}>Resumen inteligente</Text>
      </View>

      {loading ? (
        <View style={styles.loadingWrapper}>
          <ActivityIndicator color="#07a3e4" />
        </View>
      ) : (
        <>
          <View style={expanded ? undefined : styles.collapsedContainer}>
            {bullets.length > 1 ? (
              <View style={styles.bulletList}>
                {bullets.map((bullet, i) => (
                  <View key={i} style={styles.bulletRow}>
                    <Text style={styles.bulletDot}>•</Text>
                    <View style={styles.bulletContent}>{renderBoldText(bullet)}</View>
                  </View>
                ))}
              </View>
            ) : (
              renderBoldText(text!)
            )}
            {!expanded && <View style={styles.fadeOverlay} pointerEvents="none" />}
          </View>
          <TouchableOpacity onPress={() => setExpanded(e => !e)} style={styles.toggleRow}>
            <Text style={styles.toggleText}>{expanded ? 'Ver menos' : 'Ver más'}</Text>
            <Ionicons name={expanded ? 'chevron-up' : 'chevron-down'} size={14} color="#07a3e4" />
          </TouchableOpacity>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#003366',
    flex: 1,
  },
  loadingWrapper: {
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bulletList: {
    gap: 8,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  bulletDot: {
    fontSize: 14,
    color: '#07a3e4',
    lineHeight: 22,
    fontWeight: '700',
  },
  bulletContent: {
    flex: 1,
  },
  body: {
    fontSize: 14,
    color: '#4A5568',
    lineHeight: 22,
  },
  bold: {
    fontWeight: '700',
    color: '#4A5568',
  },
  collapsedContainer: {
    maxHeight: COLLAPSED_LINES * 22,
    overflow: 'hidden',
  },
  fadeOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 28,
    backgroundColor: 'rgba(255,255,255,0.85)',
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    paddingTop: 2,
  },
  toggleText: {
    fontSize: 13,
    color: '#07a3e4',
    fontWeight: '600',
  },
});

export default AiSummaryCard;
