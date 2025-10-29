'use client';

import { Status, Wrapper } from '@googlemaps/react-wrapper';
import { Box, CircularProgress, Typography } from '@mui/material';
import React, { useEffect, useState } from 'react';

// Funkcija za renderiranje statusa (ostaje ista)
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


export default function MapsLayoutWrapper({
    children,
}: {
    children: React.ReactNode;
}) {
    // ⭐️ Korištenje stanja za provjeru montiranja unutar ove komponente
    // Ovo osigurava da se Wrapper renderira tek kada je komponenta u potpunosti klijentska.
    const [hasMounted, setHasMounted] = useState(false);

    useEffect(() => {
        // Koristimo setTimeout ili requestAnimationFrame umjesto čistog useEffect
        // da bismo bili 100% sigurni da se renderiranje događa na klijentu.
        const timeout = setTimeout(() => setHasMounted(true), 10); 
        return () => clearTimeout(timeout);
    }, []);


    const NEXT_PUBLIC_GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''
    
    // Uvjetni render
    const Content = hasMounted ? (
        <Wrapper apiKey={NEXT_PUBLIC_GOOGLE_MAPS_API_KEY} render={render}>
            {children}
        </Wrapper>
    ) : (
        // Renderirajte djecu bez Wrapper-a dok se ne montira
        // Održava identičnu strukturu na serveru i klijentu tijekom inicijalnog SSR-a
        <>
            {children}
        </>
    );

    return (
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
            {Content}
        </Box>
    );
}