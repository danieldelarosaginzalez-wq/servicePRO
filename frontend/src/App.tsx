import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { PublicRoute } from './components/PublicRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Orders from './pages/Orders';
import Polizas from './pages/Polizas';
import Materials from './pages/Materials';
import Inventory from './pages/Inventory';
import Reports from './pages/Reports';
import VisitReports from './pages/VisitReports';
import Layout from './components/Layout';
import './App.css';

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            refetchOnWindowFocus: false,
            retry: 1,
        },
    },
});

const theme = createTheme({
    palette: {
        primary: {
            main: '#1976d2',
        },
        secondary: {
            main: '#dc004e',
        },
    },
});

function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <ThemeProvider theme={theme}>
                <CssBaseline />
                <AuthProvider>
                    <Router>
                        <Routes>
                            <Route path="/login" element={
                                <PublicRoute>
                                    <Login />
                                </PublicRoute>
                            } />
                            <Route path="/register" element={
                                <PublicRoute>
                                    <Register />
                                </PublicRoute>
                            } />
                            <Route
                                path="/"
                                element={
                                    <ProtectedRoute>
                                        <Layout />
                                    </ProtectedRoute>
                                }
                            >
                                <Route index element={<Navigate to="/dashboard" replace />} />
                                <Route path="dashboard" element={<Dashboard />} />
                                <Route path="orders" element={<Orders />} />
                                <Route path="polizas" element={<Polizas />} />
                                <Route path="materials" element={<Materials />} />
                                <Route path="inventory" element={<Inventory />} />
                                <Route path="reports" element={<Reports />} />
                                <Route path="visit-reports" element={<VisitReports />} />
                            </Route>
                        </Routes>
                    </Router>
                </AuthProvider>
            </ThemeProvider>
        </QueryClientProvider>
    );
}

export default App;