import { Button, SxProps } from '@mui/material';
import React from 'react';

interface CustomButtonProps {
  text: string;
  variant?: 'text' | 'outlined' | 'contained';
  color?: 'primary' | 'secondary' | 'inherit' | 'success' | 'error' | 'info' | 'warning';
  onClick: (...args: any[]) => void;
  startIcon?: React.ReactNode;
  disabled?: boolean;
  sx?: SxProps
}

const CustomButton: React.FC<CustomButtonProps> = ({
  text = '',
  color = 'primary',
  variant = 'contained',
  onClick = () => { },
  startIcon,
  disabled = false,
  sx = {},
}) => {
  return (
    <Button
      variant={variant}
      color={color}
      startIcon={startIcon}
      onClick={onClick}
      disabled={disabled}
      sx={{
        textTransform: 'none',
        padding: '10px 20px',
        fontSize: '1rem',
        width: 200,
        ...sx
      }}
    >
      {text}
    </Button>
  );
};

export default CustomButton;