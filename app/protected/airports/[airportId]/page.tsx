'use client';

import AirlineListItem from '@/app/components/protected/airline/airline-list-item';
import AirportModal from '@/app/components/protected/airport/airport-modal';
import ConfirmationModal from '@/app/components/protected/common/confirmation-modal';
import ListWrapper from '@/app/components/protected/common/list-wrapper';
import PageHeading from '@/app/components/protected/common/page-heading';
import Map from '@/app/components/protected/map/map';
import RouteListItem from '@/app/components/protected/routes/route-list-item';
import { handleAxiosError } from '@/app/lib/handle-axios-error';
import { showSnackbar } from '@/app/store/notification.slice';
import { AirlineWithRelations } from '@/app/types/airline-with-relations.type';
import { AirportWithCountry } from '@/app/types/airport-with-country.type';
import { MapLocation } from '@/app/types/map-location.type';
import { RouteWithRelations } from '@/app/types/route-with-relations.type';
import { Alert, Box, CircularProgress, Grid, Paper, Typography } from '@mui/material';
import { Airport } from '@prisma/client';
import axios from 'axios';
import { notFound, useParams, useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';

const AirportDetailPage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const dispatch = useDispatch();
  const airportId = params.airportId ? String(params.airportId) : null;
  const isValidId = airportId && !isNaN(parseInt(airportId));

  const [loading, setLoading] = useState(true);
  const [airport, setAirport] = useState<AirportWithCountry | null>(null);
  const [airlines, setAirlines] = useState<AirlineWithRelations[]>([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);


  const [routes, setRoutes] = useState<RouteWithRelations[]>([]);
  const [routesLoading, setRoutesLoading] = useState<boolean>(false);


  const handleMapLocationSelect = (location: MapLocation | null) => {
    console.log("Map location selected (read-only mode):", location);
  };

  const fetchRoutes = async (id: number) => {
    try {
      setRoutesLoading(true)
      const routesRes = await axios.get<RouteWithRelations[]>(`/api/airports/${id}/routes`);
      setRoutes(routesRes.data)
    } catch (error) {
      handleAxiosError(error, dispatch, "Error fetching routes")
    } finally {
      setRoutesLoading(false)
    }
  }

  const fetchAirportData = async () => {
    if (!airportId || !isValidId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const airportRes = await axios.get<AirportWithCountry>(`/api/airports/${airportId}`);
      setAirport(airportRes.data);

      const airlinesRes = await axios.get<AirlineWithRelations[]>(`/api/airports/${airportId}/airlines`);
      setAirlines(airlinesRes.data);

      await fetchRoutes(+airportId)
    } catch (error) {
      handleAxiosError(error, dispatch, "Error modifying airport")
      setAirport(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (airportId) {
      fetchAirportData();
    } else {
      setLoading(false);
    }
  }, [airportId]);

  const handleModalClose = () => {
    setIsEditModalOpen(false);
    setIsDeleteModalOpen(false);
  }

  const handleSuccess = async () => {
    await fetchAirportData()
    handleModalClose();
  }

  const handleEdit = () => {
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (values: AirportWithCountry): Promise<Airport> => {
    try {
      const { country, ...rest } = values;
      const response = await axios.put<Airport>(`/api/airports/${+values.id}`, rest);
      await handleSuccess();
      dispatch(showSnackbar({ message: `Airport successfuly modifyed`, severity: "success" }))
      return response.data;
    } catch (error) {
      handleAxiosError(error, dispatch, "Error modifying airport")
      throw error;
    }
  };

  const handleDelete = async (): Promise<Airport> => {
    try {
      if (!airportId) {
        throw new Error("Invalid airport ID.");
      }
      const response = await axios.delete<Airport>(`/api/airports/${airportId}`);
      dispatch(showSnackbar({ message: `Airport successfuly deleted`, severity: "success" }))
      router.push('/protected/airports');
      return response.data;
    } catch (error) {
      handleAxiosError(error, dispatch, "Error deleting airport")
      throw error;
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="60vh">
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Loading airport details...</Typography>
      </Box>
    );
  }

  if (!airport) {
    return notFound();
  }

  console.log("airlines: ", airlines)
  return (
    <>
      <ConfirmationModal
        openModal={isDeleteModalOpen}
        onConfirm={handleDelete}
        onCancel={() => setIsDeleteModalOpen(false)}
        yesText="Confirm Deletion"
        noText='Cancel'
        dialogText={`Are you sure you want to delete airport: ${airport.name} (${airport.code})?`}
      />
      {isEditModalOpen && airport && (
        <AirportModal
          isOpen={isEditModalOpen}
          onClose={handleModalClose}
          onSubmit={handleEditSubmit}
          mode='edit'
          initialValues={airport}
        />
      )}

      <PageHeading
        title={`${airport.name} (${airport.code})`}
        onEditClick={handleEdit}
        onDeleteClick={() => setIsDeleteModalOpen(true)}
      />

      <Grid container spacing={4}>
        <Grid size={12}>
          <Box mt={4}>
            <Paper elevation={0} sx={{ p: 3, border: (t) => `1px solid ${t.palette.divider}` }}>
              <Typography variant="h6" gutterBottom>
                Location Map
              </Typography>
              <Map
                readOnly={true}
                onLocationSelect={handleMapLocationSelect}
                initialLocation={{
                  lat: airport.latitude,
                  lng: airport.longitude
                }}
              />
            </Paper>
          </Box>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <ListWrapper
            heading="Serviced Airlines"
            count={airlines.length}
            removeButton={true}
          >
            {airlines.length === 0 ? (
              <Alert severity="info" sx={{ mt: 2 }}>
                No airlines are registered to service this airport.
              </Alert>
            ) : (
              airlines.map((airline) => (
                <AirlineListItem
                  key={airline.id}
                  item={airline}
                  disableActions={true}
                />
              ))
            )}
          </ListWrapper>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Box mb={4}>
            <ListWrapper
              heading="Operated Routes"
              count={routes.length}
              removeButton={true}
            >
              {routes.length === 0 ? (
                <Alert severity="info" sx={{ mt: 2 }}>
                  No flight routes are currently operated from this airport
                </Alert>
              ) : (
                routes.map((route) => (
                  <RouteListItem
                    key={route.id}
                    item={route}
                    disableActions={true}
                  />
                ))
              )}
            </ListWrapper>
          </Box>
        </Grid>
      </Grid>
    </>
  );
};

export default AirportDetailPage;