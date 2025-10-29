'use client';

import AirlineListItem from '@/app/components/protected/airline/airline-list-item';
import AirlineModal from '@/app/components/protected/airline/airline-modal';
import ConfirmationModal from '@/app/components/protected/common/confirmation-modal';
import ListWrapper from '@/app/components/protected/common/list-wrapper';
import { ListPaginationConfig } from '@/app/types/list-pagination-config.type';
import { handleAxiosError } from '@/app/lib/handle-axios-error';
import { showSnackbar } from '@/app/store/notification.slice';
import { AirlineSubmissionType } from '@/app/types/airline-submission.type';
import { AirlineWithCountry } from '@/app/types/airline-with-country.type';
import { AirportWithCountry } from '@/app/types/airport-with-country.type';
import AddIcon from '@mui/icons-material/Add';
import { Box, CircularProgress, Typography, Alert } from '@mui/material';
import { Airline, Airport } from '@prisma/client';
import axios, { AxiosResponse } from 'axios';
import React, { useEffect, useState, useCallback } from 'react'; // Uklonio useMemo
import { useDispatch, useSelector } from 'react-redux';
import { useRouter, useSearchParams } from 'next/navigation';
import CustomButton from '@/app/components/protected/form/custom-buttton';
import { fetchCountries } from '@/app/store/countires.slice';
import { RootState, AppDispatch } from '@/app/store/store';


// ⭐️ 1. Definiranje interfejsa filtera
interface AirlineFilters {
  countryId: number;
}

// ⭐️ 2. Definiranje početnog (default) stanja liste
const initialListConfig: ListPaginationConfig<AirlineFilters> = {
  page: 1,
  perPage: 1, // Fiksna vrijednost
  filters: { countryId: 0 },
};

// ⭐️ Funkcija za inicijalizaciju iz URL-a (pokreće se samo jednom)
const initializeListConfig = (searchParams: URLSearchParams): ListPaginationConfig<AirlineFilters> => {
  const page = parseInt(searchParams.get('page') || '1');
  const countryId = parseInt(searchParams.get('countryId') || '0');

  return {
    page: page,
    perPage: initialListConfig.perPage,
    filters: { countryId: countryId },
  };
};


const AirlineListPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const countries = useSelector((state: RootState) => state.countriesReducer.list);

  // ⭐️ Inicijalizacija listConfig-a samo jednom (lazy initialization)
  const [listConfig, setListConfig] = useState(() => initializeListConfig(searchParams));

  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [selectedAirline, setSelectedAirline] = useState<Airline | null>(null);
  const [selectedAirlinesServicedAirports, setSelectedAirlinesServicedAirports] = useState<Airport[] | []>([]);

  const [airlines, setAirlines] = useState<AirlineWithCountry[]>([]);
  const [totalAirlinesCount, setTotalAirlinesCount] = useState<number>(0);

  const [airlinesLoading, setAirlinesLoading] = useState<boolean>(true);
  const [allAirports, setAllAirports] = useState<AirportWithCountry[]>([]);
  const [airportsLoading, setAirportsLoading] = useState<boolean>(true);
  const [servicedAirportsLoading, setServicedAirportsLoading] = useState<boolean>(false);


  const fetchAirlines = useCallback(async () => {
    setAirlinesLoading(true);

    const params = {
      page: listConfig.page,
      perPage: listConfig.perPage,
      countryId: listConfig.filters.countryId,
    };

    const cleanedParams = Object.fromEntries(
      Object.entries(params).filter(([_, v]) => v !== 0 && v !== null && v !== undefined)
    );

    try {
      const response = await axios.get<AirlineWithCountry[]>('/api/airlines', {
        params: cleanedParams,
      });

      const totalCountHeader = response.headers['x-total-count'];

      setAirlines(response.data);
      setTotalAirlinesCount(totalCountHeader ? parseInt(totalCountHeader, 10) : response.data.length);

      const current = new URLSearchParams();
      if (listConfig.page > 1) {
        current.set('page', listConfig.page.toString());
      }
      if (listConfig.filters.countryId > 0) {
        current.set('countryId', listConfig.filters.countryId.toString());
      }

    } catch (error) {
      handleAxiosError(error, dispatch, "Error fetching airlines");
      setAirlines([]);
      setTotalAirlinesCount(0);
    } finally {
      setAirlinesLoading(false);
    }
  }, [listConfig, dispatch, router]); // Ovisnost je listConfig (STATE!)


  const fetchAllAirports = async () => {
    // ... (ostaje isto)
    setAirportsLoading(true);
    try {
      const response = await axios.get<AirportWithCountry[]>('/api/airports');
      setAllAirports(response.data);
    } catch (error) {
      handleAxiosError(error, dispatch, "Error fetching airports")
    } finally {
      setAirportsLoading(false);
    }
  };

  const fetchServicedAirports = async (id: number) => {
    setServicedAirportsLoading(true);
    setSelectedAirlinesServicedAirports([]);
    try {
      const response = await axios.get<Airport[]>(`/api/airlines/${id}/airports`);
      setSelectedAirlinesServicedAirports(response.data);
    } catch (error) {
      handleAxiosError(error, dispatch, "Error fetching serviced airports")
      setSelectedAirlinesServicedAirports([]);
    } finally {
      setServicedAirportsLoading(false);
    }
  };


  // ⭐️ Pokretanje fetchAirlines na promjenu listConfig-a
  useEffect(() => {
    fetchAirlines();
  }, [fetchAirlines]);

  // Pokretanje fetchAllAirports samo jednom
  useEffect(() => {
    if (countries.length === 0) {
      dispatch(fetchCountries());
    }
    fetchAllAirports();
  }, []);


  // ⭐️ 5. Handler za promjenu konfiguracije liste (AŽURIRA LOKALNO STANJE)
  const handleListConfigChange = (newConfig: Partial<ListPaginationConfig<AirlineFilters>>) => {
    setListConfig(prev => {
      let newFilters = prev.filters;
      let newPage = newConfig.page !== undefined ? newConfig.page : prev.page;

      if (newConfig.filters && newConfig.filters.countryId !== undefined) {
        newFilters = { ...prev.filters, ...newConfig.filters };
        newPage = 1; // Resetuj stranicu na 1 pri promjeni filtera
      }

      return {
        ...prev,
        ...newConfig,
        page: newPage,
        filters: newFilters,
      };
    });
  };

  // ... (Modal handlers i Submit logiku ostaju isti) ...
  const handleModalClose = () => {
    setIsCreateModalOpen(false);
    setIsEditModalOpen(false);
    setIsDeleteModalOpen(false);
    setSelectedAirline(null);
    setSelectedAirlinesServicedAirports([]);
  }

  const handleCreateModalOpen = () => setIsCreateModalOpen(true);

  const handleEditModalOpen = async (airline: AirlineWithCountry) => {
    setSelectedAirline({
      id: airline.id,
      name: airline.name,
      baseCountryId: airline.baseCountryId,
    });

    await fetchServicedAirports(airline.id)
    setIsEditModalOpen(true);
  }

  const handleDeleteModalOpen = (airline: AirlineWithCountry) => {
    setSelectedAirline(airline as Airline);
    setIsDeleteModalOpen(true);
  }

  const handleSuccess = async () => {
    // Pokreni fetch sa trenutnim listConfig-om
    await fetchAirlines()
    handleModalClose();
  }

  const handleCreateSubmit = async (values: AirlineSubmissionType): Promise<Airline> => {
    try {
      const response: AxiosResponse<AirlineWithCountry> = await axios.post<AirlineWithCountry>(`/api/airlines`, values);
      handleSuccess();
      dispatch(showSnackbar({ message: "Airline successfuly created", severity: "success" }))
      return response.data;
    } catch (error) {
      handleAxiosError(error, dispatch, "Error creating airline")
      throw error
    }
  };

  const handleEditSubmit = async (values: AirlineSubmissionType): Promise<Airline> => {
    try {
      const { id, ...rest } = values;
      if (!id) {
        throw new Error("Airline ID is required for editing.");
      }
      const response: AxiosResponse<AirlineWithCountry> = await axios.put<AirlineWithCountry>(`/api/airlines/${+id}`, rest);
      handleSuccess();
      dispatch(showSnackbar({ message: "Airline successfuly modifyed", severity: "success" }))
      return response.data;
    } catch (error) {
      handleAxiosError(error, dispatch, "Error modifying airline")
      throw error
    }
  };

  const handleDelete = async (id: number): Promise<Airline> => {
    try {
      const response: AxiosResponse<Airline> = await axios.delete<Airline>(`/api/airlines/${id}`);
      handleSuccess();
      dispatch(showSnackbar({ message: "Airline successfuly deleted", severity: "success" }))
      return response.data;
    } catch (error) {
      handleAxiosError(error, dispatch, "Error deleting airline")
      throw error
    }
  };


  return (
    <>
      {isCreateModalOpen && (
        <AirlineModal
          isOpen={isCreateModalOpen}
          onClose={handleModalClose}
          onSubmit={handleCreateSubmit}
          mode='create'
          airports={allAirports}
          airportsLoading={airportsLoading}
          selectedAirlinesServicedAirports={selectedAirlinesServicedAirports}
        />
      )}

      {isEditModalOpen && selectedAirline && !servicedAirportsLoading && (
        <AirlineModal
          isOpen={isEditModalOpen}
          onClose={handleModalClose}
          onSubmit={handleEditSubmit}
          mode='edit'
          initialValues={selectedAirline}
          airports={allAirports}
          airportsLoading={airportsLoading}
          selectedAirlinesServicedAirports={selectedAirlinesServicedAirports}
        />
      )}

      {isEditModalOpen && selectedAirline && servicedAirportsLoading && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 1300,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <CircularProgress color="inherit" />
        </Box>
      )}

      {isDeleteModalOpen && selectedAirline && (
        <ConfirmationModal
          openModal={isDeleteModalOpen}
          onConfirm={async () => {
            await handleDelete(selectedAirline.id);
          }}
          question={`Are you sure you want to delete the airline "${selectedAirline.name}"?`}
          dialogText='Deleting this airline will automatically delete ALL routes currently linked to it. This action cannot be undone.'
          onCancel={handleModalClose}
        />
      )}
      <ListWrapper
        heading="Global Airline Directory"
        count={totalAirlinesCount}
        buttonText="Add New Airline"
        onButtonClick={handleCreateModalOpen}
        disabled={airlinesLoading && totalAirlinesCount === 0}
        removeButton={totalAirlinesCount === 0}

        filterableByCountries={true}
        listConfig={listConfig} // ⭐️ Korištenje stanja
        onListConfigChange={handleListConfigChange} // ⭐️ Handler za promjenu stanja
      >
        {/* ... (Render logiku ostaje ista) ... */}
        {airlinesLoading && totalAirlinesCount === 0 ? (
          <Box display="flex" justifyContent="center" alignItems="center" height="100%">
            <CircularProgress />
            <Typography sx={{ ml: 2 }}>Loading airlines...</Typography>
          </Box>
        ) :

          !airlinesLoading && totalAirlinesCount === 0 ? (
            <Box
              sx={{
                p: 4,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <Box sx={{ mb: 4, width: '100%' }}>
                <Alert severity="info">
                  No airlines found. Please add a new airline.
                </Alert>
              </Box>

              <Box
                sx={{
                  display: 'flex',
                  flexGrow: 1,
                  justifyContent: 'center',
                  alignItems: 'center',
                  width: '100%',
                }}
              >
                <CustomButton
                  text="Add New Airline"
                  onClick={handleCreateModalOpen}
                  startIcon={<AddIcon />}
                />
              </Box>

              {isCreateModalOpen && (
                <AirlineModal
                  isOpen={isCreateModalOpen}
                  onClose={handleModalClose}
                  onSubmit={handleCreateSubmit}
                  mode='create'
                  airports={allAirports}
                  airportsLoading={airportsLoading}
                  selectedAirlinesServicedAirports={selectedAirlinesServicedAirports}
                />
              )}
            </Box>
          ) : (
            <>
              <Box sx={{ mt: 1 }}>
                {airlines.map((airline: AirlineWithCountry) => (
                  <AirlineListItem
                    key={airline.id}
                    item={airline}
                    onEdit={handleEditModalOpen}
                    onDelete={handleDeleteModalOpen}
                  />
                ))}
              </Box>
            </>
          )}
      </ListWrapper>
    </>
  );
};

export default AirlineListPage;