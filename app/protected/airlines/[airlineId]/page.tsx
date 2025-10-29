'use client';

import AirlineModal from '@/app/components/protected/airline/airline-modal'; // Assuming this component exists
import AirportListItem from '@/app/components/protected/airport/airport-list-item';
import ConfirmationModal from '@/app/components/protected/common/confirmation-modal';
import ListWrapper from '@/app/components/protected/common/list-wrapper';
import PageHeading from '@/app/components/protected/common/page-heading';
import Map from '@/app/components/protected/map/map';
import RouteListItem from '@/app/components/protected/routes/route-list-item';
import { handleAxiosError } from '@/app/lib/handle-axios-error';
import { showSnackbar } from '@/app/store/notification.slice';
import { AirlineSubmissionType } from '@/app/types/airline-submission.type';
import { AirportWithCountry } from '@/app/types/airport-with-country.type';
import { RouteWithRelations } from '@/app/types/route-with-relations.type';
import { Alert, Box, CircularProgress, Grid, Paper, Typography } from '@mui/material';
import { Airline } from '@prisma/client';
import axios, { AxiosError } from 'axios';
import { notFound, useParams, useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';


type AirlineWithCountry = Airline & { baseCountry: { name: string } };

const AirlineDetailPage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const dispatch = useDispatch()
  const airlineId = params.airlineId ? String(params.airlineId) : null;
  const isValidId = airlineId && !isNaN(parseInt(airlineId));

  const [loading, setLoading] = useState(true);
  const [airline, setAirline] = useState<AirlineWithCountry | null>(null);
  const [airports, setAirports] = useState<AirportWithCountry[]>([]); // Serviced Airports

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // State for all available airports (used for the multiselect dropdown in the edit modal)
  const [allAirports, setAllAirports] = useState<AirportWithCountry[]>([]);
  const [allAirportsLoading, setAllAirportsLoading] = useState<boolean>(false);

  const [routes, setRoutes] = useState<RouteWithRelations[]>([]);
  const [routesLoading, setRoutesLoading] = useState<boolean>(false);

  // Function to fetch all airports (used to populate the dropdown options in the edit modal)
  const fetchAllAirports = async () => {
    setAllAirportsLoading(true);
    try {
      const response = await axios.get<AirportWithCountry[]>('/api/airports');
      setAllAirports(response.data);
    } catch (error) {
      console.error('Failed to fetch all airports:', error);
      const err = error as AxiosError;
      console.error("Failed to fetch airline data:", err);
      const errorMessage =
        (err.response?.data as { message?: string })?.message ||
        err.message ||
        "";
      const snackbarMessage = `Error fetching airline${errorMessage ? `: ${errorMessage}` : ''}`;
      dispatch(showSnackbar({ message: snackbarMessage, severity: "error" }));
    } finally {
      setAllAirportsLoading(false);
    }
  };

  const fetchRoutes = async (id: number) => {
    try {
      setRoutesLoading(true)
      const routesRes = await axios.get<RouteWithRelations[]>(`/api/airlines/${id}/routes`);
      setRoutes(routesRes.data)
    } catch (error) {
      const err = error as AxiosError;
      console.error("Failed to fetch airline data:", err);
      const errorMessage =
        (err.response?.data as { message?: string })?.message ||
        err.message ||
        "";
      const snackbarMessage = `Error fetching airline${errorMessage ? `: ${errorMessage}` : ''}`;
      dispatch(showSnackbar({ message: snackbarMessage, severity: "error" }));
    } finally {
      setRoutesLoading(false)
    }

  }

  const fetchAirlineData = async () => {
    if (!airlineId || !isValidId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const airlineRes = await axios.get<AirlineWithCountry>(`/api/airlines/${airlineId}`);
      setAirline(airlineRes.data);
      const airportsRes = await axios.get<AirportWithCountry[]>(`/api/airlines/${airlineId}/airports`);
      setAirports(airportsRes.data);
      await fetchRoutes(+airlineId)

    } catch (error) {
      const err = error as AxiosError;
      console.error("Failed to fetch airline data:", err);
      const errorMessage =
        (err.response?.data as { message?: string })?.message ||
        err.message ||
        "";
      const snackbarMessage = `Error fetching airline${errorMessage ? `: ${errorMessage}` : ''}`;
      dispatch(showSnackbar({ message: snackbarMessage, severity: "error" }));
      setAirline(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (airlineId) {
      fetchAirlineData();
      fetchAllAirports();
    } else {
      setLoading(false);
    }
  }, [airlineId]);

  const handleModalClose = () => {
    setIsEditModalOpen(false);
    setIsDeleteModalOpen(false);
  }

  const handleSuccess = async () => {
    await fetchAirlineData()
    handleModalClose();
  }

  const handleEdit = () => {
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (values: AirlineSubmissionType): Promise<Airline> => {
    try {
      const { id, ...rest } = values;
      if (!id) {
        throw new Error("Airline ID is required for editing.");
      }
      const response = await axios.put<Airline>(`/api/airlines/${+id}`, rest);
      await handleSuccess();
      dispatch(showSnackbar({ message: "Airline successfuly modifyed", severity: "success" }))
      return response.data;
    } catch (error) {
      handleAxiosError(error, dispatch, "Error modifying airline")
      throw error
    }
  };

  const handleDelete = async (): Promise<void> => {
    try {
      if (!airlineId) {
        throw new Error("Invalid airline ID.");
      }
      await axios.delete<Airline>(`/api/airlines/${airlineId}`);
      dispatch(showSnackbar({ message: "Airline successfuly deleted", severity: "success" }))
      router.push('/protected/airlines');
      return
    } catch (error) {
      handleAxiosError(error, dispatch, "Error deleting airline")
      throw error
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="60vh">
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Loading airline details...</Typography>
      </Box>
    );
  }

  const servicedAirportLocations = airports
    .filter(a => a.latitude !== null && a.longitude !== null)
    .map(a => ({
      lat: a.latitude,
      lng: a.longitude
    }));

  if (!airline) {
    return notFound();
  }

  return (
    <>
      <ConfirmationModal
        openModal={isDeleteModalOpen}
        onConfirm={handleDelete}
        onCancel={() => setIsDeleteModalOpen(false)}
        yesText="Confirm Deletion"
        noText='Cancel'
        question={`Are you sure you want to delete the airline "${airline.name}"?`}
        dialogText='Deleting this airline will automatically delete ALL routes currently linked to it. This action cannot be undone.'
      />

      {isEditModalOpen && airline && (
        <AirlineModal
          isOpen={isEditModalOpen}
          onClose={handleModalClose}
          onSubmit={handleEditSubmit}
          mode='edit'
          initialValues={{
            id: airline.id,
            name: airline.name,
            baseCountryId: airline.baseCountryId,
          }}
          airports={allAirports} // All airports for dropdown options
          airportsLoading={allAirportsLoading}
          selectedAirlinesServicedAirports={airports} // Current serviced airports for pre-selection
        />
      )}



      <Grid container spacing={{ xs: 0, md: 4 }}>

        <Grid size={12}>

          <PageHeading
            title={`${airline.name} (Base: ${airline.baseCountry.name})`}
            onEditClick={handleEdit}
            onDeleteClick={() => setIsDeleteModalOpen(true)}
          />
        </Grid>
        <Grid size={12}>

          <Box>
            <Paper elevation={0} sx={{ p: 3, border: { sm: "none", md: (t) => `1px solid ${t.palette.divider}` } }}>
              <Typography variant="h6" gutterBottom>
                Airport Map
              </Typography>
              {
                servicedAirportLocations.length ? (
                  <Map
                    readOnly={true}
                    onLocationSelect={() => { }}
                    initialLocation={servicedAirportLocations}
                  />
                ) : (
                  <Alert severity="info" sx={{ width: '100%' }}>
                    <Typography variant="body1" sx={{ textDecoration: 'none' }}>
                      This airline currently does not service any airports.
                      {' '}
                      <Typography
                        component="span"
                        variant="body1"
                        fontWeight="bold"
                        color="primary.main"
                        sx={{
                          textDecoration: 'underline',
                          cursor: 'pointer',
                          '&:hover': {
                            color: 'primary.dark',
                          }
                        }}
                        onClick={handleEdit}
                      >
                        Click here to assign airports.
                      </Typography>
                    </Typography>
                  </Alert>
                )
              }
            </Paper>
          </Box>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <ListWrapper
            heading="Serviced Airports"
            count={airports.length}
            removeButton={true}
          >
            {airports.length === 0 ? (
              <Alert severity="info" sx={{ mt: 2 }}>
                This airline currently does not service any airports.
              </Alert>
            ) : (
              airports.map((airport) => (
                <AirportListItem
                  key={airport.id}
                  item={airport}
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
                  This airline currently does not operate any routes.
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

export default AirlineDetailPage;