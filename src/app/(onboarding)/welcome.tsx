import React from 'react';
import { StyleSheet, View, Image, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Sparkles, ArrowRight, Zap, Target, Users } from 'lucide-react-native';
import { useTheme } from '../../design-system/theme/ThemeProvider';
import { Text } from '../../design-system/primitives/Text';
import { AnimatedButton } from '../../design-system/primitives/AnimatedButton';
import { Spacer } from '../../design-system/primitives/Spacer';
import { Gradient } from '../../design-system/primitives/Gradient';
import { GlassCard } from '../../design-system/primitives/GlassCard';

export default function WelcomeScreen() {
  const { colors } = useTheme();
  const router = useRouter();

  return (
    <Gradient type="midnight" style={styles.container}>
      <View style={styles.innerContainer}>
        {/* Step Indicator */}
        <View style={styles.stepContainer}>
          <View style={[styles.stepDot, styles.activeStepDot, { backgroundColor: colors.primary }]} />
          <View style={[styles.stepDot, { backgroundColor: colors.border }]} />
          <View style={[styles.stepDot, { backgroundColor: colors.border }]} />
          <View style={[styles.stepDot, { backgroundColor: colors.border }]} />
        </View>

        <Spacer size="xl" />

        {/* Welcome Callout */}
        <View style={styles.heroSection}>
          <GlassCard borderRadius="full" style={styles.badge}>
            <Sparkles size={14} color="#FFD700" style={{ marginRight: 6 }} />
            <Text variant="caption" weight="bold" color="#FFD700" style={{ letterSpacing: 1 }}>
              WELCOME TO THE ECOSYSTEM
            </Text>
          </GlassCard>

          <Spacer size="lg" />

          <Text variant="hero" weight="display" align="center" color={colors.text}>
            Atomic Consistency.
          </Text>
          <Text variant="hero" weight="display" align="center" color={colors.primary} style={{ marginTop: -8 }}>
            Unlocked.
          </Text>

          <Spacer size="md" />

          <Text variant="body" align="center" color={colors.textSecondary} style={styles.description}>
            Dayzo gamifies your self-improvement track. Keep daily promises, build streaks, compete with squads, and watch your habits compound.
          </Text>
        </View>

        <Spacer size="2xl" />

        {/* Feature List */}
        <View style={styles.features}>
          <View style={styles.featureItem}>
            <View style={[styles.iconWrapper, { backgroundColor: 'rgba(255, 75, 43, 0.1)' }]}>
              <Zap size={20} color={colors.primary} />
            </View>
            <View style={styles.featureTextWrapper}>
              <Text variant="bodySmall" weight="bold" color={colors.text}>
                Dynamic Daily Challenges
              </Text>
              <Text variant="caption" color={colors.textSecondary}>
                One hand-crafted self-improvement challenge every day.
              </Text>
            </View>
          </View>

          <Spacer size="md" />

          <View style={styles.featureItem}>
            <View style={[styles.iconWrapper, { backgroundColor: 'rgba(138, 35, 135, 0.1)' }]}>
              <Target size={20} color="#8A2387" />
            </View>
            <View style={styles.featureTextWrapper}>
              <Text variant="bodySmall" weight="bold" color={colors.text}>
                Streak Protection
              </Text>
              <Text variant="caption" color={colors.textSecondary}>
                Keep consistency alive, or use freezes strategically.
              </Text>
            </View>
          </View>

          <Spacer size="md" />

          <View style={styles.featureItem}>
            <View style={[styles.iconWrapper, { backgroundColor: 'rgba(0, 242, 254, 0.1)' }]}>
              <Users size={20} color="#00F2FE" />
            </View>
            <View style={styles.featureTextWrapper}>
              <Text variant="bodySmall" weight="bold" color={colors.text}>
                Squad Accountability
              </Text>
              <Text variant="caption" color={colors.textSecondary}>
                Build squad clusters with friends and compete in challenges.
              </Text>
            </View>
          </View>
        </View>

        <Spacer size="2xl" />

        {/* Button */}
        <AnimatedButton
          title="Build My Habits"
          onPress={() => router.push('/(onboarding)/goals')}
          borderRadius="md"
        />
      </View>
    </Gradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  innerContainer: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 64,
    paddingBottom: 40,
    justifyContent: 'space-between',
  },
  stepContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  stepDot: {
    width: 24,
    height: 4,
    borderRadius: 2,
  },
  activeStepDot: {
    width: 48,
  },
  heroSection: {
    alignItems: 'center',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  description: {
    lineHeight: 22,
    paddingHorizontal: 12,
  },
  features: {
    width: '100%',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  iconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureTextWrapper: {
    flex: 1,
  },
});
