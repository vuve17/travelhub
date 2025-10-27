// components/forms/CustomTextInput.tsx

import React from 'react';
import { SxProps, TextField } from '@mui/material';

interface CustomTextInputProps {
  name: string;
  value: string | number | null | undefined;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur: (event: React.FocusEvent<HTMLInputElement>) => void;
  label: string;
  error?: string | false | undefined; 
  required?: boolean;

  // MUI Props
  type?: string;
  readonly?: boolean;
  disabled?: boolean;
  size?: 'small' | 'medium';
  sx?: SxProps;
}

const CustomTextInput: React.FC<CustomTextInputProps> = ({
  name,
  value,
  onChange,
  onBlur,
  label,
  error,
  required = false,
  type,
  readonly,
  disabled,
  size = 'small',
  sx = {},
}) => {
  const labelText = `${label}${required ? ' *' : ''}`;
  const isError = !!error;

  return (
    <TextField
      // Formik/React Props
      name={name}
      value={value === null || value === undefined ? '' : value} // Ensure controlled component uses empty string for null/undefined
      onChange={onChange}
      onBlur={onBlur}

      // Display/Validation Props
      error={isError}
      helperText={isError ? error : undefined}
      label={labelText}
      type={type || 'text'}
      
      // MUI/Styling Props
      fullWidth={true}
      margin="dense"
      variant="outlined"
      size={size}
      sx={sx}
      
      // Input Slot Props
      InputProps={{
        readOnly: readonly,
        disabled: disabled,
      }}
      InputLabelProps={{
        shrink: true, // Always shrink the label, matching the previous behavior
      }}
    />
  );
};

export default CustomTextInput;