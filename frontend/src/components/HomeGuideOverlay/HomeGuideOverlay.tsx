import React, { useState } from 'react';
import { Modal, View, StyleSheet, Text, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width: screenWidth } = Dimensions.get('window');

// Avatar center = paddingHorizontal (5% of screen) + half avatar width (23px)
const AVATAR_CENTER_X = screenWidth * 0.05 + 23;
const TOOLTIP_LEFT = 16;
const ARROW_MARGIN_LEFT = AVATAR_CENTER_X - TOOLTIP_LEFT - 10;

interface HomeGuideOverlayProps {
  visible: boolean;
  onFinish: () => void;
}

export const HomeGuideOverlay: React.FC<HomeGuideOverlayProps> = ({ visible, onFinish }) => {
  const [step, setStep] = useState<1 | 2>(1);
  const insets = useSafeAreaInsets();

  const handleNext = () => {
    if (step === 1) {
      setStep(2);
    } else {
      onFinish();
    }
  };

  if (!visible) return null;

  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={styles.overlay} testID="guide-overlay-container">
        {step === 1 && (
          <View
            style={[styles.tooltipContainer, { top: insets.top + 70, left: 16 }]}
            testID="step-1-tooltip"
          >
            <View style={[styles.arrowUp, { marginLeft: ARROW_MARGIN_LEFT }]} />
            <View style={styles.tooltipCard}>
              <View style={styles.headerRow}>
                <Ionicons name="person-circle" size={24} color="#07a3e4" />
                <Text style={styles.tooltipTitle}>Tu Perfil</Text>
              </View>
              <Text style={styles.tooltipText}>
                Acá podés ir a tu perfil para revisar tus configuraciones de notificaciones, límites
                y más.
              </Text>
              <TouchableOpacity style={styles.button} onPress={handleNext} testID="btn-step-1-next">
                <Text style={styles.buttonText}>Entendido</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {step === 2 && (
          <View
            style={[
              styles.tooltipContainer,
              { bottom: insets.bottom + 85, alignSelf: 'center', width: screenWidth * 0.85 },
            ]}
            testID="step-2-tooltip"
          >
            <View style={styles.tooltipCard}>
              <View style={styles.headerRow}>
                <Ionicons name="add-circle" size={24} color="#FFBB00" />
                <Text style={styles.tooltipTitle}>Cargar Gastos</Text>
              </View>
              <Text style={styles.tooltipText}>
                Desde este botón amarillo podés cargar tus gastos rápidamente.{'\n\n'}
                <Text style={{ fontWeight: 'bold' }}>¡Tip!</Text> Si mantenés apretado el botón,
                podés cargar tus gastos con voz.
              </Text>
              <TouchableOpacity
                style={styles.button}
                onPress={handleNext}
                testID="btn-step-2-finish"
              >
                <Text style={styles.buttonText}>Entendido</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.arrowDown} />
          </View>
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 51, 102, 0.6)', // matching the app theme
  },
  tooltipContainer: {
    position: 'absolute',
    width: screenWidth * 0.8,
    zIndex: 1000,
  },
  tooltipCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  tooltipTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#003366',
  },
  tooltipText: {
    fontSize: 14,
    color: '#335c85',
    lineHeight: 20,
    marginBottom: 14,
  },
  button: {
    backgroundColor: '#07a3e4',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  arrowUp: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderBottomWidth: 10,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#ffffff',
  },
  arrowDown: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderTopWidth: 10,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#ffffff',
    alignSelf: 'center',
  },
});
