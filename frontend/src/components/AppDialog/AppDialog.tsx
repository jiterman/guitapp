import React from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Modal,
  Pressable,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { Text } from '@ui-kitten/components';

const { width: screenWidth } = Dimensions.get('window');

export type AppDialogVariant = 'default' | 'destructive';

interface AppDialogProps {
  visible: boolean;
  title: string;
  message?: string;
  /** Confirm button label. Defaults to "Aceptar". */
  confirmText?: string;
  /** Cancel button label. If omitted, only the confirm button is shown. */
  cancelText?: string;
  variant?: AppDialogVariant;
  loading?: boolean;
  onConfirm: () => void;
  onCancel?: () => void;
}

const AppDialog: React.FC<AppDialogProps> = ({
  visible,
  title,
  message,
  confirmText = 'Aceptar',
  cancelText,
  variant = 'default',
  loading = false,
  onConfirm,
  onCancel,
}) => {
  const handleDismiss = onCancel ?? onConfirm;
  const isDestructive = variant === 'destructive';

  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={handleDismiss}>
      <Pressable style={styles.overlay} onPress={loading ? undefined : handleDismiss}>
        <Pressable style={styles.card} onPress={e => e.stopPropagation()}>
          <Text style={styles.title}>{title}</Text>
          {!!message && <Text style={styles.message}>{message}</Text>}

          <View style={styles.actions}>
            {cancelText && (
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={onCancel}
                disabled={loading}
                hitSlop={6}
              >
                <Text style={styles.cancelText}>{cancelText}</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[
                styles.confirmButton,
                isDestructive ? styles.confirmButtonDestructive : styles.confirmButtonDefault,
                loading && styles.confirmButtonDisabled,
              ]}
              onPress={onConfirm}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.confirmText}>{confirmText}</Text>
              )}
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: screenWidth * 0.08,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    width: '100%',
    gap: 10,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: '#003366',
  },
  message: {
    fontSize: 14,
    color: '#4A5568',
    lineHeight: 20,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 10,
    marginTop: 8,
  },
  cancelButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  cancelText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#6b8aa1',
  },
  confirmButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    minWidth: 96,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmButtonDefault: {
    backgroundColor: '#07a3e4',
  },
  confirmButtonDestructive: {
    backgroundColor: '#EF5350',
  },
  confirmButtonDisabled: {
    opacity: 0.6,
  },
  confirmText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
  },
});

export default AppDialog;
