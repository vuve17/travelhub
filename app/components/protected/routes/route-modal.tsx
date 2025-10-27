'use client';

import React, { useEffect, useState } from 'react';
import { Formik, Form } from 'formik';
import * as yup from 'yup';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, CircularProgress, Alert, IconButton, Box, Typography } from '@mui/material';
import axios from 'axios';
import RouteFormFields from './route-form';
import { Airport, Airline } from '@prisma/client';
import { CreateRouteType } from '@/app/types/create-route.type';
import { RouteWithRelations } from '@/app/types/route-with-relations.type';
import { AirportWithCountry } from '@/app/types/airport-with-country.type';
import CloseIcon from '@mui/icons-material/Close';
import { closeButtonStyle } from '@/app/lib/close-icon-style';

interface RouteModalProps {
  onClose: () => void;
  onSubmit: (values: CreateRouteType) => Promise<any>;
  mode: 'create' | 'edit';
  initialValues?: RouteWithRelations | null;
}

const validationSchema = yup.object({
  airlineId: yup.number().min(1, 'Operator is required').required('Operator je obavezan'),
  fromAirportId: yup.number().min(1, 'Required').required('Polazni aerodrom je obavezan'),
  toAirportId: yup.number().min(1, 'Required').notOneOf([yup.ref('fromAirportId')], 'Polazni i dolazni aerodrom moraju biti različiti').required('Dolazni aerodrom je obavezan'),
});


const RouteModal: React.FC<RouteModalProps> = ({ onClose, onSubmit, mode, initialValues = null }) => {
  const isEdit = mode === 'edit';
  const title = isEdit ? 'Edit Single Route' : 'Create Single Route';

  // Stanja za globalne podatke
  const [allAirports, setAllAirports] = useState<AirportWithCountry[]>([]);
  const [airlines, setAirlines] = useState<Airline[]>([]);
  const [loadingAirlines, setLoadingAirlines] = useState(false);
  const [servicedAirports, setServicedAirports] = useState<AirportWithCountry[]>([]);
  const [servicedAirportsLoading, setServicedAirportsLoading] = useState(false);

  const open = true; // Modal je otvoren ako je renderiran

  // ⭐️ Funkcija za dohvat svih aviokompanija (poziva se na mount)
  const fetchAllAirlines = async () => {
    setLoadingAirlines(true);
    try {
      const response = await axios.get<Airline[]>(`/api/airlines`);
      setAirlines(response.data);
    } catch (error) {
      console.error("Failed to fetch all airlines:", error);
      setAirlines([]);
    } finally {
      setLoadingAirlines(false);
    }
  };

  // ⭐️ Funkcija za dohvat servisiranih aerodroma (poziva se iz RouteFormFields na odabir)
  const fetchServicedAirports = async (id: number) => {
    setServicedAirportsLoading(true);
    setServicedAirports([]); // Clear previous data while loading
    try {
      // Koristi vaš API endpoint: /api/airlines/[id]/airports
      const response = await axios.get<AirportWithCountry[]>(`/api/airlines/${id}/airports`);
      setServicedAirports(response.data); // Update the state in the modal
    } catch (error) {
      console.error(`Failed to fetch serviced airports for airline ${id}:`, error);
      setServicedAirports([]);
    } finally {
      setServicedAirportsLoading(false);
    }
  };

  // ⭐️ Na mount: dohvati sve aerodrome i sve aviokompanije
  useEffect(() => {
    // 1. Fetch All Airports
    axios.get<AirportWithCountry[]>('/api/airports')
      .then(res => setAllAirports(res.data))
      .catch(err => console.error("Failed to fetch all airports for map:", err));

    // 2. Fetch All Airlines
    fetchAllAirlines();
  }, []);

  const defaultInitialValues: CreateRouteType = {
    airlineId: initialValues?.airlineId || 0,
    fromAirportId: initialValues?.fromAirportId || 0,
    toAirportId: initialValues?.toAirportId || 0,
    id: initialValues?.id,
  };

  const handleSubmit = async (values: CreateRouteType, { setSubmitting, setErrors }: any) => {
    try {
      await onSubmit(values);
    } catch (error: any) {
      setErrors({ submit: error.message || 'An unexpected error occurred.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      fullWidth
      maxWidth="md"
      slotProps={{
        backdrop: {
          onClick: (e) => e.stopPropagation(),
        },
      }}
    >
      <DialogTitle sx={{ m: 0, p: 2 }} variant='h5'>
        {title}
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <Formik
        initialValues={defaultInitialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
        enableReinitialize={true}
      >
        {({ isSubmitting, errors, setFieldValue }) => (
          <Form>
            <DialogContent>
              <RouteFormFields
                allAirports={allAirports}
                airlines={airlines}
                airlinesLoading={loadingAirlines}
                servicedAirports={servicedAirports}
                servicedAirportsLoading={servicedAirportsLoading}
                fetchServicedAirports={fetchServicedAirports}
                formikSetFieldValue={setFieldValue}
              />
              {/* {errors.submit && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  {errors.submit}
                </Alert>
              )} */}
            </DialogContent>
            <DialogActions>
              <Button
                type="submit"
                variant="contained"
                disabled={isSubmitting || allAirports.length === 0 || loadingAirlines}
              >
                {isSubmitting ? <CircularProgress size={24} /> : (isEdit ? 'Save Changes' : 'Create Route')}
              </Button>
            </DialogActions>
          </Form>
        )}
      </Formik>
    </Dialog>
  );
};

export default RouteModal;