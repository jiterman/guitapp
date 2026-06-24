import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import AppDialog, { AppDialogVariant } from '../components/AppDialog/AppDialog';

interface ConfirmOptions {
  title: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: AppDialogVariant;
}

interface AlertOptions {
  title: string;
  message?: string;
  confirmText?: string;
}

interface DialogContextValue {
  /** Shows a single-button informational dialog. Resolves when dismissed. */
  alert: (options: AlertOptions) => Promise<void>;
  /** Shows a confirm/cancel dialog. Resolves to true if confirmed, false otherwise. */
  confirm: (options: ConfirmOptions) => Promise<boolean>;
}

const DialogContext = createContext<DialogContextValue | null>(null);

interface DialogState {
  visible: boolean;
  title: string;
  message?: string;
  confirmText: string;
  cancelText?: string;
  variant: AppDialogVariant;
}

const INITIAL_STATE: DialogState = {
  visible: false,
  title: '',
  message: undefined,
  confirmText: 'Aceptar',
  cancelText: undefined,
  variant: 'default',
};

export const DialogProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<DialogState>(INITIAL_STATE);
  const resolverRef = useRef<((value: boolean) => void) | null>(null);

  const close = useCallback((result: boolean) => {
    setState(prev => ({ ...prev, visible: false }));
    if (resolverRef.current) {
      resolverRef.current(result);
      resolverRef.current = null;
    }
  }, []);

  const alert = useCallback((options: AlertOptions) => {
    return new Promise<void>(resolve => {
      resolverRef.current = () => resolve();
      setState({
        visible: true,
        title: options.title,
        message: options.message,
        confirmText: options.confirmText ?? 'Aceptar',
        cancelText: undefined,
        variant: 'default',
      });
    });
  }, []);

  const confirm = useCallback((options: ConfirmOptions) => {
    return new Promise<boolean>(resolve => {
      resolverRef.current = resolve;
      setState({
        visible: true,
        title: options.title,
        message: options.message,
        confirmText: options.confirmText ?? 'Aceptar',
        cancelText: options.cancelText ?? 'Cancelar',
        variant: options.variant ?? 'default',
      });
    });
  }, []);

  const value = useMemo<DialogContextValue>(() => ({ alert, confirm }), [alert, confirm]);

  return (
    <DialogContext.Provider value={value}>
      {children}
      <AppDialog
        visible={state.visible}
        title={state.title}
        message={state.message}
        confirmText={state.confirmText}
        cancelText={state.cancelText}
        variant={state.variant}
        onConfirm={() => close(true)}
        onCancel={state.cancelText ? () => close(false) : undefined}
      />
    </DialogContext.Provider>
  );
};

export const useDialog = (): DialogContextValue => {
  const context = useContext(DialogContext);
  if (!context) {
    throw new Error('useDialog must be used within a DialogProvider');
  }
  return context;
};
