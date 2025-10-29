'use client';

import ConfirmationModal from '@/app/components/protected/common/confirmation-modal';
import ListWrapper from '@/app/components/protected/common/list-wrapper';
import CustomButton from '@/app/components/protected/form/custom-buttton';
import RouteListItem from '@/app/components/protected/routes/route-list-item';
import RouteModal from '@/app/components/protected/routes/route-modal';
import { handleAxiosError } from '@/app/lib/handle-axios-error';
import { showSnackbar } from '@/app/store/notification.slice';
import { CreateRouteType } from '@/app/types/create-route.type';
import { RouteWithRelations } from '@/app/types/route-with-relations.type';
import AddIcon from '@mui/icons-material/Add';
import { Alert, Box, CircularProgress, Typography } from '@mui/material';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';

const RouteListPage: React.FC = () => {
  const dispatch = useDispatch()
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  // ⭐️ AŽURIRANO: Tip je RouteWithRelations
  const [selectedRoute, setSelectedRoute] = useState<RouteWithRelations | null>(null);
  // ⭐️ AŽURIRANO: Tip je niz RouteWithRelations
  const [routes, setRoutes] = useState<RouteWithRelations[]>([]);
  const [routesLoading, setRoutesLoading] = useState<boolean>(false);

  const fetchRouteData = async () => {
    setRoutesLoading(true);
    try {
      // ⭐️ Dohvatite listu ruta umjesto itinerera
      const response = await axios.get<RouteWithRelations[]>("/api/routes");
      setRoutes(response.data);
    } catch (error) {
      handleAxiosError(error, dispatch, "Error fetching routes")
      setRoutes([]);
      throw error
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

  // ⭐️ AŽURIRANO: Koristi RouteWithRelations
  const handleEditModalOpen = (route: RouteWithRelations) => {
    setSelectedRoute(route);
    setIsEditModalOpen(true);
  }

  // ⭐️ AŽURIRANO: Koristi RouteWithRelations
  const handleDeleteModalOpen = (route: RouteWithRelations) => {
    setSelectedRoute(route);
    setIsDeleteModalOpen(true);
  }

  const handleSuccess = async () => {
    await fetchRouteData()
    handleModalClose();
  }


  const handleCreateSubmit = async (values: CreateRouteType): Promise<RouteWithRelations> => {
    try {
      const response = await axios.post('/api/routes', values);
      await handleSuccess();
      dispatch(showSnackbar({ message: `Route successfuly created`, severity: "success" }))
      return response.data;
    } catch (error) {
      handleAxiosError(error, dispatch, "Error creating route")
      throw error
    }
  };

  const handleEditSubmit = async (values: CreateRouteType): Promise<RouteWithRelations> => {
    try {
      if (!values.id) throw new Error("Route ID is required for editing.");
      const response = await axios.put(`/api/routes/${values.id}`, values);
      await handleSuccess();
      dispatch(showSnackbar({ message: `Route sucessfuly modified`, severity: "success" }))
      return response.data;
    } catch (error) {
      handleAxiosError(error, dispatch, "Error modifying route")
      throw error
    }
  };

  const handleDelete = async (id: number): Promise<RouteWithRelations> => {
    try {
      // ⭐️ Ispravljena URL sintaksa
      const response = await axios.delete(`/api/routes/${id}`);
      await handleSuccess();
      dispatch(showSnackbar({ message: `Route successfuly deleted`, severity: "success" }))
      return response.data;
    } catch (error) {
      handleAxiosError(error, dispatch, "Error deleting route")
      throw error
    }
  };

  return (
    <>
      {/* 4. Modali koriste RouteModal */}
      {isCreateModalOpen && (
        <RouteModal
          onClose={handleModalClose}
          onSubmit={handleCreateSubmit}
          mode='create'
        />
      )}

      {isEditModalOpen && selectedRoute && (
        <RouteModal
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
          // ⭐️ AŽURIRANO: Tekst koristi podatke iz RouteWithRelations
          dialogText={`Are you sure you want to delete route: ${selectedRoute.fromAirport.code} → ${selectedRoute.toAirport.code} by ${selectedRoute.operator.name}?`}
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
                No routes found. Please add a new route.
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
            {/* ⚠️ Uklonjena redundantna komponenta RouteModal */}
          </Box>
        ) : (
          <>
            {routesLoading && routes.length === 0 ? (
              <Box display="flex" justifyContent="center" alignItems="center" height="50vh">
                <CircularProgress />
                <Typography sx={{ ml: 2 }}>Loading routes...</Typography>
              </Box>
            ) : (
              <Box sx={{ mt: 1 }}>
                {/* ⭐️ AŽURIRANO: Sada iteriramo kroz RouteWithRelations */}
                {routes.map((route: RouteWithRelations) => (
                  <RouteListItem
                    key={route.id}
                    item={route}
                    onEdit={handleEditModalOpen}
                    onDelete={handleDeleteModalOpen}
                  />
                ))}
              </Box>
            )}
            {routesLoading && routes.length > 0 && (
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

export default RouteListPage;