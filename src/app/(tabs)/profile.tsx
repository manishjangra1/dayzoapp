import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useRouter } from 'expo-router';
import { Award, LogOut, Moon, Sparkles } from 'lucide-react-native';
import React, { useCallback } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { UserAvatar } from '../../components/common/UserAvatar';
import { GlassCard } from '../../design-system/primitives/GlassCard';
import { Spacer } from '../../design-system/primitives/Spacer';
import { Text } from '../../design-system/primitives/Text';
import { useDialog } from '../../design-system/theme/DialogProvider';
import { useTheme } from '../../design-system/theme/ThemeProvider';
import { radius } from '../../design-system/tokens/radius';
import api from '../../services/api';
import { useAuthStore } from '../../store/authStore';

export default function ProfileScreen() {
  const { colors, isDark, setTheme, theme } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, clearAuth, updateUser } = useAuthStore();
  const dialog = useDialog();

  useFocusEffect(
    useCallback(() => {
      const fetchLatestProfile = async () => {
        try {
          const res = await api.get('/users/profile');
          updateUser(res.data);
        } catch (e) {
          console.warn('Failed to fetch latest user profile:', e);
        }
      };
      fetchLatestProfile();
    }, [])
  );

  const handleEditBio = () => {
    let localBio = user?.bio || '';
    dialog.show({
      title: 'Update Biography',
      message: (
        <View style={{ width: '100%', paddingVertical: 8 }}>
          <TextInput
            defaultValue={user?.bio || ''}
            onChangeText={(txt) => { localBio = txt; }}
            placeholder="Describe your habits focus..."
            placeholderTextColor={colors.textTertiary}
            multiline
            numberOfLines={3}
            style={{
              width: '100%',
              backgroundColor: colors.surfaceElevated,
              borderColor: colors.borderSubtle,
              borderWidth: 1,
              borderRadius: radius.md,
              color: colors.text,
              padding: 12,
              minHeight: 80,
              fontSize: 14,
              textAlignVertical: 'top',
            }}
          />
        </View>
      ),
      primaryAction: {
        text: 'SAVE',
        variant: 'primary',
        onPress: async () => {
          try {
            const res = await api.patch('/users/profile', { bio: localBio });
            updateUser(res.data);
            dialog.show({
              title: 'Success',
              message: 'Your biography has been successfully updated!',
              primaryAction: { text: 'OK' }
            });
          } catch (e) {
            console.warn('Failed to update bio:', e);
            dialog.show({
              title: 'Error',
              message: 'Failed to save bio settings. Please try again.',
              primaryAction: { text: 'OK' }
            });
          }
        }
      },
      secondaryAction: {
        text: 'CANCEL',
        variant: 'ghost',
      }
    });
  };

  const handleLogout = () => {
    dialog.show({
      title: 'Logout Session',
      message: 'Are you sure you want to end your active Dayzo session?',
      primaryAction: {
        text: 'LOGOUT',
        variant: 'danger',
        onPress: async () => {
          await clearAuth();
          router.replace('/(auth)/login');
        },
      },
      secondaryAction: {
        text: 'CANCEL',
        variant: 'ghost',
      },
    });
  };

  // Real 28-day consistency heatmap data from user profile (fallback to empty blocks)
  const heatmapData = user?.heatmapData || Array.from({ length: 28 }, (_, i) => ({
    day: i + 1,
    completed: false,
  }));

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>

      {/* Background ambient gradient orbs */}
      <View style={StyleSheet.absoluteFill}>
        <LinearGradient
          colors={isDark ? ['#08080C', '#0E0E12'] : ['#F4F5F7', '#EBEFF3']}
          style={StyleSheet.absoluteFill}
        />
        {isDark && (
          <>
            <LinearGradient
              colors={['rgba(255, 75, 43, 0.07)', 'transparent']}
              style={[styles.ambientOrb, { top: -60, left: -60, width: 280, height: 280 }]}
            />
            <LinearGradient
              colors={['rgba(0, 242, 254, 0.05)', 'transparent']}
              style={[styles.ambientOrb, { bottom: 120, right: -80, width: 340, height: 340 }]}
            />
          </>
        )}
      </View>

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8, borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)' }]}>
        <Text variant="h2" weight="bold" color={colors.text}>
          Profile
        </Text>
        <Text variant="caption" color={colors.textTertiary}>
          Your habit analytical dashboard.
        </Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.scrollContent, { paddingBottom: 90 + insets.bottom }]}>
        <Spacer size="md" />

        {/* Master Dayzo ID card */}
        <GlassCard borderRadius="2xl" intensity="high" style={[styles.profileCard, { borderColor: colors.primary }]}>
          <LinearGradient
            colors={['rgba(255, 75, 43, 0.06)', 'transparent']}
            style={[StyleSheet.absoluteFill, { borderRadius: radius.xl }]}
          />

          <View style={styles.cardHeader}>
            <UserAvatar uri={user?.avatar} username={user?.username} size="lg" borderRankColor={colors.primary} />
            <View style={[styles.rankBadge, { backgroundColor: 'rgba(255, 75, 43, 0.15)', borderColor: 'rgba(255, 75, 43, 0.3)', borderWidth: 1 }]}>
              <Text variant="micro" weight="bold" color={colors.primary} style={{ letterSpacing: 1.2 }}>
                {user?.title?.toUpperCase() || 'ROOKIE'}
              </Text>
            </View>
          </View>

          <Spacer size="md" />

          <Text variant="h1" weight="display" color={colors.text}>
            @{user?.username || 'user'}
          </Text>
          <Text variant="caption" color={colors.textSecondary} style={{ marginTop: 2, fontWeight: '600' }}>
            Habiteer Agent • Level {user?.level || 1}
          </Text>
          {user?.bio ? (
            <Text variant="bodySmall" color={colors.textSecondary} style={{ marginTop: 8, fontStyle: 'italic', lineHeight: 18 }}>
              "{user.bio}"
            </Text>
          ) : (
            <Text variant="caption" color={colors.textTertiary} style={{ marginTop: 8, fontStyle: 'italic', opacity: 0.7 }}>
              No biography written yet. Click "Update Biography" below to share your daily habit focus!
            </Text>
          )}

          <Spacer size="lg" />
          <View style={[styles.statsDivider, { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)' }]} />
          <Spacer size="md" />

          <View style={styles.statsGrid}>
            <View style={styles.statCell}>
              <Text variant="h2" weight="bold" color={colors.text}>{user?.xp || 0}</Text>
              <Text variant="micro" weight="bold" color={colors.textTertiary}>TOTAL XP</Text>
            </View>
            <View style={styles.statCell}>
              <Text variant="h2" weight="bold" color={colors.primary}>{user?.streak || 0}🔥</Text>
              <Text variant="micro" weight="bold" color={colors.textTertiary}>STREAK</Text>
            </View>
            <View style={styles.statCell}>
              <Text variant="h2" weight="bold" color={colors.text}>{user?.longestStreak || 0}👑</Text>
              <Text variant="micro" weight="bold" color={colors.textTertiary}>LONGEST</Text>
            </View>
            <View style={styles.statCell}>
              <Text variant="h2" weight="bold" color={colors.text}>{user?.streakFreezes || 0}</Text>
              <Text variant="micro" weight="bold" color={colors.textTertiary}>FREEZES</Text>
            </View>
          </View>
        </GlassCard>

        <Spacer size="lg" />

        {/* 30-Day Consistency Heatmap Grid */}
        <Text variant="caption" weight="bold" color={colors.textTertiary} style={styles.sectionTitle}>
          30-DAY CONSISTENCY HEATMAP
        </Text>

        <GlassCard borderRadius="2xl" style={[styles.cabinetCard, { borderColor: 'rgba(255,255,255,0.05)' }]}>
          <Text variant="micro" weight="bold" color={colors.textSecondary} style={{ marginBottom: 12 }}>
            CONSISTENCY INTENSITY GRID
          </Text>
          <View style={styles.heatmapGrid}>
            {heatmapData.map((data) => (
              <View
                key={data.day}
                style={[
                  styles.heatmapBlock,
                  {
                    backgroundColor: data.completed
                      ? 'rgba(52, 211, 153, 0.65)'
                      : isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)',
                    borderColor: data.completed ? 'rgba(52, 211, 153, 0.9)' : 'transparent',
                    borderWidth: data.completed ? 1 : 0,
                  }
                ]}
              />
            ))}
          </View>
          <View style={styles.heatmapLegend}>
            <Text variant="micro" color={colors.textTertiary}>Less Active</Text>
            <View style={styles.legendScale}>
              <View style={[styles.heatmapBlock, { backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)' }]} />
              <View style={[styles.heatmapBlock, { backgroundColor: 'rgba(52, 211, 153, 0.35)' }]} />
              <View style={[styles.heatmapBlock, { backgroundColor: 'rgba(52, 211, 153, 0.65)' }]} />
            </View>
            <Text variant="micro" color={colors.textTertiary}>Streak Max</Text>
          </View>
        </GlassCard>

        <Spacer size="lg" />

        {/* Badge cabinet */}
        <Text variant="caption" weight="bold" color={colors.textTertiary} style={styles.sectionTitle}>
          ACHIEVEMENTS CABINET
        </Text>

        <GlassCard borderRadius="2xl" style={[styles.cabinetCard, { borderColor: 'rgba(255,255,255,0.05)' }]}>
          {user?.badges && user.badges.length > 0 ? (
            <View style={styles.badgeRow}>
              {user.badges.map((badge: any) => {
                return (
                  <View key={badge.id} style={[styles.badgeItem, { backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)', borderColor: colors.borderSubtle }]}>
                    <LinearGradient
                      colors={['rgba(255, 75, 43, 0.05)', 'transparent']}
                      style={[StyleSheet.absoluteFill, { borderRadius: radius.md }]}
                    />
                    <Text
                      variant="h1"
                      align="center"
                      style={{
                        fontSize: 28,
                        lineHeight: 38,
                        textShadowColor: 'rgba(255,75,43,0.3)',
                        textShadowRadius: 6,
                        textShadowOffset: { width: 0, height: 0 },
                      }}
                    >
                      {badge.icon}
                    </Text>
                    <Spacer size="xs" />
                    <Text variant="micro" weight="bold" color={colors.text} align="center" numberOfLines={1}>
                      {badge.title}
                    </Text>
                  </View>
                );
              })}
            </View>
          ) : (
            <View style={styles.emptyCabinet}>
              <Award size={36} color={colors.textSecondary} style={{ opacity: 0.3, marginBottom: 8 }} />
              <Text variant="bodySmall" weight="bold" color={colors.textSecondary} align="center">
                Cabinet is currently empty.
              </Text>
              <Text variant="caption" color={colors.textTertiary} align="center" style={{ marginTop: 2 }}>
                Complete daily habits to unlock medals and badges!
              </Text>
            </View>
          )}
        </GlassCard>

        <Spacer size="lg" />

        {/* Session Utilities */}
        <Text variant="caption" weight="bold" color={colors.textTertiary} style={styles.sectionTitle}>
          UTILITIES
        </Text>

        <GlassCard borderRadius="2xl" style={[styles.utilitiesCard, { borderColor: 'rgba(255,255,255,0.05)' }]}>

          {/* Bio update btn */}
          <Pressable onPress={handleEditBio} style={styles.utilityBtn}>
            <Sparkles size={18} color={colors.primary} style={{ marginRight: 12 }} />
            <Text variant="bodySmall" weight="bold" color={colors.text}>
              Update Biography
            </Text>
          </Pressable>

          <View style={{ height: 1, backgroundColor: colors.borderSubtle, marginHorizontal: 16 }} />

          {/* Premium Theme Switcher Segment */}
          <View style={styles.themeUtilityRow}>
            <View style={styles.themeLabelCol}>
              <Moon size={18} color={colors.accentSecondary} style={{ marginRight: 12 }} />
              <Text variant="bodySmall" weight="bold" color={colors.text}>
                Theme
              </Text>
            </View>
            <View style={styles.toggleRow}>
              {(['light', 'dark', 'auto'] as const).map((t) => (
                <Pressable
                  key={t}
                  onPress={() => setTheme(t)}
                  style={[
                    styles.themeToggleBtn,
                    {
                      backgroundColor: theme === t ? colors.primary : isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)',
                      borderColor: theme === t ? colors.primary : colors.borderSubtle,
                    }
                  ]}
                >
                  <Text variant="micro" weight="bold" color={theme === t ? colors.surface : colors.textSecondary}>
                    {t.toUpperCase()}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          <Pressable onPress={handleLogout} style={styles.utilityBtn}>
            <LogOut size={18} color={colors.error} style={{ marginRight: 12 }} />
            <Text variant="bodySmall" weight="bold" color={colors.error}>
              Logout
            </Text>
          </Pressable>
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
  ambientOrb: {
    position: 'absolute',
    borderRadius: 9999,
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
  profileCard: {
    padding: 20,
    position: 'relative',
    overflow: 'hidden',
    borderWidth: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rankBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 4,
  },
  statsDivider: {
    width: '100%',
    height: 1,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCell: {
    alignItems: 'center',
    flex: 1,
  },
  sectionTitle: {
    marginLeft: 4,
    marginBottom: 6,
    letterSpacing: 1,
    marginTop: 16,
  },
  cabinetCard: {
    padding: 16,
    borderWidth: 1,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  badgeItem: {
    width: '22%',
    marginHorizontal: 5,
    marginVertical: 6,
    minHeight: 90,
    borderRadius: radius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 4,
    position: 'relative',
  },
  emptyCabinet: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  utilitiesCard: {
    overflow: 'hidden',
    borderWidth: 1,
  },
  utilityBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  themeUtilityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  themeLabelCol: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  toggleRow: {
    flexDirection: 'row',
    gap: 6,
  },
  themeToggleBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radius.sm,
    borderWidth: 1,
  },
  heatmapGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    justifyContent: 'center',
    marginVertical: 4,
  },
  heatmapBlock: {
    width: 22,
    height: 22,
    borderRadius: radius.xs,
  },
  heatmapLegend: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 14,
    paddingHorizontal: 4,
  },
  legendScale: {
    flexDirection: 'row',
    gap: 4,
  },
});
