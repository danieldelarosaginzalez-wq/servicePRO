import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Box,
    Typography,
    Autocomplete,
    MenuItem,
    Alert,
    Grid,
} from '@mui/material';
import { apiService } from '../services/apiService';
import { Poliza } from '../types';

interface CreateOrderDialogProps {
    open: boolean;
    onClose: () => void;
}

export const CreateOrderDialog: React.FC<CreateOrderDialogProps> = ({
    open,
    onClose,
}) => {
    const queryClient = useQueryClient();
    const [formData, setFormData] = useState({
        poliza_number: '',
        cliente: '',
        direccion: '',
        tipo_trabajo: 'instalacion' as 'instalacion' | 'mantenimiento' | 'reparacion' | 'inspeccion',
        'ubicacion.lat': 0,
        'ubicacion.lng': 0,
    });
    const [selectedPoliza, setSelectedPoliza] = useState<Poliza | null>(null);
    const [error, setError] = useState<string>('');

    // Consulta de pólizas activas
    const { data: polizasData } = useQuery(
        ['polizas', { estado: 'activo' }],
        () => apiService.getPolizas({ estado: 'activo' })
    );

    // Mutación para crear orden
    const createOrderMutation = useMutation(
        (data: any) => apiService.createOrder(data),
        {
            onSuccess: () => {
                queryClient.invalidateQueries(['orders']);
                onClose();
                resetForm();
            },
            onError: (error: any) => {
                setError(error.response?.data?.message || 'Error al crear la orden');
            },
        }
    );

    const resetForm = () => {
        setFormData({
            poliza_number: '',
            cliente: '',
            direccion: '',
            tipo_trabajo: 'instalacion',
            'ubicacion.lat': 0,
            'ubicacion.lng': 0,
        });
        setSelectedPoliza(null);
        setError('');
    };

    const handlePolizaChange = (poliza: Poliza | null) => {
        setSelectedPoliza(poliza);
        if (poliza) {
            setFormData(prev => ({
                ...prev,
                poliza_number: poliza.poliza_number,
                cliente: poliza.cliente,
                direccion: poliza.direccion,
                'ubicacion.lat': (poliza as Poliza).ubicacion.lat,
                'ubicacion.lng': (poliza as Poliza).ubicacion.lng,
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                poliza_number: '',
                cliente: '',
                direccion: '',
                'ubicacion.lat': 0,
                'ubicacion.lng': 0,
            }));
        }
        setError('');
    };

    const handleInputChange = (field: string, value: any) => {
        setFormData(prev => ({
            ...prev,
            [field]: value,
        }));
        setError('');
    };

    const handleSubmit = () => {
        if (!formData.poliza_number) {
            setError('Debe seleccionar una póliza');
            return;
        }

        if (!formData.cliente || !formData.direccion) {
            setError('Cliente y dirección son requeridos');
            return;
        }

        if (formData['ubicacion.lat'] === 0 || formData['ubicacion.lng'] === 0) {
            setError('Debe especificar una ubicación válida');
            return;
        }

        createOrderMutation.mutate(formData);
    };

    const availablePolizas: Poliza[] = (polizasData?.data as Poliza[]) || [];

    const tipoTrabajoOptions = [
        { value: 'instalacion', label: 'Instalación' },
        { value: 'mantenimiento', label: 'Mantenimiento' },
        { value: 'reparacion', label: 'Reparación' },
        { value: 'inspeccion', label: 'Inspección' },
    ];

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>
                Nueva Orden de Trabajo
            </DialogTitle>
            <DialogContent>
                <Box sx={{ mt: 2 }}>
                    {error && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {error}
                        </Alert>
                    )}

                    <Grid container spacing={2}>
                        {/* Selector de póliza */}
                        <Grid item xs={12}>
                            <Autocomplete<Poliza, false, false, false>
                                options={availablePolizas}
                                getOptionLabel={(option: Poliza) => `${option.poliza_number} - ${option.cliente}`}
                                value={selectedPoliza}
                                onChange={(_, newValue) => handlePolizaChange(newValue)}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Póliza *"
                                        placeholder="Seleccione una póliza"
                                        fullWidth
                                    />
                                )}
                                renderOption={(props, option: Poliza) => {
                                    const { key, ...otherProps } = props;
                                    return (
                                        <Box component="li" key={key} {...otherProps}>
                                            <Box>
                                                <Typography variant="body1">
                                                    <strong>{option.poliza_number}</strong> - {option.cliente}
                                                </Typography>
                                                <Typography variant="body2" color="textSecondary">
                                                    {option.direccion}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    );
                                }}
                            />
                        </Grid>

                        {/* Cliente */}
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Cliente *"
                                value={formData.cliente}
                                onChange={(e) => handleInputChange('cliente', e.target.value)}
                                disabled={!!selectedPoliza}
                            />
                        </Grid>

                        {/* Tipo de trabajo */}
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                select
                                label="Tipo de Trabajo *"
                                value={formData.tipo_trabajo}
                                onChange={(e) => handleInputChange('tipo_trabajo', e.target.value)}
                            >
                                {tipoTrabajoOptions.map((option) => (
                                    <MenuItem key={option.value} value={option.value}>
                                        {option.label}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid>

                        {/* Dirección */}
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Dirección *"
                                value={formData.direccion}
                                onChange={(e) => handleInputChange('direccion', e.target.value)}
                                disabled={!!selectedPoliza}
                                multiline
                                rows={2}
                            />
                        </Grid>

                        {/* Ubicación */}
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                type="number"
                                label="Latitud *"
                                value={formData['ubicacion.lat']}
                                onChange={(e) => handleInputChange('ubicacion.lat', parseFloat(e.target.value) || 0)}
                                disabled={!!selectedPoliza}
                                inputProps={{ step: 'any' }}
                            />
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                type="number"
                                label="Longitud *"
                                value={formData['ubicacion.lng']}
                                onChange={(e) => handleInputChange('ubicacion.lng', parseFloat(e.target.value) || 0)}
                                disabled={!!selectedPoliza}
                                inputProps={{ step: 'any' }}
                            />
                        </Grid>
                    </Grid>

                    {selectedPoliza && (
                        <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                            <Typography variant="subtitle2" gutterBottom>
                                Información de la Póliza Seleccionada:
                            </Typography>
                            <Typography variant="body2">
                                <strong>Número:</strong> {selectedPoliza.poliza_number}
                            </Typography>
                            <Typography variant="body2">
                                <strong>Cliente:</strong> {selectedPoliza.cliente}
                            </Typography>
                            <Typography variant="body2">
                                <strong>Dirección:</strong> {selectedPoliza.direccion}
                            </Typography>
                            <Typography variant="body2">
                                <strong>Ubicación:</strong> {formData['ubicacion.lat']}, {formData['ubicacion.lng']}
                            </Typography>
                        </Box>
                    )}
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} disabled={createOrderMutation.isLoading}>
                    Cancelar
                </Button>
                <Button
                    variant="contained"
                    onClick={handleSubmit}
                    disabled={createOrderMutation.isLoading || !selectedPoliza}
                >
                    {createOrderMutation.isLoading ? 'Creando...' : 'Crear Orden'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};