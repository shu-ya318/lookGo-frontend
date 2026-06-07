import { RouterProvider } from 'react-router-dom';
import { SnackbarProvider } from 'notistack';

import { CssBaseline, ThemeProvider } from '@mui/material';

import { theme } from './stylesheets/theme';
import { router } from './router';
import './App.css'

const App = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <SnackbarProvider anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <RouterProvider router={router} />
      </SnackbarProvider>
    </ThemeProvider>
  );
}

export default App;
