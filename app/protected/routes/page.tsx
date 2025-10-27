'use client';

import React, { useEffect, useState } from 'react';
import { Box, Typography, CircularProgress, Alert } from '@mui/material';
import axios from 'axios';
import ListWrapper from '@/app/components/protected/common/list-wrapper';
import ConfirmationModal from '@/app/components/protected/common/confirmation-modal';
import { handleAxiosError } from '@/app/lib/handle-axios-error';
import AddIcon from '@mui/icons-material/Add';
import CustomButton from '@/app/components/protected/form/custom-buttton';
import RouteListItem from '@/app/components/protected/routes/route-list-item';
// import RouteModal from '@/app/components/protected/route/RouteModal';
import { RouteWithRelations } from '@/app/types/route-with-relations.type';
import { CreateRouteType } from '@/app/types/create-route.type';
import RouteModal from '@/app/components/protected/routes/route-modal';
import { ItineraryWithRoutes } from '@/app/types/Itinerary.type';

const RouteListPage: React.FC = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [selectedRoute, setSelectedRoute] = useState<ItineraryWithRoutes | null>(null);
  const [routes, setRoutes] = useState<ItineraryWithRoutes[]>([]);
  const [routesLoading, setRoutesLoading] = useState<boolean>(false);

  const fetchRouteData = async () => {
    setRoutesLoading(true);
    try {
      const response = await axios.get<ItineraryWithRoutes[]>("/api/routes");
      setRoutes(response.data);
    } catch (error) {
      console.error("Failed to fetch routes:", error);
      setRoutes([]);
    } finally {
      setRoutesLoading(false);
    }
  };

  useEffect(() => {
    fetchRouteData();
  }, []);

  // 2. Modal Handlers
  const handleModalClose = () => {
    setIsCreateModalOpen(false);
    setIsEditModalOpen(false);
    setIsDeleteModalOpen(false);
    setSelectedRoute(null);
  }

  const handleEditModalOpen = (route: ItineraryWithRoutes) => {
    setSelectedRoute(route);
    setIsEditModalOpen(true);
  }

  const handleDeleteModalOpen = (route: ItineraryWithRoutes) => {
    setSelectedRoute(route);
    setIsDeleteModalOpen(true);
  }

  const handleSuccess = async () => {
    await fetchRouteData()
    handleModalClose();
  }

  // 3. CRUD Logic

  const handleCreateSubmit = async (values: CreateRouteType): Promise<any> => {
    try {
      const response = await axios.post('/api/routes', values);
      await handleSuccess();
      return response.data;
    } catch (error) {
      throw new Error(handleAxiosError(error));
    }
  };

  const handleEditSubmit = async (values: CreateRouteType): Promise<any> => {
    try {
      if (!values.id) throw new Error("Route ID is required for editing.");

      const { id, ...rest } = values;
      const response = await axios.put(`/api/routes/${id}`, rest);
      await handleSuccess();
      return response.data;
    } catch (error) {
      throw new Error(handleAxiosError(error));
    }
  };

  const handleDelete = async (id: number): Promise<any> => {
    try {
      const response = await axios.delete(`/api/routes/${id}`);
      await handleSuccess();
      return response.data;
    } catch (error) {
      throw new Error(handleAxiosError(error));
    }
  };

  return (
    <>
      {
        isCreateModalOpen && (
          <RouteModal
            onClose={handleModalClose}
            onSubmit={handleCreateSubmit}
            mode='create'
          />
        )
      }


      {isEditModalOpen && selectedRoute && (
        <RouteModal
          isOpen={isEditModalOpen}
          onClose={handleModalClose}
          onSubmit={handleEditSubmit}
          mode='edit'
          initialValues={selectedRoute}
        />
      )}

      {isDeleteModalOpen && selectedRoute && (
        <ConfirmationModal
          openModal={isDeleteModalOpen}
          onConfirm={async () => {
            await handleDelete(selectedRoute.id);
          }}
          onCancel={handleModalClose}
          dialogText={`Are you sure you want to delete route: ${selectedRoute.fromAirport.code} -> ${selectedRoute.toAirport.code} by ${selectedRoute.operator.name}?`}
        />
      )}

      <ListWrapper
        heading="Global Flight Routes"
        count={routes.length}
        buttonText="Add New Route"
        onButtonClick={() => setIsCreateModalOpen(true)}
        removeButton={routes.length === 0}
      >
        {!routesLoading && routes.length === 0 ? (
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
                text="Add New Route"
                onClick={() => setIsCreateModalOpen(true)}
                startIcon={<AddIcon />}
              />
            </Box>
            {
              isCreateModalOpen && (
                <RouteModal
                  onClose={handleModalClose}
                  onSubmit={handleCreateSubmit}
                  mode='create'
                />
              )
            }
          </Box>
        ) : (
          <>
            {routesLoading && routes.length === 0 ? (
              <Box display="flex" justifyContent="center" alignItems="center" height="50vh">
                <CircularProgress />
                <Typography sx={{ ml: 2 }}>Loading routes...</Typography>
              </Box>
            ) : (
              <>
                <Box sx={{ mt: 1 }}>
                  {routes.map((route: ItineraryWithRoutes) => (
                    <RouteListItem
                      key={route.id}
                      item={route}
                      onEdit={handleEditModalOpen}
                      onDelete={handleDeleteModalOpen}
                    />
                  ))}
                </Box>
                {routesLoading && routes.length > 0 && (
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

export default RouteListPage;