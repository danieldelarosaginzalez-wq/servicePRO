import React, { useState, useMemo, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { ColDef } from 'ag-grid-community';
import {
    Box,
    Paper,
    Button,
    Chip,
    IconButton,
    Tooltip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Grid,
    Typography,
    Stepper,
    Step,
    StepLabel,
} from '@mui/material';
import { Add, Visibility, Edit, Description, Draw, Download } from '@mui/icons-material';
import { ExcelGrid } from '../components/ExcelGrid';
import { SignatureDialog } from '../components/SignatureDialog';
import { generateVisitReportPDF } from '../utils/pdfGenerator';
import { apiService } from '../services/apiService';
import { useAuth } from '../contexts/AuthContext';

const VisitReports: React.FC = () => {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [signatureDialogOpen, setSignatureDialogOpen] = useState(false);
    const [selectedReport, setSelectedReport] = useState<any>(null);
    const [activeStep, setActiveStep] = useState(0);
    const [formData, setFormData] = useState({
        order_id: '',
        identificacion_servicio: {
            poliza: '',
            abonado: '',
            direccion: '',
            telefono: '',
        },
        bloque_operativo: {
            operario: user?.nombre || '',
            tipo_proceso: '',
            fecha_visita: new Date().toISOString().split('T')[0],
            hora_inicio: '',
            hora_fin: '',
        },
        trabajo_realizado: {
            descripcion: '',
            observaciones: '',
        },
    });

    const { data: reportsData, isLoading, refetch } = useQuery(
        ['visit-reports'],
        () => apiService.getVisitReports()
    );

    const { data: ordersData } = useQuery(
        ['orders-for-reports'],
        () => apiService.getOrders({ limit: 100 })
    );

    const createMutation = useMutation(
        (data: any) => apiService.createVisitReport(data),
        {
            onSuccess: () => {
                queryClient.invalidateQueries(['visit-reports']);
                setCreateDialogOpen(false);
                resetForm();
            },
        }
    );

    const columnDefs = useMemo<ColDef[]>(() => [
        {
            field: 'numero_comprobante',
            headerName: 'Número',
            width: 150,
            cellRenderer: (params: any) => (
                <strong style={{ color: '#1976d2' }}>{params.value}</strong>
            ),
        },
        {
            field: 'identificacion_servicio.poliza',
            headerName: 'Póliza',
            width: 120,
        },
        {
            field: 'identificacion_servicio.abonado',
            headerName: 'Abonado',
            width: 180,
        },
        {
            field: 'bloque_operativo.operario',
            headerName: 'Operario',
            width: 150,
        },
        {
            field: 'bloque_operativo.tipo_proceso',
            headerName: 'Tipo Proceso',
            width: 130,
        },
        {
            field: 'estado',
            headerName: 'Estado',
            width: 130,
            cellRenderer: (params: any) => {
                const colors: any = {
                    borrador: 'default',
                    pendiente_firma: 'warning',
                    firmado: 'info',
                    finalizado: 'success',
                };
                return (
                    <Chip
                        label={params.value?.replace('_', ' ')}
                        color={colors[params.value] || 'default'}
                        size="small"
                    />
                );
            },
        },
        {
            field: 'fecha_creacion',
            headerName: 'Fecha',
            width: 120,
            valueFormatter: (params) =>
                params.value ? new Date(params.value).toLocaleDateString() : '',
        },
        {
            field: 'acciones',
            headerName: 'Acciones',
            width: 150,
            cellRenderer: (params: any) => (
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                    <Tooltip title="Ver">
                        <IconButton size="small" onClick={() => handleView(params.data)}>
                            <Visibility fontSize="small" />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Descargar PDF">
                        <IconButton size="small" color="primary" onClick={() => handleDownloadPDF(params.data)}>
                            <Download fontSize="small" />
                        </IconButton>
                    </Tooltip>
                    {params.data.estado !== 'finalizado' && (
                        <>
                            <Tooltip title="Editar">
                                <IconButton size="small" onClick={() => handleEdit(params.data)}>
                                    <Edit fontSize="small" />
                                </IconButton>
                            </Tooltip>
                            <Tooltip title="Firmar">
                                <IconButton size="small" onClick={() => handleSign(params.data)}>
                                    <Draw fontSize="small" />
                                </IconButton>
                            </Tooltip>
                        </>
                    )}
                </Box>
            ),
        },
    ], []);

    const handleView = useCallback((report: any) => {
        setSelectedReport(report);
    }, []);

    const handleEdit = useCallback((report: any) => {
        setSelectedReport(report);
        setCreateDialogOpen(true);
    }, []);

    const handleSign = useCallback((report: any) => {
        setSelectedReport(report);
        setSignatureDialogOpen(true);
    }, []);

    const handleDownloadPDF = useCallback((report: any) => {
        generateVisitReportPDF(report);
    }, []);

    const resetForm = () => {
        setFormData({
            order_id: '',
            identificacion_servicio: { poliza: '', abonado: '', direccion: '', telefono: '' },
            bloque_operativo: {
                operario: user?.nombre || '',
                tipo_proceso: '',
                fecha_visita: new Date().toISOString().split('T')[0],
                hora_inicio: '',
                hora_fin: '',
            },
            trabajo_realizado: { descripcion: '', observaciones: '' },
        });
        setActiveStep(0);
    };

    const handleCreate = () => {
        createMutation.mutate(formData);
    };

    const steps = ['Identificación', 'Operativo', 'Trabajo Realizado'];

    return (
        <Box sx={{ p: 3 }}>
            <Paper sx={{ p: 2 }}>
                <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between' }}>
                    <Button
                        variant="contained"
                        startIcon={<Add />}
                        onClick={() => setCreateDialogOpen(true)}
                    >
                        Nuevo Comprobante
                    </Button>
                </Box>

                <ExcelGrid
                    data={reportsData?.data || []}
                    columns={columnDefs}
                    title="Comprobantes de Visita"
                    enableExport={true}
                    loading={isLoading}
                    onRefresh={refetch}
                    height="calc(100vh - 250px)"
                />
            </Paper>

            {/* Diálogo de creación */}
            <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="md" fullWidth>
                <DialogTitle>
                    <Description sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Nuevo Comprobante de Visita
                </DialogTitle>
                <DialogContent>
                    <Stepper activeStep={activeStep} sx={{ my: 2 }}>
                        {steps.map((label) => (
                            <Step key={label}>
                                <StepLabel>{label}</StepLabel>
                            </Step>
                        ))}
                    </Stepper>

                    {activeStep === 0 && (
                        <Grid container spacing={2} sx={{ mt: 1 }}>
                            <Grid item xs={12}>
                                <TextField
                                    select
                                    label="Orden de Trabajo"
                                    value={formData.order_id}
                                    onChange={(e) => setFormData({ ...formData, order_id: e.target.value })}
                                    fullWidth
                                    SelectProps={{ native: true }}
                                >
                                    <option value="">Seleccionar orden...</option>
                                    {ordersData?.data?.map((order: any) => (
                                        <option key={order._id} value={order._id}>
                                            {order.codigo} - {order.cliente}
                                        </option>
                                    ))}
                                </TextField>
                            </Grid>
                            <Grid item xs={6}>
                                <TextField
                                    label="Póliza"
                                    value={formData.identificacion_servicio.poliza}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        identificacion_servicio: { ...formData.identificacion_servicio, poliza: e.target.value }
                                    })}
                                    fullWidth
                                />
                            </Grid>
                            <Grid item xs={6}>
                                <TextField
                                    label="Abonado"
                                    value={formData.identificacion_servicio.abonado}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        identificacion_servicio: { ...formData.identificacion_servicio, abonado: e.target.value }
                                    })}
                                    fullWidth
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    label="Dirección"
                                    value={formData.identificacion_servicio.direccion}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        identificacion_servicio: { ...formData.identificacion_servicio, direccion: e.target.value }
                                    })}
                                    fullWidth
                                />
                            </Grid>
                        </Grid>
                    )}

                    {activeStep === 1 && (
                        <Grid container spacing={2} sx={{ mt: 1 }}>
                            <Grid item xs={6}>
                                <TextField
                                    label="Tipo de Proceso"
                                    value={formData.bloque_operativo.tipo_proceso}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        bloque_operativo: { ...formData.bloque_operativo, tipo_proceso: e.target.value }
                                    })}
                                    fullWidth
                                />
                            </Grid>
                            <Grid item xs={6}>
                                <TextField
                                    label="Fecha de Visita"
                                    type="date"
                                    value={formData.bloque_operativo.fecha_visita}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        bloque_operativo: { ...formData.bloque_operativo, fecha_visita: e.target.value }
                                    })}
                                    fullWidth
                                    InputLabelProps={{ shrink: true }}
                                />
                            </Grid>
                            <Grid item xs={6}>
                                <TextField
                                    label="Hora Inicio"
                                    type="time"
                                    value={formData.bloque_operativo.hora_inicio}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        bloque_operativo: { ...formData.bloque_operativo, hora_inicio: e.target.value }
                                    })}
                                    fullWidth
                                    InputLabelProps={{ shrink: true }}
                                />
                            </Grid>
                            <Grid item xs={6}>
                                <TextField
                                    label="Hora Fin"
                                    type="time"
                                    value={formData.bloque_operativo.hora_fin}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        bloque_operativo: { ...formData.bloque_operativo, hora_fin: e.target.value }
                                    })}
                                    fullWidth
                                    InputLabelProps={{ shrink: true }}
                                />
                            </Grid>
                        </Grid>
                    )}

                    {activeStep === 2 && (
                        <Grid container spacing={2} sx={{ mt: 1 }}>
                            <Grid item xs={12}>
                                <TextField
                                    label="Descripción del Trabajo"
                                    value={formData.trabajo_realizado.descripcion}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        trabajo_realizado: { ...formData.trabajo_realizado, descripcion: e.target.value }
                                    })}
                                    fullWidth
                                    multiline
                                    rows={4}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    label="Observaciones"
                                    value={formData.trabajo_realizado.observaciones}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        trabajo_realizado: { ...formData.trabajo_realizado, observaciones: e.target.value }
                                    })}
                                    fullWidth
                                    multiline
                                    rows={3}
                                />
                            </Grid>
                        </Grid>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setCreateDialogOpen(false)}>Cancelar</Button>
                    {activeStep > 0 && (
                        <Button onClick={() => setActiveStep(activeStep - 1)}>Anterior</Button>
                    )}
                    {activeStep < steps.length - 1 ? (
                        <Button variant="contained" onClick={() => setActiveStep(activeStep + 1)}>
                            Siguiente
                        </Button>
                    ) : (
                        <Button variant="contained" onClick={handleCreate} disabled={createMutation.isLoading}>
                            Crear Comprobante
                        </Button>
                    )}
                </DialogActions>
            </Dialog>

            {/* Diálogo de firma */}
            <SignatureDialog
                open={signatureDialogOpen}
                onClose={() => setSignatureDialogOpen(false)}
                reportId={selectedReport?._id}
            />
        </Box>
    );
};

export default VisitReports;
