import {createTheme} from "@mui/material";

const fontFamily = '"IBM Plex Sans", "Helvetica Neue", Arial, sans-serif';
const monoFontFamily = '"IBM Plex Mono", "Courier New", monospace';

export const theme = createTheme({
    palette: {
        primary: {
            main: '#161616',
            dark: '#000000',
            light: '#393939',
        },
        secondary: {
            main: '#525252',
            dark: '#393939',
            light: '#6f6f6f',
        },
        background: {
            default: '#ffffff',
            paper: '#ffffff',
        },
        text: {
            primary: '#161616',
            secondary: '#525252',
            disabled: '#a8a8a8',
        },
        divider: '#e0e0e0',
        error: {
            main: '#da1e28',
        },
        warning: {
            main: '#f1c21b',
        },
        success: {
            main: '#198038',
        },
        info: {
            main: '#0043ce',
        },
    },
    typography: {
        fontFamily,
        h1: { fontWeight: 300, letterSpacing: '-0.02em' },
        h2: { fontWeight: 300, letterSpacing: '-0.02em' },
        h3: { fontWeight: 400 },
        h4: { fontWeight: 400 },
        h5: { fontWeight: 600 },
        h6: { fontWeight: 600 },
        subtitle1: { fontWeight: 600, letterSpacing: '0.01em' },
        subtitle2: { fontWeight: 600, letterSpacing: '0.01em' },
        body1: { fontWeight: 400, fontSize: '0.875rem', lineHeight: 1.5 },
        body2: { fontWeight: 400, fontSize: '0.8125rem', lineHeight: 1.5 },
        button: { fontWeight: 600, textTransform: 'none', letterSpacing: '0.02em' },
        caption: { fontSize: '0.75rem', color: '#525252' },
        overline: { fontFamily: monoFontFamily, fontSize: '0.75rem', letterSpacing: '0.08em' },
    },
    shape: {
        borderRadius: 0,
    },
    components: {
        MuiButtonBase: {
            styleOverrides: {
                root: {
                    borderRadius: 0,
                },
            },
        },
        MuiButton: {
            styleOverrides: {
                root: ({ ownerState }) => ({
                    borderRadius: 0,
                    padding: ownerState.variant === 'contained' ? '8px 24px' : undefined,
                    boxShadow: 'none',
                    '&:hover': {
                        boxShadow: 'none',
                    },
                }),
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    borderRadius: 0,
                    border: '1px solid #e0e0e0',
                    boxShadow: 'none',
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    borderRadius: 0,
                    boxShadow: 'none',
                    border: '1px solid #e0e0e0',
                },
            },
        },
        MuiDialog: {
            styleOverrides: {
                paper: {
                    borderRadius: 0,
                },
            },
        },
        MuiChip: {
            styleOverrides: {
                root: {
                    borderRadius: 0,
                    fontWeight: 500,
                },
            },
        },
        MuiTableHead: {
            styleOverrides: {
                root: {
                    '& .MuiTableCell-head': {
                        fontWeight: 600,
                        fontSize: '0.75rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.06em',
                        color: '#525252',
                    },
                },
            },
        },
        MuiAppBar: {
            styleOverrides: {
                root: {
                    boxShadow: 'none',
                    borderBottom: '1px solid #e0e0e0',
                },
            },
        },
        MuiDrawer: {
            styleOverrides: {
                paper: {
                    borderRight: '1px solid #e0e0e0',
                },
            },
        },
        MuiLinearProgress: {
            styleOverrides: {
                root: {
                    borderRadius: 0,
                    backgroundColor: '#e0e0e0',
                },
            },
        },
    },
});
