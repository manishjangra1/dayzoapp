import React from 'react';
import { View, ViewStyle } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';

export interface DividerProps {
  vertical?: boolean;
  size?: number;
  style?: ViewStyle;
}

export const Divider: React.FC<DividerProps> = ({
  vertical = false,
  size = 1,
  style,
}) => {
  const { colors } = useTheme();

  return (
    <View
      style={[
        {
          backgroundColor: colors.borderSubtle,
          width: vertical ? size : '100%',
          height: vertical ? '100%' : size,
        },
        style,
      ]}
    />
  );
};
