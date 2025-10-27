'use client';

import React from 'react';
import { Modal, Box, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { Airline, Airport } from '@prisma/client';
import AirlineForm from './airline-form';
import { AirlineWithCountry } from '@/app/types/airline-with-country.type';
import { AirportWithCountry } from '@/app/types/airport-with-country.type';
import { AirlineSubmissionType } from '@/app/types/airline-submission.type';
import { closeButtonStyle } from '@/app/lib/close-icon-style';

interface AirlineModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: AirlineSubmissionType) => Promise<Airline>;
  mode: 'create' | 'edit';
  initialValues?: AirlineWithCountry | undefined;
  airportsLoading: boolean;
  airports: AirportWithCountry[];
  selectedAirlinesServicedAirports: Airport[];

}

const AirlineModal: React.FC<AirlineModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  mode,
  initialValues,
  airportsLoading,
  airports,
  selectedAirlinesServicedAirports = []
}) => {


  const handleFormSubmit = async (values: Airline) => {
    const submissionValues = {
      ...values,
    }
    await onSubmit(submissionValues);
    onClose();
  };


  return (
    <Modal
      open={isOpen}
      onClose={(event, reason) => {
        if (reason === "backdropClick") {
          return;
        }
        onClose();
      }}
      aria-labelledby={`airline-${mode}-title`}
      aria-describedby={`airline-${mode}-form`}
      slotProps={{
        backdrop: {
          onClick: (e) => e.stopPropagation(),
        }
      }}
    >
      <Box sx={closeButtonStyle}>
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
            zIndex: 10,
          }}
        >
          <CloseIcon />
        </IconButton>

        <AirlineForm
          initialValues={initialValues}
          onSubmit={handleFormSubmit}
          mode={mode}
          airportsLoading={airportsLoading}
          airports={airports}
          selectedAirlinesServicedAirports={selectedAirlinesServicedAirports}
        />
      </Box>
    </Modal>
  );
};

export default AirlineModal;