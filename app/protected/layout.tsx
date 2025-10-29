'use client';

import { Status, Wrapper } from '@googlemaps/react-wrapper';
import { Box, CircularProgress, Typography } from '@mui/material';
import React, { useEffect, useState } from 'react'; // ⭐️ Import useEffect and useState
import GlobalSnackbar from '../components/protected/common/global-snackbar';
import Navbar from '../components/protected/common/navbar';
import { ReduxProvider } from '../store/redux-provider';

const render = (status: Status) => {
  if (status === Status.FAILURE) return <Typography color="error">Error loading map!</Typography>;
  if (status === Status.LOADING) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 400,
          width: '100%',
          p: 2
        }}
      >
        <CircularProgress size={40} sx={{ mb: 2 }} />
        <Typography color="text.secondary">Initializing Map API...</Typography>
      </Box>
    );
  }
  return <></>;
};

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // ⭐️ 1. State to track client mount
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    const rafId = requestAnimationFrame(() => setHasMounted(true));
    return () => cancelAnimationFrame(rafId);
  }, []);

  const NEXT_PUBLIC_GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''

  const MapsWrapper = hasMounted ? (
    <Wrapper apiKey={NEXT_PUBLIC_GOOGLE_MAPS_API_KEY} render={render}>
      <Box
        component="main" // Koristimo Box kao zamjenu za 'main' tag
        className="flex-grow md:p-8 sm:p-0 xs:p-0"
        sx={{
          bgcolor: {
            xs: 'background.paper',
            sm: 'background.paper',
            md: 'background.default', // Vraća na default boju za md i veće
          },
        }}
      >
        {children}
      </Box>
    </Wrapper>
  ) : (
    <Box
      component="main" // Koristimo Box kao zamjenu za 'main' tag
      className="flex-grow md:p-8 sm:p-0 xs:p-0"
      sx={{
        bgcolor: {
          xs: 'background.paper',
          sm: 'background.paper',
          md: 'background.default', // Vraća na default boju za md i veće
        },
      }}
    >
      {children}
    </Box>
  );

  return (
    <div className="flex flex-col min-h-screen">
      <header>
        <Navbar />
      </header>
      <ReduxProvider>
        <GlobalSnackbar />
        {MapsWrapper} {/* ⭐️ 4. Use the conditional Wrapper */}
      </ReduxProvider>
    </div>
  );
}