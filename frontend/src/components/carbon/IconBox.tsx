import React from 'react';
import { Box, SxProps, Theme } from '@mui/material';
import { colors, components } from '../../styles/tokens';

export type IconBoxSize = 'sm' | 'md' | 'lg' | 'xl' | 'xxl';
export type IconBoxVariant = 'filled' | 'outline' | 'gray' | 'success' | 'warning' | 'error';

interface IconBoxProps {
  children: React.ReactNode;
  size?: IconBoxSize;
  variant?: IconBoxVariant;
  active?: boolean;
  sx?: SxProps<Theme>;
}

const getSize = (size: IconBoxSize): number => {
  const sizeMap: Record<IconBoxSize, number> = {
    sm: components.iconBox.sm.size,
    md: components.iconBox.md.size,
    lg: components.iconBox.lg.size,
    xl: components.iconBox.xl.size,
    xxl: components.iconBox.xxl.size,
  };
  return sizeMap[size];
};

const getVariantStyles = (variant: IconBoxVariant) => {
  const variants = {
    filled: {
      backgroundColor: colors.black,
      color: colors.white,
      border: 'none',
    },
    outline: {
      backgroundColor: colors.white,
      color: colors.black,
      border: `2px solid ${colors.black}`,
    },
    gray: {
      backgroundColor: colors.gray[200],
      color: colors.text.secondary,
      border: 'none',
    },
    success: {
      backgroundColor: colors.accent.success,
      color: colors.black,
      border: 'none',
    },
    warning: {
      backgroundColor: colors.accent.warning,
      color: colors.black,
      border: 'none',
    },
    error: {
      backgroundColor: colors.accent.error,
      color: colors.white,
      border: 'none',
    },
  };
  return variants[variant];
};

const getFontSize = (size: IconBoxSize): string => {
  const fontSizeMap: Record<IconBoxSize, string> = {
    sm: components.iconBox.sm.fontSize,
    md: components.iconBox.md.fontSize,
    lg: components.iconBox.lg.fontSize,
    xl: components.iconBox.xl.fontSize,
    xxl: components.iconBox.xxl.fontSize,
  };
  return fontSizeMap[size];
};

/**
 * IconBox - Carbon-inspired icon container
 * Used throughout the UI for consistent icon presentation
 */
export const IconBox: React.FC<IconBoxProps> = ({
  children,
  size = 'md',
  variant = 'filled',
  active = false,
  sx = {},
}) => {
  const boxSize = getSize(size);
  const variantStyles = getVariantStyles(variant);
  const fontSize = getFontSize(size);

  return (
    <Box
      sx={{
        width: boxSize,
        height: boxSize,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        transition: 'all 0.2s',
        fontSize: fontSize,
        ...variantStyles,
        ...(active && {
          outline: `2px solid ${colors.black}`,
          outlineOffset: '2px',
        }),
        ...sx,
      }}
    >
      {children}
    </Box>
  );
};

export default IconBox;
