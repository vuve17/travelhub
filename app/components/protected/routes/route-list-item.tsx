'use client';

import { convertMinutesToTime, formatFlightTime } from '@/app/lib/haversine-formula';
import { RouteWithRelations } from '@/app/types/route-with-relations.type';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { Box, Card, Chip, IconButton, Typography, useTheme } from '@mui/material';
import Link from 'next/link';
import React from 'react';


interface RouteListItemProps {
  item: RouteWithRelations;
  onEdit?: (route: RouteWithRelations) => void;
  onDelete?: (route: RouteWithRelations) => void;
  disableActions?: boolean;
}

const RouteListItem: React.FC<RouteListItemProps> = ({ item, onEdit, onDelete, disableActions = false }) => {
  const theme = useTheme();

  const route = item;

  const routePathCodes = `${route.fromAirport.code} → ${route.toAirport.code}`;
  const routePathNames = `${route.fromAirport.name} (${route.fromAirport.city}) → ${route.toAirport.name} (${route.toAirport.city})`;
  const operatorName = route.operator.name;

  const formattedDuration = route.totalDurationMin
    ? formatFlightTime(convertMinutesToTime(route.totalDurationMin))
    : 'N/A';

  const routeDetailHref = `/protected/routes/${item.id}`;


  const handleEditClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onEdit) {
      onEdit(route);
    }
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onDelete) {
      onDelete(route);
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
      href={routeDetailHref}
    >
      <Box>
        <Typography
          variant="h5"
          fontWeight={600}
          marginBottom={1}
          color="primary.main"
        >
          {routePathNames}
        </Typography>

        <Typography variant="body1" fontWeight={400} color="text.secondary">
          {routePathCodes}
        </Typography>

        <Box display="flex" alignItems="center" gap={3} marginTop={2} flexWrap="wrap">
          <Chip
            label={`Duration: ${formattedDuration}`}
            size="small"
            color="primary"
            icon={<AccessTimeIcon sx={{ fontSize: 16 }} />}
            sx={{ height: 24, fontWeight: 'bold' }}
          />
          <Typography variant="body2" color={'grey.500'} fontWeight={500}>
            Operator: {operatorName}
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
            marginLeft={{ xs: 0, sm: 3 }}
            marginTop={{ xs: 2, sm: 0 }}
          >
            <IconButton
              aria-label="edit"
              onClick={handleEditClick}
              color="primary"
              size="large"
            >
              <EditIcon />
            </IconButton>

            <IconButton
              aria-label="delete"
              onClick={handleDeleteClick}
              color="error"
              size="large"
            >
              <DeleteIcon />
            </IconButton>
          </Box>
        )
      }

    </Card>
  );
};

export default RouteListItem;