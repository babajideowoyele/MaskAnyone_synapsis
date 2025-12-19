import React from 'react';
import { Box, SxProps, Theme } from '@mui/material';
import { colors, spacing } from '../../styles/tokens';

interface CardElevatedProps {
  children: React.ReactNode;
  padding?: number | string;
  shadowSize?: 'sm' | 'md' | 'lg';
  sx?: SxProps<Theme>;
}

/**
 * CardElevated - Brutalist elevated card with hard shadow
 * Signature Carbon-inspired component with ::before pseudo-element shadow
 */
export const CardElevated: React.FC<CardElevatedProps> = ({
  children,
  padding = spacing.xl,
  shadowSize = 'md',
  sx = {},
}) => {
  const shadowOffset = shadowSize === 'sm' ? 4 : shadowSize === 'md' ? 6 : 8;

  return (
    <Box
      sx={{
        position: 'relative',
        backgroundColor: colors.white,
        border: `3px solid ${colors.black}`,
        padding: typeof padding === 'number' ? `${padding}px` : padding,
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: colors.black,
          zIndex: -1,
          transform: `translate(${shadowOffset}px, ${shadowOffset}px)`,
        },
        ...sx,
      }}
    >
      {children}
    </Box>
  );
};

export default CardElevated;
