import React, { useEffect, useState } from 'react';
import { StyleSheet, View, ScrollView, Platform, TextInput, Alert, Clipboard, ActivityIndicator, Pressable, RefreshControl } from 'react-native';
import { Award, ShieldAlert, Sparkles, Users, Lock, ChevronRight, Zap, Copy, LogOut, PlusCircle, UserCheck } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import api from '../../services/api';
import { useTheme } from '../../design-system/theme/ThemeProvider';
import { Text } from '../../design-system/primitives/Text';
import { GlassCard } from '../../design-system/primitives/GlassCard';
import { Surface } from '../../design-system/primitives/Surface';
import { Spacer } from '../../design-system/primitives/Spacer';
import { AnimatedButton } from '../../design-system/primitives/AnimatedButton';
import { UserAvatar } from '../../components/common/UserAvatar';
import { radius } from '../../design-system/tokens/radius';
import { StreakFlame } from '../../features/home/components/StreakFlame';

interface SquadMember {
  id: string;
  username: string;
  avatar?: string;
  xp: number;
  level: number;
  streak: number;
}

interface Squad {
  id: string;
  name: string;
  avatar: string;
  inviteCode: string;
  xp: number;
  members: SquadMember[];
}

export default function SquadsScreen() {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();

  const [mySquad, setMySquad] = useState<Squad | null>(null);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Forms state
  const [joinCode, setJoinCode] = useState('');
  const [squadName, setSquadName] = useState('');
  const [createLoading, setCreateLoading] = useState(false);
  const [joinLoading, setJoinLoading] = useState(false);
  const [leaveLoading, setLeaveLoading] = useState(false);

  const fetchSquadDetails = async () => {
    try {
      // 1. Fetch user's squad
      const resMySquad = await api.get('/squads/my-squad');
      setMySquad(resMySquad.data);

      // 2. Fetch squad leaderboard
      const resLeaderboard = await api.get('/squads/leaderboard');
      setLeaderboard(resLeaderboard.data);
    } catch (e) {
      console.warn('Failed to load squad statistics:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchSquadDetails();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchSquadDetails();
  };

  const handleCreateSquad = async () => {
    if (!squadName.trim()) {
      Alert.alert('Required Name', 'Please enter a name for your new squad.');
      return;
    }

    try {
      setCreateLoading(true);
      const res = await api.post('/squads/create', { name: squadName.trim() });
      Alert.alert('Success', `Squad "${res.data.name}" has been created! Share your invite code to invite teammates.`);
      setMySquad(res.data);
      setSquadName('');
      fetchSquadDetails();
    } catch (e: any) {
      Alert.alert('Failed to Create', e.response?.data?.message || 'Failed to create squad.');
    } finally {
      setCreateLoading(false);
    }
  };

  const handleJoinSquad = async () => {
    if (!joinCode.trim() || joinCode.trim().length < 4) {
      Alert.alert('Invalid Code', 'Please enter a valid squad invite code.');
      return;
    }

    try {
      setJoinLoading(true);
      const res = await api.post('/squads/join', { inviteCode: joinCode.trim().toUpperCase() });
      Alert.alert('Success', `Successfully joined squad: "${res.data.name}"!`);
      setMySquad(res.data);
      setJoinCode('');
      fetchSquadDetails();
    } catch (e: any) {
      Alert.alert('Failed to Join', e.response?.data?.message || 'Invalid invite code or squad is full.');
    } finally {
      setJoinLoading(false);
    }
  };

  const handleLeaveSquad = async () => {
    if (!mySquad) return;

    Alert.alert('Leave Squad', `Are you sure you want to leave "${mySquad.name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Leave',
        style: 'destructive',
        onPress: async () => {
          try {
            setLeaveLoading(true);
            await api.post('/squads/leave');
            Alert.alert('Success', 'You have left the squad.');
            setMySquad(null);
            fetchSquadDetails();
          } catch (e: any) {
            Alert.alert('Error', e.response?.data?.message || 'Failed to leave squad.');
          } finally {
            setLeaveLoading(false);
          }
        },
      },
    ]);
  };

  const copyToClipboard = () => {
    if (mySquad?.inviteCode) {
      Clipboard.setString(mySquad.inviteCode);
      Alert.alert('Copied', 'Invite code copied to clipboard!');
    }
  };

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

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Spacer size="sm" />
          <Text variant="caption" color={colors.textTertiary}>Loading squad alliances...</Text>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
          }
        >
          <Spacer size="md" />

          {mySquad ? (
            /* Active user squad layout */
            <View>
              {/* Squad Header Card */}
              <Surface elevation="raised" borderRadius="2xl" bordered style={styles.squadHeroCard}>
                <View style={styles.heroRow}>
                  <UserAvatar uri={mySquad.avatar} username={mySquad.name} size="lg" borderRankColor={colors.accent} />
                  <View style={styles.heroDetails}>
                    <Text variant="h2" weight="bold" color={colors.text}>
                      {mySquad.name}
                    </Text>
                    <Text variant="caption" color={colors.textSecondary} style={{ marginTop: 2 }}>
                      Invite Code: <Text variant="caption" weight="bold" color={colors.primary}>{mySquad.inviteCode}</Text>
                    </Text>
                    <Spacer size="xs" />
                    <View style={styles.pillRow}>
                      <Pressable onPress={copyToClipboard} style={[styles.actionPill, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}>
                        <Copy size={11} color={colors.textSecondary} style={{ marginRight: 4 }} />
                        <Text variant="micro" weight="bold" color={colors.textSecondary}>Copy Code</Text>
                      </Pressable>
                      <View style={[styles.memberCountPill, { backgroundColor: 'rgba(255, 75, 43, 0.1)' }]}>
                        <Users size={11} color={colors.primary} style={{ marginRight: 4 }} />
                        <Text variant="micro" weight="bold" color={colors.primary}>{mySquad.members.length}/5 Members</Text>
                      </View>
                    </View>
                  </View>
                </View>

                <Spacer size="lg" />
                <View style={[styles.divider, { backgroundColor: colors.borderSubtle }]} />
                <Spacer size="md" />

                <View style={styles.xpRow}>
                  <View>
                    <Text variant="micro" color={colors.textTertiary}>TOTAL ALLIANCE XP</Text>
                    <Text variant="h2" weight="bold" color={colors.text}>{mySquad.xp} XP</Text>
                  </View>
                  <View style={[styles.multiplierPill, { backgroundColor: colors.accent + '20' }]}>
                    <Zap size={14} color={colors.accent} fill={colors.accent} style={{ marginRight: 4 }} />
                    <Text variant="caption" weight="bold" color={colors.accent}>
                      {1 + mySquad.members.length * 0.1}x Boost
                    </Text>
                  </View>
                </View>
              </Surface>

              <Spacer size="lg" />

              {/* Members List */}
              <Text variant="caption" weight="bold" color={colors.textTertiary} style={styles.sectionTitle}>
                SQUAD TEAMMATES
              </Text>

              <Surface elevation="raised" borderRadius="2xl" bordered style={styles.membersCard}>
                {mySquad.members
                  .sort((a, b) => b.xp - a.xp)
                  .map((member, index) => (
                    <View
                      key={member.id}
                      style={[
                        styles.memberRow,
                        index < mySquad.members.length - 1 && { borderBottomColor: colors.borderSubtle },
                      ]}
                    >
                      <View style={styles.memberLeft}>
                        <UserAvatar uri={member.avatar} username={member.username} size="sm" />
                        <View style={styles.memberInfo}>
                          <Text variant="bodySmall" weight="bold" color={colors.text}>
                            @{member.username}
                          </Text>
                          <Text variant="micro" color={colors.textTertiary}>
                            Level {member.level}
                          </Text>
                        </View>
                      </View>

                      <View style={styles.memberRight}>
                        <Text variant="bodySmall" weight="bold" color={colors.text}>
                          {member.xp} <Text variant="micro" color={colors.textTertiary}>XP</Text>
                        </Text>
                        {member.streak > 0 && <StreakFlame streak={member.streak} size={14} showText={true} />}
                      </View>
                    </View>
                  ))}
              </Surface>

              <Spacer size="xl" />

              <AnimatedButton
                title="Leave Alliance"
                onPress={handleLeaveSquad}
                variant="danger"
                loading={leaveLoading}
                borderRadius="md"
              />
            </View>
          ) : (
            /* Join or create squad layout */
            <View>
              {/* Feature Intro */}
              <Surface elevation="raised" borderRadius="2xl" bordered style={styles.lockCard}>
                <Users size={36} color={colors.primary} style={{ marginBottom: 12 }} />
                <Text variant="h3" weight="bold" color={colors.text} align="center">
                  Form a Habit Alliance
                </Text>
                <Text variant="caption" color={colors.textSecondary} align="center" style={{ marginTop: 4, lineHeight: 16 }}>
                  Create or join a cooperative squad of up to 5 friends. Build concurrent habit chains to boost XP multipliers up to 1.5x and rise on the alliances leaderboard!
                </Text>
              </Surface>

              <Spacer size="lg" />

              {/* Action panels */}
              <GlassCard borderRadius="2xl" style={styles.actionCard}>
                {/* Join Squad */}
                <Text variant="bodySmall" weight="bold" color={colors.text}>
                  Join Existing Alliance
                </Text>
                <Spacer size="xs" />
                <View style={[styles.inputContainer, { backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)', borderColor: colors.border }]}>
                  <TextInput
                    placeholder="Enter 6-digit invite code (e.g. AX79Q1)"
                    placeholderTextColor={colors.textTertiary}
                    value={joinCode}
                    onChangeText={setJoinCode}
                    autoCapitalize="characters"
                    maxLength={10}
                    style={[styles.input, { color: colors.text }]}
                  />
                </View>
                <Spacer size="sm" />
                <AnimatedButton
                  title="Join Squad"
                  onPress={handleJoinSquad}
                  loading={joinLoading}
                  borderRadius="md"
                />

                <Spacer size="xl" />
                <View style={[styles.cardDivider, { backgroundColor: colors.borderSubtle }]} />
                <Spacer size="xl" />

                {/* Create Squad */}
                <Text variant="bodySmall" weight="bold" color={colors.text}>
                  Create New Alliance
                </Text>
                <Spacer size="xs" />
                <View style={[styles.inputContainer, { backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)', borderColor: colors.border }]}>
                  <TextInput
                    placeholder="Alliance Name (e.g. Streak Titans)"
                    placeholderTextColor={colors.textTertiary}
                    value={squadName}
                    onChangeText={setSquadName}
                    style={[styles.input, { color: colors.text }]}
                  />
                </View>
                <Spacer size="sm" />
                <AnimatedButton
                  title="Create Squad"
                  onPress={handleCreateSquad}
                  loading={createLoading}
                  borderRadius="md"
                />
              </GlassCard>
            </View>
          )}

          <Spacer size="lg" />

          {/* Squad Leaderboards */}
          <Text variant="caption" weight="bold" color={colors.textTertiary} style={styles.sectionTitle}>
            TOP ALLIANCES LEADERBOARD
          </Text>

          <Surface elevation="raised" borderRadius="2xl" bordered style={styles.leaderboardCard}>
            {leaderboard.length > 0 ? (
              leaderboard.map((squad, index) => (
                <View
                  key={squad.id}
                  style={[
                    styles.leaderboardRow,
                    index < leaderboard.length - 1 && { borderBottomColor: colors.borderSubtle },
                  ]}
                >
                  <View style={styles.leaderboardRowLeft}>
                    <Text variant="bodySmall" weight="bold" color={colors.textTertiary} style={styles.rankNum}>
                      {index + 1}
                    </Text>
                    <UserAvatar uri={squad.avatar} username={squad.name} size="sm" borderRankColor={colors.accent} />
                    <View style={styles.rankInfo}>
                      <Text variant="bodySmall" weight="bold" color={colors.text}>
                        {squad.name}
                      </Text>
                      <Text variant="micro" color={colors.textTertiary}>
                        Alliance
                      </Text>
                    </View>
                  </View>

                  <View style={styles.leaderboardRowRight}>
                    <Text variant="bodySmall" weight="bold" color={colors.text}>
                      {squad.xp} <Text variant="micro" color={colors.textTertiary}>XP</Text>
                    </Text>
                  </View>
                </View>
              ))
            ) : (
              <View style={styles.emptyLeaderboard}>
                <Award size={24} color={colors.textTertiary} style={{ opacity: 0.3, marginBottom: 8 }} />
                <Text variant="caption" color={colors.textTertiary} align="center">
                  No habit alliances formed yet. Create yours to claim the top spot!
                </Text>
              </View>
            )}
          </Surface>

          <Spacer size="5xl" />
        </ScrollView>
      )}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  squadHeroCard: {
    padding: 20,
    overflow: 'hidden',
  },
  heroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  heroDetails: {
    flex: 1,
  },
  pillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 6,
  },
  actionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.sm,
    borderWidth: 1,
  },
  memberCountPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.sm,
  },
  divider: {
    width: '100%',
    height: 1,
  },
  cardDivider: {
    width: '100%',
    height: 1,
  },
  xpRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  multiplierPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radius.sm,
  },
  sectionTitle: {
    marginLeft: 4,
    marginBottom: 6,
    letterSpacing: 1,
    marginTop: 18,
  },
  membersCard: {
    overflow: 'hidden',
  },
  memberRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  memberLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  memberInfo: {
    justifyContent: 'center',
  },
  memberRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  actionCard: {
    padding: 24,
  },
  inputContainer: {
    borderWidth: 1,
    borderRadius: radius.md,
    height: 48,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  input: {
    fontSize: 14,
    height: '100%',
    padding: 0,
  },
  leaderboardCard: {
    overflow: 'hidden',
  },
  leaderboardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  leaderboardRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  rankNum: {
    width: 20,
    textAlign: 'center',
  },
  rankInfo: {
    justifyContent: 'center',
  },
  leaderboardRowRight: {
    justifyContent: 'center',
  },
  emptyLeaderboard: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
