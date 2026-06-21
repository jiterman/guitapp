import React, { useRef, useState } from 'react';
import {
  View,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { Text } from '@ui-kitten/components';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDialog } from '../../context/dialog';

const { width: screenWidth } = Dimensions.get('window');

interface CameraModalProps {
  visible: boolean;
  onClose: () => void;
  onCapture: (uri: string) => void;
}

const CameraModal: React.FC<CameraModalProps> = ({ visible, onClose, onCapture }) => {
  const cameraRef = useRef<CameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [capturing, setCapturing] = useState(false);
  const { alert } = useDialog();

  const handleCapture = async () => {
    if (!cameraRef.current || capturing) return;
    setCapturing(true);
    try {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.9 });
      if (photo?.uri) {
        onCapture(photo.uri);
      }
    } catch {
      await alert({ title: 'Error', message: 'No se pudo tomar la foto. Intentá de nuevo.' });
    } finally {
      setCapturing(false);
    }
  };

  const handleGallery = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.9,
    });
    if (!result.canceled && result.assets[0]) {
      onCapture(result.assets[0].uri);
    }
  };

  const handleRequestPermission = async () => {
    const result = await requestPermission();
    if (!result.granted) {
      await alert({
        title: 'Permiso requerido',
        message: 'Necesitamos acceso a la cámara para escanear el ticket.',
      });
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <SafeAreaView style={styles.container}>
        {!permission?.granted ? (
          <View style={styles.permissionContainer}>
            <Ionicons name="camera-outline" size={64} color="#2383F2" />
            <Text style={styles.permissionTitle}>Acceso a la cámara</Text>
            <Text style={styles.permissionText}>
              Necesitamos acceso a la cámara para escanear el ticket.
            </Text>
            <TouchableOpacity style={styles.permissionButton} onPress={handleRequestPermission}>
              <Text style={styles.permissionButtonText}>Permitir acceso</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onClose} style={styles.cancelLink}>
              <Text style={styles.cancelLinkText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.cameraContainer}>
            <CameraView ref={cameraRef} style={styles.camera} facing="back" />

            <View style={styles.overlay}>
              <View style={styles.topBar}>
                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                  <Ionicons name="close" size={28} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.topBarTitle}>Escaneá tu ticket</Text>
                <View style={styles.topBarSpacer} />
              </View>

              <View style={styles.frameHint}>
                <View style={styles.corner} />
                <View style={[styles.corner, styles.cornerTopRight]} />
                <View style={[styles.corner, styles.cornerBottomLeft]} />
                <View style={[styles.corner, styles.cornerBottomRight]} />
              </View>

              <View style={styles.bottomBar}>
                <TouchableOpacity onPress={handleGallery} style={styles.galleryButton}>
                  <Ionicons name="images-outline" size={28} color="#fff" />
                  <Text style={styles.galleryButtonText}>Galería</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleCapture}
                  style={styles.captureButton}
                  disabled={capturing}
                >
                  {capturing ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <View style={styles.captureButtonInner} />
                  )}
                </TouchableOpacity>
                <View style={styles.bottomBarSpacer} />
              </View>
            </View>
          </View>
        )}
      </SafeAreaView>
    </Modal>
  );
};

const FRAME_SIZE = screenWidth * 0.75;
const CORNER_SIZE = 24;
const CORNER_THICKNESS = 3;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  permissionContainer: {
    flex: 1,
    backgroundColor: '#E6F2FC',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    gap: 16,
  },
  permissionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#003366',
    textAlign: 'center',
  },
  permissionText: {
    fontSize: 15,
    color: '#4A5568',
    textAlign: 'center',
    lineHeight: 22,
  },
  permissionButton: {
    backgroundColor: '#2383F2',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 32,
    marginTop: 8,
  },
  permissionButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  cancelLink: {
    paddingVertical: 8,
  },
  cancelLinkText: {
    color: '#2383F2',
    fontSize: 15,
  },
  cameraContainer: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'space-between',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  topBarTitle: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },
  closeButton: {
    padding: 4,
    width: 44,
  },
  topBarSpacer: {
    width: 44,
  },
  galleryButton: {
    alignItems: 'center',
    gap: 4,
    width: 64,
  },
  galleryButtonText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '500',
  },
  bottomBarSpacer: {
    width: 64,
  },
  frameHint: {
    width: FRAME_SIZE,
    height: FRAME_SIZE * 1.3,
    alignSelf: 'center',
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: CORNER_SIZE,
    height: CORNER_SIZE,
    borderColor: '#fff',
    borderTopWidth: CORNER_THICKNESS,
    borderLeftWidth: CORNER_THICKNESS,
    top: 0,
    left: 0,
  },
  cornerTopRight: {
    top: 0,
    left: undefined,
    right: 0,
    borderLeftWidth: 0,
    borderRightWidth: CORNER_THICKNESS,
  },
  cornerBottomLeft: {
    top: undefined,
    bottom: 0,
    borderTopWidth: 0,
    borderBottomWidth: CORNER_THICKNESS,
  },
  cornerBottomRight: {
    top: undefined,
    bottom: 0,
    left: undefined,
    right: 0,
    borderTopWidth: 0,
    borderLeftWidth: 0,
    borderBottomWidth: CORNER_THICKNESS,
    borderRightWidth: CORNER_THICKNESS,
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 40,
    paddingTop: 24,
    backgroundColor: 'rgba(0,0,0,0.4)',
    gap: 45,
  },
  captureButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 4,
    borderColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButtonInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#fff',
  },
});

export default CameraModal;
