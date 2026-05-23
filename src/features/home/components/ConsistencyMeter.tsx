import React from 'react';
import { View, StyleSheet, Dimensions, Platform, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { Check, Flame } from 'lucide-react-native';
import { useTheme } from '../../../design-system/theme/ThemeProvider';
import { Text } from '../../../design-system/primitives/Text';
import { Surface } from '../../../design-system/primitives/Surface';
import { radius } from '../../../design-system/tokens/radius';
import { GlassCard } from '../../../design-system/primitives/GlassCard';

interface DayItem {
  dayName: string;
  completed: boolean;
  isToday: boolean;
}

interface ConsistencyMeterProps {
  days?: DayItem[];
}

const DEFAULT_DAYS: DayItem[] = [
  { dayName: 'M', completed: true, isToday: false },
  { dayName: 'T', completed: true, isToday: false },
  { dayName: 'W', completed: false, isToday: false },
  { dayName: 'T', completed: true, isToday: false },
  { dayName: 'F', completed: true, isToday: true },
  { dayName: 'S', completed: false, isToday: false },
  { dayName: 'S', completed: false, isToday: false },
];

export const ConsistencyMeter: React.FC<ConsistencyMeterProps> = ({
  days = DEFAULT_DAYS,
}) => {
  const { colors, isDark } = useTheme();

  // Calculate consistency percentage
  const completedCount = days.filter((d) => d.completed).length;
  const percentage = Math.round((completedCount / days.length) * 100);

  const DayCapsule = ({ day }: { day: DayItem }) => {
    const scale = useSharedValue(1);

    const handlePressIn = () => {
      scale.value = withSpring(0.88, { damping: 10, stiffness: 200 });
    };

    const handlePressOut = () => {
      scale.value = withSpring(1, { damping: 12, stiffness: 150 });
    };

    const animatedStyle = useAnimatedStyle(() => {
      return {
        transform: [{ scale: scale.value }],
      };
    });

    return (
      <Animated.View style={[animatedStyle, styles.dayCol]}>
        <Pressable
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          style={[
            styles.dotContainer,
            {
              borderColor: day.isToday
                ? colors.primary
                : day.completed
                ? 'rgba(52, 211, 153, 0.4)'
                : isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
              backgroundColor: day.completed
                ? 'rgba(52, 211, 153, 0.15)'
                : day.isToday
                ? isDark ? 'rgba(255, 75, 43, 0.15)' : 'rgba(255, 75, 43, 0.08)'
                : isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
            },
            day.isToday && styles.todayGlow,
          ]}
        >
          {day.completed ? (
            <Check size={14} color="#34D399" strokeWidth={3.5} />
          ) : (
            <Text
              variant="caption"
              weight="bold"
              color={day.isToday ? colors.primary : colors.textTertiary}
            >
              {day.dayName}
            </Text>
          )}
        </Pressable>
        {day.isToday && (
          <View style={[styles.todayIndicator, { backgroundColor: colors.primary }]} />
        )}
      </Animated.View>
    );
  };

  return (
    <GlassCard borderRadius="2xl" intensity="high" style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTitleContainer}>
          <View style={styles.titleRow}>
            <Flame size={16} color={colors.primary} fill={colors.primary} />
            <Text variant="bodySmall" weight="bold" color={colors.text}>
              Weekly Consistency
            </Text>
          </View>
          <Text variant="caption" color={colors.textSecondary} style={{ marginTop: 2 }}>
            Maintain atomic actions to power your streak
          </Text>
        </View>
        <View style={[styles.percentBadge, { backgroundColor: 'rgba(52, 211, 153, 0.15)' }]}>
          <Text variant="caption" weight="bold" color="#34D399">
            {percentage}%
          </Text>
        </View>
      </View>

      <View style={styles.grid}>
        {days.map((day, idx) => (
          <DayCapsule key={idx} day={day} />
        ))}
      </View>
    </GlassCard>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 18,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
    width: '100%',
  },
  headerTitleContainer: {
    flex: 1,
    flexShrink: 1,
    marginRight: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  percentBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.sm,
    flexShrink: 0,
  },
  grid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dayCol: {
    alignItems: 'center',
    flex: 1,
    position: 'relative',
  },
  dotContainer: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  todayGlow: {
    ...Platform.select({
      ios: {
        shadowColor: '#FF4B2B',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.45,
        shadowRadius: 6,
      },
    }),
  },
  todayIndicator: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginTop: 6,
    position: 'absolute',
    bottom: -10,
  },
});
