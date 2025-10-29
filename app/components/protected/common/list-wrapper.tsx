'use client';

import { RootState } from '@/app/store/store';
import { ListPaginationConfig } from '@/app/types/list-pagination-config.type';
import AddIcon from '@mui/icons-material/Add';
import { Box, Pagination, Paper, SelectChangeEvent, Stack, Typography, useTheme } from '@mui/material';
import { Country } from '@prisma/client';
import React, { ReactNode, useMemo } from 'react';
import { useSelector } from 'react-redux';
import CustomButton from '../form/custom-buttton';
import CustomSelect from '../form/custom-select';

const PER_PAGE_DEFAULT_OPTIONS = [
  { label: '1 per page', value: 1 },
  { label: '15 per page', value: 15 },
  { label: '30 per page', value: 30 },
  { label: '50 per page', value: 50 },
];

interface ListWrapperProps<TFilters = unknown> {
  heading: string;
  removeButton?: boolean;
  count: number;
  buttonText?: string;
  onButtonClick?: () => void;
  disabled?: boolean;
  children: ReactNode;
  filterableByCountries?: boolean;
  listConfig?: ListPaginationConfig<TFilters>;
  perPageOptions?: { label: string, value: number }[]
  onListConfigChange?: (newConfig: Partial<ListPaginationConfig<TFilters>>) => void;
}

const ListWrapper = <TFilters,>({
  heading,
  count,
  buttonText = '',
  onButtonClick = () => { },
  disabled = false,
  children,
  removeButton = false,
  filterableByCountries = false,
  listConfig = undefined,
  perPageOptions = PER_PAGE_DEFAULT_OPTIONS,
  onListConfigChange = () => { }
}: ListWrapperProps<TFilters>) => {
  const theme = useTheme();
  const fullHeading = count !== undefined ? `${heading} (${count})` : heading;

  const countries: Country[] = useSelector((state: RootState) => state.countriesReducer.list);
  const itemsPerPage = listConfig?.perPage || 15;
  const totalPages = itemsPerPage > 0
    ? Math.ceil(count / itemsPerPage)
    : 1;

  const handlePageChange = (event: React.ChangeEvent<unknown>, newPage: number) => {
    onListConfigChange({ page: newPage });
  };

  const handlePerPageChange = (event: SelectChangeEvent<string | number>) => {
    const value = typeof event.target.value === 'string' ? parseInt(event.target.value) : event.target.value;

    onListConfigChange({
      perPage: value,
      page: 1,
    });
  };

  const handleCountryFilterChange = (event: SelectChangeEvent<string | number>) => {
    const value = typeof event.target.value === 'string' ? parseInt(event.target.value) : event.target.value;

    onListConfigChange({
      page: 1,
      filters: {
        ...(listConfig?.filters as object),
        countryId: value
      } as unknown as TFilters
    });
  };

  const selectedCountryId = (listConfig?.filters as unknown as { countryId: number })?.countryId || 0;

  const countryOptions = useMemo(() => {
    return [
      { label: 'All Countries', value: 0 },
      ...countries.map((country) => ({
        label: country.name,
        value: country.id,
      })),
    ];
  }, [countries]);

  const CountryFilter = useMemo(() => {
    return filterableByCountries ? (
      <Box sx={{ minWidth: 150, width: "100%" }}>
        <CustomSelect
          label="Filter by Country"
          name="countryId"
          value={selectedCountryId}
          onChange={handleCountryFilterChange}
          options={countryOptions}
          size="small"
        />
      </Box>
    ) : null;
  }, [filterableByCountries, selectedCountryId, handleCountryFilterChange, countryOptions]);

  const PerPageFilter = useMemo(() => {
    if (!listConfig) return null;

    return (
      <Box sx={{ minWidth: 120, width: "100%" }}>
        <CustomSelect
          label="Per page"
          name="perPage"
          value={listConfig.perPage ?? PER_PAGE_DEFAULT_OPTIONS[0].value}
          onChange={handlePerPageChange}
          options={perPageOptions || PER_PAGE_DEFAULT_OPTIONS}
          size="small"
          fullWidth={false}
          margin="normal"
        />
      </Box>
    );
  }, [listConfig?.perPage, handlePerPageChange, perPageOptions, listConfig]);


  return (
    <Paper
      elevation={0}
      sx={{
        height: { xs: "100%", md: 'calc(100vh - 100px)' },
        display: 'flex',
        flexDirection: 'column',
        border: { xs: `2px solid ${theme.palette.divider}`, md: `1px solid ${theme.palette.divider}` },
        p: 4,
      }}
    >

      <Stack
        direction={{ xs: "column", md: "row" }} // Glavni Stack: Vertikalno na XS, Horizontalno na MD+
        spacing={2}
        justifyContent="space-between"
        alignItems="center"
        sx={{
          p: 2,
          borderBottom: `1px solid ${theme.palette.divider}`,
          bgcolor: theme.palette.background.paper,
          flexShrink: 0,
        }}
      >
        <Box
          sx={{
            flexGrow: 1,
            width: { xs: '100%', md: 'auto' },
            mr: { xs: 0, md: 2 }
          }}
        >
          <Typography variant="h4" fontWeight={600}>
            {fullHeading}
          </Typography>
        </Box>
        {(CountryFilter || !removeButton) && (
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            alignItems="center"
            justifyContent={{ xs: 'flex-start', md: 'flex-end' }}
            sx={{
              flexShrink: 0,
              width: { xs: '100%', md: 'auto' },
            }}
          >
            {CountryFilter}
            {removeButton ? null : (
              <Box
              sx={{
                display: 'flex',
                width: { xs: '100%', md: 'auto'}
              }}
              >
                <CustomButton
                  text={buttonText}
                  onClick={onButtonClick}
                  startIcon={<AddIcon />}
                  disabled={disabled}
                  sx={{
                    maxHeight: 40,
                  }}
                />
              </Box>
            )}

          </Stack>
        )}
      </Stack>
      <Box
        sx={{
          flexGrow: 1,
          overflowY: 'auto',
          pt: 2,
        }}
      >
        {children}
      </Box>
      {
        listConfig && (
          <Stack
            direction={{ xs: "column", sm: "row" }}
            justifyContent={{ xs: "center", sm: "space-between" }}
            alignItems="center"
            spacing={{ xs: 2, md: 0 }}
            sx={{
              flexShrink: 0,
              py: 1,
              px: 2,
              borderTop: `1px solid ${theme.palette.divider}`,
            }}
          >
            <Box
            >
              {PerPageFilter}
            </Box>

            <Box>
              <Pagination
                count={totalPages}
                page={listConfig.page}
                onChange={handlePageChange}
                color="primary"
              />
            </Box>
          </Stack>
        )
      }
    </Paper >
  )
};

export default ListWrapper;