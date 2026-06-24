import React, { useRef, useState, useEffect } from 'react';
import { View, Pressable, PanResponder, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SvgXml } from 'react-native-svg';
import { useAudioRecorder, AudioModule } from 'expo-audio';

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

  const [isAnalyzing, setIsAnalyzing] = useState(false);

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

  const isRecording = audioRecorder.isRecording;

  const startRecording = async () => {
    try {
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

      audioRecorder.record();
    } catch (err) {
      console.error('Failed to start recording', err);
    }
  };

  const stopRecording = async () => {
    if (!audioRecorder.isRecording) return;

    try {
      await audioRecorder.stop();
      await AudioModule.setAudioModeAsync({
        allowsRecordingIOS: false,
      });
      const uri = audioRecorder.uri;

      if (uri) {
        setIsAnalyzing(true);
        const analysisResponse = await expenseService.analyzeVoice(uri);

        router.navigate({
          pathname: '/add-movement',
          params: {
            amount: analysisResponse.amount?.toString() || '',
            title: analysisResponse.title || '',
            category: analysisResponse.category || 'OTHER',
            date: analysisResponse.date || new Date().toISOString().split('T')[0],
          },
        });
      }
    } catch (err) {
      console.error('Failed to stop recording or analyze voice', err);
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
            style={[styles.fabButton, isRecording && { backgroundColor: '#E53935' }]}
            onPress={() => {
              if (pathname !== '/add-movement') router.navigate('/add-movement');
            }}
            onLongPress={startRecording}
            delayLongPress={1000}
            onPressOut={stopRecording}
            accessibilityRole="button"
            accessibilityLabel="Agregar movimiento"
          >
            {isRecording ? (
              <Text style={{ fontSize: 24 }}>🎙️</Text>
            ) : (
              <SvgXml xml={PLUS_ICON.replace('currentColor', '#fff')} width={30} height={30} />
            )}
          </Pressable>
        </View>

        <NavButton path="/transactions" icon={LIST_ICON} label="Movimientos" index={2} />
        <NavButton path="/summary" icon={SUMMARY_ICON} label="Resumen" index={3} />
      </View>

      {isRecording && (
        <View style={localStyles.recordingOverlay} pointerEvents="none">
          <View style={localStyles.recordingCard}>
            <View style={localStyles.redDot} />
            <Text style={localStyles.overlayText}>Grabando audio...</Text>
            <Text style={localStyles.subOverlayText}>Mantené y hablá. Soltá para enviar.</Text>
          </View>
        </View>
      )}

      {isAnalyzing && (
        <View style={localStyles.analyzingOverlay}>
          <ActivityIndicator size="large" color="#07a3e4" />
          <Text style={localStyles.analyzingText}>Procesando audio con IA...</Text>
        </View>
      )}
    </>
  );
};

const localStyles = StyleSheet.create({
  recordingOverlay: {
    position: 'absolute',
    top: -200,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 99,
  },
  recordingCard: {
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  redDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#E53935',
    marginRight: 10,
  },
  overlayText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  subOverlayText: {
    color: '#ccc',
    fontSize: 11,
    marginLeft: 8,
  },
  analyzingOverlay: {
    position: 'absolute',
    top: -1000,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
  },
  analyzingText: {
    marginTop: 15,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
});

export default BottomNavBar;
