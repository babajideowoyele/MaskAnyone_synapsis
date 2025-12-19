import React from 'react';
import { Box, SxProps, Theme } from '@mui/material';
import { colors, spacing, typography, transitions } from '../../styles/tokens';

export interface Step {
  label: string;
}

interface StepIndicatorProps {
  steps: Step[];
  currentStep: number;
  completedSteps?: number[];
  sx?: SxProps<Theme>;
}

/**
 * StepIndicator - Multi-step progress indicator
 * Shows current progress through a workflow
 */
export const StepIndicator: React.FC<StepIndicatorProps> = ({
  steps,
  currentStep,
  completedSteps = [],
  sx = {},
}) => {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 0,
        ...sx,
      }}
    >
      {steps.map((step, index) => {
        const isActive = index === currentStep;
        const isCompleted = completedSteps.includes(index) || index < currentStep;
        const isLast = index === steps.length - 1;

        return (
          <React.Fragment key={index}>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                position: 'relative',
              }}
            >
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: typography.fontSize.bodyLarge,
                  fontWeight: typography.fontWeight.semibold,
                  transition: `all ${transitions.normal}`,
                  backgroundColor: isActive || isCompleted ? colors.black : colors.gray[200],
                  color: isActive || isCompleted ? colors.white : colors.gray[400],
                }}
              >
                {isCompleted && !isActive ? (
                  <i className="fas fa-check" style={{ fontSize: '14px' }} />
                ) : (
                  index + 1
                )}
              </Box>
              <Box
                sx={{
                  position: 'absolute',
                  top: '100%',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  marginTop: `${spacing.xs}px`,
                  fontSize: typography.fontSize.caption,
                  fontWeight: typography.fontWeight.medium,
                  color: isActive || isCompleted ? colors.black : colors.gray[400],
                  whiteSpace: 'nowrap',
                }}
              >
                {step.label}
              </Box>
            </Box>

            {!isLast && (
              <Box
                sx={{
                  width: 60,
                  height: 2,
                  backgroundColor: isCompleted ? colors.black : colors.gray[200],
                  transition: `background-color ${transitions.normal}`,
                }}
              />
            )}
          </React.Fragment>
        );
      })}
    </Box>
  );
};

export default StepIndicator;
