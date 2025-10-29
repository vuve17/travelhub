'use client';

import { estimateFlightTime, formatFlightTime } from '@/app/lib/haversine-formula';
import { CoordinateType } from '@/app/types/coordinate.type';
import { MapLocation } from '@/app/types/map-location.type';
import { Box, Typography, useTheme } from '@mui/material';
import React, { useEffect, useRef, useState } from 'react';

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


  useEffect(() => {
    if (!map || !markerLibrary) return;

    polylines.forEach(line => line.setMap(null));
    // eslint-disable-next-line react-hooks/immutability
    if (durationMarker) durationMarker.map = null;

    setPolylines([]);
    setDurationMarker(null);

    const newPolylines: google.maps.Polyline[] = [];
    let newDurationMarker: google.maps.marker.AdvancedMarkerElement | null = null;


    if (routesToDraw && routesToDraw.length >= 2) {
      const start = routesToDraw[0];
      const end = routesToDraw[1];
      const path = [start, end];

      const line = new window.google.maps.Polyline({
        path: path,
        geodesic: true,
        strokeColor: '#003087',
        strokeOpacity: 0.8,
        strokeWeight: 3,
        map: map,
      });

      newPolylines.push(line);

      const flightTime = estimateFlightTime(start, end);
      const durationText = formatFlightTime(flightTime);

      const midpoint: CoordinateType = {
        lat: (start.lat + end.lat) / 2,
        lng: (start.lng + end.lng) / 2,
      };

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

      newDurationMarker = new markerLibrary.AdvancedMarkerElement({
        position: midpoint,
        map: map,
        content: durationElement,
        title: `Estimated Flight Time: ${durationText}`,
      });

      const bounds = new window.google.maps.LatLngBounds();
      routesToDraw.forEach(coord => bounds.extend(coord));
      map.fitBounds(bounds);
    }

    setPolylines(newPolylines);
    setDurationMarker(newDurationMarker);
  }, [map, markerLibrary, routesToDraw, theme]);


  useEffect(() => {
    return () => {
      initialMarkers.forEach(m => m.map = null);
      if (clickMarker) clickMarker.map = null;
      polylines.forEach(line => line.setMap(null));
      if (durationMarker) durationMarker.map = null;
    };
  }, []);

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