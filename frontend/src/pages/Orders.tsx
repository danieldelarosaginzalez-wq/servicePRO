import React, { useState, useMemo, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { ColDef, CellValueChangedEvent } from 'ag-grid-community';
import {
    Box,
    Paper,
    Button,
    Chip,
    IconButton,
    Tooltip,
} from '@mui/material';
import { Add, Edit, Visibility, Assignment, PlayArrow, Stop, Construction } from '@mui/icons-material';
import { ExcelGrid } from '../components/ExcelGrid';
import { CreateOrderDialog } from '../components/CreateOrderDialog';
import { AssignTechnicianDialog } from '../components/AssignTechnicianDialog';
import { WorkProgressDialog } from '../components/WorkProgressDialog';
import { apiService } from '../services/apiService';
import { useAuth } from '../contexts/AuthContext';
import { Order } from '../types';

// Type definitions for API responses
interface TechnicianData {
    _id: string;
    nombre: string;
    email: string;
    rol: string;
}

const Orders: React.FC = () => {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const [selectedOrders, setSelectedOrders] = useState<Order[]>([]);
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [assignDialogOpen, setAssignDialogOpen] = useState(false);
    const [workProgressDialogOpen, setWorkProgressDialogOpen] = useState(false);
    const [selectedOrderForAssign, setSelectedOrderForAssign] = useState<Order | null>(null);
    const [selectedOrderForProgress, setSelectedOrderForProgress] = useState<Order | null>(null);

    // Consulta de órdenes
    const { data: ordersData, isLoading, refetch } = useQuery(
        ['orders'],
        () => apiService.getOrders(),
        {
            refetchInterval: 30000, // Refrescar cada 30 segundos
        }
    );

    // Consulta de técnicos para asignación
    const { data: techniciansData } = useQuery(
        ['technicians'],
        () => apiService.getUsers({ rol: 'tecnico', estado: 'activo' })
    );

    // Mutación para actualizar orden
    const updateOrderMutation = useMutation(
        ({ id, data }: { id: string; data: any }) => apiService.updateOrder(id, data),
        {
            onSuccess: () => {
                queryClient.invalidateQueries(['orders']);
            },
        }
    );

    // Handlers
    const handleViewOrder = useCallback((order: Order) => {
        // Implementar vista de detalles
        console.log('Ver orden:', order);
    }, []);

    const handleEditOrder = useCallback((order: Order) => {
        // Implementar edición de orden
        console.log('Editar orden:', order);
    }, []);

    const handleAssignTechnician = useCallback((order: Order) => {
        setSelectedOrderForAssign(order);
        setAssignDialogOpen(true);
    }, []);

    const handleStartOrder = useCallback(async (order: Order) => {
        try {
            await apiService.startOrder(order._id);
            queryClient.invalidateQueries(['orders']);
            // Abrir diálogo de progreso después de iniciar
            setSelectedOrderForProgress(order);
            setWorkProgressDialogOpen(true);
        } catch (error) {
            console.error('Error al iniciar orden:', error);
        }
    }, [queryClient]);

    const handleWorkProgress = useCallback((order: Order) => {
        setSelectedOrderForProgress(order);
        setWorkProgressDialogOpen(true);
    }, []);

    const handleFinishOrder = useCallback((order: Order) => {
        // Implementar diálogo de finalización
        console.log('Finalizar orden:', order);
    }, []);

    // Definición de columnas para el grid
    const columnDefs = useMemo<ColDef[]>(() => [
        {
            field: 'codigo',
            headerName: 'Código',
            width: 120,
            pinned: 'left',
            cellRenderer: (params: any) => (
                <strong style={{ color: '#1976d2' }}>{params.value}</strong>
            ),
        },
        {
            field: 'poliza_number',
            headerName: 'Póliza',
            width: 100,
        },
        {
            field: 'cliente',
            headerName: 'Cliente',
            width: 200,
            filter: 'agTextColumnFilter',
        },
        {
            field: 'direccion',
            headerName: 'Dirección',
            width: 250,
            filter: 'agTextColumnFilter',
        },
        {
            field: 'tipo_trabajo',
            headerName: 'Tipo',
            width: 130,
            cellEditor: 'agSelectCellEditor',
            cellEditorParams: {
                values: ['instalacion', 'mantenimiento', 'reparacion', 'inspeccion'],
            },
            editable: user?.rol === 'analista',
        },
        {
            field: 'estado',
            headerName: 'Estado',
            width: 140,
            cellRenderer: (params: any) => {
                const getChipColor = (estado: string) => {
                    switch (estado) {
                        case 'creada': return 'default';
                        case 'asignada': return 'info';
                        case 'en_proceso': return 'warning';
                        case 'finalizada': return 'success';
                        case 'imposibilidad': return 'error';
                        case 'pendiente_revision': return 'secondary';
                        case 'cerrada': return 'success';
                        default: return 'default';
                    }
                };
                return (
                    <Chip
                        label={params.value}
                        color={getChipColor(params.value)}
                        size="small"
                        variant="outlined"
                    />
                );
            },
        },
        {
            field: 'progreso',
            headerName: 'Progreso',
            width: 120,
            valueGetter: (params) => {
                const order = params.data;
                let progress = 0;

                // Calcular progreso basado en fases completadas
                const fasesCompletadas = order.evidencias?.fases_completadas || [];

                if (fasesCompletadas.includes('inicial') || order.evidencias?.foto_inicial) progress += 25;
                if (fasesCompletadas.includes('durante') || order.evidencias?.foto_durante?.length > 0) progress += 25;
                if (fasesCompletadas.includes('materiales') || order.evidencias?.foto_materiales?.length > 0 || order.materiales_utilizados?.length > 0) progress += 25;
                if (fasesCompletadas.includes('final') || order.evidencias?.foto_final) progress += 25;

                // Si está finalizada, mostrar 100%
                if (order.estado === 'finalizada' || order.estado === 'cerrada') progress = 100;

                return progress;
            },
            cellRenderer: (params: any) => {
                const progress = params.value || 0;
                const getColor = () => {
                    if (progress >= 100) return '#4caf50';
                    if (progress >= 50) return '#ff9800';
                    if (progress > 0) return '#2196f3';
                    return '#e0e0e0';
                };

                return (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                        <Box sx={{
                            flex: 1,
                            height: 8,
                            bgcolor: '#e0e0e0',
                            borderRadius: 4,
                            overflow: 'hidden'
                        }}>
                            <Box sx={{
                                width: `${progress}%`,
                                height: '100%',
                                bgcolor: getColor(),
                                transition: 'width 0.3s ease'
                            }} />
                        </Box>
                        <span style={{ fontSize: '12px', minWidth: '35px' }}>{progress}%</span>
                    </Box>
                );
            },
        },
        {
            field: 'tecnico_nombre',
            headerName: 'Técnico',
            width: 150,
            valueGetter: (params) => {
                // Si tecnico_id es un objeto (populated), usar directamente su nombre
                if (params.data.tecnico_id && typeof params.data.tecnico_id === 'object') {
                    return params.data.tecnico_id.nombre;
                }

                // Si tecnico_id es un string, buscar en la lista de técnicos
                if (params.data.tecnico_id && typeof params.data.tecnico_id === 'string') {
                    const technician = (techniciansData?.data as TechnicianData[])?.find(
                        (t: TechnicianData) => t._id === params.data.tecnico_id
                    );
                    return technician?.nombre || 'Sin asignar';
                }

                return 'Sin asignar';
            },
        },
        {
            field: 'fecha_creacion',
            headerName: 'Creada',
            width: 120,
            valueFormatter: (params) => {
                return params.value ? new Date(params.value).toLocaleDateString() : '';
            },
        },
        {
            field: 'acciones',
            headerName: 'Acciones',
            width: 200,
            cellRenderer: (params: any) => (
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                    <Tooltip title="Ver detalles">
                        <IconButton size="small" onClick={() => handleViewOrder(params.data)}>
                            <Visibility fontSize="small" />
                        </IconButton>
                    </Tooltip>

                    {user?.rol === 'analista' && (
                        <>
                            <Tooltip title="Editar">
                                <IconButton size="small" onClick={() => handleEditOrder(params.data)}>
                                    <Edit fontSize="small" />
                                </IconButton>
                            </Tooltip>

                            {params.data.estado === 'creada' && (
                                <Tooltip title="Asignar técnico">
                                    <IconButton
                                        size="small"
                                        onClick={() => handleAssignTechnician(params.data)}
                                    >
                                        <Assignment fontSize="small" />
                                    </IconButton>
                                </Tooltip>
                            )}
                        </>
                    )}

                    {user?.rol === 'tecnico' && (
                        (typeof params.data.tecnico_id === 'object' && user._id === params.data.tecnico_id._id) ||
                        (typeof params.data.tecnico_id === 'string' && user._id === params.data.tecnico_id)
                    ) && (
                            <>
                                {params.data.estado === 'asignada' && (
                                    <Tooltip title="Iniciar trabajo">
                                        <IconButton
                                            size="small"
                                            onClick={() => handleStartOrder(params.data)}
                                        >
                                            <PlayArrow fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                )}

                                {params.data.estado === 'en_proceso' && (
                                    <>
                                        <Tooltip title="Actualizar progreso">
                                            <IconButton
                                                size="small"
                                                onClick={() => handleWorkProgress(params.data)}
                                            >
                                                <Construction fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Finalizar trabajo">
                                            <IconButton
                                                size="small"
                                                onClick={() => handleFinishOrder(params.data)}
                                            >
                                                <Stop fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                    </>
                                )}
                            </>
                        )}
                </Box>
            ),
            sortable: false,
            filter: false,
        },
    ], [user, techniciansData, handleViewOrder, handleEditOrder, handleAssignTechnician, handleStartOrder, handleWorkProgress, handleFinishOrder]);

    const handleCellValueChanged = useCallback((event: CellValueChangedEvent) => {
        if (user?.rol === 'analista') {
            const { data, colDef, newValue } = event;
            updateOrderMutation.mutate({
                id: data._id,
                data: { [colDef.field!]: newValue },
            });
        }
    }, [user, updateOrderMutation]);

    const handleCreateOrder = useCallback(() => {
        setCreateDialogOpen(true);
    }, []);

    return (
        <Box sx={{ p: 3 }}>
            <Paper sx={{ p: 2 }}>
                <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                        {user?.rol === 'analista' && (
                            <Button
                                variant="contained"
                                startIcon={<Add />}
                                onClick={handleCreateOrder}
                                sx={{ mr: 2 }}
                            >
                                Nueva Orden
                            </Button>
                        )}
                    </Box>
                </Box>

                <ExcelGrid
                    data={ordersData?.data || []}
                    columns={columnDefs}
                    title="Órdenes de Trabajo"
                    onCellValueChanged={handleCellValueChanged}
                    onRowSelected={setSelectedOrders}
                    enableEdit={user?.rol === 'analista'}
                    enableExport={true}
                    loading={isLoading}
                    onRefresh={refetch}
                    height="calc(100vh - 250px)"
                />
            </Paper>

            {/* Diálogo de creación de orden */}
            <CreateOrderDialog
                open={createDialogOpen}
                onClose={() => setCreateDialogOpen(false)}
            />

            {/* Diálogo de asignación de técnico */}
            <AssignTechnicianDialog
                open={assignDialogOpen}
                onClose={() => {
                    setAssignDialogOpen(false);
                    setSelectedOrderForAssign(null);
                }}
                order={selectedOrderForAssign}
            />

            {/* Diálogo de progreso de trabajo */}
            <WorkProgressDialog
                open={workProgressDialogOpen}
                onClose={() => {
                    setWorkProgressDialogOpen(false);
                    setSelectedOrderForProgress(null);
                }}
                orderId={selectedOrderForProgress?._id || ''}
                orderData={selectedOrderForProgress}
            />
        </Box>
    );
};

export default Orders;