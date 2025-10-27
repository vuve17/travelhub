'use client';

import { fetchCountries } from '@/app/store/countires.slice';
import { AppDispatch, RootState } from '@/app/store/store';
import { MapLocation } from '@/app/types/map-location.type';
import { Box, Button, CircularProgress, Grid, Paper, Typography, useTheme } from '@mui/material';
import { Airport, Country } from '@prisma/client';
import { Form, Formik, useFormikContext } from 'formik';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import * as Yup from 'yup';
import CountrySelect from '../form/country-select';
import CustomTextInput from '../form/custom-text-input';
import Map from '../map/map';
import { AirportWithCountry } from '@/app/types/airport-with-country.type';


const AirportValidationSchema = Yup.object().shape({
  name: Yup.string()
    .required('Airport name is required')
    .min(2, 'Name must be at least 2 characters'),
  code: Yup.string()
    .required('IATA/ICAO code is required')
    .min(3, 'Code must be at least 3 characters')
    .max(4, 'Code cannot exceed 4 characters'),
  // ⭐️ NEW: City validation
  city: Yup.string()
    .required('City is required')
    .min(2, 'City must be at least 2 characters'),
  countryId: Yup.number()
    .required('Country selection is required')
    .min(1, 'Country selection is required'),
  latitude: Yup.number()
    .required('GPS location must be set by clicking the map'),
  longitude: Yup.number()
    .required('GPS location must be set by clicking the map'),
});


interface MapUpdaterProps {
  setMapLocation: React.Dispatch<React.SetStateAction<MapLocation | null>>;
  initialLat?: number;
  initialLng?: number;
  countries: Country[];
}

const MapUpdater: React.FC<MapUpdaterProps> = ({ setMapLocation, initialLat, initialLng, countries }) => {
  // Use Airport type from schema, now includes 'city'
  const { setFieldValue, setFieldTouched } = useFormikContext<Airport & {city: string}>(); 
  
  const handleLocationSelect = (location: MapLocation | null) => {
    setMapLocation(location);

    if (location) {
      // 1. Set Latitude and Longitude
      setFieldValue('latitude', location.lat);
      setFieldValue('longitude', location.lng);
      setFieldTouched('latitude', true, false);
      setFieldTouched('longitude', true, false);

      // 2. ⭐️ NEW: Set City
      if (location.city) {
          setFieldValue('city', location.city);
          setFieldTouched('city', true, false);
      }
      
      // 3. ⭐️ Pre-select Country based on geocoded name
      if (location.country) {
        const country = countries.find(c => c.name === location.country);
        if (country) {
          // The form expects countryId as a string
          setFieldValue('countryId', country.id.toString());
          setFieldTouched('countryId', true, false);
        }
      }
    } else {
      setFieldValue('latitude', undefined);
      setFieldValue('longitude', undefined);
      setFieldTouched('latitude', true, false);
      setFieldTouched('longitude', true, false);
      // Also clear city on location clear
      setFieldValue('city', ''); 
      setFieldTouched('city', true, false);
    }
  };

  const initialCenter =
    (typeof initialLat === 'number' && typeof initialLng === 'number')
      ? { lat: initialLat, lng: initialLng }
      : undefined;

  return (
    <Box sx={{ mt: 2, mb: 1 }}>
      <Map onLocationSelect={handleLocationSelect} initialLocation={initialCenter} />
    </Box>
  );
};


interface AirportFormProps {
  initialValues: Airport;
  onSubmit: (values: AirportWithCountry) => Promise<void>;
  mode: 'create' | 'edit';
}

const AirportForm: React.FC<AirportFormProps> = ({ initialValues, onSubmit, mode }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { list: countries, loading: countriesLoading } = useSelector((state: RootState) => state.countriesReducer);
  const [mapLocation, setMapLocation] = useState<MapLocation | null>(null);
  const [saving, setSaving] = useState(false);
  const theme = useTheme();
  
  useEffect(() => {
    if (countries.length === 0) {
      dispatch(fetchCountries());
    }

    if (initialValues.latitude && initialValues.longitude && initialValues.countryId) {
      setMapLocation({
        lat: initialValues.latitude,
        lng: initialValues.longitude,
        // The initialValues for MapLocation need to be updated with the city property
        city: (initialValues as Airport & {city: string}).city || null,
        country: countries.length ? countries.find((c) => c.id === initialValues.countryId)?.name || null : null,
      });
    }
  }, [countries.length, initialValues.latitude, initialValues.longitude, initialValues.countryId]);


  const handleSubmit = async (values: Airport) => {
    // Basic validation check is redundant because Yup handles most, but ensures map interaction
    if (!values.latitude || !values.longitude) {
      return;
    }
    try {
      setSaving(true);
      await onSubmit(values as AirportWithCountry);
    } catch (error) {
      console.error('Submission error:', error);
    } finally {
      setSaving(false);
    }
  };

  const title = mode === 'create' ? 'Create New Airport' : 'Edit Airport';
  const submitText = mode === 'create' ? 'Create Airport' : 'Save Changes';


  const formikInitialValues = {
    ...initialValues,
    countryId: initialValues.countryId.toString(),
  } as unknown as Airport;


  return (
    <Paper elevation={0} sx={{ p: 0, margin: 'auto' }}>
      <Typography variant="h5" gutterBottom>
        {title}
      </Typography>

      <Formik
        initialValues={formikInitialValues}
        validationSchema={AirportValidationSchema}
        onSubmit={handleSubmit}
        enableReinitialize={true}
      >
        {({ errors, touched, getFieldProps }) => (
          <Form>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 6 }}>
                <CustomTextInput
                  {...getFieldProps('name')}
                  label="Airport Name"
                  required={true}
                  error={touched.name && errors.name}
                  size="small"
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <CustomTextInput
                  {...getFieldProps('code')}
                  label="IATA or ICAO Code"
                  required={true}
                  error={touched.code && errors.code}
                  size="small"
                />
              </Grid>
              {/* ⭐️ NEW: City Field */}
              <Grid size={{ xs: 12, md: 6 }}>
                <CustomTextInput
                  {...getFieldProps('city')}
                  label="City"
                  required={true}
                  error={touched.city && errors.city}
                  size="small"
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <CountrySelect
                  {...getFieldProps('countryId')}
                  error={touched.countryId && errors.countryId}
                  size="small"
                />
              </Grid>
            </Grid>

            <Box sx={{ mt: 3, mb: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                GPS Location (Click on Map)
              </Typography>

              <MapUpdater 
                setMapLocation={setMapLocation} 
                initialLat={initialValues.latitude || undefined} 
                initialLng={initialValues.longitude || undefined} 
                countries={countries} 
              />

              <Box sx={{ mt: 1, p: 1, bgcolor: theme.palette.background.paper, borderRadius: 1 }}>
                {mapLocation ? (
                  <Typography variant="body2">
                    Selected: {mapLocation.lat.toFixed(4)}, {mapLocation.lng.toFixed(4)}
                    ({mapLocation.city || 'Unknown City'}, {mapLocation.country || 'Unknown Country'})
                  </Typography>
                ) : (
                  <Typography variant="body2" color="error">
                    Click on the map to set the airport location.
                  </Typography>
                )}
              </Box>

              {/* Check validation errors for location fields */}
              {((touched as any).latitude && (errors as any).latitude) || ((touched as any).longitude && (errors as any).longitude) ? (
                <Typography color="error" variant="caption" sx={{ mt: 1 }}>
                  {(errors as any).latitude || (errors as any).longitude}
                </Typography>
              ) : null}
            </Box>
            <Box sx={{ mt: 3 }}>
              <Button
                type="submit"
                color="primary"
                variant="contained"
                disabled={saving || countriesLoading}
                fullWidth
              >
                {saving ? <CircularProgress size={24} color="inherit" /> : submitText}
              </Button>
            </Box>
          </Form>
        )}
      </Formik>
    </Paper>
  );
};

export default AirportForm;