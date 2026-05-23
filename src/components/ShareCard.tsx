import React, { useRef, useState } from 'react';
import { View, Modal, Pressable, Platform, StyleSheet } from 'react-native';
import { X, Flame, Share2, Award, Zap, Camera, Link, MessageCircle } from 'lucide-react-native';
import { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../design-system/theme/ThemeProvider';
import { useDialog } from '../design-system/theme/DialogProvider';
import { Text } from '../design-system/primitives/Text';
import { GlassCard } from '../design-system/primitives/GlassCard';
import { Surface } from '../design-system/primitives/Surface';
import { Spacer } from '../design-system/primitives/Spacer';
import { AnimatedButton } from '../design-system/primitives/AnimatedButton';
import { radius } from '../design-system/tokens/radius';

interface ShareCardProps {
  visible: boolean;
  onClose: () => void;
  username: string;
  streak: number;
  xp: number;
  levelTitle: string;
  challengeTitle: string;
}

const themeColors = {
  premium: {
    primary: '#8A2387',
    accent: '#FF4B2B',
    glow: 'rgba(138, 35, 135, 0.15)',
  },
  fire: {
    primary: '#FF4B2B',
    accent: '#FF416C',
    glow: 'rgba(255, 75, 43, 0.15)',
  },
  ocean: {
    primary: '#00F2FE',
    accent: '#4FACFE',
    glow: 'rgba(0, 242, 254, 0.15)',
  },
  sunset: {
    primary: '#F27121',
    accent: '#E94057',
    glow: 'rgba(242, 113, 33, 0.15)',
  },
  midnight: {
    primary: '#10B981',
    accent: '#059669',
    glow: 'rgba(16, 185, 129, 0.15)',
  },
};

export default function ShareCard({
  visible,
  onClose,
  username,
  streak,
  xp,
  levelTitle,
  challengeTitle,
}: ShareCardProps) {
  const { colors } = useTheme();
  const dialog = useDialog();
  const insets = useSafeAreaInsets();
  const viewShotRef = useRef<View>(null);

  // Customizer States
  const [themeName, setThemeName] = useState<keyof typeof themeColors>('premium');
  const [layoutType, setLayoutType] = useState<'cinematic' | 'minimalist' | 'flame'>('cinematic');
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
    <Modal visible={visible} animationType="slide" transparent>
      <View
        style={[
          styles.modalOverlay,
          {
            backgroundColor: colors.background,
            paddingTop: Math.max(insets.top, 16) + 12,
            paddingBottom: Math.max(insets.bottom, 16) + 12,
          },
        ]}
      >
        
        {/* Header Options */}
        <View
          style={[
            styles.header,
            {
              position: 'absolute',
              top: Math.max(insets.top, 16),
              left: 24,
              right: 24,
            },
          ]}
        >
          <Text variant="caption" weight="bold" color={colors.textTertiary} style={{ letterSpacing: 1.5 }}>
            CUSTOMIZE & SHARE
          </Text>
          <Pressable onPress={onClose} style={[styles.closeBtn, { backgroundColor: colors.surfaceHover }]}>
            <X color={colors.text} size={18} />
          </Pressable>
        </View>

        {/* Card Container (Wrapped in View with transparent borders) */}
        <View
          ref={viewShotRef}
          collapsable={false}
          style={[
            styles.cardWrapper,
            { aspectRatio: cardFormat === 'square' ? 1 : 9 / 16 },
          ]}
        >
          <GlassCard
            borderRadius="2xl"
            intensity="high"
            style={[
              styles.card,
              {
                borderColor: activeTheme.primary,
                padding: cardFormat === 'square' ? 16 : 24,
              },
            ]}
          >
            
            {/* Cinematic background orbs */}
            {layoutType !== 'minimalist' && (
              <>
                <View style={[styles.glowOrb, { backgroundColor: activeTheme.primary }]} />
                <View style={[styles.glowOrb2, { backgroundColor: activeTheme.accent }]} />
              </>
            )}

            {/* Card Top: Branding */}
            <View style={styles.cardHeader}>
              <View>
                <Text variant="h2" weight="display" color={colors.text}>
                  DAYZO
                </Text>
                <Text variant="micro" weight="bold" color={activeTheme.primary} style={{ letterSpacing: 1, marginTop: -4 }}>
                  WIN YOUR DAY.
                </Text>
              </View>
              <View style={[styles.userBadge, { backgroundColor: colors.surfaceElevated, borderColor: colors.borderSubtle }]}>
                <Text variant="micro" weight="bold" color={colors.textSecondary}>
                  @{username}
                </Text>
              </View>
            </View>

            {/* Card Center Layout Switching */}
            {layoutType === 'cinematic' && (
              <View style={styles.cardCenter}>
                <View
                  style={[
                    styles.flameWrapper,
                    {
                      backgroundColor: activeTheme.glow,
                      borderColor: activeTheme.primary,
                      ...(cardFormat === 'square' && {
                        width: 56,
                        height: 56,
                        borderRadius: 28,
                      }),
                    },
                  ]}
                >
                  <Flame color={activeTheme.primary} fill={activeTheme.primary} size={cardFormat === 'square' ? 30 : 40} />
                </View>
                <Spacer size="sm" />
                <Text variant="caption" weight="bold" color={colors.textTertiary} style={{ letterSpacing: 1.5 }}>
                  DAILY COMPLETE
                </Text>
                <Spacer size="xs" />
                <Text variant="h1" weight="bold" color={colors.text} align="center" style={{ paddingHorizontal: 12 }}>
                  {challengeTitle}
                </Text>
              </View>
            )}

            {layoutType === 'minimalist' && (
              <View style={styles.cardCenter}>
                <Text variant="micro" weight="bold" color={colors.textTertiary} style={{ letterSpacing: 2 }}>
                  HABIT COMPLETE
                </Text>
                <Spacer size="sm" />
                <Text
                  variant="hero"
                  weight="display"
                  color={colors.text}
                  align="center"
                  style={[
                    styles.cleanTitle,
                    cardFormat === 'square' && { fontSize: 20, lineHeight: 26 },
                  ]}
                >
                  {challengeTitle}
                </Text>
                <Spacer size="sm" />
              </View>
            )}

            {layoutType === 'flame' && (
              <View style={styles.cardCenter}>
                <View
                  style={[
                    styles.flameWrapperLarge,
                    {
                      backgroundColor: activeTheme.glow,
                      borderColor: activeTheme.primary,
                      ...(cardFormat === 'square' && {
                        width: 80,
                        height: 80,
                        borderRadius: 40,
                      }),
                    },
                  ]}
                >
                  <Flame color={activeTheme.primary} fill={activeTheme.primary} size={cardFormat === 'square' ? 44 : 60} />
                </View>
                <Spacer size={cardFormat === 'square' ? 'sm' : 'md'} />
                <Text variant="hero" weight="display" color={colors.text} align="center">
                  {streak} DAYS
                </Text>
                <Text variant="caption" weight="bold" color={colors.textTertiary} style={{ letterSpacing: 1.5 }}>
                  STREAK BURNING
                </Text>
              </View>
            )}

            {/* Card Bottom: Metrics */}
            <Surface elevation="raised" borderRadius="xl" bordered style={styles.metricsBox}>
              <View style={styles.metricCell}>
                <View style={[styles.metricRow, { justifyContent: 'center' }]}>
                  <Flame color={activeTheme.primary} fill={activeTheme.primary} size={14} style={{ marginRight: 2 }} />
                  <Text variant="bodySmall" weight="bold" color={colors.text}>{streak}</Text>
                </View>
                <Text variant="micro" weight="bold" color={colors.textTertiary} align="center">STREAK</Text>
              </View>
              
              <View style={[styles.divider, { backgroundColor: colors.borderSubtle }]} />

              <View style={styles.metricCell}>
                <View style={[styles.metricRow, { justifyContent: 'center' }]}>
                  <Zap color="#00F2FE" size={14} style={{ marginRight: 2 }} />
                  <Text variant="bodySmall" weight="bold" color={colors.text}>+{xp}</Text>
                </View>
                <Text variant="micro" weight="bold" color={colors.textTertiary} align="center">XP</Text>
              </View>

              <View style={[styles.divider, { backgroundColor: colors.borderSubtle }]} />

              <View style={styles.metricCell}>
                <View style={[styles.metricRow, { justifyContent: 'center' }]}>
                  <Award color="#8A2387" size={14} style={{ marginRight: 2 }} />
                  <Text variant="bodySmall" weight="bold" color={colors.text} numberOfLines={1}>{levelTitle}</Text>
                </View>
                <Text variant="micro" weight="bold" color={colors.textTertiary} align="center">RANK</Text>
              </View>
            </Surface>

            {/* Footer Callout */}
            <Text variant="micro" weight="bold" color={colors.textTertiary} align="center" style={{ letterSpacing: 0.5 }}>
              COMPETE WITH FRIENDS. COMPETE WITH SELF.
            </Text>
          </GlassCard>
        </View>

        <Spacer size="lg" />

        {/* Customization controls Panel */}
        <Surface elevation="raised" borderRadius="xl" bordered style={styles.customizePanel}>
          {/* Theme selector */}
          <View style={styles.controlRow}>
            <Text variant="micro" weight="bold" color={colors.textSecondary} style={{ width: 60 }}>
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
                      { backgroundColor: swatch.primary },
                      themeName === key && { borderColor: '#FFFFFF', borderWidth: 2 },
                    ]}
                  />
                );
              })}
            </View>
          </View>

          {/* Style selector */}
          <View style={styles.controlRow}>
            <Text variant="micro" weight="bold" color={colors.textSecondary} style={{ width: 60 }}>
              STYLE
            </Text>
            <View style={styles.pillRow}>
              {(['cinematic', 'minimalist', 'flame'] as const).map((type) => (
                <Pressable
                  key={type}
                  onPress={() => setLayoutType(type)}
                  style={[
                    styles.pillBtn,
                    { backgroundColor: colors.surfaceElevated, borderColor: colors.borderSubtle },
                    layoutType === type && { backgroundColor: colors.primary, borderColor: colors.primary },
                  ]}
                >
                  <Text variant="micro" weight="bold" color={layoutType === type ? colors.surface : colors.text}>
                    {type.toUpperCase()}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Format selector */}
          <View style={styles.controlRow}>
            <Text variant="micro" weight="bold" color={colors.textSecondary} style={{ width: 60 }}>
              FORMAT
            </Text>
            <View style={styles.pillRow}>
              {(['story', 'square'] as const).map((format) => (
                <Pressable
                  key={format}
                  onPress={() => setCardFormat(format)}
                  style={[
                    styles.pillBtn,
                    { backgroundColor: colors.surfaceElevated, borderColor: colors.borderSubtle },
                    cardFormat === format && { backgroundColor: colors.primary, borderColor: colors.primary },
                  ]}
                >
                  <Text variant="micro" weight="bold" color={cardFormat === format ? colors.surface : colors.text}>
                    {format === 'story' ? 'STORY (9:16)' : 'SQUARE (1:1)'}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        </Surface>

        <Spacer size="lg" />

        {/* Unified Share Button CTA */}
        <AnimatedButton
          title="Share Streak Card"
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
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 40,
  },
  header: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardWrapper: {
    width: '100%',
    maxHeight: 440,
    aspectRatio: 9 / 16,
    overflow: 'hidden',
    borderRadius: 24,
    backgroundColor: 'transparent', // Guarantees PNG captures have transparent corners!
  },
  card: {
    width: '100%',
    height: '100%',
    padding: 24,
    justifyContent: 'space-between',
    position: 'relative',
    overflow: 'hidden',
    borderRadius: 24, // Matches wrapper exactly
    borderWidth: 1,
  },
  glowOrb: {
    position: 'absolute',
    top: -50,
    right: -50,
    width: 140,
    height: 140,
    borderRadius: 70,
    opacity: 0.1,
  },
  glowOrb2: {
    position: 'absolute',
    bottom: -50,
    left: -50,
    width: 140,
    height: 140,
    borderRadius: 70,
    opacity: 0.08,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  userBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 9999,
    borderWidth: 1,
  },
  cardCenter: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  flameWrapper: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flameWrapperLarge: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cleanTitle: {
    fontSize: 24,
    lineHeight: 30,
    letterSpacing: -0.5,
  },
  metricsBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 8,
  },
  metricCell: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  divider: {
    width: 1,
    height: 24,
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
    gap: 12,
    flex: 1,
  },
  swatch: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  pillRow: {
    flexDirection: 'row',
    gap: 8,
    flex: 1,
  },
  pillBtn: {
    flex: 1,
    paddingVertical: 6,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  shareBtn: {
    width: '100%',
  },
});
