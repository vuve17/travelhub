import {
  Box,
  Dialog,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Typography,
  useTheme,
} from '@mui/material';
import React from 'react';
import CustomButton from '../form/custom-buttton';

interface ConfirmationModalProperties {
  openModal: boolean;
  question?: string;
  yesText?: string;
  noText?: string;
  dialogText?: string;
  onCancel: () => void;
  onConfirm: () => void | Promise<void>;
}

const ConfirmationModal: React.FC<ConfirmationModalProperties> = ({
  openModal,
  onCancel,
  onConfirm,
  dialogText = 'Let Google help apps determine location. This means sending anonymous location data to Google, even when no apps are running.',
  question = 'Are you sure you want to execute this action?',
  yesText = "Yes, I'm sure",
  noText = 'No, cancel',
}) => {
  const theme = useTheme();
  return (
    <Dialog
      onClick={(e) => e.stopPropagation()}
      open={openModal}
      fullScreen={false}
      slotProps={{
        backdrop: {
          onClick: (e) => e.stopPropagation(),
        },
        paper: {
          sx: {
            minWidth: { xs: '100vw', sm: 'auto' },
            minHeight: { xs: '100vh', sm: 'auto' },
            margin: { xs: 0, sm: 'auto' },
            padding: '65px 40px',
            backgroundColor: theme.palette.background.paper, 
          },
          onClick: (e: React.MouseEvent<HTMLElement, MouseEvent>) =>
            e.stopPropagation(),
        },
      }}
    >
      <DialogContent
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: { xs: '100%', sm: 'auto' },
          padding: 0,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            marginBottom: '40px',
          }}
        >
          <DialogTitle id="alert-dialog-title" textAlign="center" p={0}>
            <Typography
              fontWeight={600}
              fontSize={24}
              color={theme.palette.text.primary} 
            >
              {question}
            </Typography>
          </DialogTitle>

          <DialogContentText
            id="alert-dialog-description"
            sx={{ mt: 2 }}
            textAlign="center"
          >
            <Typography
              fontWeight={500}
              fontSize={16}
              color={theme.palette.text.primary}
            >
              {dialogText}
            </Typography>
          </DialogContentText>
        </Box>
        <Box
          sx={{
            display: 'flex',
            flexDirection: { md: 'row', xs: 'column' },
            justifyContent: 'center',
            alignItems: 'center',
            gap: 2,
            width: '100%',
          }}
        >
          <CustomButton
            text={noText}
            onClick={onCancel}
            variant="outlined" 
            color="inherit" 
            sx={{
              minWidth: { xs: '100%', md: '230px' },
              backgroundColor: theme.palette.action.hover, 
              color: theme.palette.text.primary,
              border: `1px solid ${theme.palette.divider}`, 
              '&:hover': {
                 backgroundColor: theme.palette.action.selected,
              }
            }}
          />

          <CustomButton
            text={yesText}
            onClick={onConfirm}
            variant="contained"
            color="error"
            sx={{ 
              minWidth: { xs: '100%', md: '230px' },
              color: theme.palette.error.contrastText, 
            }}
          />
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default ConfirmationModal;