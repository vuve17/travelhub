'use client';

import AirlineListItem from '@/app/components/protected/airline/airline-list-item';
import AirlineModal from '@/app/components/protected/airline/airline-modal';
import ConfirmationModal from '@/app/components/protected/common/confirmation-modal';
import ListWrapper from '@/app/components/protected/common/list-wrapper';
import CustomButton from '@/app/components/protected/form/custom-buttton';
import { handleAxiosError } from '@/app/lib/handle-axios-error';
import { showSnackbar } from '@/app/store/notification.slice';
import { AirlineSubmissionType } from '@/app/types/airline-submission.type';
import { AirlineWithCountry } from '@/app/types/airline-with-country.type';
import { AirportWithCountry } from '@/app/types/airport-with-country.type';
import AddIcon from '@mui/icons-material/Add';
import { Alert, Box, CircularProgress, Typography } from '@mui/material';
import { Airline, Airport } from '@prisma/client';
import axios, { AxiosResponse } from 'axios';
import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';


const AirlineListPage: React.FC = () => {
  const dispatch = useDispatch();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [selectedAirline, setSelectedAirline] = useState<Airline | null>(null);
  const [selectedAirlinesServicedAirports, setSelectedAirlinesServicedAirports] = useState<Airport[] | []>([]);
  const [airlines, setAirlines] = useState<AirlineWithCountry[]>([]);
  const [airlinesLoading, setAirlinesLoading] = useState<boolean>(true);
  const [allAirports, setAllAirports] = useState<AirportWithCountry[]>([]);
  const [airportsLoading, setAirportsLoading] = useState<boolean>(true);
  const [servicedAirportsLoading, setServicedAirportsLoading] = useState<boolean>(false);

  const fetchAirlines = async () => {
    setAirlinesLoading(true);
    try {
      const response = await axios.get<AirlineWithCountry[]>('/api/airlines');
      setAirlines(response.data);
    } catch (error) {
      handleAxiosError(error, dispatch, "Error fetching airlines")
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

  useEffect(() => {
    fetchAirlines();
    fetchAllAirports();
  }, []);


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