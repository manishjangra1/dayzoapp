import React from 'react';
import { View, ViewProps, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { radius } from '../tokens/radius';
import { shadows } from '../tokens/shadows';

export type SurfaceElevation = 'flat' | 'raised' | 'elevated' | 'floating';

export interface SurfaceProps extends ViewProps {
  elevation?: SurfaceElevation;
  borderRadius?: keyof typeof radius;
  bordered?: boolean;
  glowColor?: string;
}

export const Surface: React.FC<SurfaceProps> = ({
  children,
  elevation = 'flat',
  borderRadius = 'md',
  bordered = false,
  glowColor,
  style,
  ...props
}) => {
  const { colors } = useTheme();

  const getBackgroundColor = () => {
    switch (elevation) {
      case 'flat':
        return colors.background;
      case 'raised':
        return colors.surface;
      case 'elevated':
      case 'floating':
        return colors.surfaceElevated;
      default:
        return colors.surface;
    }
  };

  const getShadowStyle = () => {
    if (glowColor) {
      return shadows.glow(glowColor, 0.25, 12);
    }
    
    switch (elevation) {
      case 'flat':
        return shadows.none;
      case 'raised':
        return shadows.sm;
      case 'elevated':
        return shadows.md;
      case 'floating':
        return shadows.xl;
      default:
        return shadows.none;
    }
  };

  const getBorderColor = () => {
    return colors.border;
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
        getShadowStyle(),
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );
};
