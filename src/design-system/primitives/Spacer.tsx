import React from 'react';
import { View } from 'react-native';
import { spacing } from '../tokens/spacing';

export interface SpacerProps {
  size?: keyof typeof spacing;
  horizontal?: boolean;
}

export const Spacer: React.FC<SpacerProps> = ({
  size = 'base',
  horizontal = false,
}) => {
  const pixelSize = spacing[size];

  return (
    <View
      style={{
        width: horizontal ? pixelSize : undefined,
        height: horizontal ? undefined : pixelSize,
      }}
    />
  );
};
