import React from 'react';
import { Pressable, ActivityIndicator, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { useTheme } from '../theme/ThemeProvider';
import { radius } from '../tokens/radius';
import { animations } from '../tokens/animations';
import { Text } from './Text';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

export interface AnimatedButtonProps {
  onPress?: () => void;
  title: string;
  variant?: ButtonVariant;
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  borderRadius?: keyof typeof radius;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const AnimatedButton: React.FC<AnimatedButtonProps> = ({
  onPress,
  title,
  variant = 'primary',
  loading = false,
  disabled = false,
  style,
  borderRadius = 'md',
}) => {
  const { colors } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const handlePressIn = () => {
    if (disabled || loading) return;
    scale.value = withSpring(0.96, animations.spring.snappy);
  };

  const handlePressOut = () => {
    if (disabled || loading) return;
    scale.value = withSpring(1, animations.spring.bouncy);
  };

  const getStyles = () => {
    const baseStyle: ViewStyle = {
      paddingVertical: 14,
      paddingHorizontal: 24,
      borderRadius: radius[borderRadius],
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
      opacity: disabled ? 0.5 : 1,
    };

    switch (variant) {
      case 'primary':
        return {
          button: [
            baseStyle,
            { backgroundColor: colors.primary },
          ] as ViewStyle[],
          text: colors.surface,
        };
      case 'secondary':
        return {
          button: [
            baseStyle,
            {
              backgroundColor: colors.surfaceElevated,
              borderWidth: 1,
              borderColor: colors.border,
            },
          ] as ViewStyle[],
          text: colors.text,
        };
      case 'ghost':
        return {
          button: [
            baseStyle,
            { backgroundColor: 'transparent' },
          ] as ViewStyle[],
          text: colors.textSecondary,
        };
      case 'danger':
        return {
          button: [
            baseStyle,
            { backgroundColor: colors.error },
          ] as ViewStyle[],
          text: colors.surface,
        };
      default:
        return {
          button: [baseStyle, { backgroundColor: colors.primary }] as ViewStyle[],
          text: colors.surface,
        };
    }
  };

  const currentStyles = getStyles();

  return (
    <AnimatedPressable
      onPress={disabled || loading ? undefined : onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[currentStyles.button, animatedStyle, style]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={currentStyles.text} />
      ) : (
        <Text
          variant="body"
          weight="bold"
          color={currentStyles.text}
        >
          {title}
        </Text>
      )}
    </AnimatedPressable>
  );
};
