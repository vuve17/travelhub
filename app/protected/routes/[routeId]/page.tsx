'use client';

import ConfirmationModal from '@/app/components/protected/common/confirmation-modal';
import PageHeading from '@/app/components/protected/common/page-heading';
import Map from '@/app/components/protected/map/map';
import RouteModal from '@/app/components/protected/routes/route-modal';
import { handleAxiosError } from '@/app/lib/handle-axios-error';
import { convertMinutesToTime, formatFlightTime } from '@/app/lib/haversine-formula';
import { showSnackbar } from '@/app/store/notification.slice';
import { CreateRouteType } from '@/app/types/create-route.type';
import { RouteWithRelations } from '@/app/types/route-with-relations.type';
import { AccessTime, ArrowForward, FlightLand, FlightTakeoff, Public, Remove } from '@mui/icons-material'; // Dodane ikone
import { Box, CircularProgress, Grid, Paper, Typography } from '@mui/material';
import axios from 'axios';
import Link from 'next/link';
import { notFound, useParams, useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';

// Definicija tipa za podatke rute (preuzeta iz API-ja)
// Predpostavljamo da RouteWithRelations ima totalDurationMin, operator, fromAirport, toAirport
// i sve relacije s Country.

const RouteDetailPage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const dispatch = useDispatch();
  const routeId = params.routeId ? String(params.routeId) : null;
  const isValidId = routeId && !isNaN(parseInt(routeId));

  const [loading, setLoading] = useState(true);
  const [route, setRoute] = useState<RouteWithRelations | null>(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const fetchRouteData = async () => {
    if (!routeId || !isValidId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      // Dohvati rutu s relacijama (koristi naš /api/routes/[routeId] endpoint)
      const response = await axios.get<RouteWithRelations>(`/api/routes/${routeId}`);
      setRoute(response.data);

    } catch (error) {
      handleAxiosError(error, dispatch, "Error fetching route data");
      setRoute(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (routeId) {
      fetchRouteData();
    } else {
      setLoading(false);
    }
  }, [routeId]);

  const handleModalClose = () => {
    setIsEditModalOpen(false);
    setIsDeleteModalOpen(false);
  }

  const handleSuccess = async () => {
    await fetchRouteData()
    handleModalClose();
  }

  const handleEdit = () => {
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (values: CreateRouteType): Promise<RouteWithRelations> => {
    try {
      if (!routeId) throw new Error("Route ID is missing.");

      // Koristimo PUT /api/routes/[routeId] endpoint
      const response = await axios.put<RouteWithRelations>(`/api/routes/${routeId}`, values);

      await handleSuccess();
      dispatch(showSnackbar({ message: "Route successfully modified", severity: "success" }))
      return response.data;
    } catch (error) {
      handleAxiosError(error, dispatch, "Error modifying route");
      throw error;
    }
  };

  const handleDelete = async (): Promise<void> => {
    try {
      if (!routeId) {
        throw new Error("Invalid route ID.");
      }
      // Koristimo DELETE /api/routes/[routeId] endpoint
      await axios.delete(`/api/routes/${routeId}`);

      dispatch(showSnackbar({ message: "Route successfully deleted", severity: "success" }))
      router.push('/protected/routes'); // Preusmjeri na listu ruta
    } catch (error) {
      handleAxiosError(error, dispatch, "Error deleting route");
      throw error;
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="60vh">
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Loading route details...</Typography>
      </Box>
    );
  }

  if (!route) {
    return notFound();
  }

  // Priprema podataka za mapu (Polazni i Dolazni aerodrom)
  const routeLocations = [
    { lat: route.fromAirport.latitude, lng: route.fromAirport.longitude },
    { lat: route.toAirport.latitude, lng: route.toAirport.longitude },
  ];

  // Formatiranje trajanja leta
  const formattedDuration = route.totalDurationMin
    ? formatFlightTime(convertMinutesToTime(route.totalDurationMin))
    : 'N/A';

  // Konstrukcija naslova stranice
  const pageTitle = `${route.fromAirport.code} → ${route.toAirport.code} (Operator: ${route.operator.name})`;

  return (
    <>
      <ConfirmationModal
        openModal={isDeleteModalOpen}
        onConfirm={handleDelete}
        onCancel={() => setIsDeleteModalOpen(false)}
        yesText="Confirm Deletion"
        noText='Cancel'
        dialogText={`Are you sure you want to delete the route from ${route.fromAirport.code} to ${route.toAirport.code} by ${route.operator.name}?`}
      />

      {isEditModalOpen && route && (
        <RouteModal
          onClose={handleModalClose}
          onSubmit={handleEditSubmit}
          mode='edit'
          initialValues={{
            id: route.id,
            fromAirportId: route.fromAirport.id,
            toAirportId: route.toAirport.id,
            airlineId: route.operator.id,
            // totalDurationMin se proračunava na backendu
          }}
        />
      )}



      <Grid container spacing={4}>
        <Grid size={12}>
          <PageHeading
            title={pageTitle}
            onEditClick={handleEdit}
            onDeleteClick={() => setIsDeleteModalOpen(true)}
          />
        </Grid>

        <Grid size={12}>
          <Paper elevation={0} sx={{ p: 3, border: (t) => `1px solid ${t.palette.divider}` }}>
            <Typography variant="h6" gutterBottom>
              Route Visualization
            </Typography>

            {/* Karta */}
            <Map
              readOnly={true}
              onLocationSelect={() => { }}
              initialLocation={routeLocations}
              routesToDraw={routeLocations}

            // Opcionalno: dodajte zoom kontrolu ako je karta velika
            />
          </Paper>

          <Box mt={4}>
            <Paper elevation={0} sx={{ p: 3, border: (t) => `1px solid ${t.palette.divider}` }}>
              <Typography variant="h6" gutterBottom>
                Flight Details
              </Typography>

              <Box display="flex" alignItems="center" mb={1}>
                <AccessTime color="action" sx={{ mr: 1 }} />
                <Typography variant="body2" color="text.secondary">Estimated Duration:</Typography>
                <Typography variant="body1" fontWeight="medium" sx={{ ml: 1 }}>{formattedDuration}</Typography>
              </Box>

              <Box display="flex" alignItems="center" mb={1}>
                <Public color="action" sx={{ mr: 1 }} />
                <Typography variant="body2" color="text.secondary">Operating Airline:</Typography>
                <Typography variant="body1" fontWeight="medium" sx={{ ml: 1 }}>
                  <Link href={`/protected/airlines/${route.operator.id}`} passHref style={{ textDecoration: 'none', color: 'primary.main' }}>
                    {route.operator.name}
                  </Link>
                </Typography>
              </Box>
            </Paper>
          </Box>
        </Grid>

        {/* 2. DESNA KOLONA: Aerodromi */}
        <Grid size={12}>

          <Paper elevation={0} sx={{ p: 3, border: (t) => `1px solid ${t.palette.divider}` }}>
            <Typography variant="h6" fontWeight={600} gutterBottom sx={{ mb: 3 }}>
              Route: Origin → Destination
            </Typography>

            <Box
              sx={{
                display: 'flex',
                // U red za veće ekrane, u kolonu za manje
                flexDirection: { xs: 'column', md: 'row' },
                alignItems: 'center',
                justifyContent: 'center',
                gap: { xs: 3, md: 1 }, // Razmak između elemenata
              }}
            >
              <Box>
                <Link href={`/protected/airports/${route.fromAirport.id}`} passHref style={{ textDecoration: 'none' }}>
                  <Paper elevation={0} sx={{
                    py: 2,
                    px: 4,
                    border: (theme) => `2px solid ${theme.palette.primary.main}`,
                    '&:hover': { bgcolor: 'action.hover' },
                    minHeight: 120,
                  }}>
                    <Box display="flex" alignItems="center" mb={1} gap={4}>
                      <FlightTakeoff color="primary" sx={{ fontSize: 30 }} />
                      <Box>
                        <Typography variant="body2" color="text.secondary">DEPARTURE</Typography>
                        <Typography variant="h6" fontWeight={600} color="text.primary">
                          {route.fromAirport.code} - {route.fromAirport.city}
                        </Typography>
                        <Typography variant="body1" color="text.secondary">{route.fromAirport.name}</Typography>
                      </Box>
                    </Box>
                  </Paper>
                </Link>
              </Box>

              {/* ⭐️ STRELICA (SEPARATOR) */}
              <Box
                sx={{
                  display: 'flex',
                  // ⭐️ Vertikalni Stack na malim ekranima, Horizontalni na velikim
                  flexDirection: { xs: 'column', md: 'row' },
                  alignItems: 'center',
                  justifyContent: 'center',
                  // Dodan razmak između trajanja i strelica
                  gap: { xs: 1, md: 2 },
                  py: { xs: 2, md: 0 }, // Dodatni vertikalni padding za odvajanje na malim ekranima
                }}
              >
                {/* 1. SEPARATOR (Crtica/Ikonica) */}
                <Remove

                  color="primary"
                  sx={{
                    fontSize: 30,
                    // ⭐️ Rotira se iz vertikalne linije (I) u horizontalnu (-)
                    transform: { xs: 'rotate(90deg)', md: 'rotate(0deg)' }
                  }}
                />

                {/* 2. PRIKAZ TRAJANJA VREMENA */}
                <Box sx={{ textAlign: 'center' }}>

                  <Typography
                    variant="h6"
                    fontWeight={700}
                    color="primary.dark"
                    sx={{ whiteSpace: 'nowrap' }}
                  >
                    {formattedDuration}
                  </Typography>
                </Box>

                {/* 3. STRELICA (ArrowForward) */}
                <ArrowForward
                  color="primary"
                  sx={{
                    fontSize: 40,
                    // Rotacija za 90 stupnjeva (dolje) na XS/SM, nema rotacije na MD
                    transform: { xs: 'rotate(90deg)', md: 'rotate(0deg)' }
                  }}
                />
              </Box>

              {/* === KARTICA 2: DOLAZNI AERODROM === */}
              <Box >
                <Link href={`/protected/airports/${route.toAirport.id}`} passHref style={{ textDecoration: 'none' }}>
                  <Paper elevation={0} sx={{
                    py: 2,
                    px: 4,
                    '&:hover': { bgcolor: 'action.hover' },
                    border: (theme) => `2px solid ${theme.palette.primary.main}`,
                    minHeight: 120,
                  }}>
                    <Box display="flex" alignItems="center" mb={1} gap={4}>
                      <FlightLand color="primary" sx={{ fontSize: 30 }} />
                      <Box>
                        <Typography variant="body2" color="text.secondary">ARRIVAL</Typography>
                        <Typography variant="h6" fontWeight={600} color="text.primary">
                          {route.toAirport.code} - {route.toAirport.city}
                        </Typography>
                        <Typography variant="body1" color="text.secondary">{route.toAirport.name}</Typography>
                      </Box>
                    </Box>
                  </Paper>
                </Link>
              </Box>

            </Box>
          </Paper>
        </Grid>
      </Grid>
    </>
  );
};

export default RouteDetailPage;