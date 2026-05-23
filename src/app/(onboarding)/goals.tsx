import React, { useState } from 'react';
import { StyleSheet, View, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Check, Target, Flame, Brain, Dumbbell, ShieldAlert, Sparkles } from 'lucide-react-native';
import { useTheme } from '../../design-system/theme/ThemeProvider';
import { Text } from '../../design-system/primitives/Text';
import { AnimatedButton } from '../../design-system/primitives/AnimatedButton';
import { Spacer } from '../../design-system/primitives/Spacer';
import { Gradient } from '../../design-system/primitives/Gradient';
import { GlassCard } from '../../design-system/primitives/GlassCard';
import { radius } from '../../design-system/tokens/radius';

const GOALS = [
  { id: 'focus', title: 'Master Deep Focus & Productivity', subtitle: 'Conquer procrastination and finish deep work blocks.', icon: Brain, color: '#FF4B2B' },
  { id: 'fitness', title: 'Improve Physical Fitness & Strength', subtitle: 'Build athletic stamina and strong baseline habits.', icon: Dumbbell, color: '#00F2FE' },
  { id: 'mindfulness', title: 'Achieve Clarity & Mindfulness', subtitle: 'Reduce digital noise and center your daily focus.', icon: Sparkles, color: '#10B981' },
  { id: 'learning', title: 'Learn Hard Skills Rapidly', subtitle: 'Synthesize complex information and master tech/languages.', icon: Target, color: '#8A2387' },
  { id: 'social', title: 'Build Elite Social Bonds', subtitle: 'Engage with deep communities and squads.', icon: Flame, color: '#E94057' },
];

export default function GoalsScreen() {
  const { colors, isDark } = useTheme();
  const router = useRouter();
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);

  const toggleGoal = (id: string) => {
    if (selectedGoals.includes(id)) {
      setSelectedGoals(selectedGoals.filter((g) => g !== id));
    } else {
      setSelectedGoals([...selectedGoals, id]);
    }
  };

  return (
    <Gradient type="midnight" style={styles.container}>
      <View style={styles.innerContainer}>
        {/* Step Indicator */}
        <View style={styles.stepContainer}>
          <View style={[styles.stepDot, { backgroundColor: colors.primary }]} />
          <View style={[styles.stepDot, styles.activeStepDot, { backgroundColor: colors.primary }]} />
          <View style={[styles.stepDot, { backgroundColor: colors.border }]} />
          <View style={[styles.stepDot, { backgroundColor: colors.border }]} />
        </View>

        <Spacer size="lg" />

        <View style={styles.titleSection}>
          <Text variant="h1" weight="display" color={colors.text}>
            What are your focus vectors?
          </Text>
          <Spacer size="xs" />
          <Text variant="bodySmall" color={colors.textSecondary}>
            Select all goals that apply to calibrate your daily rotating challenges.
          </Text>
        </View>

        <Spacer size="lg" />

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.list}>
          {GOALS.map((goal) => {
            const isSelected = selectedGoals.includes(goal.id);
            const Icon = goal.icon;

            return (
              <Pressable
                key={goal.id}
                onPress={() => toggleGoal(goal.id)}
                style={styles.cardWrapper}
              >
                <GlassCard
                  borderRadius="xl"
                  style={[
                    styles.card,
                    {
                      borderColor: isSelected ? goal.color : 'rgba(255,255,255,0.06)',
                      backgroundColor: isSelected
                        ? isDark
                          ? 'rgba(255,255,255,0.04)'
                          : 'rgba(0,0,0,0.02)'
                        : 'rgba(255,255,255,0.01)',
                    },
                  ]}
                >
                  <View style={[styles.iconWrapper, { backgroundColor: `${goal.color}15` }]}>
                    <Icon size={20} color={goal.color} />
                  </View>
                  <View style={styles.textWrapper}>
                    <Text variant="body" weight="bold" color={colors.text}>
                      {goal.title}
                    </Text>
                    <Text variant="caption" color={colors.textSecondary} style={{ marginTop: 2 }}>
                      {goal.subtitle}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.checkbox,
                      {
                        borderColor: isSelected ? goal.color : colors.border,
                        backgroundColor: isSelected ? goal.color : 'transparent',
                      },
                    ]}
                  >
                    {isSelected && <Check size={12} color="#FFFFFF" strokeWidth={3} />}
                  </View>
                </GlassCard>
              </Pressable>
            );
          })}
        </ScrollView>

        <Spacer size="lg" />

        <AnimatedButton
          title="Continue"
          disabled={selectedGoals.length === 0}
          onPress={() => router.push('/(onboarding)/categories')}
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
  titleSection: {
    alignItems: 'flex-start',
  },
  list: {
    gap: 12,
  },
  cardWrapper: {
    width: '100%',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderWidth: 1,
  },
  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  textWrapper: {
    flex: 1,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
});
