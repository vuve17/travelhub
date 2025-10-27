import React from 'react';
import { Modal, Box, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { Airport } from '@prisma/client';
import AirportForm from './airport-form';
import { AirportWithCountry } from '@/app/types/airport-with-country.type';
import { closeButtonStyle } from '@/app/lib/close-icon-style';

const defaultInitialValues: Airport = {
    id: 0,
    name: '',
    code: '',
    city: '',
    countryId: 0,
    latitude: 0,
    longitude: 0,
};

interface AirportModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (values: AirportWithCountry) => Promise<Airport>;
    mode: 'create' | 'edit';
    initialValues?: Airport | undefined; 
}

const AirportModal: React.FC<AirportModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  mode,
  initialValues = defaultInitialValues, 
}) => {

  const formInitialValues = initialValues || defaultInitialValues;
  
  const handleFormSubmit = async (values: AirportWithCountry) => {
    await onSubmit(values);
    onClose(); 
  };


  return (
    <Modal
      open={isOpen}
      aria-labelledby={`airport-${mode}-title`}
      aria-describedby={`airport-${mode}-form`}
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

        <AirportForm
          initialValues={formInitialValues}
          onSubmit={handleFormSubmit}
          mode={mode}
        />
      </Box>
    </Modal>
  );
};

export default AirportModal;