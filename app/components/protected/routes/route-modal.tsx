'use client'

import { AirportWithCountry } from '@/app/types/airport-with-country.type';
import { CreateRouteType } from '@/app/types/create-route.type';
import { RouteWithRelations } from '@/app/types/route-with-relations.type';
import CloseIcon from '@mui/icons-material/Close';
import { Box, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Typography } from '@mui/material';
import { Airline } from '@prisma/client';
import axios from 'axios';
import { Form, Formik } from 'formik';
import React, { useEffect, useState } from 'react';
import * as yup from 'yup';
import RouteFormFields from './route-form';

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

  const [airlines, setAirlines] = useState<Airline[]>([]);
  const [loadingAirlines, setLoadingAirlines] = useState(false);
  const [servicedAirports, setServicedAirports] = useState<AirportWithCountry[]>([]);
  const [servicedAirportsLoading, setServicedAirportsLoading] = useState(false);
  // ⭐️ Novo stanje za kontrolu renderiranja Formik-a
  const [isReadyToRenderFormik, setIsReadyToRenderFormik] = useState(false);

  const open = true;

  const defaultInitialValues: CreateRouteType = {
    airlineId: initialValues?.airlineId || 0,
    fromAirportId: initialValues?.fromAirportId || 0,
    toAirportId: initialValues?.toAirportId || 0,
    id: initialValues?.id,
  };

  const fetchAllAirlines = async () => {
    setLoadingAirlines(true);
    try {
      const response = await axios.get<Airline[]>(`/api/airlines`);
      setAirlines(response.data);
      return response.data;
    } catch (error) {
      console.error("Failed to fetch all airlines:", error);
      setAirlines([]);
      return [];
    } finally {
      setLoadingAirlines(false);
    }
  };

  // ⭐️ Funkcija za dohvat servisiranih aerodroma
  const fetchServicedAirports = async (id: number) => {
    if (id <= 0) {
      setServicedAirports([]);
      return;
    }
    setServicedAirportsLoading(true);
    try {
      const response = await axios.get<AirportWithCountry[]>(`/api/airlines/${id}/airports`);
      setServicedAirports(response.data);
    } catch (error) {
      console.error(`Failed to fetch serviced airports for airline ${id}:`, error);
      setServicedAirports([]);
    } finally {
      setServicedAirportsLoading(false);
    }
  };

  useEffect(() => {
    const fetchInitialData = async () => {
      await fetchAllAirlines();

      if (isEdit && defaultInitialValues.airlineId > 0) {
        await fetchServicedAirports(defaultInitialValues.airlineId);
      }

      setIsReadyToRenderFormik(true);
    };

    fetchInitialData();
  }, []);

  const handleSubmit = async (values: CreateRouteType, { setSubmitting, setErrors }: any) => {
    try {
      await onSubmit(values);
    } catch (error: any) {
      setErrors({ submit: error.message || 'An unexpected error occurred.' });
    } finally {
      setSubmitting(false);
    }
  };

  const showLoading = loadingAirlines || (isEdit && servicedAirportsLoading && !isReadyToRenderFormik);

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

      {showLoading || !isReadyToRenderFormik ? (
        <DialogContent>
          <Box display="flex" justifyContent="center" alignItems="center" height="200px">
            <CircularProgress />
            <Typography sx={{ ml: 2 }}>Loading essential data...</Typography>
          </Box>
        </DialogContent>
      ) : (
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
                  airlines={airlines}
                  servicedAirports={servicedAirports}
                  servicedAirportsLoading={servicedAirportsLoading}
                  fetchServicedAirports={(id) => {
                    console.log("trigger")
                    setFieldValue('fromAirportId', 0, false);
                    setFieldValue('toAirportId', 0, false);
                    fetchServicedAirports(id);
                  }}
                  isSubmitting={isSubmitting}
                />
              </DialogContent>
              <DialogActions>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={isSubmitting || servicedAirports.length === 0}
                >
                  {isSubmitting ? <CircularProgress size={24} /> : (isEdit ? 'Save Changes' : 'Create Route')}
                </Button>
              </DialogActions>
            </Form>
          )}
        </Formik>
      )}
    </Dialog>
  );
};

export default RouteModal;