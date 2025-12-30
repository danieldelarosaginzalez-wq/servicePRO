import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Box, CircularProgress } from '@mui/material';

interface PublicRouteProps {
    children: React.ReactNode;
}

export const PublicRoute: React.FC<PublicRouteProps> = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();

    console.log('🌐 PublicRoute - Estado:', {
        isAuthenticated,
        loading
    });

    if (loading) {
        console.log('⏳ PublicRoute: Cargando...');
        return (
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '100vh',
                }}
            >
                <CircularProgress />
            </Box>
        );
    }

    if (isAuthenticated) {
        console.log('✅ PublicRoute: Usuario autenticado, redirigiendo a dashboard');
        return <Navigate to="/dashboard" replace />;
    }

    console.log('👤 PublicRoute: Usuario no autenticado, mostrando página pública');
    return <>{children}</>;
};