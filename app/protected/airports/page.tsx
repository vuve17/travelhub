'use client';

import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Box, Typography, CircularProgress, Alert } from '@mui/material';
import { AppDispatch, RootState } from '@/app/store/store';
import AirportListItem from '@/app/components/protected/airport/airport-list-item';
import { Airport } from '@prisma/client';
import CustomButton from '@/app/components/protected/form/custom-buttton';
import AddIcon from '@mui/icons-material/Add';
import AirportModal from '@/app/components/protected/airport/airport-modal';
import axios from 'axios';
import { AirportWithCountry } from '@/app/types/airport-with-country.type';
import ConfirmationModal from '@/app/components/protected/common/confirmation-modal';
import ListWrapper from '@/app/components/protected/common/list-wrapper';
import { handleAxiosError } from '@/app/lib/handle-axios-error';

const AirportListPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [isCreateAirportModalOpen, setIsCreateAirportModalOpen] = useState<boolean>(false);
  const [isEditAirportModalOpen, setIsEditAirportModalOpen] = useState<boolean>(false);
  const [isDeleteAirportModalOpen, setIsDeleteAirportModalOpen] = useState<boolean>(false);
  const [selectedAirport, setSelectedAirport] = useState<Airport | null>(null);
  const [airports, setAirports] = useState<AirportWithCountry[]>([]);
  const [airportsLoading, setAirportsLoading] = useState<boolean>(false);

  const fetchAirportData = async () => {
    setAirportsLoading(true);
    try {
      const response = await axios.get<AirportWithCountry[]>("/api/airports");
      setAirports(response.data);
    } catch (error) {
      console.error("Failed to fetch airports:", error);
      setAirports([]);
    } finally {
      setAirportsLoading(false);
    }
  };

  useEffect(() => {
    if (!airports.length) {
      fetchAirportData();
    }
  }, []);

  const handleModalClose = () => {
    setIsCreateAirportModalOpen(false);
    setIsEditAirportModalOpen(false);
    setIsDeleteAirportModalOpen(false);
    setSelectedAirport(null);
  }

  const handleCreateAirportModalOpen = () => {
    setIsCreateAirportModalOpen(true);
  }

  const handleEditAirportModalOpen = (airport: Airport) => {
    setSelectedAirport(airport);
    setIsEditAirportModalOpen(true);
  }

  const handleDeleteAirportModalOpen = (airport: Airport) => {
    setSelectedAirport(airport);
    setIsDeleteAirportModalOpen(true);
  }

  const handleSuccess = async () => {
    await fetchAirportData()
    handleModalClose();
  }

  const handleCreateAirportSubmit = async (values: AirportWithCountry): Promise<Airport> => {
    try {
      const response = await axios.post<Airport>('/api/airports', values);
      handleSuccess();
      return response.data;
    } catch (error) {
      throw new Error(handleAxiosError(error));
    }
  };

  const handleEditAirportSubmit = async (values: AirportWithCountry): Promise<Airport> => {
    try {
      console.log('Submitting edited airport:', values as Airport);
      const { country, ...rest } = values;
      const response = await axios.put<Airport>(`/api/airports/${+values.id}`, rest);
      handleSuccess();
      return response.data;
    } catch (error) {
      throw new Error(handleAxiosError(error));
    }
  };

  const handleDeleteAirport = async (id: number): Promise<Airport> => {
    try {
      const response = await axios.delete<Airport>(`/api/airports/${id}`);
      handleSuccess();
      return response.data;
    } catch (error) {
      throw new Error(handleAxiosError(error));
    }
  };

  return (
    <>
      {isCreateAirportModalOpen && (
        <AirportModal
          isOpen={isCreateAirportModalOpen}
          onClose={handleModalClose}
          onSubmit={handleCreateAirportSubmit}
          mode='create'
        />
      )}
      {isEditAirportModalOpen && selectedAirport && (
        <AirportModal
          isOpen={isEditAirportModalOpen}
          onClose={handleModalClose}
          onSubmit={handleEditAirportSubmit}
          mode='edit'
          initialValues={selectedAirport}
        />
      )}
      {
        isDeleteAirportModalOpen && selectedAirport && (
          <ConfirmationModal
            openModal={isDeleteAirportModalOpen}
            onConfirm={async () => {
              await handleDeleteAirport(selectedAirport.id);
            }}
            onCancel={handleModalClose}
          />
        )
      }

      <ListWrapper
        heading="Global Airport Directory"
        count={airports.length}
        buttonText="Add New Airport"
        onButtonClick={handleCreateAirportModalOpen}
        removeButton={airports.length === 0}
      >
        {!airportsLoading && airports.length === 0 ? (
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
                No airports found. Please add new airport.
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
                text="Add New Airport"
                onClick={handleCreateAirportModalOpen}
                startIcon={<AddIcon />}
              />
            </Box>

            {isCreateAirportModalOpen && (
              <AirportModal
                isOpen={isCreateAirportModalOpen}
                onClose={handleModalClose}
                onSubmit={handleCreateAirportSubmit}
                mode='create'
              />
            )}
          </Box>
        ) : (
          <>
            {airportsLoading && airports.length === 0 ? (
              <Box display="flex" justifyContent="center" alignItems="center" height="50vh">
                <CircularProgress />
                <Typography sx={{ ml: 2 }}>Loading airports...</Typography>
              </Box>
            ) : (
              <>
                <Box sx={{ mt: 1 }}>
                  {airports.map((airport: AirportWithCountry) => (
                    <AirportListItem
                      key={airport.id}
                      item={airport}
                      onEdit={handleEditAirportModalOpen}
                      onDelete={handleDeleteAirportModalOpen}
                    />
                  ))}
                </Box>
                {airportsLoading && airports.length > 0 && (
                  <Box display="flex" justifyContent="center" mt={2}>
                    <CircularProgress size={20} />
                  </Box>
                )}
              </>
            )}
          </>
        )}
      </ListWrapper>
    </>
  );
};

export default AirportListPage;