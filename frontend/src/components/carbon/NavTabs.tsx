import React from 'react';
import { Box, SxProps, Theme } from '@mui/material';
import { useNavigate, useLocation } from 'react-router';
import { colors, spacing, typography, transitions } from '../../styles/tokens';

export interface NavTab {
  label: string;
  path: string;
  icon?: React.ReactNode;
}

interface NavTabsProps {
  tabs: NavTab[];
  sx?: SxProps<Theme>;
}

/**
 * NavTabs - Navigation tabs for main app navigation
 * Highlights active tab based on current route
 */
export const NavTabs: React.FC<NavTabsProps> = ({ tabs, sx = {} }) => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <Box
      component="nav"
      sx={{
        display: 'flex',
        gap: `${spacing.xs}px`,
        ...sx,
      }}
    >
      {tabs.map((tab) => {
        const isActive = location.pathname === tab.path;

        return (
          <Box
            key={tab.path}
            onClick={() => navigate(tab.path)}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: `${spacing.sm}px`,
              padding: `${spacing.sm}px ${spacing.md + 2}px`,
              fontSize: typography.fontSize.bodySmall,
              fontWeight: typography.fontWeight.medium,
              cursor: 'pointer',
              transition: `all ${transitions.normal}`,
              color: isActive ? colors.white : colors.text.secondary,
              backgroundColor: isActive ? colors.black : 'transparent',
              '&:hover': {
                backgroundColor: isActive ? colors.black : colors.background.secondary,
                color: isActive ? colors.white : colors.black,
              },
            }}
          >
            {tab.icon}
            {tab.label}
          </Box>
        );
      })}
    </Box>
  );
};

export default NavTabs;
