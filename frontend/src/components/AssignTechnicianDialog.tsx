import React, { useState } from 'react';
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
    MenuItem,
    Alert,
    Avatar,
    Chip,
} from '@mui/material';
import { Assignment, Person } from '@mui/icons-material';
import { apiService } from '../services/apiService';
import { Order } from '../../../shared/types';

interface AssignTechnicianDialogProps {
    open: boolean;
    onClose: () => void;
    order: Order | null;
}

interface TechnicianData {
    _id: string;
    nombre: string;
    email: string;
    rol: string;
    estado: string;
}

export const AssignTechnicianDialog: React.FC<AssignTechnicianDialogProps> = ({
    open,
    onClose,
    order,
}) => {
    const queryClient = useQueryClient();
    const [selectedTechnician, setSelectedTechnician] = useState<string>('');
    const [error, setError] = useState<string>('');

    // Consulta de técnicos activos
    const { data: techniciansData, isLoading: loadingTechnicians } = useQuery(
        ['technicians'],
        () => apiService.getUsers({ rol: 'tecnico', estado: 'activo' })
    );

    // Mutación para asignar técnico
    const assignTechnicianMutation = useMutation(
        (data: { orderId: string; technicianId: string }) =>
            apiService.assignTechnician(data.orderId, data.technicianId),
        {
            onSuccess: () => {
                queryClient.invalidateQueries(['orders']);
                onClose();
                resetForm();
            },
            onError: (error: any) => {
                setError(error.response?.data?.message || 'Error al asignar técnico');
            },
        }
    );

    const resetForm = () => {
        setSelectedTechnician('');
        setError('');
    };

    const handleSubmit = () => {
        if (!selectedTechnician) {
            setError('Debe seleccionar un técnico');
            return;
        }

        if (!order) {
            setError('No hay orden seleccionada');
            return;
        }

        assignTechnicianMutation.mutate({
            orderId: order._id,
            technicianId: selectedTechnician,
        });
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    const availableTechnicians: TechnicianData[] = (techniciansData?.data as TechnicianData[]) || [];
    const selectedTechnicianData = availableTechnicians.find(tech => tech._id === selectedTechnician);

    const getEstadoColor = (estado: string) => {
        switch (estado) {
            case 'creada': return 'default';
            case 'asignada': return 'info';
            case 'en_proceso': return 'warning';
            case 'finalizada': return 'success';
            case 'imposibilidad': return 'error';
            default: return 'default';
        }
    };

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
            <DialogTitle>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Assignment color="primary" />
                    Asignar Técnico a Orden
                </Box>
            </DialogTitle>
            <DialogContent>
                <Box sx={{ mt: 2 }}>
                    {error && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {error}
                        </Alert>
                    )}

                    {order && (
                        <Box sx={{ mb: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                            <Typography variant="subtitle2" gutterBottom>
                                Información de la Orden:
                            </Typography>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                <Typography variant="body2">
                                    <strong>Código:</strong> {order.codigo}
                                </Typography>
                                <Typography variant="body2">
                                    <strong>Póliza:</strong> {order.poliza_number}
                                </Typography>
                                <Typography variant="body2">
                                    <strong>Cliente:</strong> {order.cliente}
                                </Typography>
                                <Typography variant="body2">
                                    <strong>Dirección:</strong> {order.direccion}
                                </Typography>
                                <Typography variant="body2">
                                    <strong>Tipo:</strong> {order.tipo_trabajo}
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <strong>Estado:</strong>
                                    <Chip
                                        label={order.estado}
                                        color={getEstadoColor(order.estado)}
                                        size="small"
                                        variant="outlined"
                                    />
                                </Box>
                            </Box>
                        </Box>
                    )}

                    <TextField
                        fullWidth
                        select
                        label="Seleccionar Técnico *"
                        value={selectedTechnician}
                        onChange={(e) => {
                            setSelectedTechnician(e.target.value);
                            setError('');
                        }}
                        disabled={loadingTechnicians || assignTechnicianMutation.isLoading}
                        helperText={loadingTechnicians ? 'Cargando técnicos...' : 'Seleccione el técnico que realizará el trabajo'}
                    >
                        {availableTechnicians.map((technician) => (
                            <MenuItem key={technician._id} value={technician._id}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                                    <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                                        <Person fontSize="small" />
                                    </Avatar>
                                    <Box sx={{ flex: 1 }}>
                                        <Typography variant="body1">
                                            {technician.nombre}
                                        </Typography>
                                        <Typography variant="body2" color="textSecondary">
                                            {technician.email}
                                        </Typography>
                                    </Box>
                                </Box>
                            </MenuItem>
                        ))}
                    </TextField>

                    {selectedTechnicianData && (
                        <Box sx={{ mt: 2, p: 2, bgcolor: 'primary.50', borderRadius: 1, border: '1px solid', borderColor: 'primary.200' }}>
                            <Typography variant="subtitle2" gutterBottom color="primary">
                                Técnico Seleccionado:
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Avatar sx={{ bgcolor: 'primary.main' }}>
                                    <Person />
                                </Avatar>
                                <Box>
                                    <Typography variant="body1" fontWeight="medium">
                                        {selectedTechnicianData.nombre}
                                    </Typography>
                                    <Typography variant="body2" color="textSecondary">
                                        {selectedTechnicianData.email}
                                    </Typography>
                                </Box>
                            </Box>
                        </Box>
                    )}

                    <Box sx={{ mt: 2 }}>
                        <Typography variant="body2" color="textSecondary">
                            <strong>Nota:</strong> Al asignar un técnico, la orden cambiará automáticamente al estado "asignada"
                            y el técnico podrá verla en su lista de órdenes pendientes.
                        </Typography>
                    </Box>
                </Box>
            </DialogContent>
            <DialogActions>
                <Button
                    onClick={handleClose}
                    disabled={assignTechnicianMutation.isLoading}
                >
                    Cancelar
                </Button>
                <Button
                    variant="contained"
                    onClick={handleSubmit}
                    disabled={!selectedTechnician || assignTechnicianMutation.isLoading}
                    startIcon={<Assignment />}
                >
                    {assignTechnicianMutation.isLoading ? 'Asignando...' : 'Asignar Técnico'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};