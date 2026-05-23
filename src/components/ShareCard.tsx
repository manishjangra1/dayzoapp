import React from 'react';
import { View, Modal, Pressable, Share, Platform, StyleSheet } from 'react-native';
import { X, Flame, Share2, Award, Zap } from 'lucide-react-native';
import { useTheme } from '../design-system/theme/ThemeProvider';
import { Text } from '../design-system/primitives/Text';
import { GlassCard } from '../design-system/primitives/GlassCard';
import { Surface } from '../design-system/primitives/Surface';
import { AnimatedButton } from '../design-system/primitives/AnimatedButton';
import { Spacer } from '../design-system/primitives/Spacer';

interface ShareCardProps {
  visible: boolean;
  onClose: () => void;
  username: string;
  streak: number;
  xp: number;
  levelTitle: string;
  challengeTitle: string;
}

export default function ShareCard({
  visible,
  onClose,
  username,
  streak,
  xp,
  levelTitle,
  challengeTitle,
}: ShareCardProps) {
  const { colors, isDark } = useTheme();
  
  const handleNativeShare = async () => {
    try {
      const message = `🔥 I just completed "${challengeTitle}" and saved my ${streak}-day streak on Dayzo! 🚀 Join me and win your day: http://dayzo.app/invite`;
      await Share.share({
        message,
        title: 'Dayzo Streak Share',
      });
    } catch (error) {
      console.warn('Sharing failed:', error);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={[styles.modalOverlay, { backgroundColor: 'rgba(0,0,0,0.92)' }]}>
        
        {/* Header Options */}
        <View style={styles.header}>
          <Text variant="caption" weight="bold" color={colors.textTertiary} style={{ letterSpacing: 1.5 }}>
            STORY PREVIEW
          </Text>
          <Pressable onPress={onClose} style={[styles.closeBtn, { backgroundColor: colors.surfaceHover }]}>
            <X color={colors.text} size={18} />
          </Pressable>
        </View>

        {/* 9:16 Story Card Container */}
        <GlassCard borderRadius="2xl" intensity="high" style={[styles.card, { borderColor: colors.primary }]}>
          {/* Subtle Background Glow Elements */}
          <View style={[styles.glowOrb, { backgroundColor: colors.primary }]} />
          <View style={[styles.glowOrb2, { backgroundColor: colors.accent }]} />

          {/* Card Top: Branding */}
          <View style={styles.cardHeader}>
            <View>
              <Text variant="h2" weight="display" color={colors.text}>
                DAYZO
              </Text>
              <Text variant="micro" weight="bold" color={colors.primary} style={{ letterSpacing: 1, marginTop: -4 }}>
                WIN YOUR DAY.
              </Text>
            </View>
            <View style={[styles.userBadge, { backgroundColor: colors.surfaceElevated, borderColor: colors.borderSubtle }]}>
              <Text variant="micro" weight="bold" color={colors.textSecondary}>
                @{username}
              </Text>
            </View>
          </View>

          {/* Card Center: Streak Flame & Title */}
          <View style={styles.cardCenter}>
            <View style={[styles.flameWrapper, { backgroundColor: 'rgba(255, 75, 43, 0.15)', borderColor: colors.primary }]}>
              <Flame color="#FF4B2B" fill="#FF4B2B" size={40} />
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

          {/* Card Bottom: Metrics */}
          <Surface elevation="raised" borderRadius="xl" bordered style={styles.metricsBox}>
            <View style={styles.metricCell}>
              <View style={styles.metricRow}>
                <Flame color="#FF4B2B" size={14} style={{ marginRight: 2 }} />
                <Text variant="body" weight="bold" color={colors.text}>{streak}</Text>
              </View>
              <Text variant="micro" weight="bold" color={colors.textTertiary}>STREAK</Text>
            </View>
            
            <View style={[styles.divider, { backgroundColor: colors.borderSubtle }]} />

            <View style={styles.metricCell}>
              <View style={styles.metricRow}>
                <Zap color="#00F2FE" size={14} style={{ marginRight: 2 }} />
                <Text variant="body" weight="bold" color={colors.text}>+{xp}</Text>
              </View>
              <Text variant="micro" weight="bold" color={colors.textTertiary}>XP EARNED</Text>
            </View>

            <View style={[styles.divider, { backgroundColor: colors.borderSubtle }]} />

            <View style={styles.metricCell}>
              <View style={styles.metricRow}>
                <Award color="#8A2387" size={14} style={{ marginRight: 2 }} />
                <Text variant="bodySmall" weight="bold" color={colors.text} numberOfLines={1}>{levelTitle}</Text>
              </View>
              <Text variant="micro" weight="bold" color={colors.textTertiary}>RANK</Text>
            </View>
          </Surface>

          {/* Footer Callout */}
          <Text variant="micro" weight="bold" color={colors.textTertiary} align="center" style={{ letterSpacing: 0.5 }}>
            COMPETE WITH FRIENDS. COMPETE WITH SELF.
          </Text>
        </GlassCard>

        {/* Share Button CTA */}
        <AnimatedButton
          title="Share to Instagram Story"
          onPress={handleNativeShare}
          style={styles.shareBtn}
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  header: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    width: '100%',
    maxHeight: 520,
    aspectRatio: 9 / 16,
    padding: 24,
    justifyContent: 'space-between',
    position: 'relative',
    overflow: 'hidden',
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
  metricsBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  metricCell: {
    flex: 1,
    alignItems: 'center',
  },
  metricRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  divider: {
    width: 1,
    height: 24,
  },
  shareBtn: {
    width: '100%',
    marginTop: 24,
  },
});

