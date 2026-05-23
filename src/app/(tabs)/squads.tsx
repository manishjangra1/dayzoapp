import React from 'react';
import { StyleSheet, View, ScrollView, Platform } from 'react-native';
import { Award, ShieldAlert, Sparkles, Users, Lock, ChevronRight, Zap } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../design-system/theme/ThemeProvider';
import { Text } from '../../design-system/primitives/Text';
import { GlassCard } from '../../design-system/primitives/GlassCard';
import { Surface } from '../../design-system/primitives/Surface';
import { Spacer } from '../../design-system/primitives/Spacer';
import { AnimatedButton } from '../../design-system/primitives/AnimatedButton';
import { radius } from '../../design-system/tokens/radius';

export default function SquadsScreen() {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8, borderColor: colors.borderSubtle }]}>
        <Text variant="h2" weight="bold" color={colors.text}>
          Squads
        </Text>
        <Text variant="caption" color={colors.textTertiary}>
          Collaborative habit networks.
        </Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <Spacer size="md" />

        {/* Feature Lock callout */}
        <Surface elevation="raised" borderRadius="2xl" bordered style={styles.lockCard}>
          <Users size={32} color={colors.primary} style={{ marginBottom: 12 }} />
          <Text variant="h3" weight="bold" color={colors.text} align="center">
            Cooperative Streaks Coming Soon
          </Text>
          <Text variant="caption" color={colors.textSecondary} align="center" style={{ marginTop: 4, lineHeight: 16 }}>
            In Phase 5, we are rolling out full cooperative squads! Form circles with up to 5 friends, trigger streak XP multipliers, and engage in direct squad vs squad challenges.
          </Text>

          <Spacer size="xl" />

          <View style={styles.statsOverview}>
            <View style={styles.statCell}>
              <Text variant="h3" weight="bold" color={colors.text}>5</Text>
              <Text variant="micro" color={colors.textTertiary}>MAX MEMBERS</Text>
            </View>
            <View style={[styles.divider, { backgroundColor: colors.borderSubtle }]} />
            <View style={styles.statCell}>
              <Text variant="h3" weight="bold" color={colors.text}>1.5x</Text>
              <Text variant="micro" color={colors.textTertiary}>XP MULTIPLIER</Text>
            </View>
            <View style={[styles.divider, { backgroundColor: colors.borderSubtle }]} />
            <View style={styles.statCell}>
              <Text variant="h3" weight="bold" color={colors.text}>Weekly</Text>
              <Text variant="micro" color={colors.textTertiary}>CLASHES</Text>
            </View>
          </View>
        </Surface>

        <Spacer size="lg" />

        <Text variant="caption" weight="bold" color={colors.textTertiary} style={styles.sectionTitle}>
          SQUAD MECHANICS
        </Text>

        <GlassCard borderRadius="xl" style={styles.infoCard}>
          <View style={styles.bulletItem}>
            <Zap size={16} color={colors.primary} />
            <View style={styles.bulletText}>
              <Text variant="bodySmall" weight="bold" color={colors.text}>
                Streak Protection Pact
              </Text>
              <Text variant="caption" color={colors.textSecondary}>
                If one member completes their challenge, it gives a minor backup shield to teammates.
              </Text>
            </View>
          </View>
          
          <Spacer size="md" />

          <View style={styles.bulletItem}>
            <Sparkles size={16} color="#8A2387" />
            <View style={styles.bulletText}>
              <Text variant="bodySmall" weight="bold" color={colors.text}>
                Collaborative Clashes
              </Text>
              <Text variant="caption" color={colors.textSecondary}>
                Enter your squad into cooperative habit challenges to win premium badges together.
              </Text>
            </View>
          </View>
        </GlassCard>

        <Spacer size="5xl" />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  lockCard: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsOverview: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
    paddingTop: 16,
  },
  statCell: {
    flex: 1,
    alignItems: 'center',
  },
  divider: {
    width: 1,
    height: 32,
  },
  sectionTitle: {
    marginLeft: 4,
    marginBottom: 6,
    letterSpacing: 1,
  },
  infoCard: {
    padding: 16,
    gap: 12,
  },
  bulletItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  bulletText: {
    flex: 1,
  },
});
