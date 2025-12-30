import React, { useState } from 'react';
import {
    Container,
    Paper,
    TextField,
    Button,
    Typography,
    Box,
    Alert,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    CircularProgress,
    Link,
    SelectChangeEvent
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { useAuth } from '../contexts/AuthContext';

const Register: React.FC = () => {
    const navigate = useNavigate();
    const { setUserData } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [formData, setFormData] = useState({
        nombre: '',
        email: '',
        password: '',
        confirmPassword: '',
        rol: '' as 'analista' | 'tecnico' | 'analista_inventario_oculto' | ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        setError('');
    };

    const handleSelectChange = (e: SelectChangeEvent<string>) => {
        setFormData(prev => ({
            ...prev,
            rol: e.target.value as 'analista' | 'tecnico' | 'analista_inventario_oculto'
        }));
        setError('');
    };

    const validateForm = () => {
        if (!formData.nombre.trim()) {
            setError('El nombre es requerido');
            return false;
        }
        if (!formData.email.trim()) {
            setError('El email es requerido');
            return false;
        }
        if (!/\S+@\S+\.\S+/.test(formData.email)) {
            setError('El email no es válido');
            return false;
        }
        if (!formData.password) {
            setError('La contraseña es requerida');
            return false;
        }
        if (formData.password.length < 6) {
            setError('La contraseña debe tener al menos 6 caracteres');
            return false;
        }
        if (formData.password !== formData.confirmPassword) {
            setError('Las contraseñas no coinciden');
            return false;
        }
        if (!formData.rol) {
            setError('El rol es requerido');
            return false;
        }
        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await authService.register({
                nombre: formData.nombre,
                email: formData.email,
                password: formData.password,
                rol: formData.rol as 'analista' | 'tecnico' | 'analista_inventario_oculto'
            });

            setSuccess('Usuario registrado exitosamente');

            // Auto login después del registro
            if (response.access_token) {
                localStorage.setItem('token', response.access_token);
                setUserData(response.user, response.access_token);
                setTimeout(() => {
                    navigate('/dashboard');
                }, 1500);
            }
        } catch (error: any) {
            console.error('Error en registro:', error);
            setError(
                error.response?.data?.message ||
                'Error al registrar usuario. Intenta nuevamente.'
            );
        } finally {
            setLoading(false);
        }
    };

    const getRolLabel = (rol: string) => {
        switch (rol) {
            case 'analista':
                return 'Analista';
            case 'tecnico':
                return 'Técnico';
            case 'analista_inventario_oculto':
                return 'Analista de Inventario';
            default:
                return rol;
        }
    };

    return (
        <Container component="main" maxWidth="sm">
            <Box
                sx={{
                    marginTop: 8,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                }}
            >
                <Paper elevation={3} sx={{ padding: 4, width: '100%' }}>
                    <Typography component="h1" variant="h4" align="center" gutterBottom>
                        Registro de Usuario
                    </Typography>

                    {error && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {error}
                        </Alert>
                    )}

                    {success && (
                        <Alert severity="success" sx={{ mb: 2 }}>
                            {success}
                        </Alert>
                    )}

                    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            id="nombre"
                            label="Nombre Completo"
                            name="nombre"
                            autoComplete="name"
                            autoFocus
                            value={formData.nombre}
                            onChange={handleChange}
                            disabled={loading}
                        />

                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            id="email"
                            label="Correo Electrónico"
                            name="email"
                            autoComplete="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            disabled={loading}
                        />

                        <FormControl fullWidth margin="normal" required>
                            <InputLabel id="rol-label">Rol</InputLabel>
                            <Select
                                labelId="rol-label"
                                id="rol"
                                name="rol"
                                value={formData.rol}
                                label="Rol"
                                onChange={handleSelectChange}
                                disabled={loading}
                            >
                                <MenuItem value="analista">
                                    {getRolLabel('analista')}
                                </MenuItem>
                                <MenuItem value="tecnico">
                                    {getRolLabel('tecnico')}
                                </MenuItem>
                                <MenuItem value="analista_inventario_oculto">
                                    {getRolLabel('analista_inventario_oculto')}
                                </MenuItem>
                            </Select>
                        </FormControl>

                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            name="password"
                            label="Contraseña"
                            type="password"
                            id="password"
                            autoComplete="new-password"
                            value={formData.password}
                            onChange={handleChange}
                            disabled={loading}
                            helperText="Mínimo 6 caracteres"
                        />

                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            name="confirmPassword"
                            label="Confirmar Contraseña"
                            type="password"
                            id="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            disabled={loading}
                        />

                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            sx={{ mt: 3, mb: 2 }}
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <CircularProgress size={20} sx={{ mr: 1 }} />
                                    Registrando...
                                </>
                            ) : (
                                'Registrar Usuario'
                            )}
                        </Button>

                        <Box textAlign="center">
                            <Link
                                component="button"
                                variant="body2"
                                onClick={(e) => {
                                    e.preventDefault();
                                    navigate('/login');
                                }}
                                disabled={loading}
                            >
                                ¿Ya tienes cuenta? Inicia sesión
                            </Link>
                        </Box>
                    </Box>
                </Paper>
            </Box>
        </Container>
    );
};

export default Register;