'use client';

import React, { useEffect, useState } from 'react';
import { useFormikContext, FormikErrors, FormikTouched } from 'formik';
import { CircularProgress, Box, Typography, Alert, Grid, SelectChangeEvent } from '@mui/material';
import CustomSelect from '../form/custom-select'; // Koristimo vašu komponentu
import Map from '../map/map';
import axios from 'axios';
import { Airline, Airport } from '@prisma/client';
import { CreateRouteType } from '@/app/types/create-route.type';
import { CoordinateType } from '@/app/types/coordinate.type'; // Koristimo vaš tip
import { AirportWithCountry } from '@/app/types/airport-with-country.type';


interface RouteFormFieldsProps {
  allAirports: AirportWithCountry[];
  airlines?: Airline[];
}

const RouteFormFields: React.FC<RouteFormFieldsProps> = ({ allAirports }) => {
  // Use the Formik context typed only with CreateRouteType so values/errors/touched keep correct types
  const { values, isSubmitting, setFieldValue, errors, touched } =
    useFormikContext<CreateRouteType>();

  const [airlines, setAirlines] = useState<Airline[]>([]);
  const [servicedAirports, setServicedAirports] = useState<AirportWithCountry[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(true);

  // 1. Fetch all airlines
  useEffect(() => {
    async function fetchAirlines() {
      try {
        const res = await axios.get<Airline[]>('/api/airlines');
        setAirlines(res.data);
      } catch (error) {
        console.error('Failed to fetch airlines:', error);
      } finally {
        setLoadingOptions(false);
      }
    }
    fetchAirlines();
  }, []);

  useEffect(() => {
    if (values.airlineId && values.airlineId > 0) {
      setServicedAirports([]);
      // Reset dependent fields immediately
      setFieldValue('fromAirportId', 0, false);
      setFieldValue('toAirportId', 0, false);

      axios.get<AirportWithCountry[]>(`/api/airlines/${values.airlineId}/airports`)
        .then(res => {
          setServicedAirports(res.data);
        })
        .catch(error => {
          console.error('Failed to fetch serviced airports:', error);
          setServicedAirports([]);
        });
    } else {
      setServicedAirports([]);
    }
  }, [values.airlineId, setFieldValue]);


  // 3. Rukovanje promjenom CustomSelect polja
  const handleSelectChange = (event: SelectChangeEvent<string | number>, fieldName: keyof CreateRouteType) => {
    // Vrijednost iz Select komponente je string ili number, Formik zahtijeva number za ID
    const value = typeof event.target.value === 'string'
      ? parseInt(event.target.value, 10) || 0
      : event.target.value;

    setFieldValue(fieldName, value);
  };

  // 4. Priprema podataka za mapu

  // Markeri za sve aerodrome koje servisira aviokompanija
  const servicedAirportLocations: CoordinateType[] = servicedAirports.map(a => ({
    lat: a.latitude,
    lng: a.longitude,
  }));

  // Koordinate za crtanje rute (A do B)
  const selectedFrom = allAirports.find(a => a.id === values.fromAirportId);
  const selectedTo = allAirports.find(a => a.id === values.toAirportId);

  const routesToDraw: CoordinateType[] = [];
  if (selectedFrom && selectedTo) {
    routesToDraw.push({ lat: selectedFrom.latitude, lng: selectedFrom.longitude });
    routesToDraw.push({ lat: selectedTo.latitude, lng: selectedTo.longitude });
  }

  const airlineOptions = airlines.map(a => ({ value: a.id, label: a.name }));
  const airportOptions = servicedAirports.map(a => ({ value: a.id, label: `${a.code} - ${a.name}` }));

  // Helper za provjeru greške i "touched" stanja
  const getError = (name: keyof CreateRouteType) => (touched[name] && errors[name] ? errors[name] : undefined);


  return (
    <Grid container spacing={2}>
      {loadingOptions ? (
        <Grid size={{ xs: 12, md: 6 }}>
          <Box display="flex" justifyContent="center" py={4}>
            <CircularProgress />
            <Typography sx={{ ml: 2 }}>Loading options...</Typography>
          </Box>
        </Grid>
      ) : (
        <>
          <Grid size={12}>
            <CustomSelect
              name="airlineId"
              label="Operating Airline"
              options={airlineOptions}
              disabled={isSubmitting}
              value={values.airlineId || 0}
              onChange={(e) => handleSelectChange(e, 'airlineId')}
              error={getError('airlineId')}
            />
          </Grid>

          {values.airlineId > 0 && (
            <>
              <Grid size={{ xs: 12, md: 6 }}>
                <CustomSelect
                  name="fromAirportId"
                  label="Origin Airport (From)"
                  options={airportOptions}
                  disabled={isSubmitting || airportOptions.length === 0}
                  value={values.fromAirportId || 0}
                  onChange={(e) => handleSelectChange(e, 'fromAirportId')}
                  error={getError('fromAirportId')}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <CustomSelect
                  name="toAirportId"
                  label="Destination Airport (To)"
                  options={airportOptions}
                  disabled={isSubmitting || airportOptions.length === 0}
                  value={values.toAirportId || 0}
                  onChange={(e) => handleSelectChange(e, 'toAirportId')}
                  error={getError('toAirportId')}
                />
              </Grid>

              {airportOptions.length === 0 && (
                <Grid size={12}>
                  <Alert severity="warning">
                    This airline does not service any airports. Assign airports to the airline first.
                  </Alert>
                </Grid>
              )}

              <Grid size={12}>
                <Map
                  onLocationSelect={() => { }}
                  initialLocation={servicedAirportLocations} // Koristi ispravan prop name
                  routesToDraw={routesToDraw}
                  readOnly={true}
                />
              </Grid>
            </>
          )}
        </>
      )}
    </Grid>
  );
};

export default RouteFormFields;