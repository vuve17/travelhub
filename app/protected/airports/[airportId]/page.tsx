'use client';

import AirportModal from '@/app/components/protected/airport/airport-modal';
import ConfirmationModal from '@/app/components/protected/common/confirmation-modal';
import ListWrapper from '@/app/components/protected/common/list-wrapper';
import PageHeading from '@/app/components/protected/common/page-heading';
import { handleAxiosError } from '@/app/lib/handle-axios-error';
import { AirlineWithRelations } from '@/app/types/airline-with-relations.type';
import { AirportWithCountry } from '@/app/types/airport-with-country.type';
import { Alert, Box, Chip, CircularProgress, Grid, Paper, Typography } from '@mui/material';
import { Airport } from '@prisma/client';
import axios from 'axios';
import Link from 'next/link';
import { notFound, useParams, useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import Map from '@/app/components/protected/map/map';
import { MapLocation } from '@/app/types/map-location.type';
import AirlineListItem from '@/app/components/protected/airline/airline-list-item';

const AirportDetailPage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const airportId = params.airportId ? String(params.airportId) : null;
  const isValidId = airportId && !isNaN(parseInt(airportId));

  const [loading, setLoading] = useState(true);
  const [airport, setAirport] = useState<AirportWithCountry | null>(null);
  const [airlines, setAirlines] = useState<AirlineWithRelations[]>([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const handleMapLocationSelect = (location: MapLocation | null) => {
    console.log("Map location selected (read-only mode):", location);
  };

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
    } catch (error) {
      console.error("Failed to fetch airport data:", error);
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
      return response.data;
    } catch (error) {
      throw new Error(handleAxiosError(error));
    }
  };

  const handleDelete = async (): Promise<Airport> => {
    try {
      if (!airportId) {
        throw new Error("Invalid airport ID.");
      }
      const response = await axios.delete<Airport>(`/api/airports/${airportId}`);
      router.push('/protected/airports');
      return response.data;
    } catch (error) {
      throw new Error(handleAxiosError(error));
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
        <Grid size={{ xs: 12, md: 6 }}>

          <Paper elevation={0} sx={{ p: 3, border: (t) => `1px solid ${t.palette.divider}` }}>
            <Typography variant="h6" gutterBottom>
              Basic Information
            </Typography>

            <Box mb={2}>
              <Typography variant="body2" color="text.secondary">Name:</Typography>
              <Typography variant="body1" fontWeight="medium">{airport.name}</Typography>
            </Box>

            <Box mb={2}>
              <Typography variant="body2" color="text.secondary">Base Country:</Typography>
              <Typography variant="body1" fontWeight="medium">{airport.country.name}</Typography>
            </Box>

            <Box mb={2}>
              <Typography variant="body2" color="text.secondary">IATA/ICAO Code:</Typography>
              <Typography variant="body1" fontWeight="medium">{airport.code}</Typography>
            </Box>
          </Paper>

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
      </Grid>
    </>
  );
};

export default AirportDetailPage;