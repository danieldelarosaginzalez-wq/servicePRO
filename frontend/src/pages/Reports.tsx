import React, { useState, useCallback, useMemo } from 'react';
import { useQuery } from 'react-query';
import {
    Box,
    Paper,
    Grid,
    Card,
    CardContent,
    Typography,
    Button,
    TextField,
    MenuItem,
    Tabs,
    Tab,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    CircularProgress,
} from '@mui/material';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    PieChart,
    Pie,
    Cell,
    LineChart,
    Line,
    ResponsiveContainer,
} from 'recharts';
import { Download, DateRange, Assessment, Refresh } from '@mui/icons-material';
import * as XLSX from 'xlsx';
import { apiService } from '../services/apiService';

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
            id={`reports-tabpanel-${index}`}
            aria-labelledby={`reports-tab-${index}`}
            {...other}
        >
            {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
        </div>
    );
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82ca9d'];

const Reports: React.FC = () => {
    const [tabValue, setTabValue] = useState(0);
    const [dateRange, setDateRange] = useState({
        start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        end: new Date().toISOString().split('T')[0],
    });

    // Consultas para datos reales
    const { data: ordersData, isLoading: ordersLoading, refetch: refetchOrders } = useQuery(
        ['reports-orders', dateRange],
        () => apiService.getOrders({ limit: 1000 })
    );

    const { data: statsData, isLoading: statsLoading, refetch: refetchStats } = useQuery(
        ['orders-stats', dateRange],
        () => apiService.getOrdersStats({ startDate: dateRange.start, endDate: dateRange.end })
    );

    const { data: materialsData, isLoading: materialsLoading } = useQuery(
        ['reports-materials'],
        () => apiService.getMaterials({ limit: 1000 })
    );

    const { data: techniciansData } = useQuery(
        ['reports-technicians'],
        () => apiService.getUsers({ rol: 'tecnico', estado: 'activo', limit: 100 })
    );

    const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
        setTabValue(newValue);
    };

    const handleRefresh = () => {
        refetchOrders();
        refetchStats();
    };

    // Calcular datos para gráficos desde datos reales
    const ordersByStatus = useMemo(() => {
        if (!ordersData?.data) return [];
        const statusCount = ordersData.data.reduce((acc: any, order: any) => {
            const status = order.estado || 'sin_estado';
            acc[status] = (acc[status] || 0) + 1;
            return acc;
        }, {});
        return Object.entries(statusCount).map(([name, value]) => ({ name, value }));
    }, [ordersData]);

    const ordersByType = useMemo(() => {
        if (!ordersData?.data) return [];
        const typeCount = ordersData.data.reduce((acc: any, order: any) => {
            const tipo = order.tipo_trabajo || 'sin_tipo';
            acc[tipo] = (acc[tipo] || 0) + 1;
            return acc;
        }, {});
        return Object.entries(typeCount).map(([tipo, cantidad]) => ({ tipo, cantidad }));
    }, [ordersData]);

    // Tendencia mensual real basada en fecha_creacion
    const ordersTrend = useMemo(() => {
        if (!ordersData?.data) return [];

        const monthlyData: { [key: string]: { creadas: number; finalizadas: number; imposibilidad: number } } = {};
        const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

        ordersData.data.forEach((order: any) => {
            const date = new Date(order.fecha_creacion);
            const monthKey = `${months[date.getMonth()]} ${date.getFullYear()}`;

            if (!monthlyData[monthKey]) {
                monthlyData[monthKey] = { creadas: 0, finalizadas: 0, imposibilidad: 0 };
            }

            monthlyData[monthKey].creadas++;
            if (order.estado === 'finalizada' || order.estado === 'cerrada') {
                monthlyData[monthKey].finalizadas++;
            }
            if (order.estado === 'imposibilidad') {
                monthlyData[monthKey].imposibilidad++;
            }
        });

        // Ordenar por fecha y tomar los últimos 6 meses
        return Object.entries(monthlyData)
            .map(([mes, data]) => ({ mes, ...data }))
            .slice(-6);
    }, [ordersData]);

    // Estadísticas de materiales reales
    const materialsStats = useMemo(() => {
        if (!materialsData?.data) return [];
        const categoryCount = materialsData.data.reduce((acc: any, material: any) => {
            const cat = material.categoria || 'Sin categoría';
            acc[cat] = (acc[cat] || 0) + 1;
            return acc;
        }, {});
        return Object.entries(categoryCount).map(([categoria, cantidad]) => ({ categoria, cantidad }));
    }, [materialsData]);

    const materialsStatsNumbers = useMemo(() => {
        if (!materialsData?.data) return { total: 0, activos: 0, bajoStock: 0 };
        const materials = materialsData.data;
        return {
            total: materials.length,
            activos: materials.filter((m: any) => m.estado === 'activo').length,
            bajoStock: materials.filter((m: any) => (m.stock_actual || 0) < (m.stock_minimo || 10)).length,
        };
    }, [materialsData]);

    // Rendimiento real de técnicos
    const techniciansPerformance = useMemo(() => {
        if (!ordersData?.data || !techniciansData?.data) return [];

        const techStats: { [key: string]: { nombre: string; total: number; completadas: number } } = {};

        // Inicializar con todos los técnicos
        techniciansData.data.forEach((tech: any) => {
            techStats[tech._id] = { nombre: tech.nombre, total: 0, completadas: 0 };
        });

        // Contar órdenes por técnico
        ordersData.data.forEach((order: any) => {
            const techId = typeof order.tecnico_id === 'object' ? order.tecnico_id?._id : order.tecnico_id;
            if (techId && techStats[techId]) {
                techStats[techId].total++;
                if (order.estado === 'finalizada' || order.estado === 'cerrada') {
                    techStats[techId].completadas++;
                }
            }
        });

        return Object.values(techStats)
            .map(tech => ({
                nombre: tech.nombre,
                ordenes_completadas: tech.completadas,
                ordenes_totales: tech.total,
                eficiencia: tech.total > 0 ? Math.round((tech.completadas / tech.total) * 100) : 0,
            }))
            .filter(tech => tech.ordenes_totales > 0)
            .sort((a, b) => b.ordenes_completadas - a.ordenes_completadas);
    }, [ordersData, techniciansData]);

    // Funciones de exportación
    const exportOrders = useCallback(() => {
        if (!ordersData?.data) return;
        const exportData = ordersData.data.map((order: any) => ({
            Código: order.codigo,
            Póliza: order.poliza_number,
            Cliente: order.cliente,
            Dirección: order.direccion,
            Tipo: order.tipo_trabajo,
            Estado: order.estado,
            Técnico: order.tecnico_id?.nombre || 'Sin asignar',
            'Fecha Creación': order.fecha_creacion ? new Date(order.fecha_creacion).toLocaleDateString() : '',
            'Fecha Finalización': order.fecha_finalizacion ? new Date(order.fecha_finalizacion).toLocaleDateString() : '',
        }));

        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(exportData);
        XLSX.utils.book_append_sheet(wb, ws, 'Ordenes_de_Trabajo');
        XLSX.writeFile(wb, `Ordenes_${new Date().toISOString().split('T')[0]}.xlsx`);
    }, [ordersData]);

    const exportMaterials = useCallback(() => {
        if (!materialsData?.data) return;
        const exportData = materialsData.data.map((material: any) => ({
            Código: material.codigo,
            Nombre: material.nombre,
            Categoría: material.categoria,
            'Unidad Medida': material.unidad_medida,
            'Stock Actual': material.stock_actual || 0,
            'Stock Mínimo': material.stock_minimo || 0,
            Estado: material.estado,
        }));

        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(exportData);
        XLSX.utils.book_append_sheet(wb, ws, 'Materiales');
        XLSX.writeFile(wb, `Materiales_${new Date().toISOString().split('T')[0]}.xlsx`);
    }, [materialsData]);

    const exportTechniciansPerformance = useCallback(() => {
        if (!techniciansPerformance.length) return;
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(techniciansPerformance.map(t => ({
            Técnico: t.nombre,
            'Órdenes Completadas': t.ordenes_completadas,
            'Órdenes Totales': t.ordenes_totales,
            'Eficiencia (%)': t.eficiencia,
        })));
        XLSX.utils.book_append_sheet(wb, ws, 'Rendimiento_Tecnicos');
        XLSX.writeFile(wb, `Rendimiento_Tecnicos_${new Date().toISOString().split('T')[0]}.xlsx`);
    }, [techniciansPerformance]);

    const isLoading = ordersLoading || statsLoading || materialsLoading;

    return (
        <Box sx={{ width: '100%' }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs value={tabValue} onChange={handleTabChange}>
                    <Tab label="Órdenes de Trabajo" />
                    <Tab label="Materiales" />
                    <Tab label="Rendimiento" />
                    <Tab label="Exportar" />
                </Tabs>
            </Box>

            {/* Controles de fecha */}
            <Box sx={{ p: 3, display: 'flex', gap: 2, alignItems: 'center' }}>
                <DateRange />
                <TextField
                    label="Fecha Inicio"
                    type="date"
                    value={dateRange.start}
                    onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                    InputLabelProps={{ shrink: true }}
                    size="small"
                />
                <TextField
                    label="Fecha Fin"
                    type="date"
                    value={dateRange.end}
                    onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                    InputLabelProps={{ shrink: true }}
                    size="small"
                />
                <Button
                    variant="outlined"
                    startIcon={isLoading ? <CircularProgress size={16} /> : <Refresh />}
                    onClick={handleRefresh}
                    disabled={isLoading}
                >
                    Actualizar
                </Button>
                {ordersData?.data && (
                    <Chip label={`${ordersData.data.length} órdenes`} color="primary" variant="outlined" />
                )}
            </Box>

            {/* Reporte de Órdenes */}
            <TabPanel value={tabValue} index={0}>
                <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                        <Paper sx={{ p: 2 }}>
                            <Typography variant="h6" gutterBottom>
                                Órdenes por Estado
                            </Typography>
                            {ordersByStatus.length > 0 ? (
                                <ResponsiveContainer width="100%" height={300}>
                                    <PieChart>
                                        <Pie
                                            data={ordersByStatus}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                            outerRadius={80}
                                            fill="#8884d8"
                                            dataKey="value"
                                        >
                                            {ordersByStatus.map((_entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : (
                                <Box sx={{ textAlign: 'center', py: 4 }}>
                                    <Typography color="textSecondary">No hay datos disponibles</Typography>
                                </Box>
                            )}
                        </Paper>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <Paper sx={{ p: 2 }}>
                            <Typography variant="h6" gutterBottom>
                                Órdenes por Tipo de Trabajo
                            </Typography>
                            {ordersByType.length > 0 ? (
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={ordersByType}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="tipo" />
                                        <YAxis />
                                        <Tooltip />
                                        <Bar dataKey="cantidad" fill="#8884d8" />
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <Box sx={{ textAlign: 'center', py: 4 }}>
                                    <Typography color="textSecondary">No hay datos disponibles</Typography>
                                </Box>
                            )}
                        </Paper>
                    </Grid>

                    <Grid item xs={12}>
                        <Paper sx={{ p: 2 }}>
                            <Typography variant="h6" gutterBottom>
                                Tendencia Mensual de Órdenes
                            </Typography>
                            {ordersTrend.length > 0 ? (
                                <ResponsiveContainer width="100%" height={300}>
                                    <LineChart data={ordersTrend}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="mes" />
                                        <YAxis />
                                        <Tooltip />
                                        <Legend />
                                        <Line type="monotone" dataKey="creadas" stroke="#8884d8" name="Creadas" strokeWidth={2} />
                                        <Line type="monotone" dataKey="finalizadas" stroke="#82ca9d" name="Finalizadas" strokeWidth={2} />
                                        <Line type="monotone" dataKey="imposibilidad" stroke="#ff7300" name="Imposibilidad" strokeWidth={2} />
                                    </LineChart>
                                </ResponsiveContainer>
                            ) : (
                                <Box sx={{ textAlign: 'center', py: 4 }}>
                                    <Typography color="textSecondary">No hay datos de tendencia disponibles</Typography>
                                </Box>
                            )}
                        </Paper>
                    </Grid>
                </Grid>
            </TabPanel>

            {/* Reporte de Materiales */}
            <TabPanel value={tabValue} index={1}>
                <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                        <Paper sx={{ p: 2 }}>
                            <Typography variant="h6" gutterBottom>
                                Materiales por Categoría
                            </Typography>
                            {materialsStats.length > 0 ? (
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={materialsStats}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="categoria" />
                                        <YAxis />
                                        <Tooltip />
                                        <Bar dataKey="cantidad" fill="#82ca9d" />
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <Box sx={{ textAlign: 'center', py: 4 }}>
                                    <Typography color="textSecondary">No hay datos disponibles</Typography>
                                </Box>
                            )}
                        </Paper>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <Paper sx={{ p: 2 }}>
                            <Typography variant="h6" gutterBottom>
                                Estadísticas de Inventario
                            </Typography>
                            <Box sx={{ mt: 2 }}>
                                <Card sx={{ mb: 2 }}>
                                    <CardContent>
                                        <Typography variant="h4" color="primary">
                                            {materialsStatsNumbers.total}
                                        </Typography>
                                        <Typography variant="body2" color="textSecondary">
                                            Total de Materiales
                                        </Typography>
                                    </CardContent>
                                </Card>
                                <Card sx={{ mb: 2 }}>
                                    <CardContent>
                                        <Typography variant="h4" color="success.main">
                                            {materialsStatsNumbers.activos}
                                        </Typography>
                                        <Typography variant="body2" color="textSecondary">
                                            Materiales Activos
                                        </Typography>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardContent>
                                        <Typography variant="h4" color="warning.main">
                                            {materialsStatsNumbers.bajoStock}
                                        </Typography>
                                        <Typography variant="body2" color="textSecondary">
                                            Materiales Bajo Stock
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Box>
                        </Paper>
                    </Grid>
                </Grid>
            </TabPanel>

            {/* Reporte de Rendimiento */}
            <TabPanel value={tabValue} index={2}>
                <Grid container spacing={3}>
                    <Grid item xs={12}>
                        <Paper sx={{ p: 2 }}>
                            <Typography variant="h6" gutterBottom>
                                Rendimiento de Técnicos (Datos Reales)
                            </Typography>
                            {techniciansPerformance.length > 0 ? (
                                <TableContainer>
                                    <Table>
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>Técnico</TableCell>
                                                <TableCell align="right">Órdenes Completadas</TableCell>
                                                <TableCell align="right">Órdenes Totales</TableCell>
                                                <TableCell align="right">Eficiencia (%)</TableCell>
                                                <TableCell align="center">Estado</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {techniciansPerformance.map((tech, index) => (
                                                <TableRow key={index}>
                                                    <TableCell component="th" scope="row">
                                                        {tech.nombre}
                                                    </TableCell>
                                                    <TableCell align="right">{tech.ordenes_completadas}</TableCell>
                                                    <TableCell align="right">{tech.ordenes_totales}</TableCell>
                                                    <TableCell align="right">{tech.eficiencia}%</TableCell>
                                                    <TableCell align="center">
                                                        <Chip
                                                            label={tech.eficiencia >= 90 ? 'Excelente' : tech.eficiencia >= 70 ? 'Bueno' : tech.eficiencia >= 50 ? 'Regular' : 'Bajo'}
                                                            color={tech.eficiencia >= 90 ? 'success' : tech.eficiencia >= 70 ? 'primary' : tech.eficiencia >= 50 ? 'warning' : 'error'}
                                                            size="small"
                                                        />
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            ) : (
                                <Box sx={{ textAlign: 'center', py: 4 }}>
                                    <Typography color="textSecondary">
                                        No hay datos de rendimiento disponibles. Los técnicos aparecerán aquí cuando tengan órdenes asignadas.
                                    </Typography>
                                </Box>
                            )}
                        </Paper>
                    </Grid>

                    {/* Gráfico de barras de rendimiento */}
                    {techniciansPerformance.length > 0 && (
                        <Grid item xs={12}>
                            <Paper sx={{ p: 2 }}>
                                <Typography variant="h6" gutterBottom>
                                    Comparativa de Órdenes por Técnico
                                </Typography>
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={techniciansPerformance.slice(0, 10)}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="nombre" />
                                        <YAxis />
                                        <Tooltip />
                                        <Legend />
                                        <Bar dataKey="ordenes_completadas" fill="#82ca9d" name="Completadas" />
                                        <Bar dataKey="ordenes_totales" fill="#8884d8" name="Totales" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </Paper>
                        </Grid>
                    )}
                </Grid>
            </TabPanel>

            {/* Exportar Reportes */}
            <TabPanel value={tabValue} index={3}>
                <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                        <Paper sx={{ p: 3 }}>
                            <Typography variant="h6" gutterBottom>
                                Exportar Datos a Excel
                            </Typography>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                <Button
                                    variant="outlined"
                                    startIcon={<Download />}
                                    onClick={exportOrders}
                                    fullWidth
                                    disabled={!ordersData?.data?.length}
                                >
                                    Exportar Órdenes de Trabajo ({ordersData?.data?.length || 0})
                                </Button>
                                <Button
                                    variant="outlined"
                                    startIcon={<Download />}
                                    onClick={exportMaterials}
                                    fullWidth
                                    disabled={!materialsData?.data?.length}
                                >
                                    Exportar Inventario de Materiales ({materialsData?.data?.length || 0})
                                </Button>
                                <Button
                                    variant="outlined"
                                    startIcon={<Download />}
                                    onClick={exportTechniciansPerformance}
                                    fullWidth
                                    disabled={!techniciansPerformance.length}
                                >
                                    Exportar Rendimiento de Técnicos ({techniciansPerformance.length})
                                </Button>
                            </Box>
                        </Paper>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <Paper sx={{ p: 3 }}>
                            <Typography variant="h6" gutterBottom>
                                Resumen del Período
                            </Typography>
                            <Typography variant="body2" color="textSecondary" gutterBottom>
                                Datos del {dateRange.start} al {dateRange.end}
                            </Typography>
                            <Box sx={{ mt: 2 }}>
                                <Grid container spacing={2}>
                                    <Grid item xs={6}>
                                        <Card variant="outlined">
                                            <CardContent>
                                                <Typography variant="h5" color="primary">
                                                    {ordersData?.data?.length || 0}
                                                </Typography>
                                                <Typography variant="body2">Total Órdenes</Typography>
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Card variant="outlined">
                                            <CardContent>
                                                <Typography variant="h5" color="success.main">
                                                    {ordersData?.data?.filter((o: any) => o.estado === 'finalizada' || o.estado === 'cerrada').length || 0}
                                                </Typography>
                                                <Typography variant="body2">Finalizadas</Typography>
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Card variant="outlined">
                                            <CardContent>
                                                <Typography variant="h5" color="warning.main">
                                                    {ordersData?.data?.filter((o: any) => o.estado === 'en_proceso').length || 0}
                                                </Typography>
                                                <Typography variant="body2">En Proceso</Typography>
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Card variant="outlined">
                                            <CardContent>
                                                <Typography variant="h5" color="error.main">
                                                    {ordersData?.data?.filter((o: any) => o.estado === 'imposibilidad').length || 0}
                                                </Typography>
                                                <Typography variant="body2">Imposibilidad</Typography>
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                </Grid>
                            </Box>
                        </Paper>
                    </Grid>
                </Grid>
            </TabPanel>
        </Box>
    );
};

export default Reports;
