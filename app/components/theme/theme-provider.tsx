"use client";

import React, { createContext, useContext, useState, useMemo } from 'react';
import { ThemeProvider as MUIThemeProvider, PaletteMode } from '@mui/material';
import { lightTheme, darkTheme } from './theme';
interface ColorModeContextType {
  mode: PaletteMode;
  toggleThemeMode: () => void;
}

const ColorModeContext = createContext<ColorModeContextType>({
  mode: 'light',
  toggleThemeMode: () => {},
});

// This hook is used in components like the Navbar
export const useThemeMode = () => useContext(ColorModeContext);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<PaletteMode>('light');

  // Value provided to context consumers (e.g., Navbar)
  const colorMode = useMemo(
    () => ({
      toggleThemeMode: () => {
        setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
      },
      mode,
    }),
    [mode],
  );

  // The actual MUI Theme object
  const theme = useMemo(() => (mode === 'light' ? lightTheme : darkTheme), [mode]);

  return (
    <ColorModeContext.Provider value={colorMode}>
      {/* MUIThemeProvider wraps the entire application */}
      <MUIThemeProvider theme={theme}>
        {children}
      </MUIThemeProvider>
    </ColorModeContext.Provider>
  );
}