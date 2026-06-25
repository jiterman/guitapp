import React, { useState } from 'react';
import { Dimensions, Modal, Pressable, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text } from '@ui-kitten/components';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Circle } from 'react-native-svg';
import { HealthScoreResponse } from '../../services/healthScoreService';

const { width: screenWidth } = Dimensions.get('window');

const LEVEL_COLORS: Record<string, { primary: string; bg: string; border: string; track: string }> =
  {
    excellent: { primary: '#22C55E', bg: '#F4FCF7', border: '#22C55E', track: '#E8F8EE' },
    great: { primary: '#2196F3', bg: '#F7FBFF', border: '#2196F3', track: '#EAF5FF' },
    good: { primary: '#2196F3', bg: '#F7FBFF', border: '#2196F3', track: '#EAF5FF' },
    fair: { primary: '#F4B400', bg: '#FFFBEF', border: '#F4B400', track: '#FFF5D9' },
    poor: { primary: '#EAB308', bg: '#FEFCE8', border: '#EAB308', track: '#FEF9C3' },
  };

const FACTOR_INFO: Record<string, { title: string; body: string }> = {
  distribution: {
    title: 'Distribución de ingresos',
    body: 'Mide qué porcentaje del total de tus gastos corresponde a categorías no esenciales.\n\n≤20% → excelente\n20–25% → aceptable\n25–30% → alto\n>30% → demasiado alto\n\nCategorías no esenciales: Restaurantes, Café, Delivery, Suscripciones, Salidas, Gimnasio, Viajes, Ropa, Belleza, Compras y Tecnología.',
  },
  savings: {
    title: 'Capacidad de ahorro',
    body: 'Mide cuánto ahorraste en el mes en relación a tu meta de ahorro configurada.\n\nBalance = Ingresos del mes − Gastos del mes. Si el balance es positivo, ahorraste; si es negativo, gastaste más de lo que ingresaste.',
  },
  expenseControl: {
    title: 'Control de gastos',
    body: 'Compara tus gastos totales de este mes con los del mes anterior.\n\nBajaron más de 20% → excelente\nVariación de ±10% → estable\nSubieron entre 10% y 20% → alto\nSubieron más de 20% → demasiado alto',
  },
};

const RING_SIZE = 80;
const STROKE = 6;
const RADIUS = (RING_SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

interface ScoreRingProps {
  score: number;
  primary: string;
  track: string;
}

const ScoreRing: React.FC<ScoreRingProps> = ({ score, primary, track }) => {
  const progress = CIRCUMFERENCE * (1 - score / 100);
  return (
    <View style={styles.ringWrapper}>
      <Svg width={RING_SIZE} height={RING_SIZE} style={styles.ringSvg}>
        <Circle
          cx={RING_SIZE / 2}
          cy={RING_SIZE / 2}
          r={RADIUS}
          stroke={track}
          strokeWidth={STROKE}
          fill="none"
        />
        <Circle
          cx={RING_SIZE / 2}
          cy={RING_SIZE / 2}
          r={RADIUS}
          stroke={primary}
          strokeWidth={STROKE}
          fill="none"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={progress}
          strokeLinecap="round"
          rotation="-90"
          origin={`${RING_SIZE / 2}, ${RING_SIZE / 2}`}
        />
      </Svg>
      <View style={styles.ringCenter}>
        <Text style={[styles.scoreNumber, { color: primary }]}>{score}</Text>
        <Text style={[styles.scoreMax, { color: primary }]}>/100</Text>
      </View>
    </View>
  );
};

interface InfoModalProps {
  visible: boolean;
  title: string;
  body: string;
  onClose: () => void;
}

const InfoModal: React.FC<InfoModalProps> = ({ visible, title, body, onClose }) => (
  <Modal transparent animationType="fade" visible={visible} onRequestClose={onClose}>
    <Pressable style={styles.modalOverlay} onPress={onClose}>
      <Pressable style={styles.modalBox} onPress={e => e.stopPropagation()}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>{title}</Text>
          <TouchableOpacity onPress={onClose} hitSlop={8}>
            <Ionicons name="close" size={18} color="#7D8EA3" />
          </TouchableOpacity>
        </View>
        <Text style={styles.modalBody}>{body}</Text>
      </Pressable>
    </Pressable>
  </Modal>
);

interface HealthScoreCardProps {
  data: HealthScoreResponse;
}

const HealthScoreCard: React.FC<HealthScoreCardProps> = ({ data }) => {
  const [expanded, setExpanded] = useState(false);
  const [infoKey, setInfoKey] = useState<string | null>(null);
  const { primary, bg, border, track } = LEVEL_COLORS[data.level] ?? LEVEL_COLORS.good;

  const activeInfo = infoKey ? FACTOR_INFO[infoKey] : null;

  return (
    <View style={[styles.card, { backgroundColor: bg, borderColor: border }]}>
      <TouchableOpacity
        style={styles.header}
        onPress={() => setExpanded(v => !v)}
        activeOpacity={0.7}
      >
        <ScoreRing score={data.score} primary={primary} track={track} />
        <View style={styles.headerText}>
          <Text style={[styles.title, { color: primary }]}>{data.title}</Text>
          <Text style={styles.message}>{data.message}</Text>
        </View>
        <Ionicons
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={18}
          color={primary}
          style={styles.chevron}
        />
      </TouchableOpacity>

      {expanded && (
        <View style={styles.factors}>
          <View style={[styles.divider, { backgroundColor: border + '33' }]} />
          {data.factors.map(factor => (
            <View key={factor.key} style={styles.factorRow}>
              <View style={styles.factorHeader}>
                <View style={styles.factorLabelRow}>
                  <Text style={styles.factorLabel}>{factor.label}</Text>
                  {FACTOR_INFO[factor.key] && (
                    <TouchableOpacity onPress={() => setInfoKey(factor.key)} hitSlop={8}>
                      <Ionicons name="information-circle-outline" size={14} color="#7D8EA3" />
                    </TouchableOpacity>
                  )}
                </View>
                <Text style={[styles.factorScore, { color: primary }]}>{factor.score}/100</Text>
              </View>
              <View style={[styles.track, { backgroundColor: track }]}>
                <View
                  style={[styles.fill, { width: `${factor.score}%`, backgroundColor: primary }]}
                />
              </View>
              <Text style={styles.factorExplanation}>{factor.explanation}</Text>
            </View>
          ))}
        </View>
      )}

      {activeInfo && (
        <InfoModal
          visible
          title={activeInfo.title}
          body={activeInfo.body}
          onClose={() => setInfoKey(null)}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1.5,
    padding: screenWidth * 0.04,
    gap: 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  ringWrapper: {
    width: RING_SIZE,
    height: RING_SIZE,
    flexShrink: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ringSvg: {
    position: 'absolute',
  },
  ringCenter: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreNumber: {
    fontSize: 24,
    fontWeight: '800',
    lineHeight: 28,
  },
  scoreMax: {
    fontSize: 11,
    fontWeight: '600',
    opacity: 0.7,
    lineHeight: 14,
  },
  headerText: {
    flex: 1,
    gap: 4,
  },
  title: {
    fontSize: 17,
    fontWeight: '800',
  },
  message: {
    fontSize: 12,
    color: '#4A5568',
    lineHeight: 17,
  },
  chevron: {
    flexShrink: 0,
  },
  divider: {
    height: 1,
    width: '100%',
    marginTop: 12,
    marginBottom: 8,
  },
  factors: {
    gap: 10,
  },
  factorRow: {
    gap: 4,
  },
  factorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  factorLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  factorLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#003366',
  },
  factorScore: {
    fontSize: 12,
    fontWeight: '700',
  },
  track: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 3,
  },
  factorExplanation: {
    fontSize: 11,
    color: '#7D8EA3',
    lineHeight: 15,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: screenWidth * 0.08,
  },
  modalBox: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    width: '100%',
    gap: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#003366',
    flex: 1,
  },
  modalBody: {
    fontSize: 13,
    color: '#4A5568',
    lineHeight: 20,
  },
});

export default HealthScoreCard;
