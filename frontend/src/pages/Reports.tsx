import React, { useState, useCallback } from 'react';
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
import { Download, DateRange, Assessment } from '@mui/icons-material';
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

const Reports: React.FC = () => {
    const [tabValue, setTabValue] = useState(0);
    const [dateRange, setDateRange] = useState({
        start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        end: new Date().toISOString().split('T')[0],
    });
    const [reportType, setReportType] = useState('');
    const [reportFrequency, setReportFrequency] = useState('');
    const [reportEmail, setReportEmail] = useState('');

    // Consultas para datos de reportes
    const { data: ordersData } = useQuery(
        ['reports-orders', dateRange],
        () => apiService.getOrders({ limit: 1000 })
    );

    const { data: materialsData } = useQuery(
        ['reports-materials'],
        () => apiService.getMaterials({ limit: 1000 })
    );

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setTabValue(newValue);
    };

    // Datos para gráficos
    const getOrdersByStatus = () => {
        if (!ordersData?.data) return [];

        const statusCount = ordersData.data.reduce((acc: any, order: any) => {
            acc[order.estado] = (acc[order.estado] || 0) + 1;
            return acc;
        }, {});

        return Object.entries(statusCount).map(([status, count]) => ({
            name: status,
            value: count,
        }));
    };

    const getOrdersByType = () => {
        if (!ordersData?.data) return [];

        const typeCount = ordersData.data.reduce((acc: any, order: any) => {
            acc[order.tipo_trabajo] = (acc[order.tipo_trabajo] || 0) + 1;
            return acc;
        }, {});

        return Object.entries(typeCount).map(([type, count]) => ({
            tipo: type,
            cantidad: count,
        }));
    };

    const getOrdersTrend = () => {
        if (!ordersData?.data) return [];

        // Simular datos de tendencia por mes
        const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'];
        return months.map(month => ({
            mes: month,
            creadas: Math.floor(Math.random() * 50) + 10,
            finalizadas: Math.floor(Math.random() * 40) + 5,
            imposibilidad: Math.floor(Math.random() * 5) + 1,
        }));
    };

    const getMaterialsStats = () => {
        if (!materialsData?.data) return [];

        const categoryCount = materialsData.data.reduce((acc: any, material: any) => {
            acc[material.categoria] = (acc[material.categoria] || 0) + 1;
            return acc;
        }, {});

        return Object.entries(categoryCount).map(([category, count]) => ({
            categoria: category,
            cantidad: count,
        }));
    };

    const getTopTechnicians = () => {
        // Datos simulados de rendimiento de técnicos
        return [
            { nombre: 'Juan Pérez', ordenes_completadas: 45, eficiencia: 92 },
            { nombre: 'María García', ordenes_completadas: 38, eficiencia: 88 },
            { nombre: 'Carlos López', ordenes_completadas: 42, eficiencia: 85 },
            { nombre: 'Ana Rodríguez', ordenes_completadas: 35, eficiencia: 90 },
            { nombre: 'Luis Martínez', ordenes_completadas: 40, eficiencia: 87 },
        ];
    };

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

    const ordersByStatus = getOrdersByStatus();
    const ordersByType = getOrdersByType();
    const ordersTrend = getOrdersTrend();
    const materialsStats = getMaterialsStats();
    const topTechnicians = getTopTechnicians();

    // Funciones de exportación
    const exportOrders = useCallback(() => {
        if (!ordersData?.data) return;

        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(ordersData.data);
        XLSX.utils.book_append_sheet(wb, ws, 'Ordenes_de_Trabajo');

        const fileName = `Ordenes_de_Trabajo_${new Date().toISOString().split('T')[0]}.xlsx`;
        XLSX.writeFile(wb, fileName);
    }, [ordersData]);

    const exportMaterials = useCallback(() => {
        if (!materialsData?.data) return;

        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(materialsData.data);
        XLSX.utils.book_append_sheet(wb, ws, 'Inventario_Materiales');

        const fileName = `Inventario_Materiales_${new Date().toISOString().split('T')[0]}.xlsx`;
        XLSX.writeFile(wb, fileName);
    }, [materialsData]);

    const exportTechniciansPerformance = useCallback(() => {
        const techniciansData = getTopTechnicians();
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(techniciansData);
        XLSX.utils.book_append_sheet(wb, ws, 'Rendimiento_Tecnicos');

        const fileName = `Rendimiento_Tecnicos_${new Date().toISOString().split('T')[0]}.xlsx`;
        XLSX.writeFile(wb, fileName);
    }, []);

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
                />
                <TextField
                    label="Fecha Fin"
                    type="date"
                    value={dateRange.end}
                    onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                    InputLabelProps={{ shrink: true }}
                />
                <Button variant="outlined" startIcon={<Assessment />}>
                    Actualizar
                </Button>
            </Box>

            {/* Reporte de Órdenes */}
            <TabPanel value={tabValue} index={0}>
                <Grid container spacing={3}>
                    {/* Resumen de estados */}
                    <Grid item xs={12} md={6}>
                        <Paper sx={{ p: 2 }}>
                            <Typography variant="h6" gutterBottom>
                                Órdenes por Estado
                            </Typography>
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
                                        {ordersByStatus.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </Paper>
                    </Grid>

                    {/* Órdenes por tipo */}
                    <Grid item xs={12} md={6}>
                        <Paper sx={{ p: 2 }}>
                            <Typography variant="h6" gutterBottom>
                                Órdenes por Tipo de Trabajo
                            </Typography>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={ordersByType}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="tipo" />
                                    <YAxis />
                                    <Tooltip />
                                    <Bar dataKey="cantidad" fill="#8884d8" />
                                </BarChart>
                            </ResponsiveContainer>
                        </Paper>
                    </Grid>

                    {/* Tendencia mensual */}
                    <Grid item xs={12}>
                        <Paper sx={{ p: 2 }}>
                            <Typography variant="h6" gutterBottom>
                                Tendencia Mensual de Órdenes
                            </Typography>
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={ordersTrend}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="mes" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Line type="monotone" dataKey="creadas" stroke="#8884d8" name="Creadas" />
                                    <Line type="monotone" dataKey="finalizadas" stroke="#82ca9d" name="Finalizadas" />
                                    <Line type="monotone" dataKey="imposibilidad" stroke="#ff7300" name="Imposibilidad" />
                                </LineChart>
                            </ResponsiveContainer>
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
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={materialsStats}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="categoria" />
                                    <YAxis />
                                    <Tooltip />
                                    <Bar dataKey="cantidad" fill="#82ca9d" />
                                </BarChart>
                            </ResponsiveContainer>
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
                                            {materialsData?.data?.length || 0}
                                        </Typography>
                                        <Typography variant="body2" color="textSecondary">
                                            Total de Materiales
                                        </Typography>
                                    </CardContent>
                                </Card>
                                <Card sx={{ mb: 2 }}>
                                    <CardContent>
                                        <Typography variant="h4" color="success.main">
                                            {materialsData?.data?.filter((m: any) => m.estado === 'activo').length || 0}
                                        </Typography>
                                        <Typography variant="body2" color="textSecondary">
                                            Materiales Activos
                                        </Typography>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardContent>
                                        <Typography variant="h4" color="warning.main">
                                            {Math.floor(Math.random() * 10) + 5}
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
                                Rendimiento de Técnicos
                            </Typography>
                            <TableContainer>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Técnico</TableCell>
                                            <TableCell align="right">Órdenes Completadas</TableCell>
                                            <TableCell align="right">Eficiencia (%)</TableCell>
                                            <TableCell align="center">Estado</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {topTechnicians.map((tech, index) => (
                                            <TableRow key={index}>
                                                <TableCell component="th" scope="row">
                                                    {tech.nombre}
                                                </TableCell>
                                                <TableCell align="right">{tech.ordenes_completadas}</TableCell>
                                                <TableCell align="right">{tech.eficiencia}%</TableCell>
                                                <TableCell align="center">
                                                    <Chip
                                                        label={tech.eficiencia >= 90 ? 'Excelente' : tech.eficiencia >= 80 ? 'Bueno' : 'Regular'}
                                                        color={tech.eficiencia >= 90 ? 'success' : tech.eficiencia >= 80 ? 'primary' : 'warning'}
                                                        size="small"
                                                    />
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Paper>
                    </Grid>
                </Grid>
            </TabPanel>

            {/* Exportar Reportes */}
            <TabPanel value={tabValue} index={3}>
                <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                        <Paper sx={{ p: 3 }}>
                            <Typography variant="h6" gutterBottom>
                                Exportar Datos
                            </Typography>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                <Button
                                    variant="outlined"
                                    startIcon={<Download />}
                                    onClick={exportOrders}
                                    fullWidth
                                >
                                    Exportar Órdenes de Trabajo
                                </Button>
                                <Button
                                    variant="outlined"
                                    startIcon={<Download />}
                                    onClick={exportMaterials}
                                    fullWidth
                                >
                                    Exportar Inventario de Materiales
                                </Button>
                                <Button
                                    variant="outlined"
                                    startIcon={<Download />}
                                    fullWidth
                                >
                                    Exportar Movimientos de Inventario
                                </Button>
                                <Button
                                    variant="outlined"
                                    startIcon={<Download />}
                                    onClick={exportTechniciansPerformance}
                                    fullWidth
                                >
                                    Exportar Rendimiento de Técnicos
                                </Button>
                            </Box>
                        </Paper>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <Paper sx={{ p: 3 }}>
                            <Typography variant="h6" gutterBottom>
                                Reportes Programados
                            </Typography>
                            <Typography variant="body2" color="textSecondary" gutterBottom>
                                Configure reportes automáticos que se enviarán por correo electrónico.
                            </Typography>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                                <TextField
                                    select
                                    label="Tipo de Reporte"
                                    value={reportType}
                                    onChange={(e) => setReportType(e.target.value)}
                                    fullWidth
                                >
                                    <MenuItem value="orders">Órdenes de Trabajo</MenuItem>
                                    <MenuItem value="materials">Inventario</MenuItem>
                                    <MenuItem value="performance">Rendimiento</MenuItem>
                                </TextField>
                                <TextField
                                    select
                                    label="Frecuencia"
                                    value={reportFrequency}
                                    onChange={(e) => setReportFrequency(e.target.value)}
                                    fullWidth
                                >
                                    <MenuItem value="daily">Diario</MenuItem>
                                    <MenuItem value="weekly">Semanal</MenuItem>
                                    <MenuItem value="monthly">Mensual</MenuItem>
                                </TextField>
                                <TextField
                                    label="Correo Electrónico"
                                    type="email"
                                    value={reportEmail}
                                    onChange={(e) => setReportEmail(e.target.value)}
                                    fullWidth
                                />
                                <Button variant="contained">
                                    Programar Reporte
                                </Button>
                            </Box>
                        </Paper>
                    </Grid>
                </Grid>
            </TabPanel>
        </Box>
    );
};

export default Reports;