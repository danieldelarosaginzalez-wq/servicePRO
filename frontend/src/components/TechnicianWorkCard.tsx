import React from 'react';
import {
    Card,
    CardContent,
    CardActions,
    Typography,
    Button,
    Box,
    Chip,
    LinearProgress,
    Avatar,
    Grid,
    Divider,
} from '@mui/material';
import {
    PlayArrow,
    Construction,
    LocationOn,
    Schedule,
    CheckCircle,
    PhotoCamera,
    Inventory,
} from '@mui/icons-material';
import { Order } from '../../../shared/types';

interface TechnicianWorkCardProps {
    order: Order;
    onStartWork: (order: Order) => void;
    onUpdateProgress: (order: Order) => void;
}

export const TechnicianWorkCard: React.FC<TechnicianWorkCardProps> = ({
    order,
    onStartWork,
    onUpdateProgress,
}) => {
    const getProgressPercentage = () => {
        const evidencias = order.evidencias || {};
        let completed = 0;
        const total = 4; // 4 fases: inicial, durante, materiales, final

        if (evidencias.foto_inicial) completed++;
        if (evidencias.foto_durante && evidencias.foto_durante.length > 0) completed++;
        if (evidencias.foto_materiales && evidencias.foto_materiales.length > 0) completed++;
        if (evidencias.foto_final) completed++;

        return (completed / total) * 100;
    };

    const getProgressSteps = () => {
        const evidencias = order.evidencias || {};
        return [
            {
                label: 'Foto Inicial',
                completed: !!evidencias.foto_inicial,
                icon: <PhotoCamera fontSize="small" />,
            },
            {
                label: 'Durante Trabajo',
                completed: !!(evidencias.foto_durante && evidencias.foto_durante.length > 0),
                icon: <Construction fontSize="small" />,
            },
            {
                label: 'Materiales',
                completed: !!(evidencias.foto_materiales && evidencias.foto_materiales.length > 0),
                icon: <Inventory fontSize="small" />,
            },
            {
                label: 'Foto Final',
                completed: !!evidencias.foto_final,
                icon: <CheckCircle fontSize="small" />,
            },
        ];
    };

    const getStatusColor = (estado: string) => {
        switch (estado) {
            case 'asignada': return 'info';
            case 'en_proceso': return 'warning';
            case 'finalizada': return 'success';
            default: return 'default';
        }
    };

    const formatDate = (date: string | Date) => {
        return new Date(date).toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const progressSteps = getProgressSteps();
    const progressPercentage = getProgressPercentage();

    return (
        <Card sx={{ mb: 2, border: order.estado === 'en_proceso' ? '2px solid #ff9800' : 'none' }}>
            <CardContent>
                {/* Header */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box>
                        <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
                            {order.codigo}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                            Póliza: {order.poliza_number}
                        </Typography>
                    </Box>
                    <Chip
                        label={order.estado}
                        color={getStatusColor(order.estado)}
                        size="small"
                        variant="outlined"
                    />
                </Box>

                {/* Cliente y dirección */}
                <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'medium' }}>
                        {order.cliente}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                        <LocationOn fontSize="small" color="action" />
                        <Typography variant="body2" color="textSecondary">
                            {order.direccion}
                        </Typography>
                    </Box>
                </Box>

                {/* Tipo de trabajo y fechas */}
                <Grid container spacing={2} sx={{ mb: 2 }}>
                    <Grid item xs={6}>
                        <Typography variant="body2" color="textSecondary">
                            Tipo de trabajo
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 'medium', textTransform: 'capitalize' }}>
                            {order.tipo_trabajo}
                        </Typography>
                    </Grid>
                    <Grid item xs={6}>
                        <Typography variant="body2" color="textSecondary">
                            {order.estado === 'asignada' ? 'Asignada' : 'Iniciada'}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Schedule fontSize="small" color="action" />
                            <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                                {formatDate(order.fecha_asignacion || order.fecha_inicio || order.fecha_creacion)}
                            </Typography>
                        </Box>
                    </Grid>
                </Grid>

                {/* Progreso del trabajo (solo si está en proceso) */}
                {order.estado === 'en_proceso' && (
                    <>
                        <Divider sx={{ my: 2 }} />
                        <Box sx={{ mb: 2 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                                    Progreso del Trabajo
                                </Typography>
                                <Typography variant="body2" color="textSecondary">
                                    {Math.round(progressPercentage)}%
                                </Typography>
                            </Box>
                            <LinearProgress
                                variant="determinate"
                                value={progressPercentage}
                                sx={{ mb: 2, height: 6, borderRadius: 3 }}
                            />

                            {/* Pasos del progreso */}
                            <Grid container spacing={1}>
                                {progressSteps.map((step, index) => (
                                    <Grid item xs={3} key={index}>
                                        <Box sx={{ textAlign: 'center' }}>
                                            <Avatar
                                                sx={{
                                                    width: 32,
                                                    height: 32,
                                                    mx: 'auto',
                                                    mb: 0.5,
                                                    bgcolor: step.completed ? 'success.main' : 'grey.300',
                                                    color: step.completed ? 'white' : 'grey.600',
                                                }}
                                            >
                                                {step.icon}
                                            </Avatar>
                                            <Typography
                                                variant="caption"
                                                sx={{
                                                    fontSize: '0.7rem',
                                                    color: step.completed ? 'success.main' : 'text.secondary',
                                                    fontWeight: step.completed ? 'medium' : 'normal',
                                                }}
                                            >
                                                {step.label}
                                            </Typography>
                                        </Box>
                                    </Grid>
                                ))}
                            </Grid>
                        </Box>
                    </>
                )}

                {/* Materiales utilizados */}
                {order.materiales_utilizados && order.materiales_utilizados.length > 0 && (
                    <Box sx={{ mt: 2 }}>
                        <Typography variant="body2" color="textSecondary" gutterBottom>
                            Materiales utilizados: {order.materiales_utilizados.length} items
                        </Typography>
                    </Box>
                )}
            </CardContent>

            <CardActions sx={{ px: 2, pb: 2 }}>
                {order.estado === 'asignada' && (
                    <Button
                        variant="contained"
                        startIcon={<PlayArrow />}
                        onClick={() => onStartWork(order)}
                        fullWidth
                    >
                        Iniciar Trabajo
                    </Button>
                )}

                {order.estado === 'en_proceso' && (
                    <Button
                        variant="contained"
                        startIcon={<Construction />}
                        onClick={() => onUpdateProgress(order)}
                        fullWidth
                        color="warning"
                    >
                        Actualizar Progreso
                    </Button>
                )}

                {order.estado === 'finalizada' && (
                    <Button
                        variant="outlined"
                        startIcon={<CheckCircle />}
                        disabled
                        fullWidth
                    >
                        Trabajo Completado
                    </Button>
                )}
            </CardActions>
        </Card>
    );
};