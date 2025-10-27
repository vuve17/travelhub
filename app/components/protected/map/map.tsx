// app/components/protected/map/Map.tsx

'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Box, useTheme, Typography } from '@mui/material';
import { MapLocation } from '@/app/types/map-location.type';
import { CoordinateType } from '@/app/types/coordinate.type';
// UVEZITE FUNKCIJE ZA VRIJEME LETA
import { estimateFlightTime, formatFlightTime } from '@/app/lib/haversine-formula';
// NAPOMENA: Prilagodite putanju za distance-utils.ts i coordinate.type ako je potrebno

interface MapComponentProps {
  onLocationSelect: (location: MapLocation | null) => void; 
  initialLocation?: CoordinateType | CoordinateType[]; 
  readOnly?: boolean; 
  routesToDraw?: CoordinateType[]; 
}

const Map: React.FC<MapComponentProps> = ({ onLocationSelect, initialLocation, readOnly = false, routesToDraw }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map>();
  const [markerLibrary, setMarkerLibrary] = useState<typeof google.maps.marker | null>(null);
  
  const [initialMarkers, setInitialMarkers] = useState<google.maps.marker.AdvancedMarkerElement[]>([]);
  const [clickMarker, setClickMarker] = useState<google.maps.marker.AdvancedMarkerElement>();
  const [polylines, setPolylines] = useState<google.maps.Polyline[]>([]);
  const [durationMarker, setDurationMarker] = useState<google.maps.marker.AdvancedMarkerElement | null>(null);
  
  const geocoder = useRef<google.maps.Geocoder | null>(null);
  const theme = useTheme();
  const hasInitializedRef = useRef(false);

  // 1. Initialize Map and Load Marker Library
  useEffect(() => {
    async function initializeMap() {
      const centerCoord = Array.isArray(initialLocation) 
        ? initialLocation[0] 
        : initialLocation || { lat: 45.8, lng: 16.0 };

      if (ref.current && !map) {
        const initialMap = new window.google.maps.Map(ref.current, {
          center: centerCoord,
          zoom: initialLocation ? (Array.isArray(initialLocation) && initialLocation.length > 1 ? 7 : 12) : 9, 
          mapId: "DEMO_MAP_ID",
        });
        setMap(initialMap);
        geocoder.current = new window.google.maps.Geocoder();

        const markerLib = await google.maps.importLibrary("marker") as typeof google.maps.marker;
        setMarkerLibrary(markerLib);
      }
    }
    initializeMap();
  }, [ref, map, initialLocation]);

  // 2. Handle Map Click and Geocoding
  useEffect(() => {
    if (!map || !markerLibrary || readOnly) {
      return;
    }

    const markerLib = markerLibrary;

    const clickHandler = (e: google.maps.MapMouseEvent) => {
      const lat = e.latLng!.lat();
      const lng = e.latLng!.lng();
      const coords = { lat, lng };

      if (clickMarker) {
        clickMarker.map = null;
      }

      const newMarker = new markerLib.AdvancedMarkerElement({
        position: coords,
        map: map,
      });
      setClickMarker(newMarker);

      geocoder.current!.geocode({ location: coords, language: 'en' }, (results, status) => {
        let city: string | null = null;
        let country: string | null = null;
        if (status === "OK" && results && results[0]) {
          for (const component of results[0].address_components) {
            if (component.types.includes("locality")) {
              city = component.long_name;
            }
            if (component.types.includes("country")) {
              country = component.long_name;
            }
          }
        }
        onLocationSelect({ lat, lng, city, country });
      });
    };

    const listener = map.addListener("click", clickHandler);

    return () => {
      google.maps.event.removeListener(listener);
    };
  }, [map, clickMarker, onLocationSelect, markerLibrary, readOnly]);

  // 3. Initial Marker Placement
  useEffect(() => {
    if (map && markerLibrary && initialLocation && !hasInitializedRef.current) {
      const markerLib = markerLibrary;
      
      const locations = Array.isArray(initialLocation) ? initialLocation : [initialLocation];

      // Čišćenje starih markera
      initialMarkers.forEach(m => m.map = null); 
      const newMarkers: google.maps.marker.AdvancedMarkerElement[] = [];

      locations.forEach((coords, index) => {
        const newMarker = new markerLib.AdvancedMarkerElement({
          position: coords,
          map: map,
          title: `Location ${index + 1}`
        });
        newMarkers.push(newMarker);
      });

      setInitialMarkers(newMarkers);
      hasInitializedRef.current = true;
    }
  // Dodajte sve varijable koje se koriste unutar efekta
  }, [map, markerLibrary, initialLocation]); 


  // ⭐️ 4. Route Drawing Logic (Ispravljeno: Uklonjen durationMarker i polylines iz dependencies)
  useEffect(() => {
    if (!map || !markerLibrary) return;

    // Čišćenje starih objekata
    polylines.forEach(line => line.setMap(null));
    if (durationMarker) durationMarker.map = null;
    
    // Resetuj stanja (važnije je to uraditi ovdje nego u cleanupu)
    setPolylines([]);
    setDurationMarker(null);
    
    const newPolylines: google.maps.Polyline[] = [];
    let newDurationMarker: google.maps.marker.AdvancedMarkerElement | null = null;
    

    if (routesToDraw && routesToDraw.length >= 2) {
        const start = routesToDraw[0];
        const end = routesToDraw[1];
        const path = [start, end];

        // Kreiranje Polylinea
        const line = new window.google.maps.Polyline({
            path: path,
            geodesic: true, 
            strokeColor: '#003087', 
            strokeOpacity: 0.8,
            strokeWeight: 3,
            map: map,
        });

        newPolylines.push(line);

        // ⭐️ LOGIKA TRAJANJA I MARKERA NA POLOVINI RUTE
        const flightTime = estimateFlightTime(start, end);
        const durationText = formatFlightTime(flightTime);

        const midpoint: CoordinateType = {
            lat: (start.lat + end.lat) / 2,
            lng: (start.lng + end.lng) / 2,
        };

        // Kreiraj HTML element za prikaz trajanja
        const durationElement = document.createElement('div');
        durationElement.className = 'flight-duration-label';
        durationElement.style.cssText = `
            padding: 4px 8px;
            background-color: ${theme.palette.primary.main};
            color: ${theme.palette.primary.contrastText};
            border-radius: 4px;
            font-size: 12px;
            font-weight: bold;
            white-space: nowrap;
            box-shadow: 0 2px 4px rgba(0,0,0,0.3);
            transform: translate(-50%, -100%); /* Bolje centriranje iznad linije */
        `;
        durationElement.textContent = durationText;

        // Kreiraj Advanced Marker
        newDurationMarker = new markerLibrary.AdvancedMarkerElement({
            position: midpoint,
            map: map,
            content: durationElement,
            title: `Estimated Flight Time: ${durationText}`,
        });
        
        // Postavi pogled da obuhvati rutu
        const bounds = new window.google.maps.LatLngBounds();
        routesToDraw.forEach(coord => bounds.extend(coord));
        map.fitBounds(bounds);
    }
    
    // Ažuriraj stanja NA KRAJU efekta
    setPolylines(newPolylines);
    setDurationMarker(newDurationMarker);

    // NAPOMENA: NEMA Cleanup funkcije unutar ovog useEffecta, jer se čišćenje obavlja na početku
    // ili u konačnom Cleanup efektu.
  // Dodajte samo stabilne ovisnosti
  }, [map, markerLibrary, routesToDraw, theme]); 
  
  
  // Konačni Cleanup efekt: za brisanje objekata mape kada se komponenta unmounta
  useEffect(() => {
    return () => {
        initialMarkers.forEach(m => m.map = null);
        if (clickMarker) clickMarker.map = null;
        polylines.forEach(line => line.setMap(null)); 
        if (durationMarker) durationMarker.map = null; 
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Pokreće se samo na unmount (prazan niz ovisnosti)

  return (
    <Box
      ref={ref}
      sx={{
        height: 400,
        width: '100%',
        borderRadius: theme.shape.borderRadius,
        border: `1px solid ${theme.palette.divider}`,
        position: 'relative',
        cursor: readOnly ? 'default' : 'pointer', 
      }}
    >
      <Box sx={{ position: 'absolute', top: 10, left: 10, zIndex: 1, p: 1, bgcolor: 'background.paper', borderRadius: 1, boxShadow: 3 }}>
        <Typography variant="caption" color="text.secondary">
          {readOnly ? "Route map (Read-only)." : "Click on the map to select a location."}
        </Typography>
      </Box>
    </Box>
  );
};

export default Map;