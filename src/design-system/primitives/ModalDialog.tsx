import React, { useEffect, useState } from 'react';
import {
  Modal,
  StyleSheet,
  Pressable,
  View,
  Dimensions,
  StyleProp,
  ViewStyle,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { useTheme } from '../theme/ThemeProvider';
import { animations } from '../tokens/animations';
import { radius } from '../tokens/radius';
import { Surface } from './Surface';
import { Text } from './Text';
import { AnimatedButton, ButtonVariant } from './AnimatedButton';
import { Spacer } from './Spacer';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export interface ModalAction {
  text: string;
  onPress?: () => void | Promise<void>;
  variant?: ButtonVariant;
  loading?: boolean;
}

export interface ModalDialogProps {
  visible: boolean;
  onClose?: () => void;
  title: string;
  message?: string | React.ReactNode;
  primaryAction?: ModalAction;
  secondaryAction?: ModalAction;
  dismissable?: boolean;
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export const ModalDialog: React.FC<ModalDialogProps> = ({
  visible,
  onClose,
  title,
  message,
  primaryAction,
  secondaryAction,
  dismissable = true,
  children,
  style,
}) => {
  const { colors } = useTheme();
  const [rendered, setRendered] = useState(visible);

  const backdropOpacity = useSharedValue(0);
  const dialogScale = useSharedValue(0.9);
  const dialogTranslateY = useSharedValue(40);

  // Synchronize internal render state and trigger animations
  useEffect(() => {
    if (visible) {
      setRendered(true);
      // Fade in backdrop
      backdropOpacity.value = withTiming(1, { duration: 250 });
      // Spring animate dialog container
      dialogScale.value = withSpring(1, animations.spring.gentle);
      dialogTranslateY.value = withSpring(0, animations.spring.gentle);
    } else {
      // Fade out backdrop
      backdropOpacity.value = withTiming(0, { duration: 200 });
      // Slide down and scale down dialog
      dialogScale.value = withTiming(0.92, { duration: 200 });
      dialogTranslateY.value = withTiming(25, { duration: 200 }, (finished) => {
        if (finished) {
          runOnJS(setRendered)(false);
        }
      });
    }
  }, [visible]);

  const handleBackdropPress = () => {
    if (dismissable && onClose) {
      onClose();
    }
  };

  const backdropAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: backdropOpacity.value,
    };
  });

  const dialogAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: backdropOpacity.value, // fade in/out container as well
      transform: [
        { scale: dialogScale.value },
        { translateY: dialogTranslateY.value },
      ],
    };
  });

  if (!rendered) {
    return null;
  }

  return (
    <Modal
      transparent
      visible={true}
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={styles.overlayContainer}>
        {/* Animated semi-transparent backdrop */}
        <Animated.View
          style={[
            styles.backdrop,
            { backgroundColor: colors.overlay },
            backdropAnimatedStyle,
          ]}
        >
          <Pressable style={styles.backdropPressable} onPress={handleBackdropPress} />
        </Animated.View>

        {/* Animated Dialog Card */}
        <Animated.View style={[styles.dialogWrapper, dialogAnimatedStyle, style]}>
          <Surface
            elevation="flat"
            borderRadius="xxl"
            bordered
            style={[
              styles.dialogCard,
              {
                backgroundColor: colors.surfaceElevated,
                borderColor: colors.border,
              },
            ]}
          >
            {/* Modal Header */}
            <Text variant="h2" weight="display" align="center" style={styles.titleText}>
              {title}
            </Text>

            <Spacer size="sm" />

            {/* Custom Children or Standard Message text */}
            {children ? (
              children
            ) : (
              message && (
                <View style={styles.messageContainer}>
                  {typeof message === 'string' ? (
                    <Text
                      variant="body"
                      color={colors.textSecondary}
                      align="center"
                      style={styles.messageText}
                    >
                      {message}
                    </Text>
                  ) : (
                    message
                  )}
                </View>
              )
            )}

            <Spacer size="xl" />

            {/* Actions Grid / Row */}
            <View
              style={[
                styles.actionsContainer,
                secondaryAction ? styles.rowActions : styles.columnActions,
              ]}
            >
              {secondaryAction && (
                <AnimatedButton
                  title={secondaryAction.text}
                  variant={secondaryAction.variant || 'ghost'}
                  onPress={secondaryAction.onPress}
                  loading={secondaryAction.loading}
                  style={styles.actionButton}
                />
              )}

              {primaryAction && (
                <AnimatedButton
                  title={primaryAction.text}
                  variant={primaryAction.variant || 'primary'}
                  onPress={primaryAction.onPress}
                  loading={primaryAction.loading}
                  style={secondaryAction ? styles.actionButton : styles.fullWidthButton}
                />
              )}
            </View>
          </Surface>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlayContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  backdropPressable: {
    flex: 1,
  },
  dialogWrapper: {
    width: '100%',
    maxWidth: 340,
    zIndex: 1,
  },
  dialogCard: {
    padding: 24,
    borderWidth: 1,
  },
  titleText: {
    letterSpacing: -0.5,
  },
  messageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  messageText: {
    lineHeight: 22,
  },
  actionsContainer: {
    width: '100%',
  },
  rowActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  columnActions: {
    flexDirection: 'column',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
  },
  fullWidthButton: {
    width: '100%',
    paddingVertical: 12,
  },
});
