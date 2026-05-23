import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions, Platform } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
} from 'react-native-reanimated';
import { useTheme } from '../../../design-system/theme/ThemeProvider';
import { Text } from '../../../design-system/primitives/Text';
import { animations } from '../../../design-system/tokens/animations';

interface XPRingProps {
  xp: number;
  level: number;
  size?: number;
  strokeWidth?: number;
}

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export const XPRing: React.FC<XPRingProps> = ({
  xp,
  level,
  size = 120,
  strokeWidth = 10,
}) => {
  const { colors } = useTheme();

  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const xpInCurrentLevel = xp % 100;
  
  // Progress value from 0 to 1
  const progress = useSharedValue(0);
  const ringScale = useSharedValue(1);

  useEffect(() => {
    // Smooth timing animation for filling the arc
    progress.value = withTiming(xpInCurrentLevel / 100, { duration: 1000 });
  }, [xp]);

  useEffect(() => {
    // Spring scaling jump on level up
    ringScale.value = withSequence(
      withSpring(1.1, animations.spring.snappy),
      withSpring(1.0, animations.spring.bouncy)
    );
  }, [level]);

  const animatedProps = useAnimatedProps(() => {
    const strokeDashoffset = circumference - progress.value * circumference;
    return {
      strokeDashoffset,
    };
  });

  const animatedRingStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: ringScale.value }],
    };
  });

  return (
    <View style={[styles.container, { width: size, height: size + 28 }]}>
      <Animated.View style={[styles.ringContainer, { width: size, height: size }, animatedRingStyle]}>
        <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={styles.svg}>
          <Defs>
            <LinearGradient id="xpGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor="#8A2387" />
              <Stop offset="50%" stopColor="#E94057" />
              <Stop offset="100%" stopColor="#FF4B2B" />
            </LinearGradient>
          </Defs>

          {/* Underlay track */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={colors.borderSubtle}
            strokeWidth={strokeWidth}
            fill="transparent"
          />

          {/* Animated active progress stroke */}
          <AnimatedCircle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="url(#xpGradient)"
            strokeWidth={strokeWidth}
            strokeDasharray={`${circumference} ${circumference}`}
            animatedProps={animatedProps}
            strokeLinecap="round"
            fill="transparent"
            rotation="-90"
            origin={`${size / 2}, ${size / 2}`}
          />
        </Svg>

        {/* Center content */}
        <View style={[StyleSheet.absoluteFill, styles.centerContent]}>
          <Text variant="caption" weight="bold" color={colors.textTertiary} style={styles.label}>
            LEVEL
          </Text>
          <Text variant="hero" weight="display" color={colors.text} style={styles.levelNumber}>
            {level}
          </Text>
        </View>
      </Animated.View>

      {/* Progress sub-caption below the ring */}
      <Text variant="bodySmall" weight="bold" color={colors.textSecondary} style={styles.progressText}>
        {xpInCurrentLevel}/100 <Text variant="caption" weight="bold" color={colors.textTertiary}>XP</Text>
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
    flexShrink: 0,
  },
  ringContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  svg: {
    transform: [{ scaleX: 1 }],
    flexShrink: 0,
  },
  centerContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    letterSpacing: 2,
    fontSize: 9,
    marginBottom: -4,
  },
  levelNumber: {
    fontSize: 38,
    lineHeight: 44,
  },
  progressText: {
    marginTop: 6,
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 0.5,
    flexShrink: 0,
  },
});
