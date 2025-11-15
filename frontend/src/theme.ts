import { createTheme } from '@mui/material/styles';

/**
 * Custom MUI Theme
 * Primary color: Tirkizna (Teal/Cyan)
 */
const theme = createTheme({
  palette: {
    primary: {
      main: '#00BCD4', // Tirkizna
      light: '#4DD0E1', // Svetlija tirkizna
      dark: '#0097A7', // Tamnija tirkizna
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#009688', // Teal
      light: '#4DB6AC',
      dark: '#00796B',
      contrastText: '#FFFFFF',
    },
    success: {
      main: '#10B981',
      light: '#34D399',
      dark: '#059669',
    },
    error: {
      main: '#EF4444',
      light: '#F87171',
      dark: '#DC2626',
    },
    warning: {
      main: '#F59E0B',
      light: '#FBBF24',
      dark: '#D97706',
    },
    info: {
      main: '#00BCD4',
      light: '#4DD0E1',
      dark: '#0097A7',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
    },
    h2: {
      fontWeight: 700,
    },
    h3: {
      fontWeight: 600,
    },
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
  },
});

export default theme;
