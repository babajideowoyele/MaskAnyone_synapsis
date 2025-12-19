# MaskAnyone UI Migration Plan
## From MUI to Carbon-Inspired Brutalist Design

### Overview

This document outlines the phased migration from the current Material UI-based frontend to a new IBM Carbon-inspired brutalist design system. The new design emphasizes clarity, professional appearance, and improved user experience for video anonymization workflows.

---

## Phase 0: Foundation (Current Status)

### Completed
- [x] Design mockups created (6 HTML templates in `carbon_redesign/`)
- [x] Initial Carbon components built (`src/components/carbon/`)
  - Button, IconBox, CardElevated, Tag, AppHeader, NavTabs, StepIndicator
- [x] Demo page at `/demo` route
- [x] Design tokens started (`frontend/src/mui/tokens.ts`)

### Design System Files
```
src/components/carbon/
├── index.ts          # Exports
├── Button.tsx        # Primary/secondary/ghost/danger buttons
├── IconBox.tsx       # Icon containers with variants
├── CardElevated.tsx  # Brutalist shadow cards
├── Tag.tsx           # Status tags
├── AppHeader.tsx     # Top navigation
├── NavTabs.tsx       # Tab navigation
└── StepIndicator.tsx # Multi-step progress
```

---

## Phase 1: Design System Completion
**Priority: HIGH | Effort: 3-5 days**

### 1.1 Core Components to Build

| Component | Template Source | Description |
|-----------|-----------------|-------------|
| `FileDropZone` | upload-flow.html | Drag & drop with dashed border, file preview |
| `ProgressBar` | upload-flow.html | Linear progress with percentage |
| `Checkbox` | upload-flow.html | Custom styled checkbox |
| `ChecklistItem` | upload-flow.html | Row with checkbox, icon, label |
| `StrategyCard` | upload-flow.html | Selectable option card with icon |
| `Slider` | quick-anonymize.html | Intensity/range slider |
| `SearchBox` | batch-redesign.html | Search input with icon |
| `Modal` | batch-redesign.html | Dialog overlay with shadow |

### 1.2 Layout Components

| Component | Template Source | Description |
|-----------|-----------------|-------------|
| `Sidebar` | quick-anonymize.html | Collapsible left panel |
| `SidebarSection` | quick-anonymize.html | Panel section with header |
| `PageLayout` | all templates | Main app frame structure |
| `Panel` | editor-redesign.html | Bordered panel with header |

### 1.3 Video-Specific Components

| Component | Template Source | Description |
|-----------|-----------------|-------------|
| `VideoCanvas` | editor-redesign.html | Video display with bounding boxes |
| `VideoControls` | quick-anonymize.html | Play/pause, timeline, volume |
| `Timeline` | editor-redesign.html | Multi-track timeline with keyframes |
| `SubjectBox` | editor-redesign.html | Draggable/resizable bounding box |
| `CompareView` | quick-anonymize.html | Side-by-side original/preview |

### 1.4 Data Display Components

| Component | Template Source | Description |
|-----------|-----------------|-------------|
| `StatCard` | batch-redesign.html | Metric display card |
| `Table` | batch-redesign.html | Data table with selection |
| `QueueItem` | batch-redesign.html | Job queue row with actions |
| `ActivityItem` | team-workspace.html | Activity feed item |
| `VideoCard` | team-workspace.html | Video thumbnail card |

### 1.5 Design Tokens

```typescript
// frontend/src/styles/tokens.ts
export const colors = {
  black: '#000000',
  white: '#ffffff',
  gray: {
    50: '#fafafa',
    100: '#f5f5f5',
    200: '#e5e5e5',
    300: '#ccc',
    400: '#999',
    500: '#666',
  },
  accent: {
    success: '#00cc6a',
    warning: '#ffd000',
    error: '#ff3b30',
    info: '#007aff',
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const borders = {
  thin: '1px solid',
  medium: '2px solid',
  thick: '3px solid',
  dashed: '3px dashed',
};

export const shadows = {
  sm: 'translate(4px, 4px)',
  md: 'translate(6px, 6px)',
  lg: 'translate(8px, 8px)',
};
```

---

## Phase 2: Upload Flow Implementation
**Priority: HIGH | Effort: 1 week**

Implement the 4-step upload wizard as the first major new feature.

### 2.1 Route Structure
```
/upload              → Step 1: File Upload
/upload/review       → Step 2: Detection Review
/upload/configure    → Step 3: Configure Masking
/upload/process      → Step 4: Processing & Complete
```

### 2.2 Pages to Create
```
frontend/src/pages/upload/
├── UploadPage.tsx           # Step 1: Drag & drop upload
├── ReviewPage.tsx           # Step 2: Person detection review
├── ConfigurePage.tsx        # Step 3: Strategy selection
├── ProcessPage.tsx          # Step 4: Progress & completion
└── UploadLayout.tsx         # Shared layout with step indicator
```

### 2.3 Features
- Drag and drop video upload
- File validation (format, size)
- Auto-detection of subjects
- Selectable hiding strategies (blur, solid, pixelate, contour)
- Optional pose overlay selection
- Real-time processing progress
- Download & "Process Another" actions

---

## Phase 3: Quick Anonymize Page
**Priority: HIGH | Effort: 1 week**

Single-page workflow for fast processing.

### 3.1 Features
- Preset selection sidebar (Face Blur, Full Body, Skeleton, Pixelate)
- Intensity slider
- Target selection (Faces, Body, Hands, License Plates)
- Detected subjects list with toggle
- Side-by-side preview (Original / Masked)
- Video playback controls
- Workflow progress checklist

### 3.2 Page Structure
```
frontend/src/pages/
└── QuickAnonymizePage.tsx
    ├── PresetSidebar
    ├── CompareView
    ├── VideoControls
    └── WorkflowPanel
```

---

## Phase 4: Advanced Editor
**Priority: MEDIUM | Effort: 2 weeks**

Full-featured video editing interface.

### 4.1 Features
- Canvas with draggable subject bounding boxes
- Per-subject masking configuration
- Multi-track timeline
- Keyframe editing
- Body part selection (Face, Body, Hands, Feet)
- Property panel for selected subject
- Zoom controls
- Undo/Redo

### 4.2 Page Structure
```
frontend/src/pages/
└── EditorPage.tsx
    ├── LeftPanel (Subjects list, Body parts)
    ├── CenterArea
    │   ├── VideoCanvas
    │   └── Timeline
    └── RightPanel (Properties)
```

---

## Phase 5: Batch Processing
**Priority: MEDIUM | Effort: 1 week**

Multi-video queue management.

### 5.1 Features
- Stats dashboard (Total, Completed, Processing, Time remaining)
- Batch configuration panel
- Search and filter
- Queue table with status, progress, actions
- Bulk selection and actions
- CLI command preview

### 5.2 Page Structure
```
frontend/src/pages/
└── BatchPage.tsx
    ├── StatsGrid
    ├── ConfigPanel
    ├── QueueTable
    └── CLIPanel
```

---

## Phase 6: Team Workspace
**Priority: LOW | Effort: 1 week**

Collaboration features (if multi-user mode is needed).

### 6.1 Features
- Projects sidebar
- Team members list with online status
- Video grid with status badges
- Activity feed
- Project settings

---

## Phase 7: Migration of Existing Pages
**Priority: LOW | Effort: 2 weeks**

Convert remaining pages to new design.

### Pages to Migrate
1. `VideosPage` → Merge into Quick Anonymize or keep as library
2. `RunsPage` → Merge into Batch page
3. `PresetsPage` → New Templates page
4. `WorkersPage` → Admin panel
5. `LandingPage` → Redesign
6. `AboutPage` → Redesign

---

## Implementation Guidelines

### Component Conventions

```tsx
// File: frontend/src/components/carbon/Button.tsx
import React from 'react';
import styled from '@emotion/styled';
import { colors, spacing } from '../../styles/tokens';

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  disabled?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
}

const StyledButton = styled.button<ButtonProps>`
  display: inline-flex;
  align-items: center;
  gap: ${spacing.sm}px;
  font-family: 'Inter', sans-serif;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: all 0.15s;
  // ... variant styles
`;

export const Button: React.FC<ButtonProps> = ({ children, ...props }) => {
  return <StyledButton {...props}>{children}</StyledButton>;
};
```

### CSS-in-JS Approach
- Use `@emotion/styled` for component styling
- Use design tokens for all values
- No inline styles except for dynamic values

### Folder Structure
```
frontend/src/
├── components/
│   └── carbon/           # Design system components
├── pages/
│   ├── upload/           # Upload flow pages
│   ├── QuickAnonymizePage.tsx
│   ├── EditorPage.tsx
│   ├── BatchPage.tsx
│   └── WorkspacePage.tsx
├── styles/
│   ├── tokens.ts         # Design tokens
│   ├── global.css        # Global styles, fonts
│   └── theme.ts          # MUI theme overrides
└── layouts/
    ├── AppLayout.tsx     # Main app layout
    └── UploadLayout.tsx  # Upload wizard layout
```

---

## Success Metrics

- [ ] All new pages use Carbon components exclusively
- [ ] Consistent visual language across application
- [ ] Improved user task completion time
- [ ] Reduced clicks for common workflows
- [ ] Mobile-responsive layouts
- [ ] Accessibility compliance (WCAG 2.1 AA)

---

## Timeline Estimate

| Phase | Duration | Dependencies |
|-------|----------|--------------|
| Phase 1: Design System | 3-5 days | None |
| Phase 2: Upload Flow | 1 week | Phase 1 |
| Phase 3: Quick Anonymize | 1 week | Phase 1 |
| Phase 4: Advanced Editor | 2 weeks | Phase 1, 2 |
| Phase 5: Batch Processing | 1 week | Phase 1 |
| Phase 6: Team Workspace | 1 week | Phase 1 |
| Phase 7: Migration | 2 weeks | All above |

**Total: ~8-10 weeks**

---

## Next Steps

1. **Immediate**: Complete Phase 1 components
2. **This Sprint**: Build Upload Flow (Phase 2)
3. **Parallel**: Set up Storybook for component documentation
4. **Ongoing**: User testing and iteration

---

*Last updated: December 2024*
