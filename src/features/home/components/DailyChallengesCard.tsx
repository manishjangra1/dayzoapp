import React, { useState } from 'react';
import { View, StyleSheet, Platform, Pressable } from 'react-native';
import { Clock, Zap, CheckCircle2, ChevronRight, ChevronDown, Share2, Compass, Flame, Users, Sparkles, BookOpen, Smile } from 'lucide-react-native';
import Animated, { FadeInUp, FadeOutUp, LinearTransition } from 'react-native-reanimated';
import { useTheme } from '../../../design-system/theme/ThemeProvider';
import { Text } from '../../../design-system/primitives/Text';
import { GlassCard } from '../../../design-system/primitives/GlassCard';
import { Surface } from '../../../design-system/primitives/Surface';
import { AnimatedButton } from '../../../design-system/primitives/AnimatedButton';
import { triggerConfetti } from '../../../utils/confetti';
import { radius } from '../../../design-system/tokens/radius';
import { Spacer } from '../../../design-system/primitives/Spacer';

export interface Challenge {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard' | string;
  xpReward: number;
  duration: number;
  completed?: boolean;
}

interface DailyChallengesCardProps {
  challenges: Challenge[];
  onComplete: (challengeId: string) => void;
  actionLoading?: boolean;
  onShare: () => void;
}

export const DailyChallengesCard: React.FC<DailyChallengesCardProps> = ({
  challenges,
  onComplete,
  actionLoading = false,
  onShare,
}) => {
  const { colors, isDark } = useTheme();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const getCategoryIcon = (category: string, size = 16, color: string) => {
    const norm = category.toLowerCase();
    switch (norm) {
      case 'fitness':
        return <Flame size={size} color={color} fill={color} />;
      case 'productivity':
        return <Zap size={size} color={color} fill={color} />;
      case 'learning':
        return <BookOpen size={size} color={color} />;
      case 'mindfulness':
        return <Smile size={size} color={color} />;
      case 'social':
        return <Users size={size} color={color} />;
      default:
        return <Compass size={size} color={color} />;
    }
  };

  const getCategoryThemeColor = (category: string) => {
    const norm = category.toLowerCase();
    switch (norm) {
      case 'fitness':
        return '#00F2FE';
      case 'productivity':
        return '#FF4B2B';
      case 'learning':
        return '#8A2387';
      case 'mindfulness':
        return '#10B981';
      case 'social':
        return '#E94057';
      default:
        return '#FF4B2B';
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleCheckboxClick = (challengeId: string, completed: boolean) => {
    if (completed) return;
    triggerConfetti();
    onComplete(challengeId);
  };

  // Mock companion count based on challenge details
  const getCompletionsCount = (title: string) => {
    return (title.length * 7) % 24 + 11;
  };

  const completedCount = challenges.filter(c => c.completed).length;

  return (
    <GlassCard
      borderRadius="2xl"
      intensity="high"
      style={[
        styles.mainCard,
        {
          borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)',
          backgroundColor: isDark ? 'rgba(20, 20, 26, 0.65)' : 'rgba(255, 255, 255, 0.85)',
        }
      ]}
    >
      <View style={styles.cardHeader}>
        <View style={styles.headerTitleCol}>
          <Text variant="caption" weight="bold" color={colors.primary} style={styles.supTitle}>
            DAILY FUEL HUB
          </Text>
          <Text variant="bodySmall" weight="bold" color={colors.textSecondary}>
            {completedCount} OF {challenges.length} COMPLETED
          </Text>
        </View>
        <Zap size={18} color={colors.primary} fill={colors.primary} />
      </View>

      <Spacer size="sm" />

      {/* Accordion List Container */}
      <View style={styles.listContainer}>
        {challenges.map((chall, index) => {
          const themeColor = getCategoryThemeColor(chall.category);
          const isExpanded = expandedId === chall.id;
          const completed = !!chall.completed;

          return (
            <Animated.View
              key={chall.id}
              layout={LinearTransition}
              style={[
                styles.itemRowWrapper,
                index < challenges.length - 1 && { borderBottomColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)' }
              ]}
            >
              {/* Interactive Row Header */}
              <Pressable
                onPress={() => toggleExpand(chall.id)}
                style={styles.itemHeaderRow}
              >
                <View style={styles.headerLeftCol}>
                  <View style={[styles.categoryIndicator, { backgroundColor: themeColor }]} />
                  <View style={styles.iconBox}>
                    {getCategoryIcon(chall.category, 15, themeColor)}
                  </View>
                  <Text
                    variant="bodySmall"
                    weight="bold"
                    color={completed ? colors.textTertiary : colors.text}
                    numberOfLines={1}
                    style={[styles.itemTitle, completed && styles.completedTitle]}
                  >
                    {chall.title}
                  </Text>
                  {isExpanded ? (
                    <ChevronDown size={14} color={colors.textTertiary} style={styles.chevron} />
                  ) : (
                    <ChevronRight size={14} color={colors.textTertiary} style={styles.chevron} />
                  )}
                </View>

                {/* Complete Mark Option (Right Checkbox) */}
                <Pressable
                  onPress={() => handleCheckboxClick(chall.id, completed)}
                  disabled={actionLoading}
                  style={styles.checkboxTouchZone}
                >
                  {completed ? (
                    <CheckCircle2 size={22} color={colors.success} fill={isDark ? 'transparent' : 'rgba(52, 211, 153, 0.1)'} />
                  ) : (
                    <View style={[styles.emptyCheckbox, { borderColor: themeColor }]} />
                  )}
                </Pressable>
              </Pressable>

              {/* Collapsible expanded section with smooth Reanimated slide/fade transitions */}
              {isExpanded && (
                <Animated.View
                  entering={FadeInUp.duration(200)}
                  exiting={FadeOutUp.duration(150)}
                  layout={LinearTransition}
                >
                  <Surface
                    elevation="flat"
                    borderRadius="lg"
                    bordered
                    style={[
                      styles.dropdownContent,
                      {
                        backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)',
                        borderColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
                      }
                    ]}
                  >
                    <Text variant="caption" color={colors.text} style={styles.dropdownDesc}>
                      {chall.description}
                    </Text>

                    <Spacer size="xs" />

                    {/* Rewards Row */}
                    <View style={styles.dropdownFooter}>
                      <View style={styles.metaPills}>
                        <View style={[styles.pill, { backgroundColor: 'rgba(255, 75, 43, 0.08)' }]}>
                          <Zap size={9} color={colors.primary} fill={colors.primary} />
                          <Text variant="micro" weight="bold" color={colors.primary}>
                            +{chall.xpReward} XP
                          </Text>
                        </View>
                        <View style={[styles.pill, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)' }]}>
                          <Clock size={9} color={colors.textSecondary} />
                          <Text variant="micro" weight="bold" color={colors.textSecondary}>
                            {chall.duration} MIN
                          </Text>
                        </View>
                      </View>

                      <Text variant="micro" color={colors.textTertiary} style={styles.companionsCount}>
                        🔥 {getCompletionsCount(chall.title)} COMPLETED TODAY
                      </Text>
                    </View>
                  </Surface>
                </Animated.View>
              )}
            </Animated.View>
          );
        })}
      </View>

      <Spacer size="md" />

      {/* Single Share Icon Button at bottom right */}
      <View style={styles.footerRow}>
        <View style={styles.footerLeft}>
          <Text variant="micro" weight="bold" color={colors.textTertiary} style={{ letterSpacing: 0.8 }}>
            TODAY'S CHALLENGE PROGRESS CARD
          </Text>
        </View>
        <Pressable
          onPress={onShare}
          style={({ pressed }) => [
            styles.shareIconButton,
            {
              backgroundColor: pressed ? 'rgba(255, 75, 43, 0.2)' : 'rgba(255, 75, 43, 0.1)',
              borderColor: colors.primary,
            }
          ]}
        >
          <Share2 size={16} color={colors.primary} />
        </Pressable>
      </View>
    </GlassCard>
  );
};

const styles = StyleSheet.create({
  mainCard: {
    padding: 16,
    borderWidth: 1,
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 12,
      },
    }),
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
  },
  headerTitleCol: {
    gap: 2,
  },
  supTitle: {
    letterSpacing: 1.2,
  },
  listContainer: {
    marginTop: 4,
  },
  itemRowWrapper: {
    borderBottomWidth: 1,
    paddingVertical: 4,
  },
  itemHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 52,
    width: '100%',
  },
  headerLeftCol: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 10,
  },
  categoryIndicator: {
    width: 3,
    height: 16,
    borderRadius: 1.5,
  },
  iconBox: {
    width: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemTitle: {
    flex: 1,
    fontSize: 14,
  },
  completedTitle: {
    textDecorationLine: 'line-through',
  },
  chevron: {
    marginLeft: 4,
    opacity: 0.8,
  },
  checkboxTouchZone: {
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: -4,
  },
  emptyCheckbox: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    backgroundColor: 'transparent',
  },
  dropdownContent: {
    marginTop: 2,
    marginBottom: 8,
    padding: 12,
  },
  dropdownDesc: {
    lineHeight: 18,
  },
  dropdownFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  metaPills: {
    flexDirection: 'row',
    gap: 6,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: radius.xs,
    gap: 2.5,
  },
  companionsCount: {
    fontSize: 9,
    fontWeight: '600',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
  },
  footerLeft: {
    flex: 1,
  },
  shareIconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
});
