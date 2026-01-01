import React, { useState, useMemo, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useNavigate } from 'react-router-dom';
import { ColDef, CellValueChangedEvent } from 'ag-grid-community';
import {
    Box,
    Paper,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    MenuItem,
    Chip,
    IconButton,
    Tooltip,
    Grid,
    Alert,
    Snackbar,
} from '@mui/material';
import { Add, Edit, Delete, Assignment, LocationOn } from '@mui/icons-material';
import { ExcelGrid } from '../components/ExcelGrid';
import { apiService } from '../services/apiService';
import { useAuth } from '../contexts/AuthContext';
import { Poliza } from '../types';

const Polizas: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [selectedPolizas, setSelectedPolizas] = useState<Poliza[]>([]);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingPoliza, setEditingPoliza] = useState<Poliza | null>(null);
    const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
        open: false,
        message: '',
        severity: 'success'
    });
    const [formData, setFormData] = useState({
        poliza_number: '',
        descripcion: '',
        cliente: '',
        direccion: '',
        ubicacion: {
            lat: 0,
            lng: 0,
            geocoded: false,
        },
        estado: 'activo' as 'activo' | 'anulada',
        metadata: {
            costo_maximo: 0,
        },
    });

    // Consulta de pólizas (ahora incluye conteo de órdenes)
    const { data: polizasData, isLoading, refetch } = useQuery(
        ['polizas'],
        () => apiService.getPolizas()
    );

    // Mutación para crear/actualizar póliza
    const savePolizaMutation = useMutation(
        (data: any) => {
            if (editingPoliza) {
                return apiService.updatePoliza(editingPoliza._id, data);
            } else {
                return apiService.createPoliza(data);
            }
        },
        {
            onSuccess: () => {
                queryClient.invalidateQueries(['polizas']);
                setDialogOpen(false);
                resetForm();
                setSnackbar({ open: true, message: editingPoliza ? 'Póliza actualizada' : 'Póliza creada', severity: 'success' });
            },
            onError: (error: any) => {
                setSnackbar({ open: true, message: error.response?.data?.message || 'Error al guardar', severity: 'error' });
            }
        }
    );

    // Mutación para eliminar póliza
    const deletePolizaMutation = useMutation(
        (id: string) => apiService.deletePoliza(id),
        {
            onSuccess: () => {
                queryClient.invalidateQueries(['polizas']);
                setSnackbar({ open: true, message: 'Póliza eliminada', severity: 'success' });
            },
            onError: (error: any) => {
                setSnackbar({ open: true, message: error.response?.data?.message || 'Error al eliminar', severity: 'error' });
            }
        }
    );

    // Mutación para actualización inline
    const updatePolizaMutation = useMutation(
        ({ id, data }: { id: string; data: any }) => apiService.updatePoliza(id, data),
        {
            onSuccess: () => {
                queryClient.invalidateQueries(['polizas']);
            },
        }
    );

    // Handlers
    const handleEditPoliza = useCallback((poliza: Poliza) => {
        setEditingPoliza(poliza);
        setFormData({
            poliza_number: poliza.poliza_number,
            descripcion: poliza.descripcion,
            cliente: poliza.cliente,
            direccion: poliza.direccion,
            ubicacion: poliza.ubicacion || { lat: 0, lng: 0, geocoded: false },
            estado: poliza.estado,
            metadata: { costo_maximo: poliza.metadata?.costo_maximo || 0, ...poliza.metadata },
        });
        setDialogOpen(true);
    }, []);

    const handleCreateOrder = useCallback((poliza: Poliza) => {
        // Navegar a órdenes con datos de la póliza pre-cargados
        navigate('/orders', {
            state: {
                createOrder: true,
                polizaData: {
                    poliza_number: poliza.poliza_number,
                    cliente: poliza.cliente,
                    direccion: poliza.direccion,
                    ubicacion: poliza.ubicacion
                }
            }
        });
    }, [navigate]);

    const handleDeletePoliza = useCallback((poliza: Poliza) => {
        if (window.confirm(`¿Está seguro de eliminar la póliza "${poliza.poliza_number}"?\n\nNota: No se puede eliminar si tiene órdenes asociadas.`)) {
            deletePolizaMutation.mutate(poliza._id);
        }
    }, [deletePolizaMutation]);

    // Definición de columnas para el grid
    const columnDefs = useMemo<ColDef[]>(() => [
        {
            field: 'poliza_number',
            headerName: 'Número',
            width: 120,
            pinned: 'left',
            cellRenderer: (params: any) => (
                <strong style={{ color: '#1976d2' }}>{params.value}</strong>
            ),
            editable: user?.rol === 'analista',
        },
        {
            field: 'cliente',
            headerName: 'Cliente',
            width: 200,
            filter: 'agTextColumnFilter',
            editable: user?.rol === 'analista',
        },
        {
            field: 'descripcion',
            headerName: 'Descripción',
            width: 250,
            filter: 'agTextColumnFilter',
            editable: user?.rol === 'analista',
        },
        {
            field: 'direccion',
            headerName: 'Dirección',
            width: 300,
            filter: 'agTextColumnFilter',
            editable: user?.rol === 'analista',
            cellRenderer: (params: any) => (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <LocationOn fontSize="small" color="action" />
                    {params.value}
                </Box>
            ),
        },
        {
            field: 'estado',
            headerName: 'Estado',
            width: 120,
            cellRenderer: (params: any) => (
                <Chip
                    label={params.value}
                    color={params.value === 'activo' ? 'success' : 'default'}
                    size="small"
                    variant="outlined"
                />
            ),
            cellEditor: 'agSelectCellEditor',
            cellEditorParams: {
                values: ['activo', 'anulada'],
            },
            editable: user?.rol === 'analista',
        },
        {
            field: 'costo_maximo',
            headerName: 'Costo Máx.',
            width: 130,
            valueGetter: (params) => params.data.metadata?.costo_maximo || 0,
            valueFormatter: (params) => {
                return params.value ? `$${params.value.toLocaleString()}` : '$0';
            },
            editable: user?.rol === 'analista',
            cellEditor: 'agNumberCellEditor',
        },
        {
            field: 'ordenes_count',
            headerName: 'Órdenes',
            width: 100,
            cellRenderer: (params: any) => (
                <Chip
                    label={params.value || 0}
                    color={params.value > 0 ? 'primary' : 'default'}
                    size="small"
                />
            ),
        },
        {
            field: 'acciones',
            headerName: 'Acciones',
            width: 150,
            cellRenderer: (params: any) => (
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                    {user?.rol === 'analista' && (
                        <>
                            <Tooltip title="Editar">
                                <IconButton size="small" onClick={() => handleEditPoliza(params.data)}>
                                    <Edit fontSize="small" />
                                </IconButton>
                            </Tooltip>

                            <Tooltip title="Crear Orden">
                                <IconButton
                                    size="small"
                                    onClick={() => handleCreateOrder(params.data)}
                                    color="primary"
                                >
                                    <Assignment fontSize="small" />
                                </IconButton>
                            </Tooltip>

                            <Tooltip title="Eliminar">
                                <IconButton
                                    size="small"
                                    onClick={() => handleDeletePoliza(params.data)}
                                    color="error"
                                    disabled={params.data.ordenes_count > 0}
                                >
                                    <Delete fontSize="small" />
                                </IconButton>
                            </Tooltip>
                        </>
                    )}
                </Box>
            ),
            sortable: false,
            filter: false,
        },
    ], [user, handleEditPoliza, handleCreateOrder, handleDeletePoliza]);

    const handleCellValueChanged = useCallback((event: CellValueChangedEvent) => {
        if (user?.rol === 'analista') {
            const { data, colDef, newValue } = event;
            let updateData: any = {};

            if (colDef.field === 'costo_maximo') {
                updateData = { metadata: { ...data.metadata, costo_maximo: newValue } };
            } else {
                updateData = { [colDef.field!]: newValue };
            }

            updatePolizaMutation.mutate({
                id: data._id,
                data: updateData,
            });
        }
    }, [user, updatePolizaMutation]);

    const resetForm = useCallback(() => {
        setFormData({
            poliza_number: '',
            descripcion: '',
            cliente: '',
            direccion: '',
            ubicacion: {
                lat: 0,
                lng: 0,
                geocoded: false,
            },
            estado: 'activo',
            metadata: {
                costo_maximo: 0,
            },
        });
        setEditingPoliza(null);
    }, []);

    const handleCreatePoliza = useCallback(() => {
        setEditingPoliza(null);
        resetForm();
        setDialogOpen(true);
    }, [resetForm]);

    const handleSavePoliza = useCallback(() => {
        savePolizaMutation.mutate(formData);
    }, [formData, savePolizaMutation]);

    const handleInputChange = useCallback((field: string, value: any) => {
        if (field.includes('.')) {
            const [parent, child] = field.split('.');
            setFormData(prev => ({
                ...prev,
                [parent]: {
                    ...(prev[parent as keyof typeof prev] as object || {}),
                    [child]: value,
                },
            }));
        } else {
            setFormData(prev => ({ ...prev, [field]: value }));
        }
    }, []);

    const generatePolizaNumber = useCallback(() => {
        const number = Math.floor(100000 + Math.random() * 900000).toString();
        handleInputChange('poliza_number', number);
    }, [handleInputChange]);

    return (
        <Box sx={{ p: 3 }}>
            <Paper sx={{ p: 2 }}>
                <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                        {user?.rol === 'analista' && (
                            <Button
                                variant="contained"
                                startIcon={<Add />}
                                onClick={handleCreatePoliza}
                                sx={{ mr: 2 }}
                            >
                                Nueva Póliza
                            </Button>
                        )}
                    </Box>
                </Box>

                <ExcelGrid
                    data={polizasData?.data || []}
                    columns={columnDefs}
                    title="Pólizas de Servicio"
                    onCellValueChanged={handleCellValueChanged}
                    onRowSelected={setSelectedPolizas}
                    enableEdit={user?.rol === 'analista'}
                    enableExport={true}
                    loading={isLoading}
                    onRefresh={refetch}
                    height="calc(100vh - 250px)"
                />
            </Paper>

            {/* Diálogo de edición/creación */}
            <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
                <DialogTitle>
                    {editingPoliza ? 'Editar Póliza' : 'Nueva Póliza'}
                </DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={12} sm={6}>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                                <TextField
                                    label="Número de Póliza"
                                    value={formData.poliza_number}
                                    onChange={(e) => handleInputChange('poliza_number', e.target.value)}
                                    required
                                    sx={{ flexGrow: 1 }}
                                />
                                <Button
                                    variant="outlined"
                                    onClick={generatePolizaNumber}
                                    sx={{ minWidth: 'auto', px: 2 }}
                                >
                                    Gen
                                </Button>
                            </Box>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                select
                                label="Estado"
                                value={formData.estado}
                                onChange={(e) => handleInputChange('estado', e.target.value)}
                                fullWidth
                            >
                                <MenuItem value="activo">Activo</MenuItem>
                                <MenuItem value="anulada">Anulada</MenuItem>
                            </TextField>
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                label="Cliente"
                                value={formData.cliente}
                                onChange={(e) => handleInputChange('cliente', e.target.value)}
                                required
                                fullWidth
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                label="Descripción del Servicio"
                                value={formData.descripcion}
                                onChange={(e) => handleInputChange('descripcion', e.target.value)}
                                multiline
                                rows={2}
                                fullWidth
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                label="Dirección"
                                value={formData.direccion}
                                onChange={(e) => handleInputChange('direccion', e.target.value)}
                                required
                                fullWidth
                            />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <TextField
                                label="Latitud"
                                type="number"
                                value={formData.ubicacion.lat}
                                onChange={(e) => handleInputChange('ubicacion.lat', parseFloat(e.target.value) || 0)}
                                fullWidth
                            />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <TextField
                                label="Longitud"
                                type="number"
                                value={formData.ubicacion.lng}
                                onChange={(e) => handleInputChange('ubicacion.lng', parseFloat(e.target.value) || 0)}
                                fullWidth
                            />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <TextField
                                label="Costo Máximo"
                                type="number"
                                value={formData.metadata.costo_maximo}
                                onChange={(e) => handleInputChange('metadata.costo_maximo', parseFloat(e.target.value) || 0)}
                                fullWidth
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDialogOpen(false)}>Cancelar</Button>
                    <Button
                        variant="contained"
                        onClick={handleSavePoliza}
                        disabled={savePolizaMutation.isLoading}
                    >
                        {editingPoliza ? 'Actualizar' : 'Crear'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Snackbar para notificaciones */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
            >
                <Alert severity={snackbar.severity} onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default Polizas;
