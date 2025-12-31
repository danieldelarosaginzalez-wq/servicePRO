import React, { useState, useMemo } from 'react';
import { useQuery, useQueryClient } from 'react-query';
import { ColDef } from 'ag-grid-community';
import {
    Box,
    Paper,
    Button,
    Chip,
    Grid,
    Typography,
    Card,
    CardContent,
    Avatar,
    Tabs,
    Tab,
    TextField,
    MenuItem,
} from '@mui/material';
import {
    Add,
    Inventory as InventoryIcon,
    TrendingUp,
    TrendingDown,
    SwapHoriz,
    Warning,
    CheckCircle,
} from '@mui/icons-material';
import { ExcelGrid } from '../components/ExcelGrid';
import { AssignMaterialsDialog } from '../components/AssignMaterialsDialog';
import { apiService } from '../services/apiService';
import { useAuth } from '../contexts/AuthContext';
import { InventoryTechnician } from '../types';

// Type definitions for API responses
interface TechnicianData {
    _id: string;
    nombre: string;
    email: string;
    rol: string;
}

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

function TabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;
    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`inventory-tabpanel-${index}`}
            aria-labelledby={`inventory-tab-${index}`}
            {...other}
        >
            {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
        </div>
    );
}

const Inventory: React.FC = () => {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const [tabValue, setTabValue] = useState(0);
    const [assignDialogOpen, setAssignDialogOpen] = useState(false);
    const [selectedTechnician, setSelectedTechnician] = useState<string>('');

    // Consultas
    const { data: techniciansData } = useQuery(
        ['technicians'],
        () => apiService.getUsers({ rol: 'tecnico', estado: 'activo' })
    );

    const { data: myInventoryData, isLoading: myInventoryLoading } = useQuery(
        ['my-inventory'],
        () => apiService.getMyInventory(),
        {
            enabled: user?.rol === 'tecnico',
        }
    );

    const { data: technicianInventoryData, isLoading: techInventoryLoading } = useQuery(
        ['technician-inventory', selectedTechnician],
        () => apiService.getTechnicianInventory(selectedTechnician),
        {
            enabled: !!selectedTechnician && user?.rol === 'analista_inventario_oculto',
        }
    );

    const { data: movementsData } = useQuery(
        ['inventory-movements', selectedTechnician || user?._id],
        () => apiService.getTechnicianMovements(selectedTechnician || user?._id || ''),
        {
            enabled: !!(selectedTechnician || user?._id),
        }
    );

    // Columnas para inventario de técnico
    const inventoryColumns = useMemo<ColDef[]>(() => [
        {
            field: 'material_nombre',
            headerName: 'Material',
            width: 200,
            valueGetter: (params) => params.data.material?.nombre || 'Material desconocido',
        },
        {
            field: 'material_codigo',
            headerName: 'Código',
            width: 120,
            valueGetter: (params) => params.data.material?.codigo || '',
        },
        {
            field: 'cantidad_actual',
            headerName: 'Stock Actual',
            width: 120,
            cellRenderer: (params: any) => (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <InventoryIcon fontSize="small" color="primary" />
                    {params.value || 0}
                </Box>
            ),
        },
        {
            field: 'cantidad_apartada',
            headerName: 'Apartado',
            width: 120,
            cellRenderer: (params: any) => (
                <Chip
                    label={params.value || 0}
                    color={params.value > 0 ? 'warning' : 'default'}
                    size="small"
                />
            ),
        },
        {
            field: 'cantidad_disponible',
            headerName: 'Disponible',
            width: 120,
            cellRenderer: (params: any) => (
                <Chip
                    label={params.value || 0}
                    color={params.value > 0 ? 'success' : 'error'}
                    size="small"
                />
            ),
        },
        {
            field: 'unidad_medida',
            headerName: 'Unidad',
            width: 100,
            valueGetter: (params) => params.data.material?.unidad_medida || '',
        },
        {
            field: 'ultimo_movimiento',
            headerName: 'Último Mov.',
            width: 140,
            valueFormatter: (params) => {
                return params.value ? new Date(params.value).toLocaleDateString() : '';
            },
        },
    ], []);

    // Columnas para movimientos
    const movementsColumns = useMemo<ColDef[]>(() => [
        {
            field: 'fecha',
            headerName: 'Fecha',
            width: 140,
            valueFormatter: (params) => {
                return params.value ? new Date(params.value).toLocaleString() : '';
            },
        },
        {
            field: 'tipo',
            headerName: 'Tipo',
            width: 120,
            cellRenderer: (params: any) => {
                const getColor = (tipo: string) => {
                    switch (tipo) {
                        case 'entrada': return 'success';
                        case 'salida': return 'error';
                        case 'apartado': return 'warning';
                        case 'devolucion': return 'info';
                        case 'ajuste': return 'secondary';
                        default: return 'default';
                    }
                };
                return (
                    <Chip
                        label={params.value}
                        color={getColor(params.value)}
                        size="small"
                        variant="outlined"
                    />
                );
            },
        },
        {
            field: 'material_nombre',
            headerName: 'Material',
            width: 200,
            valueGetter: (params) => params.data.material?.nombre || 'Material desconocido',
        },
        {
            field: 'cantidad',
            headerName: 'Cantidad',
            width: 100,
            cellRenderer: (params: any) => {
                const isPositive = params.value > 0;
                return (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        {isPositive ? (
                            <TrendingUp fontSize="small" color="success" />
                        ) : (
                            <TrendingDown fontSize="small" color="error" />
                        )}
                        {Math.abs(params.value)}
                    </Box>
                );
            },
        },
        {
            field: 'motivo',
            headerName: 'Motivo',
            width: 200,
        },
        {
            field: 'origen',
            headerName: 'Origen',
            width: 120,
            cellRenderer: (params: any) => (
                <Chip label={params.value} size="small" />
            ),
        },
    ], []);

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setTabValue(newValue);
    };

    const handleInitInventory = async () => {
        if (!selectedTechnician) return;

        try {
            await apiService.initTechnicianInventory(selectedTechnician);
            queryClient.invalidateQueries(['technician-inventory', selectedTechnician]);
        } catch (error) {
            console.error('Error inicializando inventario:', error);
        }
    };

    const getInventoryStats = () => {
        const inventory = user?.rol === 'tecnico' ? myInventoryData?.data : technicianInventoryData?.data;
        if (!inventory?.materials) return { total: 0, disponible: 0, apartado: 0, bajo_stock: 0 };

        return (inventory as InventoryTechnician).materials.reduce(
            (acc: any, item: any) => ({
                total: acc.total + (item.cantidad_actual || 0),
                disponible: acc.disponible + (item.cantidad_disponible || 0),
                apartado: acc.apartado + (item.cantidad_apartada || 0),
                bajo_stock: acc.bajo_stock + ((item.cantidad_disponible || 0) < 5 ? 1 : 0),
            }),
            { total: 0, disponible: 0, apartado: 0, bajo_stock: 0 }
        );
    };

    const stats = getInventoryStats();

    return (
        <Box sx={{ width: '100%' }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs value={tabValue} onChange={handleTabChange}>
                    <Tab label="Mi Inventario" />
                    {user?.rol === 'analista_inventario_oculto' && (
                        <Tab label="Inventarios de Técnicos" />
                    )}
                    <Tab label="Movimientos" />
                </Tabs>
            </Box>

            {/* Estadísticas */}
            <Box sx={{ p: 3 }}>
                <Grid container spacing={3} sx={{ mb: 3 }}>
                    <Grid item xs={12} sm={6} md={3}>
                        <Card>
                            <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <Avatar sx={{ bgcolor: '#1976d2', mr: 2 }}>
                                        <InventoryIcon />
                                    </Avatar>
                                    <Box>
                                        <Typography variant="h4">{stats.total}</Typography>
                                        <Typography variant="body2" color="textSecondary">
                                            Total Items
                                        </Typography>
                                    </Box>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Card>
                            <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <Avatar sx={{ bgcolor: '#2e7d32', mr: 2 }}>
                                        <CheckCircle />
                                    </Avatar>
                                    <Box>
                                        <Typography variant="h4">{stats.disponible}</Typography>
                                        <Typography variant="body2" color="textSecondary">
                                            Disponible
                                        </Typography>
                                    </Box>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Card>
                            <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <Avatar sx={{ bgcolor: '#ed6c02', mr: 2 }}>
                                        <SwapHoriz />
                                    </Avatar>
                                    <Box>
                                        <Typography variant="h4">{stats.apartado}</Typography>
                                        <Typography variant="body2" color="textSecondary">
                                            Apartado
                                        </Typography>
                                    </Box>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Card>
                            <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <Avatar sx={{ bgcolor: '#d32f2f', mr: 2 }}>
                                        <Warning />
                                    </Avatar>
                                    <Box>
                                        <Typography variant="h4">{stats.bajo_stock}</Typography>
                                        <Typography variant="body2" color="textSecondary">
                                            Bajo Stock
                                        </Typography>
                                    </Box>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </Box>

            {/* Mi Inventario */}
            <TabPanel value={tabValue} index={0}>
                <Paper sx={{ p: 2 }}>
                    <ExcelGrid
                        data={(myInventoryData?.data as InventoryTechnician)?.materials || []}
                        columns={inventoryColumns}
                        title={`Inventario - ${user?.nombre}`}
                        enableExport={true}
                        loading={myInventoryLoading}
                        height="calc(100vh - 400px)"
                    />
                </Paper>
            </TabPanel>

            {/* Inventarios de Técnicos */}
            {user?.rol === 'analista_inventario_oculto' && (
                <TabPanel value={tabValue} index={1}>
                    <Paper sx={{ p: 2 }}>
                        <Box sx={{ mb: 2, display: 'flex', gap: 2, alignItems: 'center' }}>
                            <TextField
                                select
                                label="Seleccionar Técnico"
                                value={selectedTechnician}
                                onChange={(e) => setSelectedTechnician(e.target.value)}
                                sx={{ minWidth: 200 }}
                            >
                                {techniciansData?.data?.map((tech: any) => (
                                    <MenuItem key={tech._id} value={tech._id}>
                                        {tech.nombre}
                                    </MenuItem>
                                ))}
                            </TextField>
                            <Button
                                variant="contained"
                                startIcon={<Add />}
                                onClick={() => setAssignDialogOpen(true)}
                                disabled={!selectedTechnician}
                            >
                                Asignar Materiales
                            </Button>
                            <Button
                                variant="outlined"
                                onClick={handleInitInventory}
                                disabled={!selectedTechnician}
                            >
                                Inicializar Inventario
                            </Button>
                        </Box>

                        {selectedTechnician && (
                            <ExcelGrid
                                data={(technicianInventoryData?.data as InventoryTechnician)?.materials || []}
                                columns={inventoryColumns}
                                title={`Inventario - ${(techniciansData?.data as TechnicianData[])?.find((t: TechnicianData) => t._id === selectedTechnician)?.nombre}`}
                                enableExport={true}
                                loading={techInventoryLoading}
                                height="calc(100vh - 450px)"
                            />
                        )}
                    </Paper>
                </TabPanel>
            )}

            {/* Movimientos */}
            <TabPanel value={tabValue} index={user?.rol === 'analista_inventario_oculto' ? 2 : 1}>
                <Paper sx={{ p: 2 }}>
                    <ExcelGrid
                        data={movementsData?.data || []}
                        columns={movementsColumns}
                        title="Historial de Movimientos"
                        enableExport={true}
                        height="calc(100vh - 400px)"
                    />
                </Paper>
            </TabPanel>

            {/* Diálogo para asignar materiales */}
            <AssignMaterialsDialog
                open={assignDialogOpen}
                onClose={() => setAssignDialogOpen(false)}
                technicianId={selectedTechnician}
                technicianName={
                    (techniciansData?.data as TechnicianData[])?.find(
                        (t: TechnicianData) => t._id === selectedTechnician
                    )?.nombre || ''
                }
            />
        </Box>
    );
};

export default Inventory;