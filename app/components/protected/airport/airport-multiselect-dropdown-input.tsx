'use client';

import React from 'react';
import { FormControl, InputLabel, Select, MenuItem, Checkbox, ListItemText, OutlinedInput, FormHelperText } from '@mui/material';
import { Airport } from '@prisma/client';

interface AirportMutiselectDropdownInputProps {
  value: number[];
  onChange: (e: { target: { name: string, value: number[] } }) => void;
  name: string;
  error?: string | boolean;
  size?: 'small' | 'medium';
  airports: Airport[];
  airportsLoading: boolean;
}

const AirportMutiselectDropdownInput: React.FC<AirportMutiselectDropdownInputProps> = ({
  value,
  onChange,
  name,
  error,
  size = 'medium',
  airports,
  airportsLoading
}) => {


  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const {
      target: { value: selectedValues },
    } = event;

    const numericValues = Array.isArray(selectedValues) ? selectedValues.map(v => Number(v)) : [];

    onChange({
      target: {
        name: name,
        value: numericValues,
      }
    });
  };

  return (
    <FormControl
      fullWidth
      size={size}
      error={!!error}
      sx={{ my: 1 }}
    >
      <InputLabel id={`${name}-label`}>Serviced Airports (Multi-Select)</InputLabel>
      <Select
        labelId={`${name}-label`}
        id={name}
        multiple
        value={value}
        onChange={handleChange}
        input={<OutlinedInput label="Serviced Airports (Multi-Select)" />}
        renderValue={(selected) => {
          const selectedAirportNames = airports
            .filter(airport => selected.includes(airport.id))
            .map(airport => airport.name);
          return selectedAirportNames.join(', ');
        }}
        disabled={airportsLoading}
      >
        {airportsLoading ? (
          <MenuItem disabled>Loading airports...</MenuItem>
        ) : (
          airports.map((airport) => (
            <MenuItem key={airport.id} value={airport.id}>
              <Checkbox checked={value.includes(airport.id)} />
              <ListItemText primary={`${airport.name} (${airport.code})`} />
            </MenuItem>
          ))
        )}
      </Select>
      {error && <FormHelperText>{error}</FormHelperText>}
    </FormControl>
  );
};

export default AirportMutiselectDropdownInput;