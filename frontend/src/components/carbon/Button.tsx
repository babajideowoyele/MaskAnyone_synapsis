import React from 'react';
import { Button as MuiButton, ButtonProps as MuiButtonProps } from '@mui/material';
import { colors, spacing, typography, transitions } from '../../styles/tokens';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface CustomButtonProps extends Omit<MuiButtonProps, 'variant' | 'size'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: React.ReactNode;
  iconPosition?: 'start' | 'end';
}

const getSizeStyles = (size: ButtonSize) => {
  const sizes = {
    sm: {
      padding: `${spacing.sm}px ${spacing.md + 2}px`,
      fontSize: typography.fontSize.caption,
    },
    md: {
      padding: `${spacing.md}px ${spacing.lg}px`,
      fontSize: typography.fontSize.bodySmall,
    },
    lg: {
      padding: `${spacing.base}px ${spacing.xxl}px`,
      fontSize: typography.fontSize.body,
    },
  };
  return sizes[size];
};

const getVariantStyles = (variant: ButtonVariant) => {
  const variants = {
    primary: {
      backgroundColor: colors.black,
      color: colors.white,
      border: 'none',
      '&:hover': {
        backgroundColor: colors.text.secondary,
      },
      '&:disabled': {
        backgroundColor: colors.ui.disabled,
        color: colors.white,
      },
    },
    secondary: {
      backgroundColor: colors.white,
      color: colors.black,
      border: `2px solid ${colors.black}`,
      '&:hover': {
        backgroundColor: colors.black,
        color: colors.white,
        border: `2px solid ${colors.black}`,
      },
      '&:disabled': {
        borderColor: colors.ui.disabled,
        color: colors.ui.disabled,
      },
    },
    ghost: {
      backgroundColor: 'transparent',
      color: colors.text.secondary,
      border: `2px solid transparent`,
      '&:hover': {
        backgroundColor: colors.ui.hover,
        color: colors.black,
      },
      '&:disabled': {
        color: colors.ui.disabled,
      },
    },
    danger: {
      backgroundColor: colors.white,
      color: colors.accent.error,
      border: `2px solid ${colors.accent.error}`,
      '&:hover': {
        backgroundColor: colors.accent.error,
        color: colors.white,
      },
    },
  };
  return variants[variant];
};

/**
 * Button - Carbon-inspired button component
 * Follows brutalist design with sharp corners and bold styling
 */
export const Button: React.FC<CustomButtonProps> = ({
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'start',
  children,
  sx = {},
  ...props
}) => {
  const sizeStyles = getSizeStyles(size);
  const variantStyles = getVariantStyles(variant);

  return (
    <MuiButton
      disableElevation
      sx={{
        borderRadius: 0,
        textTransform: 'none',
        fontWeight: typography.fontWeight.bold,
        transition: `all ${transitions.normal}`,
        display: 'inline-flex',
        alignItems: 'center',
        gap: `${spacing.sm}px`,
        boxShadow: 'none',
        '&:hover': {
          boxShadow: 'none',
        },
        ...sizeStyles,
        ...variantStyles,
        ...sx,
      }}
      {...props}
    >
      {icon && iconPosition === 'start' && icon}
      {children}
      {icon && iconPosition === 'end' && icon}
    </MuiButton>
  );
};

export default Button;
