/**
 * Design Tokens for MaskAnyone Carbon Design System
 * IBM Carbon-inspired brutalist design tokens
 */

// =============================================================================
// COLORS
// =============================================================================

export const colors = {
  // Base colors
  black: '#000000',
  white: '#ffffff',

  // Gray scale
  gray: {
    50: '#fafafa',
    100: '#f5f5f5',
    200: '#e5e5e5',
    300: '#cccccc',
    400: '#999999',
    500: '#666666',
    600: '#333333',
  },

  // Accent colors
  accent: {
    success: '#00cc6a',
    warning: '#ffd000',
    error: '#ff3b30',
    info: '#007aff',
  },

  // Semantic aliases
  text: {
    primary: '#000000',
    secondary: '#666666',
    disabled: '#999999',
    inverse: '#ffffff',
  },

  background: {
    primary: '#ffffff',
    secondary: '#f5f5f5',
    tertiary: '#fafafa',
    dark: '#1a1a1a',
  },

  border: {
    light: '#e5e5e5',
    medium: '#cccccc',
    dark: '#000000',
  },

  ui: {
    hover: '#f0f0f0',
    active: '#e5e5e5',
    disabled: '#cccccc',
  },

  // Subject/person colors for editor
  subjects: [
    '#00cc6a', // green
    '#ff5757', // red
    '#4ecdc4', // teal
    '#ffd000', // yellow
    '#007aff', // blue
    '#af52de', // purple
  ],
};

// =============================================================================
// SPACING
// =============================================================================

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 48,
};

// =============================================================================
// TYPOGRAPHY
// =============================================================================

export const typography = {
  fontFamily: {
    primary: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    mono: "'SF Mono', 'Monaco', 'Consolas', monospace",
  },

  fontSize: {
    xs: '10px',
    caption: '11px',
    bodySmall: '12px',
    body: '13px',
    bodyLarge: '14px',
    h6: '11px',
    h5: '14px',
    h4: '18px',
    h3: '20px',
    h2: '28px',
    h1: '32px',
  },

  fontWeight: {
    light: 300,
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },

  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.6,
  },

  letterSpacing: {
    tight: '-0.5px',
    normal: '0',
    wide: '0.5px',
    wider: '1px',
  },
};

// =============================================================================
// BORDERS
// =============================================================================

export const borders = {
  width: {
    thin: '1px',
    medium: '2px',
    thick: '3px',
  },

  style: {
    solid: 'solid',
    dashed: 'dashed',
  },

  radius: {
    none: '0',
    sm: '2px',
    md: '4px',
    lg: '8px',
  },
};

// =============================================================================
// SHADOWS (Brutalist offset shadows)
// =============================================================================

export const shadows = {
  sm: {
    offset: '4px 4px',
    transform: 'translate(4px, 4px)',
  },
  md: {
    offset: '6px 6px',
    transform: 'translate(6px, 6px)',
  },
  lg: {
    offset: '8px 8px',
    transform: 'translate(8px, 8px)',
  },
};

// =============================================================================
// TRANSITIONS
// =============================================================================

export const transitions = {
  fast: '0.1s',
  normal: '0.15s',
  slow: '0.2s',
  easing: 'ease',
};

// =============================================================================
// BREAKPOINTS
// =============================================================================

export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  xxl: '1536px',
};

// =============================================================================
// Z-INDEX
// =============================================================================

export const zIndex = {
  base: 0,
  dropdown: 100,
  sticky: 200,
  modal: 300,
  popover: 400,
  tooltip: 500,
};

// =============================================================================
// COMPONENT-SPECIFIC TOKENS
// =============================================================================

export const components = {
  button: {
    sm: {
      padding: `${spacing.sm}px ${spacing.md + 2}px`,
      fontSize: typography.fontSize.caption,
    },
    md: {
      padding: `${spacing.md}px ${spacing.lg}px`,
      fontSize: typography.fontSize.bodySmall,
    },
    lg: {
      padding: `${spacing.base}px ${spacing.xxl}px`,
      fontSize: typography.fontSize.body,
    },
  },

  iconBox: {
    sm: { size: 32, fontSize: '14px' },
    md: { size: 40, fontSize: '16px' },
    lg: { size: 48, fontSize: '20px' },
    xl: { size: 56, fontSize: '24px' },
    xxl: { size: 80, fontSize: '32px' },
  },

  card: {
    padding: {
      sm: spacing.base,
      md: spacing.lg,
      lg: spacing.xl,
    },
  },

  input: {
    padding: `${spacing.md}px ${spacing.base}px`,
    fontSize: typography.fontSize.body,
  },
};
