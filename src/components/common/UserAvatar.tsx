import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { Image } from 'expo-image';
import { useTheme } from '../../design-system/theme/ThemeProvider';
import { Text } from '../../design-system/primitives/Text';
import { radius } from '../../design-system/tokens/radius';

export interface UserAvatarProps {
  uri?: string;
  username?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  online?: boolean;
  borderRankColor?: string; // Border color representing tier rank
}

export const UserAvatar: React.FC<UserAvatarProps> = ({
  uri,
  username = 'U',
  size = 'md',
  online = false,
  borderRankColor,
}) => {
  const { colors } = useTheme();

  const getDimensions = () => {
    switch (size) {
      case 'sm':
        return { dimensions: 32, ring: 2, dot: 8, font: 'caption' as any };
      case 'md':
        return { dimensions: 48, ring: 3, dot: 10, font: 'body' as any };
      case 'lg':
        return { dimensions: 64, ring: 4, dot: 12, font: 'h2' as any };
      case 'xl':
        return { dimensions: 88, ring: 4, dot: 16, font: 'hero' as any };
    }
  };

  const { dimensions, ring, dot, font } = getDimensions();
  const initials = username.substring(0, 2).toUpperCase();

  const renderContent = () => {
    if (uri && uri.trim().length > 0) {
      return (
        <Image
          source={{ uri }}
          style={{ width: dimensions, height: dimensions, borderRadius: dimensions / 2 }}
          contentFit="cover"
          transition={200}
        />
      );
    }

    // Dynamic initial background colors
    const colorsList = ['#FF4B2B', '#8A2387', '#00F2FE', '#E94057', '#10B981'];
    const charCodeSum = username.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const bgColor = colorsList[charCodeSum % colorsList.length];

    return (
      <View
        style={[
          styles.initialsContainer,
          {
            width: dimensions,
            height: dimensions,
            borderRadius: dimensions / 2,
            backgroundColor: bgColor,
          },
        ]}
      >
        <Text variant={font} weight="bold" color="#FFFFFF">
          {initials}
        </Text>
      </View>
    );
  };

  const ringColor = borderRankColor || colors.border;

  return (
    <View style={[styles.container, { width: dimensions + ring * 2, height: dimensions + ring * 2 }]}>
      {/* Outer Level Ring border */}
      <View
        style={[
          styles.outerRing,
          {
            width: dimensions + ring * 2,
            height: dimensions + ring * 2,
            borderRadius: (dimensions + ring * 2) / 2,
            borderWidth: ring,
            borderColor: ringColor,
          },
        ]}
      >
        {renderContent()}
      </View>

      {/* Online indicator dot */}
      {online && (
        <View
          style={[
            styles.onlineDot,
            {
              width: dot,
              height: dot,
              borderRadius: dot / 2,
              backgroundColor: colors.success,
              borderColor: colors.surface,
              borderWidth: size === 'sm' ? 1.5 : 2,
            },
          ]}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  outerRing: {
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  initialsContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  onlineDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
});
