'use client';

import { AirportWithCountry } from '@/app/types/airport-with-country.type';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { Box, Card, Chip, IconButton, Typography, useTheme } from '@mui/material';
import Link from 'next/link';
import React from 'react';

interface AirportListItemProps {
  item: AirportWithCountry;
  onEdit?: (airport: AirportWithCountry) => void;
  onDelete?: (airportId: AirportWithCountry) => void;
  disableActions?: boolean
}

const AirportListItem: React.FC<AirportListItemProps> = ({ item, onEdit, onDelete, disableActions = false }) => {
  const theme = useTheme()
  const handleEditClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onEdit) {
      onEdit(item);
    }
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onDelete) {
      onDelete(item);
    }
  };

  return (
    <Card
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        padding: 3,
        marginBottom: 3,
        borderRadius: 4,
        textDecoration: 'none',
        border: `1px solid ${theme.palette.divider}`,
        '&:hover': {
          transition: '0.2s',
          borderColor: 'primary.main',
        },
        justifyContent: 'space-between',
      }}
      elevation={0}
      component={Link}
      href={`/protected/airports/${+item.id}`}
    >
      <Box>
        <Typography
          variant="h5"
          fontWeight={600}
          marginBottom={1}
          color="primary.main"
        >
          {item.name} ({item.code.trim()})
        </Typography>

        <Typography variant="body1" fontWeight={400} color="text.secondary">
          {item.city}, {item.country.name}
        </Typography>

        <Box display="flex" flexDirection={{ xs: 'column', sm: 'column', md: 'row' }} alignItems={{ sm: "left", md: "center" }} gap={1} marginTop={2}>
          <Chip
            label={`IATA/ICAO: ${item.code}`}
            size="small"
            variant="outlined"
            color="info"
            sx={{
              maxWidth: 150
            }}
          />
          <Typography variant="body2" color={'grey.500'}>
            Location: {item.longitude.toFixed(4)}, {item.latitude.toFixed(4)}
          </Typography>
        </Box>
      </Box>
      {
        disableActions ? null : (
          <Box
            display="flex"
            justifyContent={'flex-end'}
            alignItems="center"
            gap={1}
            marginLeft={3}
          >
            <IconButton
              aria-label="edit"
              onClick={(e) => handleEditClick(e)}
              color="primary"
            >
              <EditIcon />
            </IconButton>

            <IconButton
              aria-label="delete"
              onClick={(e) => handleDeleteClick(e)}
              color="error"
            >
              <DeleteIcon />
            </IconButton>
          </Box>
        )
      }
    </Card>
  );
};

export default AirportListItem;