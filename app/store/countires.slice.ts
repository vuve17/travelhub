import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Country } from '@prisma/client';
import { RootState } from './store';
import axios, { isAxiosError } from 'axios';

interface CountriesState {
  list: Country[];
  loading: boolean;
}

const initialState: CountriesState = {
  list: [],
  loading: false,
};

export const fetchCountries = createAsyncThunk<
  Country[],
  void,
  { state: RootState }
>('countries/fetchCountries', async (_, { getState, rejectWithValue }) => {
    
    const state = getState();
    if (state.countriesReducer.list.length > 0) {
        return state.countriesReducer.list;
    }

    try {
        const response = await axios.get<Country[]>('/api/countries'); 
        return response.data;
    } catch (error) {
        if (isAxiosError(error) && error.response) {
            const errorMessage = error.response.data?.message || `API error: ${error.response.status}`;
            return rejectWithValue(errorMessage);
        }
        
        // Network error or other unexpected error
        return rejectWithValue(error instanceof Error ? error.message : 'An unknown network error occurred.');
    }
});

const countriesSlice = createSlice({
  name: 'countries',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCountries.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCountries.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(fetchCountries.rejected, (state) => {
        state.loading = false;
      });
  },
});

export default countriesSlice.reducer;