'use client';

import AirlineListItem from '@/app/components/protected/airline/airline-list-item';
import AirlineModal from '@/app/components/protected/airline/airline-modal';
import ConfirmationModal from '@/app/components/protected/common/confirmation-modal';
import ListWrapper from '@/app/components/protected/common/list-wrapper';
import CustomButton from '@/app/components/protected/form/custom-buttton';
import { AirlineSubmissionType } from '@/app/types/airline-submission.type';
import { AirlineWithCountry } from '@/app/types/airline-with-country.type';
import { AirportWithCountry } from '@/app/types/airport-with-country.type';
import AddIcon from '@mui/icons-material/Add';
import { Alert, Box, CircularProgress, Typography } from '@mui/material';
import { Airline, Airport } from '@prisma/client';
import axios, { AxiosResponse } from 'axios';
import React, { useEffect, useState } from 'react';


const AirlineListPage: React.FC = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);

  // State for the airline currently being edited/deleted
  const [selectedAirline, setSelectedAirline] = useState<Airline | null>(null);

  // State for the specific airports serviced by the SELECTED airline (for pre-populating the dropdown)
  const [selectedAirlinesServicedAirports, setSelectedAirlinesServicedAirports] = useState<Airport[] | []>([]);

  // State for the main list of airlines
  const [airlines, setAirlines] = useState<AirlineWithCountry[]>([]);
  const [airlinesLoading, setAirlinesLoading] = useState<boolean>(true);

  // State for ALL available airports (for the dropdown options)
  const [allAirports, setAllAirports] = useState<AirportWithCountry[]>([]);
  const [airportsLoading, setAirportsLoading] = useState<boolean>(true);

  // State for loading the selected airline's serviced airports (used during edit setup)
  const [servicedAirportsLoading, setServicedAirportsLoading] = useState<boolean>(false);

  // --- Data Fetching Functions ---

  const fetchAirlines = async () => {
    setAirlinesLoading(true);
    try {
      const response = await axios.get<AirlineWithCountry[]>('/api/airlines');
      setAirlines(response.data);
    } catch (error) {
      console.error('Failed to fetch airlines:', error);
    } finally {
      setAirlinesLoading(false);
    }
  };

  const fetchAllAirports = async () => {
    setAirportsLoading(true);
    try {
      const response = await axios.get<AirportWithCountry[]>('/api/airports');
      setAllAirports(response.data);
    } catch (error) {
      console.error('Failed to fetch all airports:', error);
    } finally {
      setAirportsLoading(false);
    }
  };

  const fetchServicedAirports = async (id: number) => {
    setServicedAirportsLoading(true);
    setSelectedAirlinesServicedAirports([]); // Clear previous data while loading
    try {
      const response = await axios.get<Airport[]>(`/api/airlines/${id}/airports`);
      // CORRECT: Update the state that holds the *serviced* airports
      setSelectedAirlinesServicedAirports(response.data);
    } catch (error) {
      console.error(`Failed to fetch serviced airports for airline ${id}:`, error);
      setSelectedAirlinesServicedAirports([]);
    } finally {
      setServicedAirportsLoading(false);
    }
  };

  // --- Effects ---

  useEffect(() => {
    fetchAirlines();
    fetchAllAirports();
  }, []);

  // --- Modal Handlers ---

  const handleModalClose = () => {
    setIsCreateModalOpen(false);
    setIsEditModalOpen(false);
    setIsDeleteModalOpen(false);
    setSelectedAirline(null);
    setSelectedAirlinesServicedAirports([]); // Reset serviced airports on close
  }

  const handleCreateModalOpen = () => setIsCreateModalOpen(true);

  const handleEditModalOpen = async (airline: AirlineWithCountry) => {
    // 1. Set the basic airline data
    setSelectedAirline({
      id: airline.id,
      name: airline.name,
      baseCountryId: airline.baseCountryId,
    });

    // 2. Await the fetch for serviced airports before opening the modal
    await fetchServicedAirports(airline.id)

    // 3. Open the modal now that data is loaded
    setIsEditModalOpen(true);
  }

  const handleDeleteModalOpen = (airline: AirlineWithCountry) => {
    setSelectedAirline(airline as Airline);
    setIsDeleteModalOpen(true);
  }

  const handleSuccess = async () => {
    await fetchAirlines()
    handleModalClose();
  }

  const handleCreateSubmit = async (values: AirlineSubmissionType): Promise<Airline> => {
    try {
      const response: AxiosResponse<AirlineWithCountry> = await axios.post<AirlineWithCountry>(`/api/airlines`, values);
      handleSuccess();
      return response.data;
    } catch (error) {
      console.log("axios err: ", error);
      throw new Error(`Error creating airline: ${error}`);
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
      return response.data;
    } catch (error) {
      console.log("axios err: ", error);
      throw new Error(`Error editing airline: ${error}`);
    }
  };

  const handleDelete = async (id: number): Promise<Airline> => {
    try {
      const response: AxiosResponse<Airline> = await axios.delete<Airline>(`/api/airlines/${id}`);
      handleSuccess();
      return response.data;
    } catch (error) {
      console.log("axios err: ", error);
      throw new Error(`Error deleting airline: ${error}`);
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
          onCancel={handleModalClose}
        />
      )}

      <ListWrapper
        heading="Global Airline Directory"
        count={airlines.length}
        buttonText="Add New Airline"
        onButtonClick={handleCreateModalOpen}
        disabled={airlinesLoading && airlines.length === 0}
        removeButton={airlines.length === 0}
      >
        {airlinesLoading && airlines.length === 0 ? (
          <Box display="flex" justifyContent="center" alignItems="center" height="100%">
            <CircularProgress />
            <Typography sx={{ ml: 2 }}>Loading airlines...</Typography>
          </Box>
        ) :

          !airlinesLoading && airlines.length === 0 ? (
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

              {airlinesLoading && airlines.length > 0 && (
                <Box display="flex" justifyContent="center" mt={2}>
                  <CircularProgress size={20} />
                </Box>
              )}
            </>
          )}
      </ListWrapper>
    </>
  );
};

export default AirlineListPage;