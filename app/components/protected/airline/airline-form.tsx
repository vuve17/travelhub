'use client';

import { AirportWithCountry } from '@/app/types/airport-with-country.type';
import { Box, Button, CircularProgress, Grid, Paper, Typography } from '@mui/material';
import { Airline, Airport } from '@prisma/client';
import { Form, Formik } from 'formik';
import React, { useState } from 'react';
import * as Yup from 'yup';
import AirportMutiselectDropdownInput from '../airport/airport-multiselect-dropdown-input';
import CountrySelect from '../form/country-select';
import CustomTextInput from '../form/custom-text-input';

interface AirlineFormValues {
  id: number;
  name: string;
  baseCountryId: number;
  servicedAirportIds: number[];
}

const defaultFormikInitialValues: AirlineFormValues = {
  id: 0,
  name: '',
  baseCountryId: 0,
  servicedAirportIds: [],
};

const AirlineValidationSchema = Yup.object().shape({
  name: Yup.string()
    .required('Airline name is required')
    .min(2, 'Name must be at least 2 characters'),
  baseCountryId: Yup.number()
    .required('Base Country selection is required')
    .min(1, 'Country selection is required')
    .typeError('Country selection is required'),
  servicedAirportIds: Yup.array()
    .of(Yup.number())
    .nullable(),
});


interface AirlineFormProps {
  initialValues: Airline | undefined;
  onSubmit: (values: AirlineFormValues) => Promise<void>;
  mode: 'create' | 'edit';
  airportsLoading: boolean;
  airports: AirportWithCountry[];
  selectedAirlinesServicedAirports?: Airport[]
}

const AirlineForm: React.FC<AirlineFormProps> = ({ initialValues, onSubmit, mode, airports = [],
  airportsLoading = false, selectedAirlinesServicedAirports = [] }) => {
  const [saving, setSaving] = useState(false);
  const handleSubmit = async (values: AirlineFormValues) => {
    try {
      setSaving(true);
      await onSubmit(values);
    } catch (error) {
      console.error('Submission error:', error);
    } finally {
      setSaving(false);
    }
  };

  const title = mode === 'create' ? 'Create New Airline' : 'Edit Airline';
  const submitText = mode === 'create' ? 'Create Airline' : 'Save Changes';
  const servicedAirportIds = selectedAirlinesServicedAirports.length ? selectedAirlinesServicedAirports.map((a) => a.id) : []
  console.log("servicedAirportIds: ", servicedAirportIds)
  const initialFormValues = initialValues
    ? {
      ...initialValues,
      servicedAirportIds
    }
    : defaultFormikInitialValues;


  return (
    <Paper elevation={0} sx={{ p: 0, margin: 'auto' }}>
      <Typography variant="h5" gutterBottom>
        {title}
      </Typography>

      <Formik
        initialValues={initialFormValues}
        validationSchema={AirlineValidationSchema}
        onSubmit={handleSubmit}
        enableReinitialize={true}
      >
        {({ errors, touched, getFieldProps }) => {
          const servicedAirportProps = getFieldProps('servicedAirportIds');

          return (
          <Form>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 6 }}>
                <CustomTextInput
                  {...getFieldProps('name')}
                  label="Airline Name"
                  required={true}
                  error={touched.name && errors.name}
                  size="small"
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <CountrySelect
                  {...getFieldProps('baseCountryId')}
                  error={touched.baseCountryId && errors.baseCountryId}
                  size="small"
                />
              </Grid>

              <Grid size={12}>
                <AirportMutiselectDropdownInput
                  {...servicedAirportProps}
                  size="small"
                  airports={airports}
                  airportsLoading={airportsLoading}
                />
              </Grid>
            </Grid>

            <Box sx={{ mt: 3 }}>
              <Button
                type="submit"
                color="primary"
                variant="contained"
                disabled={saving || airportsLoading}
                fullWidth
              >
                {saving ? <CircularProgress size={24} color="inherit" /> : submitText}
              </Button>
            </Box>
          </Form>
        );
      }}
      </Formik>
    </Paper>
  );
};

export default AirlineForm;