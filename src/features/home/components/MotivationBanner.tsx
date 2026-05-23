import React, { useState, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { Sparkles } from 'lucide-react-native';
import { useTheme } from '../../../design-system/theme/ThemeProvider';
import { Text } from '../../../design-system/primitives/Text';
import { GlassCard } from '../../../design-system/primitives/GlassCard';

const MOTIVATIONS = [
  "Small daily disciplines compound into massive lifetime transformations.",
  "Your future self is waiting for you to complete today's commitment.",
  "A streak is a record of promises kept to yourself. Keep the promise.",
  "Pain of discipline is temporary; regret of quitting is permanent.",
  "You don't rise to the level of your goals, you sink to the level of your systems.",
];

const AnimatedText = Animated.createAnimatedComponent(Text);

export const MotivationBanner: React.FC = () => {
  const { colors } = useTheme();
  const [index, setIndex] = useState(0);
  const opacity = useSharedValue(1);

  const changeQuote = () => {
    setIndex((prev) => (prev + 1) % MOTIVATIONS.length);
    opacity.value = withTiming(1, { duration: 400 });
  };

  useEffect(() => {
    const interval = setInterval(() => {
      opacity.value = withTiming(0, { duration: 400 }, (finished) => {
        if (finished) {
          runOnJS(changeQuote)();
        }
      });
    }, 10000); // Shift every 10 seconds

    return () => clearInterval(interval);
  }, [index]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
    };
  });

  return (
    <GlassCard borderRadius="xl" intensity="low" style={styles.container}>
      <Sparkles size={16} color={colors.primary} style={styles.icon} />
      <View style={styles.textWrapper}>
        <AnimatedText
          variant="bodySmall"
          weight="medium"
          color={colors.textSecondary}
          style={[styles.quoteText, animatedStyle]}
        >
          "{MOTIVATIONS[index]}"
        </AnimatedText>
      </View>
    </GlassCard>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 75, 43, 0.08)',
  },
  icon: {
    marginRight: 12,
  },
  textWrapper: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  quoteText: {
    lineHeight: 18,
    fontStyle: 'italic',
    backgroundColor: 'transparent',
  },
});
