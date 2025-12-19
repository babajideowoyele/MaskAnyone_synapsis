import React from 'react';
import { Box, Slider as MuiSlider, SxProps, Theme, Typography } from '@mui/material';
import { colors, spacing, typography } from '../../styles/tokens';

interface SliderProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  label?: string;
  showValue?: boolean;
  valueFormatter?: (value: number) => string;
  marks?: boolean | Array<{ value: number; label: string }>;
  sx?: SxProps<Theme>;
}

/**
 * Slider - Range input slider
 * Used for intensity, opacity, and numeric adjustments
 */
export const Slider: React.FC<SliderProps> = ({
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  label,
  showValue = true,
  valueFormatter = (v) => `${v}%`,
  marks,
  sx = {},
}) => {
  return (
    <Box sx={{ width: '100%', ...sx }}>
      {(label || showValue) && (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: `${spacing.sm}px`,
          }}
        >
          {label && (
            <Typography
              sx={{
                fontSize: typography.fontSize.caption,
                fontWeight: typography.fontWeight.bold,
                textTransform: 'uppercase',
                letterSpacing: typography.letterSpacing.wider,
                color: colors.text.secondary,
              }}
            >
              {label}
            </Typography>
          )}
          {showValue && (
            <Typography
              sx={{
                fontSize: typography.fontSize.body,
                fontWeight: typography.fontWeight.semibold,
                color: colors.text.primary,
              }}
            >
              {valueFormatter(value)}
            </Typography>
          )}
        </Box>
      )}

      <MuiSlider
        value={value}
        onChange={(_, newValue) => onChange(newValue as number)}
        min={min}
        max={max}
        step={step}
        marks={marks}
        sx={{
          color: colors.black,
          height: 6,
          padding: '15px 0',
          '& .MuiSlider-track': {
            border: 'none',
            backgroundColor: colors.black,
          },
          '& .MuiSlider-rail': {
            backgroundColor: colors.gray[200],
            opacity: 1,
          },
          '& .MuiSlider-thumb': {
            width: 16,
            height: 16,
            backgroundColor: colors.black,
            borderRadius: 0,
            '&:focus, &:hover, &.Mui-active, &.Mui-focusVisible': {
              boxShadow: 'none',
            },
            '&::before': {
              display: 'none',
            },
          },
          '& .MuiSlider-markLabel': {
            fontSize: typography.fontSize.bodySmall,
            color: colors.text.secondary,
          },
          '& .MuiSlider-mark': {
            backgroundColor: colors.gray[300],
            width: 2,
            height: 8,
          },
        }}
      />

      {!marks && (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            mt: `${spacing.xs}px`,
          }}
        >
          <Typography sx={{ fontSize: typography.fontSize.bodySmall, color: colors.text.secondary }}>
            {valueFormatter(min)}
          </Typography>
          <Typography sx={{ fontSize: typography.fontSize.bodySmall, color: colors.text.secondary }}>
            {valueFormatter(max)}
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default Slider;
