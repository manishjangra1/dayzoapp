import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { Check } from 'lucide-react-native';
import { useTheme } from '../../../design-system/theme/ThemeProvider';
import { Text } from '../../../design-system/primitives/Text';
import { Surface } from '../../../design-system/primitives/Surface';
import { radius } from '../../../design-system/tokens/radius';
import { spacing } from '../../../design-system/tokens/spacing';

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
  const { colors } = useTheme();

  // Calculate consistency percentage
  const completedCount = days.filter((d) => d.completed).length;
  const percentage = Math.round((completedCount / days.length) * 100);

  return (
    <Surface elevation="raised" borderRadius="xl" bordered style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTitleContainer}>
          <Text variant="bodySmall" weight="bold" color={colors.textSecondary}>
            Weekly Consistency
          </Text>
          <Text variant="caption" color={colors.textTertiary}>
            Complete your challenge every day to protect your streak
          </Text>
        </View>
        <View style={[styles.percentBadge, { backgroundColor: 'rgba(16, 185, 129, 0.1)' }]}>
          <Text variant="caption" weight="bold" color={colors.success}>
            {percentage}%
          </Text>
        </View>
      </View>

      <View style={styles.grid}>
        {days.map((day, idx) => {
          return (
            <View key={idx} style={styles.dayCol}>
              <View
                style={[
                  styles.dotContainer,
                  {
                    borderColor: day.isToday
                      ? colors.primary
                      : day.completed
                      ? colors.success
                      : colors.border,
                    backgroundColor: day.completed
                      ? colors.success
                      : day.isToday
                      ? 'rgba(255, 75, 43, 0.05)'
                      : colors.background,
                  },
                ]}
              >
                {day.completed ? (
                  <Check size={14} color={colors.surface} strokeWidth={3} />
                ) : (
                  <Text
                    variant="caption"
                    weight="bold"
                    color={day.isToday ? colors.primary : colors.textTertiary}
                  >
                    {day.dayName}
                  </Text>
                )}
              </View>
              {day.isToday && (
                <View style={[styles.todayIndicator, { backgroundColor: colors.primary }]} />
              )}
            </View>
          );
        })}
      </View>
    </Surface>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    marginVertical: 8,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
    width: '100%',
  },
  headerTitleContainer: {
    flex: 1,
    flexShrink: 1,
    marginRight: 12,
  },
  percentBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.xs,
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
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  todayIndicator: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginTop: 4,
    position: 'absolute',
    bottom: -8,
  },
});
