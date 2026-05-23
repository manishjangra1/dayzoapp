import React from 'react';
import { View, ViewProps, StyleSheet, Platform } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { radius } from '../tokens/radius';
import { shadows } from '../tokens/shadows';

export interface GlassCardProps extends ViewProps {
  borderRadius?: keyof typeof radius;
  intensity?: 'low' | 'medium' | 'high';
  bordered?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  borderRadius = 'lg',
  intensity = 'medium',
  bordered = true,
  style,
  ...props
}) => {
  const { isDark } = useTheme();

  const getBackgroundColor = () => {
    if (isDark) {
      switch (intensity) {
        case 'low':
          return 'rgba(30, 30, 38, 0.4)';
        case 'medium':
          return 'rgba(20, 20, 26, 0.65)';
        case 'high':
          return 'rgba(10, 10, 14, 0.85)';
      }
    } else {
      switch (intensity) {
        case 'low':
          return 'rgba(255, 255, 255, 0.5)';
        case 'medium':
          return 'rgba(255, 255, 255, 0.75)';
        case 'high':
          return 'rgba(240, 240, 245, 0.9)';
      }
    }
  };

  const getBorderColor = () => {
    return isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.08)';
  };

  return (
    <View
      style={[
        {
          backgroundColor: getBackgroundColor(),
          borderRadius: radius[borderRadius],
          borderWidth: bordered ? 1 : 0,
          borderColor: getBorderColor(),
        },
        Platform.select({
          ios: {
            shadowColor: '#000000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.15,
            shadowRadius: 10,
          },
          android: {
            elevation: 4,
          },
        }),
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );
};
