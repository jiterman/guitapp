import React from 'react';
import { Modal, View, StyleSheet, Text, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width: screenWidth } = Dimensions.get('window');

interface AddMovementGuideOverlayProps {
  visible: boolean;
  onFinish: () => void;
}

export const AddMovementGuideOverlay: React.FC<AddMovementGuideOverlayProps> = ({
  visible,
  onFinish,
}) => {
  const insets = useSafeAreaInsets();

  if (!visible) return null;

  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={styles.overlay} testID="guide-overlay-container">
        <View
          style={[styles.tooltipContainer, { top: insets.top + 250, right: 16 }]}
          testID="step-1-tooltip"
        >
          <View style={styles.arrowUp} />
          <View style={styles.tooltipCard}>
            <View style={styles.headerRow}>
              <Ionicons name="camera" size={24} color="#07a3e4" />
              <Text style={styles.tooltipTitle}>Cargar con Foto</Text>
            </View>
            <Text style={styles.tooltipText}>
              Usá este botón para escanear un ticket con tu cámara.{'\n\n'}
              <Text style={{ fontWeight: 'bold' }}>¡Tip!</Text> También podés compartir capturas de
              pantalla o imágenes desde tu galería o cualquier otra app usando la opción de
              compartir.
            </Text>
            <TouchableOpacity style={styles.button} onPress={onFinish} testID="btn-finish">
              <Text style={styles.buttonText}>Entendido</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 51, 102, 0.6)',
  },
  tooltipContainer: {
    position: 'absolute',
    width: screenWidth * 0.75,
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
    alignSelf: 'flex-end',
    marginRight: 30,
  },
});
