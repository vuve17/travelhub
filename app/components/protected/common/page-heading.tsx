'use client';

import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { Box, IconButton, Typography } from '@mui/material';
import React from 'react';

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
      sx={(theme) => ({
        display: 'flex',
        width: { xs: "100%", md: "auto" },
        flexDirection: { xs: "column", md: "row" },
        justifyContent: { xs: "flex-start", md: "space-between" },
        alignItems: 'center',
        p: 2,
        mt: { xs: 2, md: 0 },
        background: theme.palette.background.paper,
        border: {
          xs: 'none',
          sm: 'none',

          md: `1px solid ${theme.palette.divider}`,
          lg: `1px solid ${theme.palette.divider}`,
          xl: `1px solid ${theme.palette.divider}`,
        }
      })}
    >
      <Box display={'flex'} justifyItems={'flex-start'}>
        <Typography variant="h4" component="h1" fontWeight={600}>
          {title}
        </Typography>
      </Box>

      <Box
        sx={{
          display: "flex",
          gap: 1,
          width: { xs: "100%", md: "auto" },
          justifyContent: { xs: "flex-end", md: "flex-start" },
          mt: { xs: 1.5, md: 0 }
        }}
      >
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