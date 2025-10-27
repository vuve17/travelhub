// components/forms/CountrySelect.tsx

import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { CircularProgress } from '@mui/material';
import { Country } from '@prisma/client';
import CustomSelect from './custom-select';
import { fetchCountries } from '@/app/store/countires.slice';
import { AppDispatch, RootState } from '@/app/store/store';
import { SelectChangeEvent } from '@mui/material';

interface CountrySelectProps {
  name: string;
  value: string | number;
  onChange: (event: SelectChangeEvent<string | number>, child: React.ReactNode) => void;
  onBlur: (event: React.FocusEvent<HTMLInputElement>) => void;
  error?: string | false | undefined;
  disabled?: boolean;
  size?: 'small' | 'medium' | undefined;
  margin?: 'normal' | 'dense';
  fullWidth?: boolean;
}

const CountrySelect: React.FC<CountrySelectProps> = (props) => {
  const dispatch = useDispatch<AppDispatch>();
  const { list: countries, loading: countriesLoading } = useSelector((state: RootState) => state.countriesReducer);
  
  React.useEffect(() => {
    if (countries.length === 0) {
      dispatch(fetchCountries());
    }
  }, [dispatch, countries.length]);
  
  const countryOptions = countries.map((country: Country) => ({
    label: country.name,
    value: country.id,
  }));
  
  if (countriesLoading) {
    return <CircularProgress size={20} sx={{ mt: 1, mb: 1 }} />;
  }

  return (
    <CustomSelect
      label="Country"
      options={countryOptions}
      {...props} 
    />
  );
};

export default CountrySelect;