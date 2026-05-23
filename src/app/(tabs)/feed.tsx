import React, { useEffect, useState } from 'react';
import { StyleSheet, View, TextInput, Pressable, ScrollView, RefreshControl, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Users, Plus, Zap, Heart, MessageSquare, Compass } from 'lucide-react-native';
import { useAuthStore } from '../../store/authStore';
import api from '../../services/api';
import { useTheme } from '../../design-system/theme/ThemeProvider';
import { Text } from '../../design-system/primitives/Text';
import { GlassCard } from '../../design-system/primitives/GlassCard';
import { Surface } from '../../design-system/primitives/Surface';
import { AnimatedButton } from '../../design-system/primitives/AnimatedButton';
import { Spacer } from '../../design-system/primitives/Spacer';
import { UserAvatar } from '../../components/common/UserAvatar';

export default function SocialFeedScreen() {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const { user } = useAuthStore();

  const [socialFeed, setSocialFeed] = useState<any[]>([]);
  const [friendInput, setFriendInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchFeed = async () => {
    try {
      const res = await api.get('/social/feed');
      setSocialFeed(res.data);
    } catch (e) {
      console.warn('Failed to load social feed:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchFeed();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchFeed();
  };

  const handleAddFriend = async () => {
    if (!friendInput.trim()) return;
    try {
      setActionLoading(true);
      await api.post('/social/request', {
        username: friendInput.trim().toLowerCase(),
      });
      alert('Friend request sent successfully!');
      setFriendInput('');
      fetchFeed();
    } catch (e: any) {
      alert(e.response?.data?.message || 'Failed to send friend request.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSendReaction = async (targetUserId: string, emoji: string) => {
    try {
      await api.post('/social/react', {
        targetUserId,
        emoji,
      });
      
      // Optimistic locally injected update
      setSocialFeed(
        socialFeed.map((item) => {
          if (item.user.id === targetUserId) {
            return {
              ...item,
              reactions: [...(item.reactions || []), { username: user?.username || 'You', emoji }],
            };
          }
          return item;
        })
      );
    } catch (e) {
      console.warn('Failed to send reaction:', e);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Feed Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8, borderColor: colors.borderSubtle }]}>
        <Text variant="h2" weight="bold" color={colors.text}>
          Feed
        </Text>
        <Text variant="caption" color={colors.textTertiary}>
          Habits compound in public.
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

        {/* Challenge Friends widget */}
        <Surface elevation="raised" borderRadius="2xl" bordered style={styles.addFriendCard}>
          <Text variant="body" weight="bold" color={colors.text}>
            Connect Habits
          </Text>
          <Text variant="caption" color={colors.textSecondary} style={{ marginTop: 2, marginBottom: 12 }}>
            Add users to your circle to watch their challenge completions.
          </Text>
          
          <View style={styles.inputRow}>
            <View style={[styles.inputContainer, { backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)', borderColor: colors.border }]}>
              <TextInput
                placeholder="Enter username..."
                placeholderTextColor={colors.textTertiary}
                value={friendInput}
                onChangeText={setFriendInput}
                autoCapitalize="none"
                style={[styles.input, { color: colors.text }]}
              />
            </View>
            <Pressable
              onPress={handleAddFriend}
              disabled={actionLoading}
              style={[styles.plusButton, { backgroundColor: colors.primary }]}
            >
              <Plus size={20} color={colors.surface} />
            </Pressable>
          </View>
        </Surface>

        <Spacer size="lg" />

        {/* Activity feed list */}
        {socialFeed.length === 0 ? (
          <Surface elevation="raised" borderRadius="2xl" bordered style={styles.emptyCard}>
            <Compass size={40} color={colors.textSecondary} style={{ opacity: 0.5, marginBottom: 12 }} />
            <Text variant="bodySmall" weight="bold" color={colors.textSecondary} align="center">
              No recent friend activity.
            </Text>
            <Text variant="caption" color={colors.textTertiary} align="center" style={{ marginTop: 2, paddingHorizontal: 16 }}>
              Add a companion above or invite friends to dayzo to see their progress!
            </Text>
          </Surface>
        ) : (
          socialFeed.map((item, idx) => {
            return (
              <GlassCard key={idx} borderRadius="2xl" style={styles.feedCard}>
                <View style={styles.cardHeader}>
                  <View style={styles.userInfo}>
                    <UserAvatar uri={item.user.avatar} username={item.user.username} size="sm" borderRankColor={colors.primary} />
                    <View>
                      <Text variant="bodySmall" weight="bold" color={colors.text}>
                        @{item.user.username}
                      </Text>
                      <Text variant="micro" color={colors.textTertiary}>
                        Level {item.user.level || 1} • {item.user.streak || 0}🔥 Streak
                      </Text>
                    </View>
                  </View>
                  <View style={[styles.categoryBadge, { backgroundColor: 'rgba(255, 75, 43, 0.1)' }]}>
                    <Text variant="micro" weight="bold" color={colors.primary}>
                      {item.challenge.category.toUpperCase()}
                    </Text>
                  </View>
                </View>

                {/* Challenge description box */}
                <Surface elevation="raised" borderRadius="lg" bordered style={styles.completionBox}>
                  <Text variant="bodySmall" weight="bold" color={colors.text}>
                    Completed: {item.challenge.title}
                  </Text>
                  <Text variant="caption" color={colors.textSecondary} style={{ marginTop: 2 }}>
                    {item.challenge.description}
                  </Text>
                </Surface>

                {/* Reaction Actions */}
                <View style={styles.footer}>
                  <View style={styles.reactionsShelf}>
                    {item.reactions && item.reactions.slice(0, 3).map((react: any, rIdx: number) => {
                      return (
                        <View key={rIdx} style={[styles.reactionPill, { backgroundColor: colors.surfaceElevated, borderColor: colors.borderSubtle }]}>
                          <Text style={styles.reactionText}>
                            {react.emoji} <Text variant="micro" color={colors.textSecondary}>{react.username}</Text>
                          </Text>
                        </View>
                      );
                    })}
                  </View>

                  {/* Reaction controls */}
                  <View style={styles.reactionButtons}>
                    {['🔥', '👏', '💪'].map((emoji) => (
                      <Pressable
                        key={emoji}
                        onPress={() => handleSendReaction(item.user.id, emoji)}
                        style={[styles.emojiButton, { backgroundColor: colors.surfaceElevated, borderColor: colors.borderSubtle }]}
                      >
                        <Text style={{ fontSize: 13 }}>{emoji}</Text>
                      </Pressable>
                    ))}
                  </View>
                </View>
              </GlassCard>
            );
          })
        )}
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
  addFriendCard: {
    padding: 16,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  inputContainer: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 12,
    height: 48,
    paddingHorizontal: 14,
  },
  input: {
    flex: 1,
    height: '100%',
    fontSize: 14,
  },
  plusButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyCard: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  feedCard: {
    padding: 16,
    marginVertical: 6,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  completionBox: {
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
    paddingTop: 10,
  },
  reactionsShelf: {
    flexDirection: 'row',
    gap: 6,
  },
  reactionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
  },
  reactionText: {
    fontSize: 11,
  },
  reactionButtons: {
    flexDirection: 'row',
    gap: 6,
  },
  emojiButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
