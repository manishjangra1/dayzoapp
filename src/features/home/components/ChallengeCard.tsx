import React from 'react';
import { View, StyleSheet, Platform, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { Clock, Zap, CheckCircle2, ChevronRight, Share2, Compass, Flame, Users } from 'lucide-react-native';
import { useTheme } from '../../../design-system/theme/ThemeProvider';
import { Text } from '../../../design-system/primitives/Text';
import { GlassCard } from '../../../design-system/primitives/GlassCard';
import { Surface } from '../../../design-system/primitives/Surface';
import { AnimatedButton } from '../../../design-system/primitives/AnimatedButton';
import { triggerConfetti } from '../../../utils/confetti';
import { animations } from '../../../design-system/tokens/animations';
import { radius } from '../../../design-system/tokens/radius';
import { UserAvatar } from '../../../components/common/UserAvatar';

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
  const pulseScale = useSharedValue(1);

  React.useEffect(() => {
    if (!completed) {
      pulseScale.value = withRepeat(
        withSequence(
          withTiming(1.02, { duration: 1500 }),
          withTiming(1.0, { duration: 1500 })
        ),
        -1,
        true
      );
    } else {
      pulseScale.value = 1;
    }
  }, [completed]);

  const handlePressIn = () => {
    scale.value = withSpring(0.96, { damping: 12, stiffness: 180 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 10, stiffness: 120 });
  };

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value * (completed ? 1 : pulseScale.value) }],
    };
  });

  const getCategoryTheme = (cat: string) => {
    const norm = cat.toLowerCase();
    switch (norm) {
      case 'fitness':
        return { color: '#00F2FE', label: 'FITNESS QUEST', glow: 'rgba(0, 242, 254, 0.25)', bgGlow: 'rgba(0, 242, 254, 0.04)' };
      case 'productivity':
        return { color: '#FF4B2B', label: 'ELITE MISSION', glow: 'rgba(255, 75, 43, 0.25)', bgGlow: 'rgba(255, 75, 43, 0.04)' };
      case 'learning':
        return { color: '#8A2387', label: 'INTELLECT QUEST', glow: 'rgba(138, 35, 135, 0.25)', bgGlow: 'rgba(138, 35, 135, 0.04)' };
      case 'mindfulness':
        return { color: '#10B981', label: 'ZEN OBJECTIVE', glow: 'rgba(16, 185, 129, 0.25)', bgGlow: 'rgba(16, 185, 129, 0.04)' };
      case 'social':
        return { color: '#E94057', label: 'REALM ALLIANCE', glow: 'rgba(233, 64, 87, 0.25)', bgGlow: 'rgba(233, 64, 87, 0.04)' };
      default:
        return { color: '#FF4B2B', label: 'CHALLENGE', glow: 'rgba(255, 75, 43, 0.25)', bgGlow: 'rgba(255, 75, 43, 0.04)' };
    }
  };

  const catTheme = getCategoryTheme(challenge.category);

  // Deterministic mock companions count to maximize feed social density
  const totalCompletions = (challenge.title.length * 7) % 24 + 11;
  const companionInitials = ['AN', 'JD', 'KL', 'MR'];

  const handleCompletePress = () => {
    triggerConfetti();
    if (onComplete) onComplete();
  };

  return (
    <Animated.View style={[animatedStyle, styles.cardContainer]}>
      <GlassCard
        borderRadius="2xl"
        intensity="high"
        style={[
          styles.card,
          {
            borderColor: completed ? 'rgba(52, 211, 153, 0.35)' : catTheme.glow,
            backgroundColor: completed ? (isDark ? 'rgba(10, 20, 16, 0.6)' : 'rgba(230, 248, 240, 0.95)') : (isDark ? 'rgba(20, 20, 26, 0.5)' : 'rgba(255, 255, 255, 0.85)'),
          }
        ]}
      >
        {/* Glow pulsing ambient aura inside quest card */}
        {!completed && (
          <View style={[styles.ambientGlow, { backgroundColor: catTheme.color, opacity: isDark ? 0.07 : 0.03 }]} />
        )}

        {/* Quest Badge Indicator */}
        <View style={styles.header}>
          <View style={[styles.questBadge, { backgroundColor: completed ? 'rgba(52, 211, 153, 0.15)' : `${catTheme.color}20` }]}>
            <Compass size={12} color={completed ? colors.success : catTheme.color} />
            <Text variant="micro" weight="bold" color={completed ? colors.success : catTheme.color} style={styles.badgeText}>
              {completed ? 'QUEST SECURED' : catTheme.label}
            </Text>
          </View>
          
          {/* Rarity and rewards indicators */}
          <View style={styles.statPills}>
            <View style={[styles.pill, { backgroundColor: isDark ? 'rgba(255, 75, 43, 0.1)' : 'rgba(255, 75, 43, 0.05)' }]}>
              <Zap size={11} color={colors.primary} fill={colors.primary} />
              <Text variant="micro" weight="bold" color={colors.primary} style={styles.pillText}>
                +{challenge.xpReward} XP
              </Text>
            </View>

            <View style={[styles.pill, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)' }]}>
              <Clock size={11} color={colors.textSecondary} />
              <Text variant="micro" weight="bold" color={colors.textSecondary} style={styles.pillText}>
                {challenge.duration} MIN
              </Text>
            </View>
          </View>
        </View>

        {/* Quest Objectives */}
        <View style={styles.content}>
          <Text variant="h1" weight="display" color={colors.text} style={styles.questTitle}>
            {challenge.title}
          </Text>
          <Text variant="bodySmall" color={colors.textSecondary} style={styles.desc}>
            {challenge.description}
          </Text>
        </View>

        {/* Social Companions completion list overlay */}
        <View style={[styles.socialDensityDivider, { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)' }]} />
        
        <View style={styles.socialDensityRow}>
          <View style={styles.avatarStack}>
            {companionInitials.map((initial, index) => (
              <View
                key={index}
                style={[
                  styles.stackAvatarWrapper,
                  {
                    left: index * -8,
                    zIndex: 10 - index,
                    borderColor: isDark ? '#121216' : '#FFFFFF',
                    backgroundColor: colors.primary,
                  }
                ]}
              >
                <Text variant="micro" weight="bold" color="#FFFFFF" style={{ fontSize: 8 }}>
                  {initial}
                </Text>
              </View>
            ))}
          </View>
          <Text variant="micro" color={colors.textSecondary} style={[styles.socialText, { marginLeft: (companionInitials.length - 1) * -8 + 8 }]}>
            🔥 {totalCompletions} companions secured this quest today!
          </Text>
        </View>

        {/* Call to action */}
        <View style={styles.footer}>
          {completed ? (
            <View style={styles.completedRow}>
              <View style={[styles.completedBanner, { backgroundColor: 'rgba(52, 211, 153, 0.08)', borderColor: 'rgba(52, 211, 153, 0.2)' }]}>
                <CheckCircle2 size={16} color={colors.success} />
                <Text variant="bodySmall" weight="bold" color={colors.success} style={styles.completedText}>
                  MISSION COMPLETE
                </Text>
              </View>
              {onShare && (
                <Pressable
                  onPress={onShare}
                  style={({ pressed }) => [
                    styles.shareIconBtn,
                    {
                      backgroundColor: 'rgba(255, 75, 43, 0.1)',
                      borderColor: colors.primary,
                      borderWidth: 1,
                      opacity: pressed ? 0.7 : 1,
                    }
                  ]}
                >
                  <Share2 size={18} color={colors.primary} />
                </Pressable>
              )}
            </View>
          ) : (
            <AnimatedButton
              title="ENGAGE MISSION"
              onPress={handleCompletePress}
              loading={actionLoading}
              borderRadius="md"
              style={[
                styles.engageButton,
                {
                  backgroundColor: catTheme.color,
                  shadowColor: catTheme.color,
                }
              ]}
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
    padding: 20,
    position: 'relative',
    overflow: 'hidden',
    borderWidth: 1,
  },
  ambientGlow: {
    position: 'absolute',
    top: -60,
    right: -60,
    width: 180,
    height: 180,
    borderRadius: 90,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  questBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: radius.xs,
    gap: 4,
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
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.xs,
    gap: 3,
  },
  pillText: {
    letterSpacing: 0.5,
  },
  content: {
    marginBottom: 14,
  },
  questTitle: {
    fontSize: 22,
    lineHeight: 28,
    letterSpacing: -0.5,
  },
  desc: {
    marginTop: 6,
    lineHeight: 18,
  },
  socialDensityDivider: {
    height: 1,
    width: '100%',
    marginVertical: 4,
  },
  socialDensityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  avatarStack: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stackAvatarWrapper: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  socialText: {
    fontSize: 10,
    fontWeight: '600',
  },
  footer: {
    width: '100%',
    marginTop: 10,
  },
  engageButton: {
    width: '100%',
    paddingVertical: 14,
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.35,
        shadowRadius: 10,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  completedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    width: '100%',
  },
  completedBanner: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 8,
    borderWidth: 1,
    borderRadius: radius.md,
  },
  shareIconBtn: {
    width: 46,
    height: 46,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  completedText: {
    fontSize: 11,
    letterSpacing: 1,
    fontWeight: '800',
  },
});
