import React, { useState } from 'react';
import { StyleSheet, View, Pressable, ScrollView, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../../design-system/theme/ThemeProvider';
import { Text } from '../../design-system/primitives/Text';
import { AnimatedButton } from '../../design-system/primitives/AnimatedButton';
import { Spacer } from '../../design-system/primitives/Spacer';
import { Gradient } from '../../design-system/primitives/Gradient';
import { GlassCard } from '../../design-system/primitives/GlassCard';
import { radius } from '../../design-system/tokens/radius';

const INTERESTS = [
  { id: 'fitness', name: 'Fitness & Cardio', emoji: '🏃‍♂️', color: '#00F2FE' },
  { id: 'strength', name: 'Strength & Weight', emoji: '🏋️‍♂️', color: '#3B82F6' },
  { id: 'productivity', name: 'Productivity Hacks', emoji: '⚡', color: '#FF4B2B' },
  { id: 'focus', name: 'Deep Work blocks', emoji: '🧠', color: '#FF416C' },
  { id: 'mindfulness', name: 'Mindfulness & Meditation', emoji: '🧘‍♂️', color: '#10B981' },
  { id: 'diet', name: 'Biohacking & Sleep', emoji: '🥑', color: '#059669' },
  { id: 'learning', name: 'Technical Skills', emoji: '💻', color: '#8A2387' },
  { id: 'reading', name: 'Speed Reading', emoji: '📚', color: '#E94057' },
  { id: 'finances', name: 'Wealth & Habits', emoji: '💰', color: '#FBBF24' },
  { id: 'social', name: 'Deep Relationships', emoji: '🤝', color: '#F27121' },
];

export default function CategoriesScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);

  const toggleInterest = (id: string) => {
    if (selectedInterests.includes(id)) {
      setSelectedInterests(selectedInterests.filter((x) => x !== id));
    } else {
      setSelectedInterests([...selectedInterests, id]);
    }
  };

  return (
    <Gradient type="midnight" style={styles.container}>
      <View style={styles.innerContainer}>
        {/* Step Indicator */}
        <View style={styles.stepContainer}>
          <View style={[styles.stepDot, { backgroundColor: colors.primary }]} />
          <View style={[styles.stepDot, { backgroundColor: colors.primary }]} />
          <View style={[styles.stepDot, styles.activeStepDot, { backgroundColor: colors.primary }]} />
          <View style={[styles.stepDot, { backgroundColor: colors.border }]} />
        </View>

        <Spacer size="lg" />

        <View style={styles.titleSection}>
          <Text variant="h1" weight="display" color={colors.text}>
            What gets you fired up?
          </Text>
          <Spacer size="xs" />
          <Text variant="bodySmall" color={colors.textSecondary}>
            Select your favorite self-improvement subjects to configure recommendations.
          </Text>
        </View>

        <Spacer size="lg" />

        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.grid}>
            {INTERESTS.map((interest) => {
              const isSelected = selectedInterests.includes(interest.id);

              return (
                <Pressable
                  key={interest.id}
                  onPress={() => toggleInterest(interest.id)}
                  style={styles.gridCell}
                >
                  <GlassCard
                    borderRadius="xl"
                    style={[
                      styles.card,
                      {
                        borderColor: isSelected ? interest.color : 'rgba(255,255,255,0.06)',
                        backgroundColor: isSelected
                          ? `${interest.color}12`
                          : 'rgba(255,255,255,0.01)',
                      },
                    ]}
                  >
                    <Text style={styles.emoji}>{interest.emoji}</Text>
                    <Spacer size="xs" />
                    <Text variant="bodySmall" weight="bold" color={colors.text} align="center">
                      {interest.name}
                    </Text>
                  </GlassCard>
                </Pressable>
              );
            })}
          </View>
        </ScrollView>

        <Spacer size="lg" />

        <AnimatedButton
          title="Continue"
          disabled={selectedInterests.length === 0}
          onPress={() => router.push('/(onboarding)/profile-setup')}
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
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  gridCell: {
    width: '48%',
  },
  card: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    paddingHorizontal: 10,
    borderWidth: 1,
    height: 110,
  },
  emoji: {
    fontSize: 28,
  },
});
