import React, { useState, useEffect } from 'react';
import { Snackbar, Alert, AlertColor, AlertProps } from '@mui/material';

interface SnackbarAlertProps {
  open: boolean;
  text: string;
  severity?: AlertColor;
  duration?: number;
  onClose: (reason?: string) => void;
  alertVariant?: AlertProps['variant'];
}

const SnackbarAlert: React.FC<SnackbarAlertProps> = ({
  open,
  text,
  severity = 'success',
  duration = 5000,
  onClose,
  alertVariant = 'filled',
}) => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setIsOpen(open);
  }, [open]);

  const handleClose = (
    event?: React.SyntheticEvent | Event,
    reason?: string
  ) => {
    if (reason === 'clickaway') {
      return;
    }
    setIsOpen(false);
    onClose(reason);
  };

  return (
    <Snackbar
      open={isOpen}
      autoHideDuration={duration}
      onClose={handleClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
    >
      <Alert
        onClose={handleClose}
        severity={severity}
        variant={alertVariant}
        sx={{ width: '100%' }}
      >
        {text}
      </Alert>
    </Snackbar>
  );
};

export default SnackbarAlert;