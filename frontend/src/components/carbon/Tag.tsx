import React from 'react';
import { Box, SxProps, Theme } from '@mui/material';
import { colors, spacing, typography } from '../../styles/tokens';

export type TagVariant =
  | 'filled'
  | 'outline'
  | 'success'
  | 'warning'
  | 'error'
  | 'blue'
  | 'green'
  | 'purple'
  | 'orange'
  | 'processing';

interface TagProps {
  children: React.ReactNode;
  variant?: TagVariant;
  icon?: React.ReactNode;
  sx?: SxProps<Theme>;
}

const getVariantStyles = (variant: TagVariant) => {
  const variants = {
    filled: {
      backgroundColor: colors.black,
      color: colors.white,
      border: 'none',
    },
    outline: {
      backgroundColor: colors.white,
      color: colors.black,
      border: `1px solid ${colors.black}`,
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
    blue: {
      backgroundColor: '#e3f2fd',
      color: '#1565c0',
      border: 'none',
    },
    green: {
      backgroundColor: '#e8f5e9',
      color: '#2e7d32',
      border: 'none',
    },
    purple: {
      backgroundColor: '#f3e5f5',
      color: '#7b1fa2',
      border: 'none',
    },
    orange: {
      backgroundColor: '#fff3e0',
      color: '#e65100',
      border: 'none',
    },
    processing: {
      backgroundColor: colors.black,
      color: colors.white,
      border: 'none',
    },
  };
  return variants[variant];
};

/**
 * Tag - Status and label tags
 * Used for badges, status indicators, and categorization
 */
export const Tag: React.FC<TagProps> = ({
  children,
  variant = 'filled',
  icon,
  sx = {},
}) => {
  const variantStyles = getVariantStyles(variant);

  return (
    <Box
      component="span"
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: `${spacing.xs}px`,
        padding: `${spacing.xs}px ${spacing.md}px`,
        fontSize: typography.fontSize.xs,
        fontWeight: typography.fontWeight.semibold,
        textTransform: 'uppercase',
        letterSpacing: typography.letterSpacing.wide,
        ...variantStyles,
        ...sx,
      }}
    >
      {icon}
      {children}
    </Box>
  );
};

export default Tag;
