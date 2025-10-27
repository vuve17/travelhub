// import React from 'react';
// import {
//   FormControl,
//   FormHelperText,
//   InputLabel,
//   MenuItem,
//   Select,
//   SelectChangeEvent,
// } from '@mui/material';

// interface SelectOption {
//   label: string;
//   value: string | number;
// }

// interface CustomSelectProps {
//   label: string;
//   name: string; // The name of the field for Formik/state tracking
//   value: string | number; // The current value of the field
//   onChange: (value: string | number) => void; // Standard change handler
//   error?: string | false | undefined; // Error message string or boolean/undefined
  
//   // Existing MUI props
//   disabled?: boolean;
//   size?: 'small' | 'medium';
//   margin?: 'normal' | 'dense';
//   options: SelectOption[];
//   fullWidth?: boolean;
// }

// const CustomSelect: React.FC<CustomSelectProps> = ({
//   label,
//   name,
//   value,
//   onChange,
//   error,
//   disabled,
//   size,
//   margin = 'dense',
//   fullWidth = true,
//   options = [],
// }) => {
    
//   const isError = !!error;

//   const handleChange = (event: SelectChangeEvent<typeof value>) => {
//     onChange(event.target.value); 
//   };
  
//   return (
//     <FormControl fullWidth={fullWidth} error={isError} margin={margin}>
//       <InputLabel id={`label-${name}`} size={size}>{label}</InputLabel>
//       <Select
//         labelId={`label-${name}`}
//         id={name}
//         name={name}
//         label={label}
//         value={value || ''}
//         onChange={handleChange}
//         variant="outlined"
//         size={size}
//         disabled={disabled}
//         // Ensure it handles string/number values correctly from Formik
//         inputProps={{
//             // Convert value back to string for the DOM, though MUI handles it well
//             value: value === undefined || value === null ? '' : value,
//         }}
//       >
//         {options.map((o) => (
//           <MenuItem key={o.value} value={o.value}>
//             {o.label}
//           </MenuItem>
//         ))}
//       </Select>
//       {isError && <FormHelperText>{error}</FormHelperText>}
//     </FormControl>
//   );
// };

// export default CustomSelect;

// components/forms/CustomSelect.tsx

import React from 'react';
import {
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
} from '@mui/material';

interface SelectOption {
  label: string;
  value: string | number;
}

interface CustomSelectProps {
  label: string;
  name: string;
  value: string | number;
  onChange: (event: SelectChangeEvent<string | number>, child: React.ReactNode) => void;
  error?: string | false | undefined;
  options: SelectOption[];
  disabled?: boolean;
  size?: 'small' | 'medium';
  margin?: 'normal' | 'dense';
  fullWidth?: boolean;
}

const CustomSelect: React.FC<CustomSelectProps> = ({
  label,
  name,
  value,
  onChange,
  error,
  disabled,
  size,
  margin = 'dense',
  fullWidth = true,
  options = [],
}) => {
  
  const selectValue = 
    value === 0 || value === null || value === undefined || value === ''
      ? ''
      : String(value);

  return (
    <FormControl fullWidth={fullWidth} error={!!error} margin={margin}>
      <InputLabel id={`label-${name}`} size={size}>{label}</InputLabel>
      <Select
        labelId={`label-${name}`}
        id={name}
        name={name}
        label={label}
        value={selectValue}
        onChange={onChange}
        variant="outlined"
        size={size}
        disabled={disabled}
      >
        {options.map((o) => (
          <MenuItem key={o.value} value={o.value}>
            {o.label}
          </MenuItem>
        ))}
      </Select>
      {!!error && <FormHelperText>{error}</FormHelperText>}
    </FormControl>
  );
};

export default CustomSelect;