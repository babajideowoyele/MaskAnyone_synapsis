import React from 'react';
import { Box, SxProps, Theme, Typography } from '@mui/material';
import { colors, spacing, transitions, typography } from '../../styles/tokens';
import { IconBox } from './IconBox';

interface StrategyCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  selected?: boolean;
  onClick?: () => void;
  disabled?: boolean;
  sx?: SxProps<Theme>;
}

/**
 * StrategyCard - Selectable option card
 * Used for masking strategy and overlay selection
 */
export const StrategyCard: React.FC<StrategyCardProps> = ({
  icon,
  title,
  description,
  selected = false,
  onClick,
  disabled = false,
  sx = {},
}) => {
  return (
    <Box
      onClick={disabled ? undefined : onClick}
      sx={{
        padding: `${spacing.lg}px`,
        border: `2px solid ${selected ? colors.black : colors.gray[200]}`,
        backgroundColor: selected ? colors.gray[50] : colors.white,
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: `all ${transitions.normal}`,
        opacity: disabled ? 0.5 : 1,
        '&:hover': {
          borderColor: disabled ? undefined : selected ? colors.black : colors.gray[400],
        },
        ...sx,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: `${spacing.base}px` }}>
        <IconBox size="md" variant={selected ? 'filled' : 'gray'}>
          {icon}
        </IconBox>
        <Box>
          <Typography
            sx={{
              fontSize: typography.fontSize.bodyLarge,
              fontWeight: typography.fontWeight.semibold,
              color: colors.text.primary,
              mb: `${spacing.xs}px`,
            }}
          >
            {title}
          </Typography>
          <Typography
            sx={{
              fontSize: typography.fontSize.bodySmall,
              color: colors.text.secondary,
            }}
          >
            {description}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default StrategyCard;
