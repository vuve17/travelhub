'use client';

// ⭐️ Uvozite novu Wrapper komponentu
import MapsLayoutWrapper from '../lib/maps-layout-wrapper';
import { Box } from '@mui/material'; // Uklonjeni nepotrebni importi za Google Maps
import React from 'react'; 
// Uklonite useEffect i useState jer se hasMounted premjestio!
import GlobalSnackbar from '../components/protected/common/global-snackbar';
import Navbar from '../components/protected/common/navbar';
import { ReduxProvider } from '../store/redux-provider';

// ⭐️ Funkcija render i MapsWrapper su uklonjeni odavde!

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // ⭐️ Uklonjeno: hasMounted state i useEffect - to je sada u MapsLayoutWrapper.

  return (
    // ⭐️ Ovaj div je uzrokovao grešku, ali je sada siguran jer ne sadrži nestabilan sadržaj.
    <div className="flex flex-col min-h-screen">
      <header>
        <Navbar />
      </header>
      <ReduxProvider>
        <GlobalSnackbar />
        
        {/* ⭐️ Koristimo novu komponentu koja uvjetno renderira Maps Wrapper */}
        <MapsLayoutWrapper>
            {children} 
        </MapsLayoutWrapper>
        
      </ReduxProvider>
    </div>
  );
}