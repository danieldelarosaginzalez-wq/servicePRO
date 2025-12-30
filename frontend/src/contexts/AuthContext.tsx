import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../../../shared/types';
import { authService } from '../services/authService';

interface AuthContextType {
    user: User | null;
    token: string | null;
    login: (email: string, password: string) => Promise<{ success: boolean }>;
    setUserData: (user: User, token: string) => void;
    logout: () => void;
    loading: boolean;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const initAuth = async () => {
            console.log('🚀 Inicializando autenticación...');
            const savedToken = localStorage.getItem('token');
            console.log('🔍 Token guardado:', savedToken ? 'Existe' : 'No existe');

            if (savedToken) {
                try {
                    console.log('🔄 Validando token...');
                    const response = await authService.validateToken(savedToken);
                    console.log('📋 Respuesta de validación:', response);

                    if (response.valid) {
                        setToken(savedToken);
                        setUser(response.user);
                        console.log('✅ Token válido, usuario establecido:', response.user);
                    } else {
                        console.log('❌ Token inválido, removiendo...');
                        localStorage.removeItem('token');
                    }
                } catch (error) {
                    console.error('❌ Error validando token:', error);
                    localStorage.removeItem('token');
                }
            }
            setLoading(false);
            console.log('🏁 Inicialización de auth completada');
        };

        initAuth();
    }, []);

    const login = async (email: string, password: string) => {
        try {
            console.log('🔐 Intentando login para:', email);
            const response = await authService.login(email, password);
            console.log('✅ Respuesta del login:', response);

            // Guardar en localStorage primero
            localStorage.setItem('token', response.access_token);

            // Luego actualizar el estado
            setToken(response.access_token);
            setUser(response.user);

            console.log('👤 Usuario establecido:', response.user);
            console.log('🔑 Token guardado en localStorage');

            return { success: true };
        } catch (error) {
            console.error('❌ Error en login:', error);
            throw error;
        }
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem('token');
    };

    const setUserData = (userData: User, userToken: string) => {
        setUser(userData);
        setToken(userToken);
    };

    const value = {
        user,
        token,
        login,
        setUserData,
        logout,
        loading,
        isAuthenticated: !!token && !!user,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};