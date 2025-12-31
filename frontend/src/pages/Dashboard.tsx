import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import {
    Box,
    Grid,
    Paper,
    Typography,
    Card,
    CardContent,
    Button,
    Avatar,
    LinearProgress,
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
    IconButton,
    Chip,
    Divider,
} from '@mui/material';
import {
    Assignment,
    CheckCircle,
    Schedule,
    Warning,
    TrendingUp,
    Inventory,
    Assessment,
    People,
    PersonAdd,
} from '@mui/icons-material';
import { AssignTechnicianDialog } from '../components/AssignTechnicianDialog';
import { TechnicianWorkCard } from '../components/TechnicianWorkCard';
import { WorkProgressDialog } from '../components/WorkProgressDialog';
import { apiService } from '../services/apiService';
import { useAuth } from '../contexts/AuthContext';
import { Order } from '../types';

interface StatCard {
    title: string;
    value: number;
    icon: React.ReactNode;
    color: string;
    trend?: number;
}

const Dashboard: React.FC = () => {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const [assignDialogOpen, setAssignDialogOpen] = useState(false);
    const [workProgressDialogOpen, setWorkProgressDialogOpen] = useState(false);
    const [selectedOrderForAssign, setSelectedOrderForAssign] = useState<Order | null>(null);
    const [selectedOrderForProgress, setSelectedOrderForProgress] = useState<Order | null>(null);

    // Consultas para estadísticas
    const { data: ordersStats } = useQuery(
        ['dashboard-orders'],
        () => apiService.getOrders({ limit: 1000 }),
        {
            select: (data) => {
                const orders = data.data || [];
                return {
                    total: orders.length,
                    creadas: orders.filter((o: any) => o.estado === 'creada').length,
                    asignadas: orders.filter((o: any) => o.estado === 'asignada').length,
                    en_proceso: orders.filter((o: any) => o.estado === 'en_proceso').length,
                    finalizadas: orders.filter((o: any) => o.estado === 'finalizada').length,
                    imposibilidad: orders.filter((o: any) => o.estado === 'imposibilidad').length,
                };
            },
        }
    );

    // Consulta específica para órdenes del técnico
    const { data: technicianOrders } = useQuery(
        ['technician-orders'],
        () => apiService.getOrders({ tecnico_id: user?._id, limit: 10 }),
        {
            enabled: user?.rol === 'tecnico',
            select: (data) => data.data || [],
        }
    );

    // Consulta específica para órdenes pendientes de asignación (solo para analistas)
    const { data: pendingOrders } = useQuery(
        ['pending-orders'],
        () => apiService.getOrders({ estado: 'creada', limit: 10 }),
        {
            enabled: user?.rol === 'analista',
            select: (data) => data.data || [],
        }
    );

    const { data: materialsStats } = useQuery(
        ['dashboard-materials'],
        () => apiService.getMaterials({ limit: 1000 }),
        {
            select: (data) => {
                const materials = data.data || [];
                return {
                    total: materials.length,
                    activos: materials.filter((m: any) => m.estado === 'activo').length,
                    bajo_stock: materials.filter((m: any) => m.stock_actual < m.stock_minimo).length,
                };
            },
        }
    );

    // Mutación para iniciar orden
    const startOrderMutation = useMutation(
        (orderId: string) => apiService.startOrder(orderId),
        {
            onSuccess: () => {
                queryClient.invalidateQueries(['technician-orders']);
                queryClient.invalidateQueries(['dashboard-orders']);
            },
        }
    );

    // Funciones para manejar asignación de técnicos
    const handleAssignTechnician = (order: Order) => {
        setSelectedOrderForAssign(order);
        setAssignDialogOpen(true);
    };

    const handleCloseAssignDialog = () => {
        setAssignDialogOpen(false);
        setSelectedOrderForAssign(null);
    };

    // Funciones para técnicos
    const handleStartWork = async (order: Order) => {
        try {
            await startOrderMutation.mutateAsync(order._id);
            // Abrir diálogo de progreso después de iniciar
            setSelectedOrderForProgress(order);
            setWorkProgressDialogOpen(true);
        } catch (error) {
            console.error('Error al iniciar trabajo:', error);
        }
    };

    const handleUpdateProgress = (order: Order) => {
        setSelectedOrderForProgress(order);
        setWorkProgressDialogOpen(true);
    };

    const handleCloseProgressDialog = () => {
        setWorkProgressDialogOpen(false);
        setSelectedOrderForProgress(null);
    };

    const getStatsForRole = (): StatCard[] => {
        const baseStats: StatCard[] = [];

        if (user?.rol === 'analista') {
            return [
                {
                    title: 'Órdenes Totales',
                    value: ordersStats?.total || 0,
                    icon: <Assignment />,
                    color: '#1976d2',
                    trend: 12,
                },
                {
                    title: 'En Proceso',
                    value: ordersStats?.en_proceso || 0,
                    icon: <Schedule />,
                    color: '#ed6c02',
                },
                {
                    title: 'Finalizadas',
                    value: ordersStats?.finalizadas || 0,
                    icon: <CheckCircle />,
                    color: '#2e7d32',
                    trend: 8,
                },
                {
                    title: 'Imposibilidades',
                    value: ordersStats?.imposibilidad || 0,
                    icon: <Warning />,
                    color: '#d32f2f',
                },
            ];
        }

        if (user?.rol === 'tecnico') {
            return [
                {
                    title: 'Mis Órdenes',
                    value: ordersStats?.total || 0,
                    icon: <Assignment />,
                    color: '#1976d2',
                },
                {
                    title: 'Asignadas',
                    value: ordersStats?.asignadas || 0,
                    icon: <Schedule />,
                    color: '#ed6c02',
                },
                {
                    title: 'Completadas',
                    value: ordersStats?.finalizadas || 0,
                    icon: <CheckCircle />,
                    color: '#2e7d32',
                },
                {
                    title: 'Materiales',
                    value: materialsStats?.total || 0,
                    icon: <Inventory />,
                    color: '#7b1fa2',
                },
            ];
        }

        if (user?.rol === 'analista_inventario_oculto') {
            return [
                {
                    title: 'Materiales Totales',
                    value: materialsStats?.total || 0,
                    icon: <Inventory />,
                    color: '#1976d2',
                },
                {
                    title: 'Materiales Activos',
                    value: materialsStats?.activos || 0,
                    icon: <CheckCircle />,
                    color: '#2e7d32',
                },
                {
                    title: 'Bajo Stock',
                    value: materialsStats?.bajo_stock || 0,
                    icon: <Warning />,
                    color: '#d32f2f',
                },
                {
                    title: 'Órdenes Activas',
                    value: (ordersStats?.asignadas || 0) + (ordersStats?.en_proceso || 0),
                    icon: <Assignment />,
                    color: '#ed6c02',
                },
            ];
        }

        return baseStats;
    };

    const stats = getStatsForRole();

    const getRecentActivities = () => {
        const activities = [
            {
                id: 1,
                title: 'Nueva orden creada',
                description: 'OT-000123 - Instalación en Calle 45 #23-45',
                time: 'Hace 5 minutos',
                type: 'order',
            },
            {
                id: 2,
                title: 'Material asignado',
                description: 'Tubería PVC 4" - 10 unidades a Juan Pérez',
                time: 'Hace 15 minutos',
                type: 'material',
            },
            {
                id: 3,
                title: 'Orden finalizada',
                description: 'OT-000120 - Mantenimiento completado',
                time: 'Hace 1 hora',
                type: 'completed',
            },
            {
                id: 4,
                title: 'Técnico asignado',
                description: 'Carlos López asignado a OT-000124',
                time: 'Hace 2 horas',
                type: 'assignment',
            },
        ];

        return activities;
    };

    const activities = getRecentActivities();

    return (
        <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h4" gutterBottom>
                Bienvenido, {user?.nombre}
            </Typography>
            <Typography variant="body1" color="textSecondary" gutterBottom>
                {user?.rol?.replace('_', ' ').toUpperCase()} - Panel de Control
            </Typography>

            {/* Estadísticas principales */}
            <Grid container spacing={3} sx={{ mb: 3 }}>
                {stats.map((stat, index) => (
                    <Grid item xs={12} sm={6} md={3} key={index}>
                        <Card>
                            <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                    <Avatar sx={{ bgcolor: stat.color, mr: 2 }}>
                                        {stat.icon}
                                    </Avatar>
                                    <Box>
                                        <Typography variant="h4" component="div">
                                            {stat.value}
                                        </Typography>
                                        <Typography variant="body2" color="textSecondary">
                                            {stat.title}
                                        </Typography>
                                    </Box>
                                </Box>
                                {stat.trend && (
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        <TrendingUp color="success" fontSize="small" />
                                        <Typography variant="body2" color="success.main" sx={{ ml: 0.5 }}>
                                            +{stat.trend}% este mes
                                        </Typography>
                                    </Box>
                                )}
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            {/* Sección de órdenes del técnico */}
            {user?.rol === 'tecnico' && technicianOrders && technicianOrders.length > 0 && (
                <Paper sx={{ p: 2, mb: 3 }}>
                    <Typography variant="h6" gutterBottom>
                        Mis Órdenes de Trabajo
                    </Typography>
                    <Grid container spacing={2}>
                        {technicianOrders.slice(0, 4).map((order: Order) => (
                            <Grid item xs={12} md={6} key={order._id}>
                                <TechnicianWorkCard
                                    order={order}
                                    onStartWork={handleStartWork}
                                    onUpdateProgress={handleUpdateProgress}
                                />
                            </Grid>
                        ))}
                    </Grid>
                    {technicianOrders.length > 4 && (
                        <Box sx={{ textAlign: 'center', mt: 2 }}>
                            <Button variant="outlined" size="small">
                                Ver todas mis órdenes ({technicianOrders.length})
                            </Button>
                        </Box>
                    )}
                </Paper>
            )}

            {/* Sección de órdenes pendientes de asignación (solo para analistas) */}
            {user?.rol === 'analista' && pendingOrders && pendingOrders.length > 0 && (
                <Paper sx={{ p: 2, mb: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="h6">
                            Órdenes Pendientes de Asignación ({pendingOrders.length})
                        </Typography>
                        <Chip
                            label={`${pendingOrders.length} pendientes`}
                            color="warning"
                            size="small"
                        />
                    </Box>
                    <List>
                        {pendingOrders.slice(0, 5).map((order: Order, index: number) => (
                            <React.Fragment key={order._id}>
                                <ListItem>
                                    <ListItemText
                                        primary={
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <Typography variant="body1" fontWeight="medium">
                                                    {order.codigo}
                                                </Typography>
                                                <Chip
                                                    label={order.tipo_trabajo}
                                                    size="small"
                                                    variant="outlined"
                                                />
                                            </Box>
                                        }
                                        secondary={
                                            <Box>
                                                <Typography variant="body2" color="textSecondary">
                                                    <strong>Cliente:</strong> {order.cliente}
                                                </Typography>
                                                <Typography variant="body2" color="textSecondary">
                                                    <strong>Póliza:</strong> {order.poliza_number} | <strong>Dirección:</strong> {order.direccion}
                                                </Typography>
                                            </Box>
                                        }
                                    />
                                    <ListItemSecondaryAction>
                                        <IconButton
                                            edge="end"
                                            color="primary"
                                            onClick={() => handleAssignTechnician(order)}
                                            size="small"
                                        >
                                            <PersonAdd />
                                        </IconButton>
                                    </ListItemSecondaryAction>
                                </ListItem>
                                {index < Math.min(pendingOrders.length - 1, 4) && <Divider />}
                            </React.Fragment>
                        ))}
                    </List>
                    {pendingOrders.length > 5 && (
                        <Box sx={{ textAlign: 'center', mt: 2 }}>
                            <Button variant="outlined" size="small">
                                Ver todas las órdenes ({pendingOrders.length})
                            </Button>
                        </Box>
                    )}
                </Paper>
            )}

            <Grid container spacing={3}>
                {/* Actividad reciente */}
                <Grid item xs={12} md={8}>
                    <Paper sx={{ p: 2 }}>
                        <Typography variant="h6" gutterBottom>
                            Actividad Reciente
                        </Typography>
                        {activities.map((activity) => (
                            <Box
                                key={activity.id}
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    py: 1,
                                    borderBottom: '1px solid #f0f0f0',
                                    '&:last-child': { borderBottom: 'none' },
                                }}
                            >
                                <Avatar
                                    sx={{
                                        width: 32,
                                        height: 32,
                                        mr: 2,
                                        bgcolor: activity.type === 'order' ? '#1976d2' :
                                            activity.type === 'material' ? '#7b1fa2' :
                                                activity.type === 'completed' ? '#2e7d32' : '#ed6c02',
                                    }}
                                >
                                    {activity.type === 'order' && <Assignment fontSize="small" />}
                                    {activity.type === 'material' && <Inventory fontSize="small" />}
                                    {activity.type === 'completed' && <CheckCircle fontSize="small" />}
                                    {activity.type === 'assignment' && <People fontSize="small" />}
                                </Avatar>
                                <Box sx={{ flexGrow: 1 }}>
                                    <Typography variant="body2" fontWeight="medium">
                                        {activity.title}
                                    </Typography>
                                    <Typography variant="caption" color="textSecondary">
                                        {activity.description}
                                    </Typography>
                                </Box>
                                <Typography variant="caption" color="textSecondary">
                                    {activity.time}
                                </Typography>
                            </Box>
                        ))}
                    </Paper>
                </Grid>

                {/* Panel lateral */}
                <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 2, mb: 2 }}>
                        <Typography variant="h6" gutterBottom>
                            Estado del Sistema
                        </Typography>
                        <Box sx={{ mb: 2 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                <Typography variant="body2">Órdenes Completadas</Typography>
                                <Typography variant="body2">75%</Typography>
                            </Box>
                            <LinearProgress variant="determinate" value={75} />
                        </Box>
                        <Box sx={{ mb: 2 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                <Typography variant="body2">Eficiencia Técnicos</Typography>
                                <Typography variant="body2">88%</Typography>
                            </Box>
                            <LinearProgress variant="determinate" value={88} color="success" />
                        </Box>
                        <Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                <Typography variant="body2">Stock Disponible</Typography>
                                <Typography variant="body2">92%</Typography>
                            </Box>
                            <LinearProgress variant="determinate" value={92} color="info" />
                        </Box>
                    </Paper>

                    <Paper sx={{ p: 2 }}>
                        <Typography variant="h6" gutterBottom>
                            Acciones Rápidas
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                            {user?.rol === 'analista' && (
                                <>
                                    <Button variant="outlined" startIcon={<Assignment />} fullWidth>
                                        Nueva Orden
                                    </Button>
                                    <Button variant="outlined" startIcon={<PersonAdd />} fullWidth>
                                        Asignar Técnicos
                                    </Button>
                                    <Button variant="outlined" startIcon={<Assessment />} fullWidth>
                                        Ver Reportes
                                    </Button>
                                </>
                            )}
                            {user?.rol === 'tecnico' && (
                                <>
                                    <Button variant="outlined" startIcon={<Assignment />} fullWidth>
                                        Mis Órdenes
                                    </Button>
                                    <Button variant="outlined" startIcon={<Inventory />} fullWidth>
                                        Mi Inventario
                                    </Button>
                                </>
                            )}
                            {user?.rol === 'analista_inventario_oculto' && (
                                <>
                                    <Button variant="outlined" startIcon={<Inventory />} fullWidth>
                                        Gestionar Materiales
                                    </Button>
                                    <Button variant="outlined" startIcon={<People />} fullWidth>
                                        Asignar Inventario
                                    </Button>
                                </>
                            )}
                        </Box>
                    </Paper>
                </Grid>
            </Grid>

            {/* Diálogo de asignación de técnico */}
            <AssignTechnicianDialog
                open={assignDialogOpen}
                onClose={handleCloseAssignDialog}
                order={selectedOrderForAssign}
            />

            {/* Diálogo de progreso de trabajo */}
            <WorkProgressDialog
                open={workProgressDialogOpen}
                onClose={handleCloseProgressDialog}
                orderId={selectedOrderForProgress?._id || ''}
                orderData={selectedOrderForProgress}
            />
        </Box>
    );
};

export default Dashboard;