import React from 'react';
import { Navigate } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
    children: React.ReactNode;
    roles?: string[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
    children,
    roles = []
}) => {
    const { user, loading, isAuthenticated } = useAuth();

    console.log('🛡️ ProtectedRoute - Estado:', {
        user: user ? user.nombre : 'null',
        loading,
        isAuthenticated
    });

    if (loading) {
        console.log('⏳ Cargando autenticación...');
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

    if (!isAuthenticated) {
        console.log('🚫 No autenticado, redirigiendo a login');
        return <Navigate to="/login" replace />;
    }

    if (roles.length > 0 && user && !roles.includes(user.rol)) {
        console.log('⚠️ Rol no permitido, redirigiendo a dashboard');
        return <Navigate to="/dashboard" replace />;
    }

    console.log('✅ Usuario autenticado, renderizando contenido');
    return <>{children}</>;
};