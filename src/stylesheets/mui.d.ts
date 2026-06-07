import '@mui/material/styles';

declare module '@mui/material/styles' {
  interface Palette {
    tertiary?: Palette['primary'];
    quaternary?: Palette['primary'];
  }

  interface PaletteOptions {
    tertiary?: PaletteOptions['primary'];
    quaternary?: PaletteOptions['primary'];
  }
}

declare module '@mui/material/AppBar' {
  interface AppBarPropsColorOverrides {
    tertiary: true;
    quaternary: true;
  }
}

declare module '@mui/material/Button' {
  interface ButtonPropsColorOverrides {
    tertiary: true;
    quaternary: true;
  }
}

declare module '@mui/material/Typography' {
  interface TypographyPropsColorOverrides {
    tertiary: true;
    quaternary: true;
  }
}
