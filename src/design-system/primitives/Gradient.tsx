import React from 'react';
import { ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { gradients, GradientType } from '../tokens/gradients';

export interface GradientProps {
  type?: GradientType;
  colors?: string[];
  start?: { x: number; y: number };
  end?: { x: number; y: number };
  style?: ViewStyle | ViewStyle[];
  children?: React.ReactNode;
}

export const Gradient: React.FC<GradientProps> = ({
  type = 'premium',
  colors: customColors,
  start = { x: 0, y: 0 },
  end = { x: 1, y: 1 },
  style,
  children,
}) => {
  const gradientColors = customColors || gradients[type] || gradients.premium;

  return (
    <LinearGradient
      colors={gradientColors as [string, string, ...string[]]}
      start={start}
      end={end}
      style={style}
    >
      {children}
    </LinearGradient>
  );
};
