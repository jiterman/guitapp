import React, { useRef } from 'react';
import { Animated, PanResponder, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '@ui-kitten/components';

const ACTION_WIDTH = 88;
// Require dragging far enough that the full "Eliminar" action is revealed
// before the delete confirmation fires.
const OPEN_THRESHOLD = ACTION_WIDTH * 0.95;

interface SwipeToDeleteProps {
  children: React.ReactNode;
  onDelete: () => void;
}

/**
 * Wraps a row so that swiping left reveals a red "Eliminar" action.
 * Built on PanResponder + Animated to avoid extra native dependencies.
 */
export const SwipeToDelete: React.FC<SwipeToDeleteProps> = ({ children, onDelete }) => {
  const translateX = useRef(new Animated.Value(0)).current;
  // Tracks the resting position so a new gesture starts from where it left off.
  const offset = useRef(0);

  const animateTo = (toValue: number) => {
    offset.current = toValue;
    Animated.spring(translateX, {
      toValue,
      useNativeDriver: true,
      bounciness: 0,
    }).start();
  };

  const panResponder = useRef(
    PanResponder.create({
      // Only claim the gesture for clearly horizontal drags, so vertical
      // scrolling and taps keep working.
      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 8 && Math.abs(g.dx) > Math.abs(g.dy),
      onPanResponderMove: (_, g) => {
        const next = offset.current + g.dx;
        // Clamp: allow dragging left to reveal the action, but not past it,
        // and never drag the row to the right of its closed position.
        const clamped = Math.min(0, Math.max(-ACTION_WIDTH, next));
        translateX.setValue(clamped);
      },
      onPanResponderRelease: (_, g) => {
        const next = offset.current + g.dx;
        // Always snap back to closed; once the user drags past the threshold we
        // trigger the delete confirmation right away instead of leaving the row
        // open waiting for a tap.
        animateTo(0);
        if (next <= -OPEN_THRESHOLD) {
          onDelete();
        }
      },
    })
  ).current;

  return (
    <View style={styles.container}>
      <View style={styles.actionContainer}>
        <View style={styles.deleteAction}>
          <Ionicons name="trash-outline" size={20} color="#fff" />
          <Text style={styles.deleteText}>Eliminar</Text>
        </View>
      </View>

      <Animated.View
        style={[styles.rowContent, { transform: [{ translateX }] }]}
        {...panResponder.panHandlers}
      >
        {children}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
  rowContent: {
    backgroundColor: '#fff',
    // Keep a small gap so the row's info never sits flush against the red
    // action while the row is being dragged.
    paddingRight: 12,
  },
  actionContainer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  deleteAction: {
    width: ACTION_WIDTH,
    height: '100%',
    backgroundColor: '#c0392b',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  deleteText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
});

export default SwipeToDelete;
