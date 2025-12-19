import React from 'react';
import { Box, SxProps, Theme } from '@mui/material';
import { colors, spacing } from '../../styles/tokens';

interface AppHeaderProps {
  logo: React.ReactNode;
  navigation?: React.ReactNode;
  actions?: React.ReactNode;
  sx?: SxProps<Theme>;
}

/**
 * AppHeader - Top navigation bar
 * Contains logo, navigation tabs, and action buttons
 */
export const AppHeader: React.FC<AppHeaderProps> = ({
  logo,
  navigation,
  actions,
  sx = {},
}) => {
  return (
    <Box
      component="header"
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: `${spacing.base}px ${spacing.xl}px`,
        backgroundColor: colors.white,
        borderBottom: `2px solid ${colors.black}`,
        ...sx,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: `${spacing.base}px` }}>
        {logo}
      </Box>

      {navigation && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: `${spacing.md}px` }}>
          {navigation}
        </Box>
      )}

      {actions && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: `${spacing.sm}px` }}>
          {actions}
        </Box>
      )}
    </Box>
  );
};

export default AppHeader;
