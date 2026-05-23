import React, { useEffect } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  withSpring,
} from 'react-native-reanimated';
import { Flame } from 'lucide-react-native';
import { useTheme } from '../../../design-system/theme/ThemeProvider';
import { Text } from '../../../design-system/primitives/Text';
import { animations } from '../../../design-system/tokens/animations';

interface StreakFlameProps {
  streak: number;
  size?: number;
  showText?: boolean;
}

export const StreakFlame = ({ streak, size = 28, showText = true }: StreakFlameProps) => {
  const { colors } = useTheme();
  
  const scale = useSharedValue(1);
  const glowOpacity = useSharedValue(0.4);
  const textScale = useSharedValue(1);

  // Flame color based on streak length milestones (Gamified Streak Evolution)
  const getStreakTier = () => {
    if (streak >= 30) return { name: 'legendary', color: '#FFD700', text: 'GOLD' }; // Gold
    if (streak >= 15) return { name: 'celestial', color: '#8A2387', text: 'CELESTIAL' }; // Purple
    if (streak >= 5) return { name: 'fiery', color: '#FF416C', text: 'FIERY' }; // Red
    return { name: 'spark', color: '#FF4B2B', text: 'SPARK' }; // Orange
  };

  const tier = getStreakTier();

  useEffect(() => {
    // Elegant breathing/pulsing flame
    scale.value = withRepeat(
      withSequence(
        withTiming(1.15, { duration: 900 }),
        withTiming(1.0, { duration: 900 })
      ),
      -1,
      true
    );

    // Dynamic glowing background opacity shift
    glowOpacity.value = withRepeat(
      withSequence(
        withTiming(0.7, { duration: 900 }),
        withTiming(0.3, { duration: 900 })
      ),
      -1,
      true
    );
  }, []);

  // Whenever streak count changes, bounce the text numbers
  useEffect(() => {
    textScale.value = withSequence(
      withSpring(1.3, animations.spring.snappy),
      withSpring(1.0, animations.spring.bouncy)
    );
  }, [streak]);

  const animatedFlameStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    shadowColor: tier.color,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.95,
    shadowRadius: size * 0.8,
  }));

  const animatedTextStyle = useAnimatedStyle(() => ({
    transform: [{ scale: textScale.value }],
  }));

  if (streak === 0) return null;

  return (
    <View style={[styles.badgeContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={styles.flameContainer}>
        {/* Actual pulsing flame icon with shadow glow */}
        <Animated.View style={animatedFlameStyle}>
          <Flame color={tier.color} fill={tier.color} size={size} />
        </Animated.View>
      </View>

      {showText && (
        <Animated.View style={[styles.textContainer, animatedTextStyle]}>
          <Text variant="h3" weight="bold" color={tier.color} style={styles.streakText}>
            {streak}
          </Text>
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 9999,
    borderWidth: 1,
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  flameContainer: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
  },
  textContainer: {
    justifyContent: 'center',
  },
  streakText: {
    fontStyle: 'normal',
    lineHeight: undefined,
  },
});
