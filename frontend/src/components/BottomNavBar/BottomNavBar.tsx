import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Pressable,
  PanResponder,
  Text,
  ActivityIndicator,
  StyleSheet,
  Modal,
  Vibration,
} from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SvgXml } from 'react-native-svg';
import { useAudioRecorder, AudioModule } from 'expo-audio';
import { Ionicons } from '@expo/vector-icons';

import HOME_ICON from '../../../assets/icons/homeIcon';
import LIST_ICON from '../../../assets/icons/listIcon';
import CHART_ICON from '../../../assets/icons/chartIcon';
import SUMMARY_ICON from '../../../assets/icons/summaryIcon';
import PLUS_ICON from '../../../assets/icons/plusIcon';
import styles from '../../styles/bottomNavStyles';
import { expenseService } from '../../services/expenseService';

const ROUTE_ORDER = ['/home', '/statistics', '/transactions', '/summary'];

const ACTIVE_COLOR = '#07a3e4';
const INACTIVE_COLOR = '#a8c8e0';

const BottomNavBar: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();

  const currentIndex = useRef<number>(0);
  const [currentPath, setCurrentPath] = useState('/home');

  const [isRecordingState, setIsRecordingState] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const preparePromiseRef = useRef<Promise<void> | null>(null);
  const shouldRecordRef = useRef(false);

  const audioRecorder = useAudioRecorder({
    extension: '.wav',
    sampleRate: 16000,
    numberOfChannels: 1,
    android: {
      extension: '.m4a',
      outputFormat: 'mpeg4',
      audioEncoder: 'aac',
      sampleRate: 16000,
      numberOfChannels: 1,
    },
    ios: {
      extension: '.wav',
      outputFormat: 'lpcm',
      sampleRate: 16000,
      numberOfChannels: 1,
      linearPCMBitDepth: 16,
      linearPCMIsBigEndian: false,
      linearPCMIsFloat: false,
    },
    web: {},
  });

  const handlePressIn = () => {
    shouldRecordRef.current = false;
    preparePromiseRef.current = (async () => {
      const permission = await AudioModule.requestRecordingPermissionsAsync();
      if (!permission.granted) {
        console.warn('Microphone permission not granted');
        return;
      }

      await AudioModule.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      try {
        await audioRecorder.prepareToRecordAsync();
      } catch (err) {
        if (err instanceof Error && !err.message.includes('already been prepared')) {
          throw err;
        }
      }
    })();
  };

  const startRecording = async () => {
    try {
      shouldRecordRef.current = true;
      if (preparePromiseRef.current) {
        await preparePromiseRef.current;
      }

      // Check if user is still holding the button
      if (!shouldRecordRef.current) return;

      Vibration.vibrate(100);
      audioRecorder.record();
      setIsRecordingState(true);
    } catch (err) {
      console.error('Failed to start recording', err);
    }
  };

  const stopRecording = async () => {
    shouldRecordRef.current = false;
    if (!audioRecorder.isRecording && !isRecordingState) return;

    try {
      setIsRecordingState(false);

      if (audioRecorder.isRecording) {
        await audioRecorder.stop();
      }

      await AudioModule.setAudioModeAsync({
        allowsRecordingIOS: false,
      });
      const uri = audioRecorder.uri;

      if (uri) {
        setIsAnalyzing(true);
        const analysisResponse = await expenseService.analyzeVoice(uri);

        if (!analysisResponse.amount) {
          setErrorMessage(
            'Perdón! No pudimos extraer el monto de tu audio, por favor volvé a intentar especificando el valor.'
          );
          return;
        }

        router.navigate({
          pathname: '/add-movement',
          params: {
            amount: analysisResponse.amount.toString(),
            title: analysisResponse.title || '',
            category: analysisResponse.category || 'OTHER',
            date: analysisResponse.date || new Date().toISOString().split('T')[0],
          },
        });
      }
    } catch (err) {
      console.error('Failed to stop recording or analyze voice', err);
      setErrorMessage(
        'Perdón! En este momento no pudimos procesar el audio, por favor volvé a intentar en unos segundos'
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  useEffect(() => {
    const idx = ROUTE_ORDER.indexOf(pathname || '');
    if (idx !== -1) {
      currentIndex.current = idx;
      setCurrentPath(pathname || '/home');
    }
  }, [pathname]);

  const getIconColor = (path: string) => (currentPath === path ? ACTIVE_COLOR : INACTIVE_COLOR);

  const renderIcon = (xml: string, path: string) => {
    const color = getIconColor(path);
    // Replace the hardcoded color in icons with the dynamic one
    const modifiedXml = xml.replace(/#07a3e4/g, color);
    return <SvgXml xml={modifiedXml} width={24} height={24} />;
  };

  const panRef = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gestureState) => Math.abs(gestureState.dx) > 10,
      onPanResponderRelease: (_, gestureState) => {
        const { dx } = gestureState;
        if (Math.abs(dx) < 50) return;
        const idx = currentIndex.current;
        if (dx < -50 && idx < ROUTE_ORDER.length - 1) {
          const next = idx + 1;
          currentIndex.current = next;
          router.navigate(ROUTE_ORDER[next]);
        } else if (dx > 50 && idx > 0) {
          const prev = idx - 1;
          currentIndex.current = prev;
          router.navigate(ROUTE_ORDER[prev]);
        }
      },
    })
  );

  const NavButton = ({
    path,
    icon,
    label,
    index,
  }: {
    path: string;
    icon: string;
    label: string;
    index: number;
  }) => (
    <Pressable
      style={styles.button}
      onPress={() => {
        currentIndex.current = index;
        router.navigate(path);
      }}
      accessibilityRole="button"
    >
      <View style={currentPath === path ? styles.iconWrapper : styles.iconWrapperInactive}>
        {renderIcon(icon, path)}
      </View>
      <Text style={[styles.label, { color: getIconColor(path) }]}>{label}</Text>
    </Pressable>
  );

  return (
    <>
      <View
        style={[styles.container, { paddingBottom: insets.bottom, height: 65 + insets.bottom }]}
        accessibilityRole="tablist"
        {...panRef.current.panHandlers}
      >
        <NavButton path="/home" icon={HOME_ICON} label="Inicio" index={0} />
        <NavButton path="/statistics" icon={CHART_ICON} label="Estadísticas" index={1} />

        <View style={styles.fabContainer}>
          <Pressable
            style={[styles.fabButton, isRecordingState && { backgroundColor: '#E53935' }]}
            onPressIn={handlePressIn}
            onPress={() => {
              if (pathname !== '/add-movement') router.navigate('/add-movement');
            }}
            onLongPress={startRecording}
            delayLongPress={800}
            onPressOut={stopRecording}
            accessibilityRole="button"
            accessibilityLabel="Agregar movimiento"
          >
            {isRecordingState ? (
              <Text style={{ fontSize: 24 }}>🎙️</Text>
            ) : (
              <SvgXml xml={PLUS_ICON.replace('currentColor', '#fff')} width={30} height={30} />
            )}
          </Pressable>
        </View>

        <NavButton path="/transactions" icon={LIST_ICON} label="Movimientos" index={2} />
        <NavButton path="/summary" icon={SUMMARY_ICON} label="Resumen" index={3} />
      </View>

      <Modal transparent visible={isRecordingState} animationType="fade">
        <View style={localStyles.overlayContainer}>
          <View style={localStyles.popupCard}>
            <View style={localStyles.micCircle}>
              <Ionicons name="mic" size={48} color="#07a3e4" />
            </View>
            <Text style={localStyles.titleText}>Grabando audio...</Text>
            <Text style={localStyles.subtitleText}>Hablá para registrar el movimiento</Text>
          </View>
        </View>
      </Modal>

      <Modal transparent visible={isAnalyzing} animationType="fade">
        <View style={localStyles.overlayContainer}>
          <View style={localStyles.popupCard}>
            <ActivityIndicator size="large" color="#07a3e4" />
            <Text style={[localStyles.titleText, { marginTop: 20 }]}>Analizando audio...</Text>
          </View>
        </View>
      </Modal>

      <Modal transparent visible={errorMessage !== null} animationType="fade">
        <View style={localStyles.overlayContainer}>
          <View style={localStyles.popupCard}>
            <View style={localStyles.errorCircle}>
              <Ionicons name="alert-circle" size={48} color="#E53935" />
            </View>
            <Text style={localStyles.titleText}>Ocurrió un error</Text>
            <Text style={localStyles.subtitleText}>{errorMessage}</Text>
            <Pressable style={localStyles.closeButton} onPress={() => setErrorMessage(null)}>
              <Text style={localStyles.closeButtonText}>Entendido</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </>
  );
};

const localStyles = StyleSheet.create({
  overlayContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 51, 102, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  popupCard: {
    width: '80%',
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 15,
    elevation: 10,
  },
  micCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#f0f8ff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
    marginBottom: 10,
  },
  errorCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#FFEBEE',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  closeButton: {
    backgroundColor: '#07a3e4',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 10,
    marginTop: 25,
    width: '100%',
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  titleText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#003366',
    marginTop: 15,
    textAlign: 'center',
  },
  subtitleText: {
    fontSize: 14,
    color: '#003366',
    marginTop: 8,
    opacity: 0.8,
    textAlign: 'center',
  },
});

export default BottomNavBar;
