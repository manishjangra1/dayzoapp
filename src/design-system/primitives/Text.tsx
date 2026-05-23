import React from 'react';
import { Text as RNText, TextProps, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { typography } from '../tokens/typography';

export type TextVariant = 'hero' | 'h1' | 'h2' | 'h3' | 'body' | 'bodySmall' | 'caption' | 'micro' | 'label';

export interface CustomTextProps extends TextProps {
  variant?: TextVariant;
  color?: string;
  weight?: 'display' | 'bold' | 'semiBold' | 'medium' | 'regular' | 'light';
  align?: 'auto' | 'left' | 'right' | 'center' | 'justify';
}

export const Text: React.FC<CustomTextProps> = ({
  children,
  variant = 'body',
  color,
  weight,
  align = 'left',
  style,
  ...props
}) => {
  const { colors } = useTheme();

  const getFontFamily = () => {
    if (weight) return typography.fonts[weight];
    
    // Default weight mapping by variant
    switch (variant) {
      case 'hero':
        return typography.fonts.display;
      case 'h1':
      case 'h2':
        return typography.fonts.bold;
      case 'h3':
        return typography.fonts.semiBold;
      case 'label':
        return typography.fonts.bold;
      case 'body':
      case 'bodySmall':
        return typography.fonts.regular;
      case 'caption':
      case 'micro':
        return typography.fonts.medium;
      default:
        return typography.fonts.regular;
    }
  };

  const getTextColor = () => {
    if (color) return color;
    
    switch (variant) {
      case 'caption':
      case 'micro':
        return colors.textTertiary;
      case 'bodySmall':
        return colors.textSecondary;
      default:
        return colors.text;
    }
  };

  const variantStyle = styles[variant];

  return (
    <RNText
      style={[
        {
          fontFamily: getFontFamily(),
          color: getTextColor(),
          textAlign: align,
        },
        variantStyle,
        style,
      ]}
      {...props}
    >
      {children}
    </RNText>
  );
};

const styles = StyleSheet.create({
  hero: {
    fontSize: typography.sizes.hero,
    lineHeight: typography.lineHeights.hero,
    letterSpacing: typography.letterSpacings.hero,
  },
  h1: {
    fontSize: typography.sizes.h1,
    lineHeight: typography.lineHeights.h1,
    letterSpacing: typography.letterSpacings.h1,
  },
  h2: {
    fontSize: typography.sizes.h2,
    lineHeight: typography.lineHeights.h2,
    letterSpacing: typography.letterSpacings.h2,
  },
  h3: {
    fontSize: typography.sizes.h3,
    lineHeight: typography.lineHeights.h3,
    letterSpacing: typography.letterSpacings.h3,
  },
  body: {
    fontSize: typography.sizes.body,
    lineHeight: typography.lineHeights.body,
    letterSpacing: typography.letterSpacings.body,
  },
  bodySmall: {
    fontSize: typography.sizes.bodySmall,
    lineHeight: typography.lineHeights.bodySmall,
    letterSpacing: typography.letterSpacings.bodySmall,
  },
  caption: {
    fontSize: typography.sizes.caption,
    lineHeight: typography.lineHeights.caption,
    letterSpacing: typography.letterSpacings.caption,
  },
  micro: {
    fontSize: typography.sizes.micro,
    lineHeight: typography.lineHeights.micro,
    letterSpacing: typography.letterSpacings.micro,
  },
  label: {
    fontSize: typography.sizes.label,
    lineHeight: typography.lineHeights.label,
    letterSpacing: typography.letterSpacings.label,
    textTransform: 'uppercase',
  },
});
