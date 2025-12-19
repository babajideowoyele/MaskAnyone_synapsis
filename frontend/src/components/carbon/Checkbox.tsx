import React from 'react';
import { Box, SxProps, Theme } from '@mui/material';
import { colors, spacing, transitions } from '../../styles/tokens';

interface CheckboxProps {
  checked: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  sx?: SxProps<Theme>;
}

const getSize = (size: 'sm' | 'md' | 'lg'): number => {
  const sizes = { sm: 18, md: 24, lg: 28 };
  return sizes[size];
};

/**
 * Checkbox - Custom styled checkbox
 * Follows brutalist design with sharp corners
 */
export const Checkbox: React.FC<CheckboxProps> = ({
  checked,
  onChange,
  disabled = false,
  size = 'md',
  sx = {},
}) => {
  const boxSize = getSize(size);

  const handleClick = () => {
    if (!disabled && onChange) {
      onChange(!checked);
    }
  };

  return (
    <Box
      onClick={handleClick}
      sx={{
        width: boxSize,
        height: boxSize,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: `all ${transitions.fast}`,
        border: `2px solid ${checked ? colors.black : colors.gray[300]}`,
        backgroundColor: checked ? colors.black : colors.white,
        color: checked ? colors.white : 'transparent',
        opacity: disabled ? 0.5 : 1,
        '&:hover': {
          borderColor: disabled ? undefined : colors.black,
        },
        ...sx,
      }}
    >
      {checked && <i className="fas fa-check" style={{ fontSize: boxSize * 0.5 }} />}
    </Box>
  );
};

export default Checkbox;
