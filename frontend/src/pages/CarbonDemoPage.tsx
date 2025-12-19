import React, { useState } from 'react';
import { Box, Typography, Container, Grid, Divider } from '@mui/material';
import {
  Button,
  IconBox,
  CardElevated,
  Tag,
  AppHeader,
  NavTabs,
  StepIndicator,
  Step,
  NavTab,
  FileDropZone,
  ProgressBar,
  Checkbox,
  ChecklistItem,
  StrategyCard,
  Slider,
} from '../components/carbon';
import { colors, spacing } from '../styles/tokens';

/**
 * CarbonDemoPage - Showcase all Carbon Design System components
 * This page demonstrates the new brutalist design system
 */
const CarbonDemoPage: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);

  const navTabs: NavTab[] = [
    { label: 'Dashboard', path: '/dashboard', icon: <i className="fas fa-home" /> },
    { label: 'Quick Mask', path: '/quick-mask', icon: <i className="fas fa-mask" /> },
    { label: 'Demo', path: '/demo', icon: <i className="fas fa-flask" /> },
  ];

  const steps: Step[] = [
    { label: 'Upload' },
    { label: 'Review' },
    { label: 'Configure' },
    { label: 'Process' },
  ];

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: colors.background.secondary }}>
      {/* App Header Demo */}
      <AppHeader
        logo={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: `${spacing.md}px` }}>
            <i className="fas fa-mask" style={{ fontSize: '18px' }} />
            <Typography variant="h6">MaskAnyone</Typography>
          </Box>
        }
        navigation={<NavTabs tabs={navTabs} />}
        actions={
          <>
            <Button variant="ghost" size="sm" icon={<i className="fas fa-question-circle" />}>
              Help
            </Button>
            <Button variant="primary" size="sm" icon={<i className="fas fa-user" />}>
              Account
            </Button>
          </>
        }
      />

      <Container maxWidth="lg" sx={{ py: spacing.xxxl }}>
        {/* Page Title */}
        <Box sx={{ mb: spacing.xxxl }}>
          <Typography variant="h1" sx={{ mb: spacing.sm }}>
            Carbon <Box component="span" sx={{ fontWeight: 700 }}>Design System</Box>
          </Typography>
          <Typography variant="body1" color="text.secondary">
            IBM Carbon-inspired brutalist components for MaskAnyone
          </Typography>
        </Box>

        {/* Buttons Section */}
        <Box sx={{ mb: spacing.xxxl }}>
          <Typography variant="h3" sx={{ mb: spacing.xl }}>
            Buttons
          </Typography>
          <Grid container spacing={2}>
            <Grid item>
              <Button variant="primary" icon={<i className="fas fa-play" />}>
                Primary Button
              </Button>
            </Grid>
            <Grid item>
              <Button variant="secondary" icon={<i className="fas fa-download" />}>
                Secondary Button
              </Button>
            </Grid>
            <Grid item>
              <Button variant="ghost" icon={<i className="fas fa-cog" />}>
                Ghost Button
              </Button>
            </Grid>
            <Grid item>
              <Button variant="danger" icon={<i className="fas fa-trash" />}>
                Danger Button
              </Button>
            </Grid>
          </Grid>

          <Box sx={{ mt: spacing.xl }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: spacing.md }}>
              Button Sizes
            </Typography>
            <Grid container spacing={2} alignItems="center">
              <Grid item>
                <Button variant="primary" size="sm">
                  Small
                </Button>
              </Grid>
              <Grid item>
                <Button variant="primary" size="md">
                  Medium
                </Button>
              </Grid>
              <Grid item>
                <Button variant="primary" size="lg">
                  Large
                </Button>
              </Grid>
            </Grid>
          </Box>
        </Box>

        <Divider sx={{ my: spacing.xxxl }} />

        {/* Icon Boxes Section */}
        <Box sx={{ mb: spacing.xxxl }}>
          <Typography variant="h3" sx={{ mb: spacing.xl }}>
            Icon Boxes
          </Typography>
          <Grid container spacing={2} alignItems="center">
            <Grid item>
              <IconBox size="sm" variant="filled">
                <i className="fas fa-user" />
              </IconBox>
            </Grid>
            <Grid item>
              <IconBox size="md" variant="filled">
                <i className="fas fa-video" />
              </IconBox>
            </Grid>
            <Grid item>
              <IconBox size="lg" variant="filled">
                <i className="fas fa-mask" />
              </IconBox>
            </Grid>
            <Grid item>
              <IconBox size="xl" variant="filled">
                <i className="fas fa-play" />
              </IconBox>
            </Grid>
          </Grid>

          <Box sx={{ mt: spacing.xl }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: spacing.md }}>
              Variants
            </Typography>
            <Grid container spacing={2} alignItems="center">
              <Grid item>
                <IconBox variant="filled">
                  <i className="fas fa-check" />
                </IconBox>
              </Grid>
              <Grid item>
                <IconBox variant="outline">
                  <i className="fas fa-lightbulb" />
                </IconBox>
              </Grid>
              <Grid item>
                <IconBox variant="gray">
                  <i className="fas fa-times" />
                </IconBox>
              </Grid>
              <Grid item>
                <IconBox variant="success">
                  <i className="fas fa-check" />
                </IconBox>
              </Grid>
              <Grid item>
                <IconBox variant="warning">
                  <i className="fas fa-exclamation" />
                </IconBox>
              </Grid>
              <Grid item>
                <IconBox variant="error">
                  <i className="fas fa-times" />
                </IconBox>
              </Grid>
            </Grid>
          </Box>
        </Box>

        <Divider sx={{ my: spacing.xxxl }} />

        {/* Tags Section */}
        <Box sx={{ mb: spacing.xxxl }}>
          <Typography variant="h3" sx={{ mb: spacing.xl }}>
            Tags
          </Typography>
          <Grid container spacing={1}>
            <Grid item>
              <Tag variant="filled">Filled</Tag>
            </Grid>
            <Grid item>
              <Tag variant="outline">Outline</Tag>
            </Grid>
            <Grid item>
              <Tag variant="success" icon={<i className="fas fa-check" />}>
                Success
              </Tag>
            </Grid>
            <Grid item>
              <Tag variant="warning" icon={<i className="fas fa-exclamation" />}>
                Warning
              </Tag>
            </Grid>
            <Grid item>
              <Tag variant="error" icon={<i className="fas fa-times" />}>
                Error
              </Tag>
            </Grid>
            <Grid item>
              <Tag variant="blue">Blue</Tag>
            </Grid>
            <Grid item>
              <Tag variant="green">Green</Tag>
            </Grid>
            <Grid item>
              <Tag variant="purple">Purple</Tag>
            </Grid>
            <Grid item>
              <Tag variant="orange">Orange</Tag>
            </Grid>
          </Grid>
        </Box>

        <Divider sx={{ my: spacing.xxxl }} />

        {/* Cards Section */}
        <Box sx={{ mb: spacing.xxxl }}>
          <Typography variant="h3" sx={{ mb: spacing.xl }}>
            Elevated Cards
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <CardElevated shadowSize="sm">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: `${spacing.md}px`, mb: spacing.md }}>
                  <IconBox size="lg" variant="filled">
                    <i className="fas fa-upload" />
                  </IconBox>
                  <Typography variant="h4">Upload Video</Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Upload your video file to begin the anonymization process. Supports MP4, AVI, MOV formats.
                </Typography>
              </CardElevated>
            </Grid>
            <Grid item xs={12} md={4}>
              <CardElevated shadowSize="md">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: `${spacing.md}px`, mb: spacing.md }}>
                  <IconBox size="lg" variant="success">
                    <i className="fas fa-eye-slash" />
                  </IconBox>
                  <Typography variant="h4">Configure Mask</Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Choose your masking strategy and intensity. Preview results in real-time before processing.
                </Typography>
              </CardElevated>
            </Grid>
            <Grid item xs={12} md={4}>
              <CardElevated shadowSize="lg">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: `${spacing.md}px`, mb: spacing.md }}>
                  <IconBox size="lg" variant="warning">
                    <i className="fas fa-download" />
                  </IconBox>
                  <Typography variant="h4">Download Result</Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Download your anonymized video once processing is complete. Save templates for future use.
                </Typography>
              </CardElevated>
            </Grid>
          </Grid>
        </Box>

        <Divider sx={{ my: spacing.xxxl }} />

        {/* Step Indicator Section */}
        <Box sx={{ mb: spacing.xxxl }}>
          <Typography variant="h3" sx={{ mb: spacing.xl }}>
            Step Indicator
          </Typography>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              py: spacing.xxxl,
              backgroundColor: colors.white,
              border: `1px solid ${colors.border.medium}`,
            }}
          >
            <StepIndicator steps={steps} currentStep={currentStep} completedSteps={[0]} />
          </Box>
          <Box sx={{ display: 'flex', gap: spacing.md, mt: spacing.xl, justifyContent: 'center' }}>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
              disabled={currentStep === 0}
            >
              Previous
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setCurrentStep(Math.min(steps.length - 1, currentStep + 1))}
              disabled={currentStep === steps.length - 1}
            >
              Next
            </Button>
          </Box>
        </Box>

        <Divider sx={{ my: spacing.xxxl }} />

        {/* Typography Section */}
        <Box sx={{ mb: spacing.xxxl }}>
          <Typography variant="h3" sx={{ mb: spacing.xl }}>
            Typography
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: spacing.xl }}>
            <Box>
              <Typography variant="h1">
                Display Heading <Box component="span" sx={{ fontWeight: 700 }}>Bold Span</Box>
              </Typography>
              <Typography variant="caption" color="text.secondary">
                variant="h1" - 32px light with bold spans
              </Typography>
            </Box>
            <Box>
              <Typography variant="h2">
                Page Title <Box component="span" sx={{ fontWeight: 700 }}>Bold Span</Box>
              </Typography>
              <Typography variant="caption" color="text.secondary">
                variant="h2" - 28px light
              </Typography>
            </Box>
            <Box>
              <Typography variant="h3">Section Header</Typography>
              <Typography variant="caption" color="text.secondary">
                variant="h3" - 20px semibold
              </Typography>
            </Box>
            <Box>
              <Typography variant="h4">Card Title</Typography>
              <Typography variant="caption" color="text.secondary">
                variant="h4" - 18px semibold
              </Typography>
            </Box>
            <Box>
              <Typography variant="h6">LABEL TEXT</Typography>
              <Typography variant="caption" color="text.secondary">
                variant="h6" - 11px bold uppercase with letter spacing
              </Typography>
            </Box>
            <Box>
              <Typography variant="body1">
                Body text paragraph. This is the default text style used for most content in the application.
                It's designed for optimal readability with proper line height and spacing.
              </Typography>
              <Typography variant="caption" color="text.secondary">
                variant="body1" - 14px regular
              </Typography>
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary">
                Secondary body text. Used for less prominent content, descriptions, and supporting information.
              </Typography>
              <Typography variant="caption" color="text.secondary">
                variant="body2" - 13px regular
              </Typography>
            </Box>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default CarbonDemoPage;
