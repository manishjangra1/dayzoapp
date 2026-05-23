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
  const { colors, isDark } = useTheme();

  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const xpInCurrentLevel = xp % 100;
  
  const progress = useSharedValue(0);
  const ringScale = useSharedValue(1);
  const pulseOpacity = useSharedValue(0.4);

  useEffect(() => {
    progress.value = withTiming(xpInCurrentLevel / 100, { duration: 1200 });
  }, [xp]);

  useEffect(() => {
    ringScale.value = withSequence(
      withSpring(1.15, { damping: 10, stiffness: 200 }),
      withSpring(1.0, { damping: 12, stiffness: 120 })
    );
  }, [level]);

  useEffect(() => {
    pulseOpacity.value = withSpring(0.6, { damping: 20, stiffness: 50 });
  }, []);

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

  const glowStyle = useAnimatedStyle(() => {
    return {
      opacity: withTiming(progress.value * 0.35 + 0.15, { duration: 500 }),
    };
  });

  return (
    <View style={[styles.container, { width: size, height: size + 28 }]}>
      <Animated.View style={[styles.ringContainer, { width: size, height: size }, animatedRingStyle]}>
        
        {/* Futuristic Ambient Glowing Halo Underlay */}
        <Animated.View
          style={[
            styles.glowHalo,
            {
              width: size - strokeWidth,
              height: size - strokeWidth,
              borderRadius: (size - strokeWidth) / 2,
              borderWidth: strokeWidth,
              borderColor: colors.primary,
              backgroundColor: 'transparent',
              shadowColor: colors.primary,
            },
            glowStyle,
          ]}
        />

        <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={styles.svg}>
          <Defs>
            <LinearGradient id="xpGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor="#8A2387" />
              <Stop offset="50%" stopColor="#E94057" />
              <Stop offset="100%" stopColor="#FF4B2B" />
            </LinearGradient>
          </Defs>

          {/* Underlay track with translucent border shine */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)'}
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

        {/* Center content overlay */}
        <View style={[StyleSheet.absoluteFill, styles.centerContent]}>
          <Text variant="micro" weight="bold" color={colors.textTertiary} style={styles.label}>
            LEVEL
          </Text>
          <Text variant="hero" weight="display" color={colors.text} style={[styles.levelNumber, { textShadowColor: 'rgba(255, 75, 43, 0.3)', textShadowRadius: 8, textShadowOffset: { width: 0, height: 0 } }]}>
            {level}
          </Text>
        </View>
      </Animated.View>

      {/* Progress sub-caption below the ring */}
      <Text variant="bodySmall" weight="bold" color={colors.textSecondary} style={styles.progressText}>
        {xpInCurrentLevel} <Text variant="micro" weight="bold" color={colors.textTertiary}>/ 100 XP</Text>
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
  glowHalo: {
    position: 'absolute',
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.6,
        shadowRadius: 18,
      },
      android: {
        elevation: 10,
      },
    }),
    zIndex: -1,
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
    fontSize: 40,
    lineHeight: 44,
  },
  progressText: {
    marginTop: 8,
    fontSize: 12,
    letterSpacing: 0.5,
    flexShrink: 0,
  },
});
