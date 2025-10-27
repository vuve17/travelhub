'use client';

import React, { ReactNode } from 'react';
import { Stack, Typography, Box, Paper, useTheme } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CustomButton from '../form/custom-buttton';


interface ListWrapperProps {
  heading: string;
  removeButton?: boolean;
  count?: number;
  buttonText?: string;
  onButtonClick?: () => void;
  disabled?: boolean;
  children: ReactNode;
}

const ListWrapper: React.FC<ListWrapperProps> = ({
  heading,
  count = 0,
  buttonText = '',
  onButtonClick,
  disabled = false,
  children,
  removeButton = false
}) => {
  const theme = useTheme();
  const fullHeading = count !== undefined ? `${heading} (${count})` : heading;

  return (
    <Paper
      elevation={0}
      sx={{
        height: 'calc(100vh - 100px)',
        display: 'flex',
        flexDirection: 'column',
        border: `1px solid ${theme.palette.divider}`,
        minWidth: {
          sm: '100vw',
          md: 'auto',
        },
        p: 4
      }}
    >
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{
          p: 2,
          borderBottom: `1px solid ${theme.palette.divider}`,
          bgcolor: theme.palette.background.paper,
          flexShrink: 0,
        }}
      >
        <Typography variant="h4">
          {fullHeading}
        </Typography>

        {
          removeButton ? null : <CustomButton
            text={buttonText}
            onClick={onButtonClick}
            startIcon={<AddIcon />}
            disabled={disabled}
          />
        }

      </Stack>

      <Box
        sx={{
          flexGrow: 1,
          overflowY: 'auto',
          pt: 2
        }}
      >
        {children}
      </Box>
    </Paper>
  );
};

export default ListWrapper;