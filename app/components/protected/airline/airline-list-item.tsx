'use client';

import { AirlineWithCountry } from '@/app/types/airline-with-country.type';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { Box, Card, IconButton, Typography, useTheme } from '@mui/material';
import Link from 'next/link';
import React from 'react';

interface AirlineListItemProps {
  item: AirlineWithCountry;
  onEdit?: (airline: AirlineWithCountry) => void;
  onDelete?: (airline: AirlineWithCountry) => void;
  disableActions?: boolean
}

const AirlineListItem: React.FC<AirlineListItemProps> = ({ item, onEdit, onDelete, disableActions = false }) => {
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
      component={Link}
      elevation={0}
      href={`/protected/airlines/${item.id}`}
    >
      <Box>
        <Typography
          variant="h5"
          fontWeight={600}
          marginBottom={1}
          color="primary.main"
        >
          {item.name}
        </Typography>

        <Typography variant="body1" fontWeight={400} color="text.secondary">
          {item.baseCountry.name}
        </Typography>

        <Box display="flex" alignItems="center" gap={1} marginTop={1}>
          <Typography variant="body2" color={'grey.500'}>
            Base: {item.baseCountry.name}
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
              onClick={handleEditClick}
              color="primary"
            >
              <EditIcon />
            </IconButton>

            <IconButton
              aria-label="delete"
              onClick={handleDeleteClick}
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

export default AirlineListItem;