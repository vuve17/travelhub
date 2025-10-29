'use client';

import AirportListItem from '@/app/components/protected/airport/airport-list-item';
import AirportModal from '@/app/components/protected/airport/airport-modal';
import ConfirmationModal from '@/app/components/protected/common/confirmation-modal';
import ListWrapper from '@/app/components/protected/common/list-wrapper';
import CustomButton from '@/app/components/protected/form/custom-buttton';
import { handleAxiosError } from '@/app/lib/handle-axios-error';
import { showSnackbar } from '@/app/store/notification.slice';
import { AppDispatch } from '@/app/store/store';
import { AirportWithCountry } from '@/app/types/airport-with-country.type';
import AddIcon from '@mui/icons-material/Add';
import { Alert, Box, CircularProgress, Typography } from '@mui/material';
import { Airport } from '@prisma/client';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';

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
      // dispatch(showSnackbar({ message: `Airport successfuly created`, severity: "success" }))
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
      dispatch(showSnackbar({ message: `Airport successfuly created`, severity: "success" }))
      return response.data;
    } catch (error) {
      handleAxiosError(error, dispatch, "Error creating airport")
      throw error
    }
  };

  const handleEditAirportSubmit = async (values: AirportWithCountry): Promise<Airport> => {
    try {
      console.log('Submitting edited airport:', values as Airport);
      const { country, ...rest } = values;
      const response = await axios.put<Airport>(`/api/airports/${+values.id}`, rest);
      handleSuccess();
      dispatch(showSnackbar({ message: `Airport successfuly modifyed`, severity: "success" }))
      return response.data;
    } catch (error) {
      handleAxiosError(error, dispatch, "Error modifying airport")
      throw error
    }
  };

  const handleDeleteAirport = async (id: number): Promise<Airport> => {
    try {
      const response = await axios.delete<Airport>(`/api/airports/${id}`);
      handleSuccess();
      dispatch(showSnackbar({ message: `Airport successfuly deleted`, severity: "success" }))
      return response.data;
    } catch (error) {
      handleAxiosError(error, dispatch, "Error deleting airport")
      throw error
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