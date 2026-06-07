import { createTheme } from '@mui/material/styles';
import { grey } from '@mui/material/colors';

export const theme = createTheme({
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          fontWeight: 700,
          whiteSpace: 'nowrap',
          textTransform: 'none',
        },
      },
      variants: [
        {
          props: { variant: 'contained', color: 'primary' },
          style: {
            color: '#FFFFFF',
          },
        },
      ],
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          '&:not(.Mui-selected)': {
            color: 'rgba(0, 0, 0, 0.6)',
          },
          '&.Mui-selected': {
            color: '#000000',
          },
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        indicator: {
          backgroundColor: '#303030',
        },
      },
    },
    MuiFormLabel: {
      styleOverrides: {
        root: {
          marginBottom: '.25rem',
          color: 'primary.dark',
          fontSize: '1rem',
          fontWeight: 500,
        },
        asterisk: {
          color: 'error.main',
          fontWeight: 500,
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          fontSize: '1rem',
          fontWeight: 500,
          height: '3rem',
          borderRadius: '4px',
        },
        input: {
          padding: '.75rem .9375rem',
          '&:-webkit-autofill': {
            WebkitBoxShadow: '0 0 0 100px #FFFFFF inset',
            WebkitTextFillColor: '#000000',
          },
        },
      },
    },
    MuiFilledInput: {
      styleOverrides: {
        root: {
          borderRadius: '4.8px',
          fontSize: '.875rem',
          fontWeight: 400,
          background: '#EFF2F5',
          '&& .MuiInputBase-input': {
            height: '100%',
            border: 'none',
            background: '#EFF2F5',
          },
          '&:hover': {
            backgroundColor: '#EFF2F5',
          },
          '&:focus-within': {
            backgroundColor: '#EFF2F5',
          },
        },
        input: {
          padding: 0,
          borderRadius: '4.8px',
          '&:-webkit-autofill': {
            WebkitBoxShadow: '0 0 0 100px #EFF2F5 inset',
          },
        },
      },
    },
    MuiMenu: {
      defaultProps: {
        disableScrollLock: true,
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          fontSize: '1rem',
          '&:hover': {
            backgroundColor: grey[100],
          },
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          whiteSpace: 'nowrap',
          textTransform: 'none',
          '&:hover': {
            backgroundColor: grey[100],
          },
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          maxWidth: 'none',
        },
      },
    },
  },
  palette: {
    mode: 'light',
    // black
    primary: {
      dark: '#000000',
      main: '#303030',
      light: '#505050',
      contrastText: '#FFFFFF',
    },
    // grey
    secondary: {
      dark: '#828282',
      main: '#9C9C9C',
      light: grey[400], // '#BDBDBD',
    },
    //light grey
    tertiary: {
      dark: '#D9D9D9',
      main: grey[300], //'#E0E0E0',
      light: '#F1F1F1',
    },
    // white
    quaternary: {
      dark: '#F2F2F2',
      main: '#F5F5F5',
      light: '#FFFFFF',
    },
    //state
    // yellow
    warning: {
      main: '#FAAD14',
    },
    //Delete and Reset
    // red
    error: {
      main: '#FF3B30',
    },
    //state, description
    // blue
    info: {
      dark: '#446692',
      main: '#007AFF', // iOS blue
      light: '#91CAFF',
    },
    //state
    // green
    success: {
      dark: '#2AC769',
      main: '#BDEAA3',
      light: '#F6FFED',
    },
    background: {
      default: '#FFFFFF',
      paper: '#FFFFFF',
    },
    text: {
      primary: 'rgba(0, 0, 0, 0.87)',
      secondary: 'rgba(0, 0, 0, 0.6)',
    },
  },
  typography: {
    h1: {
      fontWeight: 700,
    },
    h2: {
      fontWeight: 700,
    },
    h3: {
      fontWeight: 700,
    },
    h4: {
      fontSize: '2.25rem',
      fontWeight: 700,
    },
    h5: {
      fontWeight: 700,
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 700,
    },
    subtitle1: {
      fontSize: '1.125rem',
      fontWeight: 500,
    },
    subtitle2: {
      fontSize: '1rem',
      fontWeight: 500,
    },
    body1: {
      fontSize: '1.125rem',
      fontWeight: 400,
    },
    body2: {
      fontSize: '1rem',
      fontWeight: 400,
    },
    button: {
      fontSize: '1rem',
      fontWeight: 500,
    },
    caption: {
      fontSize: '0.875rem',
      fontWeight: 400,
    },
    overline: {
      fontSize: '0.875rem',
      fontWeight: 400,
    },
    fontFamily: ['Noto Sans TC', 'sans-serif'].join(','),
  },
});
