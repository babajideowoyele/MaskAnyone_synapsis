import React from 'react';
import { Box, SxProps, Theme } from '@mui/material';
import { colors, transitions } from '../../styles/tokens';

type ProgressVariant = 'default' | 'success' | 'error';

interface ProgressBarProps {
  value: number; // 0-100
  variant?: ProgressVariant;
  height?: number;
  showLabel?: boolean;
  sx?: SxProps<Theme>;
}

const getVariantColor = (variant: ProgressVariant): string => {
  const variants = {
    default: colors.black,
    success: colors.accent.success,
    error: colors.accent.error,
  };
  return variants[variant];
};

/**
 * ProgressBar - Linear progress indicator
 * Used for processing status and completion tracking
 */
export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  variant = 'default',
  height = 4,
  showLabel = false,
  sx = {},
}) => {
  const clampedValue = Math.max(0, Math.min(100, value));
  const fillColor = getVariantColor(variant);

  return (
    <Box sx={{ width: '100%', ...sx }}>
      <Box
        sx={{
          height: `${height}px`,
          backgroundColor: colors.gray[200],
          borderRadius: height > 6 ? '2px' : 0,
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            height: '100%',
            width: `${clampedValue}%`,
            backgroundColor: fillColor,
            transition: `width ${transitions.slow}`,
          }}
        />
      </Box>
      {showLabel && (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'flex-end',
            mt: '4px',
            fontSize: '12px',
            fontWeight: 600,
            color: colors.text.primary,
          }}
        >
          {Math.round(clampedValue)}%
        </Box>
      )}
    </Box>
  );
};

export default ProgressBar;
