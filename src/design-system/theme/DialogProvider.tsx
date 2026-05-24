import React, { createContext, useContext, useState, useCallback } from 'react';
import { ModalDialog, ModalAction } from '../primitives/ModalDialog';
import { ButtonVariant } from '../primitives/AnimatedButton';

export interface DialogAction {
  text: string;
  onPress?: () => void | Promise<void> | any;
  variant?: ButtonVariant;
}

export interface DialogConfig {
  title: string;
  message?: string | React.ReactNode;
  primaryAction?: DialogAction;
  secondaryAction?: DialogAction;
  dismissable?: boolean;
}

type DialogContextType = {
  show: (config: DialogConfig) => void;
  hide: () => void;
};

const DialogContext = createContext<DialogContextType | undefined>(undefined);

export const DialogProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [visible, setVisible] = useState(false);
  const [config, setConfig] = useState<DialogConfig | null>(null);
  const [primaryLoading, setPrimaryLoading] = useState(false);
  const [secondaryLoading, setSecondaryLoading] = useState(false);

  const hide = useCallback(() => {
    setVisible(false);
    // Reset loading states after close animation has a chance to play
    setTimeout(() => {
      setPrimaryLoading(false);
      setSecondaryLoading(false);
      setConfig(null);
    }, 100);
  }, []);

  const show = useCallback((newConfig: DialogConfig) => {
    setPrimaryLoading(false);
    setSecondaryLoading(false);
    setConfig(newConfig);
    setVisible(true);
  }, []);

  const handleAction = async (action: DialogAction | undefined, isPrimary: boolean) => {
    if (!action) return;

    if (action.onPress) {
      try {
        const result = action.onPress();
        if (result instanceof Promise) {
          if (isPrimary) {
            setPrimaryLoading(true);
          } else {
            setSecondaryLoading(true);
          }
          await result;
        }
      } catch (error) {
        console.error('Error executing dialog action:', error);
      } finally {
        if (isPrimary) {
          setPrimaryLoading(false);
        } else {
          setSecondaryLoading(false);
        }
      }
    }
    
    hide();
  };

  const dialogPrimaryAction: ModalAction | undefined = config?.primaryAction
    ? {
        text: config.primaryAction.text,
        variant: config.primaryAction.variant,
        loading: primaryLoading,
        onPress: () => handleAction(config.primaryAction, true),
      }
    : undefined;

  const dialogSecondaryAction: ModalAction | undefined = config?.secondaryAction
    ? {
        text: config.secondaryAction.text,
        variant: config.secondaryAction.variant,
        loading: secondaryLoading,
        onPress: () => handleAction(config.secondaryAction, false),
      }
    : undefined;

  return (
    <DialogContext.Provider value={{ show, hide }}>
      {children}
      {config && (
        <ModalDialog
          visible={visible}
          onClose={hide}
          title={config.title}
          message={config.message}
          primaryAction={dialogPrimaryAction}
          secondaryAction={dialogSecondaryAction}
          dismissable={config.dismissable}
        />
      )}
    </DialogContext.Provider>
  );
};

export const useDialog = () => {
  const context = useContext(DialogContext);
  if (!context) {
    throw new Error('useDialog must be used within a DialogProvider');
  }
  return context;
};
