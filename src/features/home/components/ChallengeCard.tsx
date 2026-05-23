import React from 'react';
import { View, StyleSheet, Platform, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { Clock, Zap, CheckCircle2, ChevronRight } from 'lucide-react-native';
import { useTheme } from '../../../design-system/theme/ThemeProvider';
import { Text } from '../../../design-system/primitives/Text';
import { GlassCard } from '../../../design-system/primitives/GlassCard';
import { Surface } from '../../../design-system/primitives/Surface';
import { AnimatedButton } from '../../../design-system/primitives/AnimatedButton';
import { triggerConfetti } from '../../../utils/confetti';
import { animations } from '../../../design-system/tokens/animations';
import { radius } from '../../../design-system/tokens/radius';

export interface Challenge {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard' | string;
  xpReward: number;
  duration: number;
}

interface ChallengeCardProps {
  challenge: Challenge;
  completed?: boolean;
  onComplete?: () => void;
  actionLoading?: boolean;
  onShare?: () => void;
}

export const ChallengeCard: React.FC<ChallengeCardProps> = ({
  challenge,
  completed = false,
  onComplete,
  actionLoading = false,
  onShare,
}) => {
  const { colors, isDark } = useTheme();
  const scale = useSharedValue(1);

  const handlePressIn = () => {
    scale.value = withSpring(0.98, animations.spring.snappy);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, animations.spring.bouncy);
  };

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const getCategoryTheme = (cat: string) => {
    const norm = cat.toLowerCase();
    switch (norm) {
      case 'fitness':
        return { color: '#00F2FE', label: 'FITNESS', gradient: ['#00F2FE', '#4FACFE'] };
      case 'productivity':
        return { color: '#FF4B2B', label: 'PRODUCTIVITY', gradient: ['#FF4B2B', '#FF416C'] };
      case 'learning':
        return { color: '#8A2387', label: 'LEARNING', gradient: ['#8A2387', '#E94057'] };
      case 'mindfulness':
        return { color: '#10B981', label: 'MINDFULNESS', gradient: ['#10B981', '#059669'] };
      case 'social':
        return { color: '#E94057', label: 'SOCIAL', gradient: ['#E94057', '#F27121'] };
      default:
        return { color: '#FF4B2B', label: 'CHALLENGE', gradient: ['#FF4B2B', '#E94057'] };
    }
  };

  const catTheme = getCategoryTheme(challenge.category);

  const handleCompletePress = () => {
    triggerConfetti();
    if (onComplete) onComplete();
  };

  return (
    <Animated.View style={[animatedStyle, styles.cardContainer]}>
      <GlassCard borderRadius="2xl" intensity="high" style={[styles.card, { borderColor: completed ? colors.success : 'rgba(255, 255, 255, 0.08)' }]}>
        {/* Subtle Category Accent Border Line at Top */}
        <View style={[styles.accentLine, { backgroundColor: completed ? colors.success : catTheme.color }]} />

        {/* Card Header */}
        <View style={styles.header}>
          <View style={[styles.badge, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)' }]}>
            <Text variant="micro" weight="bold" color={completed ? colors.success : catTheme.color} style={styles.badgeText}>
              {completed ? 'COMPLETED' : catTheme.label}
            </Text>
          </View>
          
          <View style={styles.statPills}>
            {/* XP Pill */}
            <View style={[styles.pill, { backgroundColor: isDark ? 'rgba(138, 35, 135, 0.15)' : 'rgba(138, 35, 135, 0.08)' }]}>
              <Zap size={11} color="#8A2387" fill="#8A2387" />
              <Text variant="micro" weight="bold" color="#8A2387" style={styles.pillText}>
                +{challenge.xpReward} XP
              </Text>
            </View>

            {/* Time Pill */}
            <View style={[styles.pill, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)' }]}>
              <Clock size={11} color={colors.textSecondary} />
              <Text variant="micro" weight="bold" color={colors.textSecondary} style={styles.pillText}>
                {challenge.duration} MIN
              </Text>
            </View>
          </View>
        </View>

        {/* Title & Description */}
        <View style={styles.content}>
          <Text variant="h2" weight="bold" color={colors.text}>
            {challenge.title}
          </Text>
          <Text variant="bodySmall" color={colors.textSecondary} style={styles.desc}>
            {challenge.description}
          </Text>
        </View>

        {/* Footer Actions */}
        <View style={styles.footer}>
          {completed ? (
            <View style={{ gap: 8, width: '100%' }}>
              <Surface elevation="raised" borderRadius="md" style={styles.completedBanner}>
                <CheckCircle2 size={18} color={colors.success} />
                <Text variant="bodySmall" weight="bold" color={colors.success} style={styles.completedText}>
                  Day Complete. Keep the momentum going!
                </Text>
              </Surface>
              {onShare && (
                <AnimatedButton
                  title="Share Achievement"
                  onPress={onShare}
                  variant="secondary"
                  borderRadius="md"
                  style={{ width: '100%', paddingVertical: 10 }}
                />
              )}
            </View>
          ) : (
            <AnimatedButton
              title="Complete Challenge"
              onPress={handleCompletePress}
              loading={actionLoading}
              borderRadius="md"
              style={[styles.button, { backgroundColor: catTheme.color }]}
            />
          )}
        </View>
      </GlassCard>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    marginVertical: 8,
  },
  card: {
    padding: 18,
    position: 'relative',
    overflow: 'hidden',
  },
  accentLine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.xs,
  },
  badgeText: {
    letterSpacing: 1,
  },
  statPills: {
    flexDirection: 'row',
    gap: 6,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: radius.xs,
    gap: 3,
  },
  pillText: {
    letterSpacing: 0.5,
  },
  content: {
    marginBottom: 18,
  },
  desc: {
    marginTop: 6,
    lineHeight: 20,
  },
  footer: {
    width: '100%',
  },
  button: {
    width: '100%',
    paddingVertical: 12,
  },
  completedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.15)',
  },
  completedText: {
    marginLeft: 4,
  },
});
