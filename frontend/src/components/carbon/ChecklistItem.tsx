import React from 'react';
import { Box, SxProps, Theme, Typography } from '@mui/material';
import { colors, spacing, transitions, typography } from '../../styles/tokens';
import { Checkbox } from './Checkbox';
import { IconBox } from './IconBox';

interface ChecklistItemProps {
  checked: boolean;
  onChange?: (checked: boolean) => void;
  icon?: React.ReactNode;
  title: string;
  subtitle?: string;
  rightContent?: React.ReactNode;
  disabled?: boolean;
  sx?: SxProps<Theme>;
}

/**
 * ChecklistItem - Row with checkbox, icon, and text
 * Used for person selection, task lists, and options
 */
export const ChecklistItem: React.FC<ChecklistItemProps> = ({
  checked,
  onChange,
  icon,
  title,
  subtitle,
  rightContent,
  disabled = false,
  sx = {},
}) => {
  const handleClick = () => {
    if (!disabled && onChange) {
      onChange(!checked);
    }
  };

  return (
    <Box
      onClick={handleClick}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: `${spacing.base}px`,
        padding: `${spacing.base}px`,
        borderBottom: `1px solid ${colors.gray[200]}`,
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: `background-color ${transitions.fast}`,
        opacity: disabled ? 0.5 : 1,
        '&:last-child': {
          borderBottom: 'none',
        },
        '&:hover': {
          backgroundColor: disabled ? undefined : colors.gray[50],
        },
        ...sx,
      }}
    >
      <Checkbox checked={checked} onChange={onChange} disabled={disabled} />

      {icon && (
        <IconBox size="sm" variant={checked ? 'filled' : 'gray'}>
          {icon}
        </IconBox>
      )}

      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography
          sx={{
            fontSize: typography.fontSize.body,
            fontWeight: typography.fontWeight.semibold,
            color: colors.text.primary,
          }}
        >
          {title}
        </Typography>
        {subtitle && (
          <Typography
            sx={{
              fontSize: typography.fontSize.bodySmall,
              color: colors.text.secondary,
            }}
          >
            {subtitle}
          </Typography>
        )}
      </Box>

      {rightContent}
    </Box>
  );
};

export default ChecklistItem;
