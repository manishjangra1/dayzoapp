import React, { useRef, useState } from 'react';
import { View, Modal, Pressable, StyleSheet, ScrollView } from 'react-native';
import { X, Flame, Award, Zap, Trophy, Sparkles, CheckCircle2, XCircle } from 'lucide-react-native';
import { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../design-system/theme/ThemeProvider';
import { useDialog } from '../design-system/theme/DialogProvider';
import { Text } from '../design-system/primitives/Text';
import { Surface } from '../design-system/primitives/Surface';
import { Spacer } from '../design-system/primitives/Spacer';
import { AnimatedButton } from '../design-system/primitives/AnimatedButton';
import { radius } from '../design-system/tokens/radius';
import { LinearGradient } from 'expo-linear-gradient';

interface ShareChallenge {
  id: string;
  title: string;
  completed: boolean;
}

interface ShareCardProps {
  visible: boolean;
  onClose: () => void;
  username: string;
  streak: number;
  xp: number;
  levelTitle: string;
  challenges: ShareChallenge[];
}

const themeColors = {
  premium: {
    gradient: ['#8A2387', '#E94057', '#F27121'], // Spotify bold orange-purple
    textColor: '#FFFFFF',
    accentColor: '#FFD700', // Gold
    glow: 'rgba(138, 35, 135, 0.4)',
  },
  aurora: {
    gradient: ['#0575E6', '#00F260'], // Neon green-blue
    textColor: '#FFFFFF',
    accentColor: '#00FFFF',
    glow: 'rgba(0, 242, 96, 0.4)',
  },
  neonBurn: {
    gradient: ['#FF416C', '#FF4B2B'], // Red-orange lava hot
    textColor: '#FFFFFF',
    accentColor: '#FFFF00', // Neon yellow
    glow: 'rgba(255, 75, 43, 0.4)',
  },
  synthwave: {
    gradient: ['#F72585', '#7209B7', '#3F37C9'], // Pink-purple retro wave
    textColor: '#FFFFFF',
    accentColor: '#4CC9F0', // Ice blue
    glow: 'rgba(247, 37, 133, 0.4)',
  },
  cyberpunk: {
    gradient: ['#FFE000', '#799F0C'], // Cyber yellow/green
    textColor: '#08080C', // Dark text for bright cyberpunk look!
    accentColor: '#FF007F', // Cyber pink
    glow: 'rgba(121, 159, 12, 0.4)',
  },
};

export default function ShareCard({
  visible,
  onClose,
  username,
  streak,
  xp,
  levelTitle,
  challenges = [],
}: ShareCardProps) {
  const { isDark } = useTheme();
  const dialog = useDialog();
  const insets = useSafeAreaInsets();
  const viewShotRef = useRef<View>(null);

  // Customizer States
  const [themeName, setThemeName] = useState<keyof typeof themeColors>('premium');
  const [layoutType, setLayoutType] = useState<'cinematic' | 'minimalist' | 'flame' | 'modern' | 'glass'>('cinematic');
  const [cardFormat, setCardFormat] = useState<'story' | 'square'>('story');

  const activeTheme = themeColors[themeName];
  
  const handleNativeShare = async () => {
    try {
      if (!viewShotRef.current) {
        dialog.show({
          title: 'Error',
          message: 'Card is still rendering. Please try again.',
          primaryAction: { text: 'OK' }
        });
        return;
      }

      // Capture view shot directly with transparent background options
      const localUri = await captureRef(viewShotRef, {
        format: 'png',
        quality: 0.98,
      });

      // Share the actual generated image file natively!
      const isAvailable = await Sharing.isAvailableAsync();
      if (isAvailable) {
        await Sharing.shareAsync(localUri, {
          mimeType: 'image/png',
          dialogTitle: 'Share Dayzo Habit Win',
        });
      } else {
        dialog.show({
          title: 'Error',
          message: 'Sharing is not supported on this device.',
          primaryAction: { text: 'OK', variant: 'primary' }
        });
      }
    } catch (error) {
      console.warn('Sharing failed:', error);
      dialog.show({
        title: 'Error',
        message: 'Failed to generate visual sharing card.',
        primaryAction: { text: 'OK', variant: 'primary' }
      });
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      statusBarTranslucent={true}
    >
      <View
        style={[
          styles.modalOverlay,
          {
            backgroundColor: isDark ? '#08080C' : '#F4F5F7',
            paddingTop: insets.top + 16,
            paddingBottom: insets.bottom + 16,
          },
        ]}
      >
        
        {/* Header Options */}
        <View
          style={[
            styles.header,
            {
              paddingTop: Math.max(insets.top, 8),
            },
          ]}
        >
          <View>
            <Text variant="caption" weight="bold" color={isDark ? '#9CA3AF' : '#4B5563'} style={{ letterSpacing: 1.5 }}>
              CUSTOMIZE & SHARE
            </Text>
            <Text variant="micro" color={isDark ? '#6B7280' : '#9CA3AF'}>
              Generate viral story slides
            </Text>
          </View>
          <Pressable onPress={onClose} style={[styles.closeBtn, { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)' }]}>
            <X color={isDark ? '#FFFFFF' : '#000000'} size={18} />
          </Pressable>
        </View>

        <Spacer size="md" />

        {/* Card Container */}
        <View style={styles.cardContainer}>
          <View
            ref={viewShotRef}
            collapsable={false}
            style={[
              styles.cardWrapper,
              { aspectRatio: cardFormat === 'square' ? 1 : 9 / 16 },
            ]}
          >
            {/* Spotify bold linear gradient backplate */}
            <LinearGradient
              colors={activeTheme.gradient as [string, string, ...string[]]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFill}
            />

            {/* Decorative fluid elements for organic visual intensity */}
            <View style={[styles.vectorOrb1, { backgroundColor: activeTheme.accentColor }]} />
            <View style={[styles.vectorOrb2, { backgroundColor: activeTheme.textColor }]} />

            {/* Diagonal shine/gloss overlay reflection */}
            <LinearGradient
              colors={['transparent', 'rgba(255, 255, 255, 0.15)', 'transparent']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[
                StyleSheet.absoluteFill,
                {
                  transform: [{ rotate: '-35deg' }, { scale: 2 }],
                  opacity: 0.7,
                }
              ]}
            />

            <View style={[styles.cardContent, { padding: cardFormat === 'square' ? 16 : 28 }]}>
              {/* Card Top: Branding */}
              <View style={styles.cardHeader}>
                <View>
                  <Text variant="h2" weight="display" color={activeTheme.textColor}>
                    DAYZO
                  </Text>
                  <Text variant="micro" weight="bold" color={activeTheme.accentColor} style={{ letterSpacing: 2, marginTop: -4 }}>
                    WIN YOUR DAY.
                  </Text>
                </View>
                <View style={[styles.userBadge, { backgroundColor: 'rgba(0,0,0,0.2)', borderColor: 'rgba(255,255,255,0.15)' }]}>
                  <Text variant="micro" weight="bold" color={activeTheme.textColor}>
                    @{username}
                  </Text>
                </View>
              </View>

              {/* Card Center: Dynamic Layout Templates */}
              {layoutType === 'cinematic' && (
                <View style={styles.cardCenter}>
                  <View style={[styles.questCapsule, { backgroundColor: 'rgba(0,0,0,0.25)', borderColor: 'rgba(255,255,255,0.1)' }]}>
                    <Sparkles size={10} color={activeTheme.accentColor} style={{ marginRight: 4 }} />
                    <Text variant="micro" weight="bold" color={activeTheme.textColor} style={{ letterSpacing: 1.5 }}>
                      DAILY QUEST CHECKLIST
                    </Text>
                  </View>
                  <Spacer size="sm" />
                  <View style={styles.checklistContainer}>
                    {challenges.map((c, i) => (
                      <View
                        key={c.id || i}
                        style={[
                          styles.checklistItem,
                          {
                            paddingVertical: cardFormat === 'square' ? 3 : 5,
                          }
                        ]}
                      >
                        <View style={styles.checkIconWrapper}>
                          {c.completed ? (
                            <CheckCircle2 color={activeTheme.accentColor} fill={activeTheme.accentColor + '20'} size={cardFormat === 'square' ? 16 : 18} />
                          ) : (
                            <XCircle color="rgba(255,255,255,0.3)" size={cardFormat === 'square' ? 16 : 18} />
                          )}
                        </View>
                        <Text
                          variant="bodySmall"
                          weight="bold"
                          color={activeTheme.textColor}
                          numberOfLines={1}
                          style={[
                            styles.checklistText,
                            !c.completed && { opacity: 0.5 },
                            cardFormat === 'square' && { fontSize: 11, lineHeight: 14 }
                          ]}
                        >
                          {c.title}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {layoutType === 'minimalist' && (
                <View style={styles.cardCenter}>
                  <Text variant="micro" weight="bold" color={activeTheme.accentColor} style={{ letterSpacing: 3 }}>
                    THE SECURED RITUALS
                  </Text>
                  <Spacer size="md" />
                  <View style={{ width: '100%', gap: cardFormat === 'square' ? 8 : 12 }}>
                    {challenges.map((c, i) => (
                      <View key={c.id || i} style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                        {c.completed ? (
                          <CheckCircle2 color={activeTheme.accentColor} size={cardFormat === 'square' ? 14 : 16} />
                        ) : (
                          <XCircle color="rgba(255,255,255,0.3)" size={cardFormat === 'square' ? 14 : 16} />
                        )}
                        <Text
                          variant="caption"
                          weight="bold"
                          color={activeTheme.textColor}
                          style={[
                            !c.completed && { opacity: 0.5 },
                            cardFormat === 'square' && { fontSize: 11 }
                          ]}
                          numberOfLines={1}
                        >
                          {c.title}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {layoutType === 'flame' && (
                <View style={styles.cardCenter}>
                  <View style={[styles.badgeHalo, { borderColor: 'rgba(255,255,255,0.15)', width: 56, height: 56, borderRadius: 28 }]}>
                    <View style={[styles.badgeInner, { backgroundColor: 'rgba(0,0,0,0.3)', borderColor: activeTheme.accentColor, width: 44, height: 44, borderRadius: 22 }]}>
                      <Flame color={activeTheme.accentColor} fill={activeTheme.accentColor} size={18} />
                    </View>
                  </View>
                  <Spacer size="xs" />
                  <Text variant="caption" weight="bold" color={activeTheme.textColor} style={{ letterSpacing: 1.5, opacity: 0.8, fontSize: 9 }}>
                    MOMENTUM MULTIPLIER
                  </Text>
                  <Spacer size="xs" />
                  <Text
                    variant="hero"
                    weight="display"
                    color={activeTheme.textColor}
                    align="center"
                    style={[
                      styles.streakNumberText,
                      { fontSize: cardFormat === 'square' ? 22 : 30, lineHeight: cardFormat === 'square' ? 26 : 34 }
                    ]}
                  >
                    {streak} DAY STREAK
                  </Text>
                  <Spacer size="xs" />
                  <View style={{ width: '100%', gap: cardFormat === 'square' ? 2 : 3, opacity: 0.9, marginTop: 4 }}>
                    {challenges.map((c, i) => (
                      <View key={c.id || i} style={styles.miniChecklistItem}>
                        {c.completed ? (
                          <CheckCircle2 color="#00F260" size={cardFormat === 'square' ? 10 : 12} />
                        ) : (
                          <XCircle color="rgba(255,255,255,0.3)" size={cardFormat === 'square' ? 10 : 12} />
                        )}
                        <Text
                          variant="micro"
                          weight="bold"
                          color={activeTheme.textColor}
                          numberOfLines={1}
                          style={[
                            { flex: 1, fontSize: cardFormat === 'square' ? 9 : 11 },
                            !c.completed && { opacity: 0.5 }
                          ]}
                        >
                          {c.title}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {layoutType === 'modern' && (
                <View style={styles.cardCenter}>
                  <View style={[styles.questCapsule, { backgroundColor: 'rgba(255,255,255,0.1)', borderColor: 'rgba(255,255,255,0.2)' }]}>
                    <Sparkles size={10} color={activeTheme.accentColor} style={{ marginRight: 4 }} />
                    <Text variant="micro" weight="bold" color={activeTheme.textColor} style={{ letterSpacing: 1.5 }}>
                      MODERN TARGETS
                    </Text>
                  </View>
                  <Spacer size="sm" />
                  <View style={styles.checklistContainer}>
                    {challenges.map((c, i) => (
                      <View
                        key={c.id || i}
                        style={[
                          styles.checklistItem,
                          {
                            paddingVertical: cardFormat === 'square' ? 3 : 5,
                          }
                        ]}
                      >
                        <View style={styles.checkIconWrapper}>
                          {c.completed ? (
                            <CheckCircle2 color="#00F260" size={cardFormat === 'square' ? 14 : 16} />
                          ) : (
                            <XCircle color="rgba(255,255,255,0.3)" size={cardFormat === 'square' ? 14 : 16} />
                          )}
                        </View>
                        <Text
                          variant="caption"
                          weight="bold"
                          color={activeTheme.textColor}
                          numberOfLines={1}
                          style={[{ flex: 1 }, !c.completed && { opacity: 0.5 }]}
                        >
                          {c.title}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {layoutType === 'glass' && (
                <View style={styles.cardCenter}>
                  <View style={{ backgroundColor: 'rgba(255, 255, 255, 0.08)', borderRadius: 16, padding: cardFormat === 'square' ? 10 : 16, width: '100%', borderColor: 'rgba(255, 255, 255, 0.15)', borderWidth: 1 }}>
                    <Text variant="micro" weight="bold" color={activeTheme.textColor} align="center" style={{ letterSpacing: 2 }}>
                      GLASS SECURED RITUALS
                    </Text>
                    <Spacer size="xs" />
                    <View style={{ gap: cardFormat === 'square' ? 3 : 5 }}>
                      {challenges.map((c, i) => (
                        <View key={c.id || i} style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                          {c.completed ? (
                            <CheckCircle2 color={activeTheme.accentColor} size={cardFormat === 'square' ? 12 : 14} />
                          ) : (
                            <XCircle color="rgba(255,255,255,0.2)" size={cardFormat === 'square' ? 12 : 14} />
                          )}
                          <Text variant="caption" weight="bold" color={activeTheme.textColor} numberOfLines={1} style={[{ flex: 1 }, !c.completed && { opacity: 0.4 }]}>
                            {c.title}
                          </Text>
                        </View>
                      ))}
                    </View>
                  </View>
                </View>
              )}

              {/* Card Bottom: Spotify-Wrapped statistics drawer */}
              <View style={[styles.wrappedMetricsBox, { backgroundColor: 'rgba(0,0,0,0.25)', borderColor: 'rgba(255,255,255,0.1)' }]}>
                <View style={styles.metricCell}>
                  <View style={styles.metricRow}>
                    <Flame color={activeTheme.accentColor} fill={activeTheme.accentColor} size={14} style={{ marginRight: 4 }} />
                    <Text variant="bodySmall" weight="bold" color={activeTheme.textColor}>{streak}</Text>
                  </View>
                  <Text variant="micro" weight="bold" color={activeTheme.textColor} style={{ opacity: 0.6 }}>STREAK</Text>
                </View>
                
                <View style={styles.metricsDivider} />

                <View style={styles.metricCell}>
                  <View style={styles.metricRow}>
                    <Zap color={activeTheme.accentColor} size={14} style={{ marginRight: 4 }} />
                    <Text variant="bodySmall" weight="bold" color={activeTheme.textColor}>+{xp}</Text>
                  </View>
                  <Text variant="micro" weight="bold" color={activeTheme.textColor} style={{ opacity: 0.6 }}>XP</Text>
                </View>

                <View style={styles.metricsDivider} />

                <View style={styles.metricCell}>
                  <View style={styles.metricRow}>
                    <Award color={activeTheme.accentColor} size={14} style={{ marginRight: 4 }} />
                    <Text variant="bodySmall" weight="bold" color={activeTheme.textColor} numberOfLines={1}>{levelTitle}</Text>
                  </View>
                  <Text variant="micro" weight="bold" color={activeTheme.textColor} style={{ opacity: 0.6 }}>LEVEL</Text>
                </View>
              </View>

              {/* Ecosystem Callout Footer */}
              <Text variant="micro" weight="bold" color={activeTheme.textColor} align="center" style={{ letterSpacing: 1.5, opacity: 0.8 }}>
                JOIN ME ON DAYZO
              </Text>
            </View>
          </View>
        </View>

        <Spacer size="md" />

        {/* Customization controls Panel */}
        <Surface elevation="raised" borderRadius="xl" bordered style={[styles.customizePanel, { borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)' }]}>
          {/* Theme selector */}
          <View style={styles.controlRow}>
            <Text variant="micro" weight="bold" color={isDark ? '#9CA3AF' : '#4B5563'} style={{ width: 64 }}>
              THEME
            </Text>
            <View style={styles.swatchRow}>
              {(Object.keys(themeColors) as Array<keyof typeof themeColors>).map((key) => {
                const swatch = themeColors[key];
                return (
                  <Pressable
                    key={key}
                    onPress={() => setThemeName(key)}
                    style={[
                      styles.swatch,
                      { backgroundColor: swatch.gradient[0] },
                      themeName === key && styles.activeSwatch,
                    ]}
                  />
                );
              })}
            </View>
          </View>

          {/* Style selector */}
          <View style={styles.controlRow}>
            <Text variant="micro" weight="bold" color={isDark ? '#9CA3AF' : '#4B5563'} style={{ width: 64 }}>
              STYLE
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.scrollPillRow}
            >
              {(['cinematic', 'minimalist', 'flame', 'modern', 'glass'] as const).map((type) => (
                <Pressable
                  key={type}
                  onPress={() => setLayoutType(type)}
                  style={[
                    styles.pillBtn,
                    {
                      backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                      borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)',
                      paddingHorizontal: 16,
                      marginRight: 8,
                    },
                    layoutType === type && {
                      backgroundColor: activeTheme.gradient[0],
                      borderColor: activeTheme.gradient[0],
                    },
                  ]}
                >
                  <Text
                    variant="micro"
                    weight="bold"
                    color={layoutType === type ? '#FFFFFF' : (isDark ? '#9CA3AF' : '#4B5563')}
                  >
                    {type.toUpperCase()}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>

          {/* Format selector */}
          <View style={styles.controlRow}>
            <Text variant="micro" weight="bold" color={isDark ? '#9CA3AF' : '#4B5563'} style={{ width: 64 }}>
              FORMAT
            </Text>
            <View style={styles.pillRow}>
              {(['story', 'square'] as const).map((format) => (
                <Pressable
                  key={format}
                  onPress={() => setCardFormat(format)}
                  style={[
                    styles.pillBtn,
                    {
                      backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                      borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)',
                    },
                    cardFormat === format && {
                      backgroundColor: activeTheme.gradient[0],
                      borderColor: activeTheme.gradient[0],
                    },
                  ]}
                >
                  <Text
                    variant="micro"
                    weight="bold"
                    color={cardFormat === format ? '#FFFFFF' : (isDark ? '#9CA3AF' : '#4B5563')}
                  >
                    {format === 'story' ? 'STORY (9:16)' : 'SQUARE (1:1)'}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        </Surface>

        <Spacer size="md" />

        {/* Unified Share Button CTA */}
        <AnimatedButton
          title="Share to Stories"
          onPress={handleNativeShare}
          style={styles.shareBtn}
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  header: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardContainer: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardWrapper: {
    width: '100%',
    maxHeight: '85%',
    overflow: 'hidden',
    borderRadius: 24,
    elevation: 10,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
  },
  cardContent: {
    flex: 1,
    justifyContent: 'space-between',
    zIndex: 20,
  },
  vectorOrb1: {
    position: 'absolute',
    top: '15%',
    left: '-25%',
    width: 260,
    height: 260,
    borderRadius: 130,
    opacity: 0.18,
  },
  vectorOrb2: {
    position: 'absolute',
    bottom: '5%',
    right: '-30%',
    width: 320,
    height: 320,
    borderRadius: 160,
    opacity: 0.12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  userBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
  },
  cardCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  badgeHalo: {
    width: 84,
    height: 84,
    borderRadius: 42,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  badgeInner: {
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  questCapsule: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
  },
  checklistContainer: {
    width: '100%',
    gap: 2,
    marginTop: 6,
  },
  checklistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 12,
    width: '100%',
  },
  checkIconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  checklistText: {
    fontSize: 13,
    lineHeight: 16,
    flex: 1,
  },
  miniChecklistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    width: '100%',
    paddingHorizontal: 8,
  },
  challengeText: {
    fontSize: 28,
    lineHeight: 34,
    textTransform: 'uppercase',
    letterSpacing: -0.5,
  },
  minimalistTitle: {
    fontSize: 22,
    lineHeight: 28,
    letterSpacing: -0.3,
  },
  quoteMark: {
    fontSize: 48,
    lineHeight: 48,
    opacity: 0.5,
  },
  streakNumberText: {
    fontSize: 42,
    lineHeight: 46,
    letterSpacing: -1,
  },
  wrappedMetricsBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: radius.xl,
    borderWidth: 1,
    width: '100%',
  },
  metricCell: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  metricsDivider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  customizePanel: {
    width: '100%',
    padding: 16,
    gap: 12,
  },
  controlRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  swatchRow: {
    flexDirection: 'row',
    gap: 10,
    flex: 1,
    justifyContent: 'flex-start',
  },
  swatch: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  activeSwatch: {
    borderColor: '#FFFFFF',
    borderWidth: 2.5,
    transform: [{ scale: 1.15 }],
  },
  scrollPillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 2,
  },
  pillRow: {
    flexDirection: 'row',
    gap: 8,
    flex: 1,
  },
  pillBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  shareBtn: {
    width: '100%',
  },
});
