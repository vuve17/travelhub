'use client';

import React from 'react';
import { Box, Typography, IconButton } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

interface PageHeadingProps {
  title: string;
  onEditClick: () => void;
  onDeleteClick: () => void;
  actionsDisabled?: boolean;
}

const PageHeading: React.FC<PageHeadingProps> = ({
  title,
  onEditClick,
  onDeleteClick,
  actionsDisabled = false,
}) => {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        mb: 4,
        pb: 1,
        borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
      }}
    >
      <Typography variant="h4" component="h1" fontWeight={600}>
        {title}
      </Typography>
      <Box display="flex" gap={1}>
        <IconButton
          color="primary"
          onClick={onEditClick}
          disabled={actionsDisabled}
          aria-label="Edit"
        >
          <EditIcon />
        </IconButton>
        <IconButton
          color="error"
          onClick={onDeleteClick}
          disabled={actionsDisabled}
          aria-label="Delete"
        >
          <DeleteIcon />
        </IconButton>
      </Box>
    </Box>
  );
};

export default PageHeading;