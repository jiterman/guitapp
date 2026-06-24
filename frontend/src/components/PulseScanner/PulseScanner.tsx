import React, { useEffect, useRef } from 'react';
import { Animated, View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface PulseScannerProps {
  color?: string;
  size?: number;
}

export const PulseScanner: React.FC<PulseScannerProps> = ({ color = '#07a3e4', size = 120 }) => {
  const pulse1 = useRef(new Animated.Value(1)).current;
  const pulse2 = useRef(new Animated.Value(1)).current;
  const opacity1 = useRef(new Animated.Value(0.6)).current;
  const opacity2 = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    // Pulse ring 1 loop
    const anim1 = Animated.loop(
      Animated.parallel([
        Animated.timing(pulse1, {
          toValue: 2.2,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(opacity1, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    );

    // Pulse ring 2 loop (staggered by 1000ms)
    const anim2 = Animated.loop(
      Animated.parallel([
        Animated.timing(pulse2, {
          toValue: 2.2,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(opacity2, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    );

    anim1.start();
    const delay = setTimeout(() => {
      anim2.start();
    }, 1000);

    return () => {
      anim1.stop();
      anim2.stop();
      clearTimeout(delay);
    };
  }, [opacity1, opacity2, pulse1, pulse2]);

  const ringStyle = {
    width: size,
    height: size,
    borderRadius: size / 2,
    backgroundColor: color,
    borderColor: color,
  };

  const centerCircleStyle = {
    width: size,
    height: size,
    borderRadius: size / 2,
    backgroundColor: color,
  };

  const containerStyle = {
    height: size * 2.5,
    width: size * 2.5,
  };

  const iconSize = Math.round(size * 0.4);

  return (
    <View style={[styles.container, containerStyle]}>
      {/* Outer Pulse Rings */}
      <Animated.View
        style={[
          styles.ring,
          ringStyle,
          {
            transform: [{ scale: pulse1 }],
            opacity: opacity1,
          },
        ]}
      />
      <Animated.View
        style={[
          styles.ring,
          ringStyle,
          {
            transform: [{ scale: pulse2 }],
            opacity: opacity2,
          },
        ]}
      />

      {/* Central Solid Circle with Icon */}
      <View style={[styles.centerCircle, centerCircleStyle]}>
        <Ionicons name="receipt" size={iconSize} color="#ffffff" />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  ring: {
    position: 'absolute',
    borderWidth: 1,
  },
  centerCircle: {
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 4,
  },
});

export default PulseScanner;
