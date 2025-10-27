"use client";

import React, { useState } from 'react';
import { Container, Typography, Box, Paper, useTheme } from '@mui/material';
import Map from '../components/protected/map/map';

const Page: React.FC = () => {
  const theme = useTheme();
  const [selectedLocation, setSelectedLoaction] = useState<any>();
  console.log("Selected Location:", selectedLocation);

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Airport Location Selector
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Use the map below to select the exact coordinates for a new airport or route endpoint.
      </Typography>

      <Paper elevation={3} sx={{ p: 3, bgcolor: theme.palette.background.paper }}>

        <Box sx={{ mt: 3, pt: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
          <Typography variant="h6">
            Location Data
          </Typography>
          <Typography variant="caption" color="text.secondary">
            (The selected location data is managed by the Map component and can be retrieved here if state were lifted higher.)
          </Typography>
          <Map onLocationSelect={setSelectedLoaction}/>
        </Box>
      </Paper>

    </Container>
  );
}

export default Page;