import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Pressable, ScrollView, RefreshControl, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Trophy, Award } from 'lucide-react-native';
import api from '../../services/api';
import { useTheme } from '../../design-system/theme/ThemeProvider';
import { Text } from '../../design-system/primitives/Text';
import { GlassCard } from '../../design-system/primitives/GlassCard';
import { Surface } from '../../design-system/primitives/Surface';
import { UserAvatar } from '../../components/common/UserAvatar';
import { Spacer } from '../../design-system/primitives/Spacer';

export default function LeaderboardScreen() {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();

  const [globalLeaderboard, setGlobalLeaderboard] = useState<any[]>([]);
  const [friendsLeaderboard, setFriendsLeaderboard] = useState<any[]>([]);
  const [scope, setScope] = useState<'global' | 'friends'>('global');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchLeaderboards = async () => {
    try {
      const resGlobal = await api.get('/leaderboard/global');
      setGlobalLeaderboard(resGlobal.data);

      try {
        const resFriends = await api.get('/leaderboard/friends');
        setFriendsLeaderboard(resFriends.data);
      } catch (e) {
        setFriendsLeaderboard([]);
      }
    } catch (e) {
      console.warn('Failed to load leaderboards:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchLeaderboards();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchLeaderboards();
  };

  const list = scope === 'global' ? globalLeaderboard : friendsLeaderboard;
  const top3 = list.slice(0, 3);
  const remainder = list.slice(3);

  // Re-order top3 to display: [Rank 2, Rank 1, Rank 3] for visual podium alignment
  const podiumOrder = () => {
    const ordered = [];
    if (top3[1]) ordered.push({ item: top3[1], rank: 2 });
    if (top3[0]) ordered.push({ item: top3[0], rank: 1 });
    if (top3[2]) ordered.push({ item: top3[2], rank: 3 });
    return ordered;
  };

  const orderedPodium = podiumOrder();

  const getRankMedal = (rank: number) => {
    switch (rank) {
      case 1:
        return '🥇';
      case 2:
        return '🥈';
      case 3:
        return '🥉';
      default:
        return `${rank}`;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8, borderColor: colors.borderSubtle }]}>
        <Text variant="h2" weight="bold" color={colors.text}>
          Arena
        </Text>
        <Text variant="caption" color={colors.textTertiary}>
          Streak metrics & ranking.
        </Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        <Spacer size="md" />

        {/* Global/Friends toggle switcher */}
        <Surface elevation="raised" borderRadius="full" style={styles.scopeSwitcher}>
          <Pressable
            onPress={() => setScope('global')}
            style={[styles.scopeBtn, scope === 'global' && { backgroundColor: colors.primary }]}
          >
            <Text variant="caption" weight="bold" color={scope === 'global' ? colors.surface : colors.textSecondary}>
              GLOBAL ARENA
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setScope('friends')}
            style={[styles.scopeBtn, scope === 'friends' && { backgroundColor: colors.primary }]}
          >
            <Text variant="caption" weight="bold" color={scope === 'friends' ? colors.surface : colors.textSecondary}>
              MY FRIENDS
            </Text>
          </Pressable>
        </Surface>

        <Spacer size="lg" />

        {/* 3D Visual Podium Spotlights */}
        {top3.length > 0 ? (
          <View style={styles.podiumContainer}>
            {/* Display Rank 2 (Left) */}
            {top3[1] && (
              <View style={styles.podiumCol}>
                <UserAvatar uri={top3[1].avatar} username={top3[1].username} size="md" borderRankColor="rgba(255,255,255,0.2)" />
                <Spacer size="xs" />
                <Text variant="caption" weight="bold" color={colors.textSecondary} numberOfLines={1}>
                  @{top3[1].username}
                </Text>
                <Text variant="micro" weight="bold" color={colors.primary}>
                  {top3[1].xp} XP
                </Text>
                <Surface elevation="raised" style={[styles.podiumPillar, { height: 70, borderTopColor: 'rgba(255,255,255,0.1)' }]}>
                  <Text variant="h1" weight="display" color={colors.textTertiary}>
                    2
                  </Text>
                </Surface>
              </View>
            )}

            {/* Display Rank 1 (Center) */}
            {top3[0] && (
              <View style={[styles.podiumCol, styles.centerPillarWrapper]}>
                <Trophy size={20} color="#FFD700" style={styles.trophyIcon} />
                <UserAvatar uri={top3[0].avatar} username={top3[0].username} size="lg" borderRankColor="#FFD700" />
                <Spacer size="xs" />
                <Text variant="bodySmall" weight="bold" color={colors.text} numberOfLines={1}>
                  @{top3[0].username}
                </Text>
                <Text variant="caption" weight="bold" color={colors.primary}>
                  {top3[0].xp} XP
                </Text>
                <Surface elevation="floating" style={[styles.podiumPillar, { height: 100, borderTopColor: '#FFD700' }]}>
                  <Text variant="hero" weight="display" color="#FFD700">
                    1
                  </Text>
                </Surface>
              </View>
            )}

            {/* Display Rank 3 (Right) */}
            {top3[2] && (
              <View style={styles.podiumCol}>
                <UserAvatar uri={top3[2].avatar} username={top3[2].username} size="md" borderRankColor="rgba(255,255,255,0.1)" />
                <Spacer size="xs" />
                <Text variant="caption" weight="bold" color={colors.textSecondary} numberOfLines={1}>
                  @{top3[2].username}
                </Text>
                <Text variant="micro" weight="bold" color={colors.primary}>
                  {top3[2].xp} XP
                </Text>
                <Surface elevation="raised" style={[styles.podiumPillar, { height: 50, borderTopColor: 'rgba(255,255,255,0.05)' }]}>
                  <Text variant="h2" weight="display" color={colors.textTertiary}>
                    3
                  </Text>
                </Surface>
              </View>
            )}
          </View>
        ) : (
          <Surface elevation="raised" borderRadius="2xl" bordered style={styles.emptyPodium}>
            <Trophy size={40} color={colors.textSecondary} style={{ opacity: 0.3, marginBottom: 12 }} />
            <Text variant="bodySmall" weight="bold" color={colors.textSecondary}>
              Podium ranks loading...
            </Text>
          </Surface>
        )}

        <Spacer size="lg" />

        {/* Remainder ranks listing */}
        <Surface elevation="raised" borderRadius="2xl" bordered style={styles.ranksCard}>
          {remainder.length === 0 && top3.length === 0 ? (
            <View style={styles.emptyRanks}>
              <Award size={24} color={colors.textTertiary} />
              <Text variant="caption" color={colors.textTertiary} style={{ marginTop: 6 }}>
                Compete daily to register rankings!
              </Text>
            </View>
          ) : (
            remainder.map((item, idx) => {
              const globalRank = idx + 4;
              return (
                <View key={idx} style={[styles.rankRow, { borderBottomColor: colors.borderSubtle }]}>
                  <View style={styles.rankRowLeft}>
                    <Text variant="bodySmall" weight="bold" color={colors.textTertiary} style={styles.rankNum}>
                      {globalRank}
                    </Text>
                    <UserAvatar uri={item.avatar} username={item.username} size="sm" />
                    <View style={styles.rankInfo}>
                      <Text variant="bodySmall" weight="bold" color={colors.text}>
                        @{item.username}
                      </Text>
                      <Text variant="micro" color={colors.textTertiary}>
                        Level {item.level || 1} • {item.title || 'Rookie'}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.rankRowRight}>
                    <Text variant="bodySmall" weight="bold" color={colors.text}>
                      {item.xp} <Text variant="micro" color={colors.textTertiary}>XP</Text>
                    </Text>
                    <Text variant="micro" weight="bold" color={colors.primary}>
                      {item.streak || 0}🔥
                    </Text>
                  </View>
                </View>
              );
            })
          )}
        </Surface>
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
  scopeSwitcher: {
    flexDirection: 'row',
    padding: 4,
  },
  scopeBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 9999,
  },
  podiumContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    paddingHorizontal: 8,
    marginTop: 20,
  },
  podiumCol: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  centerPillarWrapper: {
    zIndex: 10,
    transform: [{ scale: 1.05 }],
  },
  trophyIcon: {
    marginBottom: 4,
  },
  podiumPillar: {
    width: '90%',
    borderTopWidth: 3,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  emptyPodium: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ranksCard: {
    overflow: 'hidden',
  },
  emptyRanks: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  rankRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  rankNum: {
    width: 24,
    textAlign: 'center',
  },
  rankInfo: {
    justifyContent: 'center',
  },
  rankRowRight: {
    alignItems: 'flex-end',
    gap: 2,
  },
});
