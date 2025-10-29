'use client';

import AddIcon from '@mui/icons-material/Add';
import { Box, Paper, Stack, Typography, useTheme } from '@mui/material';
import React, { ReactNode } from 'react';
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
  onButtonClick = () => { },
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
        height: { xs: "100%", md: 'calc(100vh - 100px)' },
        display: 'flex',
        flexDirection: 'column',
        border: { xs: `1px solid transparent`, md: `1px solid ${theme.palette.divider}` },
        // minWidth: {
        //   sm: '100vw',
        //   md: 'auto',
        // },
        p: 4
      }}
    >
      <Stack
        direction={{ sm: "column", md: "row" }}
        justifyContent="space-between"
        gap={{ xs: 2, sm: 2, md: 0 }}
        // alignItems="center"
        sx={{
          p: 2,
          borderBottom: `3px solid ${theme.palette.divider}`,
          bgcolor: theme.palette.background.paper,
          flexShrink: 0,
        }}
      >
        <Typography variant="h4" fontWeight={600}>
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