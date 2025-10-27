'use client';

import React from 'react';
import { Box, Typography, IconButton, Card, Chip, useTheme, Paper } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import Link from 'next/link';
import { RouteWithRelations } from '@/app/types/route-with-relations.type';
import { ItineraryWithRoutes } from '@/app/types/Itinerary.type';
import { formatFlightTime, convertMinutesToTime } from '@/app/lib/haversine-formula';


interface RouteListItemProps {
  item: ItineraryWithRoutes;
  onEdit: (route: RouteWithRelations) => void;
  onDelete: (route: RouteWithRelations) => void;
  disableActions?: boolean;
}

const RouteListItem: React.FC<RouteListItemProps> = ({ item, onEdit, onDelete, disableActions = false }) => {
  const theme = useTheme();

  const sortedSegments = [...item.segments].sort((a, b) => a.order - b.order);
  // console.log('Sorted Segments:', sortedSegments, sortedSegments.length, sortedSegments[0].route);
if (sortedSegments.length === 0 || !sortedSegments[0] || !sortedSegments[0].route) {
      return (
      <Paper elevation={0} sx={{ p: 2, border: (t) => `1px solid ${t.palette.error.main}` }}>
        <Typography color="error">Error: No route data available for this itinerary.</Typography>
      </Paper>
    );
  }

  // Određivanje prve rute (za akcije i početak putanje)
  const initialRoute = sortedSegments[0].route;
  
  // 1. Inicijalizacija putanje s polazištem prve rute
  let routePathCodes = initialRoute.fromAirport.code;
  let routePathNames = `${initialRoute.fromAirport.name} (${initialRoute.fromAirport.city})`;

  // 2. Prolazak kroz segmente i DODAVANJE SAMO ODREDIŠTA
  // Petlja kreće od prvog segmenta i dodaje njegovo odredište,
  // zatim odredište drugog, i tako dalje.
  for (const segment of sortedSegments) {
    if (segment.route) {
      // Svaki put dodajemo odredište, čime se formira ispravan niz A → B → C
      // A (inicijalizacija) + → B + → C
      routePathCodes += ` → ${segment.route.toAirport.code}`;
      routePathNames += ` → ${segment.route.toAirport.name} (${segment.route.toAirport.city})`;
    }
  }

  // 3. Ostatak logike ostaje nepromijenjen
  const route = initialRoute;
  const operatorName = route.operator.name;

  const formattedDuration = item.totalDurationMin
    ? formatFlightTime(convertMinutesToTime(item.totalDurationMin))
    : 'N/A';

  const routeToPass = route as RouteWithRelations;

  const handleEditClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onEdit(routeToPass);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onDelete(routeToPass);
  };

  return (
    <Card
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        padding: 3,
        marginBottom: 3,
        borderRadius: 4,
        textDecoration: 'none',
        border: `1px solid ${theme.palette.divider}`,
        '&:hover': {
          transition: '0.2s',
          borderColor: 'primary.main',
        },
        justifyContent: 'space-between',
      }}
      component={Link}
      elevation={0}
      href={`/protected/itineraries/${item.id}`}
    >
      <Box>
        {/* Primarni naslov: Imena Aerodroma */}
        <Typography
          variant="h5"
          fontWeight={600}
          marginBottom={1}
          color="primary.main"
        >
          {routePathNames}
        </Typography>

        {/* Sekundarni naslov: KODOVI AERODROMA */}
        <Typography variant="body1" fontWeight={400} color="text.secondary">
          {routePathCodes}
        </Typography>

        {/* PRIKAZ TRAJANJA I OPERATORA */}
        <Box display="flex" alignItems="center" gap={3} marginTop={2} flexWrap="wrap">
          <Chip
            label={`Duration: ${formattedDuration}`}
            size="small"
            color="primary"
            icon={<AccessTimeIcon sx={{ fontSize: 16 }} />}
            sx={{ height: 24, fontWeight: 'bold' }}
          />
          <Typography variant="body2" color={'grey.500'} fontWeight={500}>
            Operator: {operatorName}
          </Typography>
        </Box>
      </Box>

      {
        disableActions ? null : (
          <Box
            display="flex"
            justifyContent={'flex-end'}
            alignItems="center"
            gap={1}
            marginLeft={{ xs: 0, sm: 3 }}
            marginTop={{ xs: 2, sm: 0 }}
          >
            <IconButton
              aria-label="edit"
              onClick={handleEditClick}
              color="primary"
              size="large"
            >
              <EditIcon />
            </IconButton>

            <IconButton
              aria-label="delete"
              onClick={handleDeleteClick}
              color="error"
              size="large"
            >
              <DeleteIcon />
            </IconButton>
          </Box>
        )
      }

    </Card>
  );
};

export default RouteListItem;