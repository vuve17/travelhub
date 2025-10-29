'use client'

import { AirportWithCountry } from '@/app/types/airport-with-country.type';
import { CoordinateType } from '@/app/types/coordinate.type';
import { CreateRouteType } from '@/app/types/create-route.type';
import { Alert, Box, CircularProgress, Grid, SelectChangeEvent, Typography } from '@mui/material';
import { Airline } from '@prisma/client';
import { useFormikContext } from 'formik';
import React, { useEffect, useMemo, useRef } from 'react';
import CustomSelect from '../form/custom-select';
import Map from '../map/map';


interface RouteFormFieldsProps {
  airlines: Airline[];
  servicedAirports: AirportWithCountry[];
  servicedAirportsLoading: boolean;
  fetchServicedAirports: (id: number) => void;
  isSubmitting: boolean;
}

const RouteFormFields: React.FC<RouteFormFieldsProps> = ({
  airlines,
  servicedAirports,
  servicedAirportsLoading,
  fetchServicedAirports,
  isSubmitting
}) => {

  const { values, setFieldValue, errors, touched } =
    useFormikContext<CreateRouteType>();

  const prevAirlineIdRef = useRef(values.airlineId);
  useEffect(() => {
    if (values.airlineId !== prevAirlineIdRef.current) {
      if (values.airlineId > 0) {

        fetchServicedAirports(values.airlineId);
      }
      prevAirlineIdRef.current = values.airlineId;
    }
  }, [values.airlineId, fetchServicedAirports]);

  const handleSelectChange = (event: SelectChangeEvent<string | number>, fieldName: keyof CreateRouteType) => {
    const value = typeof event.target.value === 'string'
      ? parseInt(event.target.value, 10) || 0
      : event.target.value;
    setFieldValue(fieldName, value);
    if (fieldName === "airlineId") {
      fetchServicedAirports(values.airlineId);
    }
  };


  const servicedAirportLocations: CoordinateType[] = servicedAirports.map(a => ({
    lat: a.latitude,
    lng: a.longitude,
  }));


  const selectedFrom = servicedAirports.find(a => a.id === values.fromAirportId);
  const selectedTo = servicedAirports.find(a => a.id === values.toAirportId);

  const routesToDraw: CoordinateType[] = [];
  if (selectedFrom && selectedTo) {
    routesToDraw.push({ lat: selectedFrom.latitude, lng: selectedFrom.longitude });
    routesToDraw.push({ lat: selectedTo.latitude, lng: selectedTo.longitude });
  }

  const airlineOptions = airlines.map(a => ({ value: a.id, label: a.name }));
  const airportOptions = servicedAirports.map(a => ({ value: a.id, label: `${a.code} - ${a.name}` }));

  const getError = (name: keyof CreateRouteType) => (touched[name] && errors[name] ? errors[name] : undefined);

  const MapMemo = useMemo(() => {
    return (
      <Map
        onLocationSelect={() => { }}
        initialLocation={servicedAirportLocations}
        routesToDraw={routesToDraw}
        readOnly={true}
      />
    )
  }, [routesToDraw, servicedAirportLocations])

  return (
    <Grid container spacing={2}>
      <Grid size={12}>
        <CustomSelect
          name="airlineId"
          label="Operating Airline"
          options={airlineOptions}
          disabled={isSubmitting || airlineOptions.length === 0}
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
              disabled={isSubmitting || servicedAirportsLoading || airportOptions.length === 0}
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
              disabled={isSubmitting || servicedAirportsLoading || airportOptions.length === 0}
              value={values.toAirportId || 0}
              onChange={(e) => handleSelectChange(e, 'toAirportId')}
              error={getError('toAirportId')}
            />
          </Grid>

          {servicedAirportsLoading && (
            <Grid size={12}>
              <Box display="flex" justifyContent="center" mt={1}>
                <CircularProgress size={20} />
                <Typography sx={{ ml: 1, color: 'text.secondary' }}>Loading serviced airports...</Typography>
              </Box>
            </Grid>
          )}

          {airportOptions.length === 0 && !servicedAirportsLoading && (
            <Grid size={12}>
              <Alert severity="warning">
                This airline does not service any airports. Assign airports to the airline first.
              </Alert>
            </Grid>
          )}

          <Grid size={12}>
            {MapMemo}
          </Grid>
        </>
      )}
    </Grid>
  );
};

export default RouteFormFields;