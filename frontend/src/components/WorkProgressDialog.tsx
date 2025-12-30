import React, { useState, useRef } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Stepper,
    Step,
    StepLabel,
    Box,
    Typography,
    Card,
    CardContent,
    Grid,
    TextField,
    IconButton,
    Chip,
    Alert,
    CircularProgress,
    Fab,
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
    LinearProgress,
} from '@mui/material';
import {
    PhotoCamera,
    Add,
    Delete,
    CheckCircle,
    Construction,
    Inventory,
    Landscape,
    CompressOutlined,
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { apiService } from '../services/apiService';
import { useAuth } from '../contexts/AuthContext';
import { compressToSize, getImageSizeKB } from '../utils/imageUtils';

interface WorkProgressDialogProps {
    open: boolean;
    onClose: () => void;
    orderId: string;
    orderData?: any;
}

interface MaterialConsumed {
    material_id: string;
    material_name: string;
    cantidad: number;
    unidad_medida: string;
}

const steps = [
    {
        label: 'Foto Inicial',
        description: 'Captura el estado inicial del sitio de trabajo',
        icon: <PhotoCamera />,
        fase: 'inicial'
    },
    {
        label: 'Durante el Trabajo',
        description: 'Documenta el progreso del trabajo',
        icon: <Construction />,
        fase: 'durante'
    },
    {
        label: 'Materiales Gastados',
        description: 'Registra los materiales utilizados',
        icon: <Inventory />,
        fase: 'materiales'
    },
    {
        label: 'Foto Final',
        description: 'Captura el resultado final sin escombros',
        icon: <Landscape />,
        fase: 'final'
    },
];

export const WorkProgressDialog: React.FC<WorkProgressDialogProps> = ({
    open,
    onClose,
    orderId,
    orderData,
}) => {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const [activeStep, setActiveStep] = useState(0);
    const [photos, setPhotos] = useState<{ [key: string]: string }>({});
    const [materialsConsumed, setMaterialsConsumed] = useState<MaterialConsumed[]>([]);
    const [newMaterial, setNewMaterial] = useState({
        material_id: '',
        cantidad: 0,
    });
    const [loading, setLoading] = useState(false);
    const [compressing, setCompressing] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Consultar inventario del técnico
    const { data: inventoryData } = useQuery(
        ['my-inventory'],
        () => apiService.getMyInventory(),
        {
            enabled: open && user?.rol === 'tecnico',
        }
    );

    // Mutación para actualizar progreso
    const updateProgressMutation = useMutation(
        (progressData: any) => apiService.updateWorkProgress(orderId, progressData),
        {
            onSuccess: () => {
                queryClient.invalidateQueries(['order', orderId]);
                queryClient.invalidateQueries(['orders']);
            },
        }
    );

    // Mutación para consumir materiales
    const consumeMaterialsMutation = useMutation(
        (data: any) => apiService.consumeMaterials(orderData?.tecnico_id?._id || orderData?.tecnico_id || user?._id || '', data),
        {
            onSuccess: () => {
                queryClient.invalidateQueries(['my-inventory']);
                queryClient.invalidateQueries(['inventory-movements']);
            },
        }
    );

    const handlePhotoCapture = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setCompressing(true);
        try {
            // Comprimir imagen a máximo 80KB (ultra pequeño)
            const compressedImage = await compressToSize(file, 80);
            const sizeKB = getImageSizeKB(compressedImage);

            console.log(`Imagen comprimida: ${sizeKB}KB`);

            const currentStep = steps[activeStep];
            setPhotos(prev => ({
                ...prev,
                [currentStep.fase]: compressedImage,
            }));
        } catch (error) {
            console.error('Error comprimiendo imagen:', error);
            alert('Error al procesar la imagen. Intenta con una imagen más pequeña.');
        } finally {
            setCompressing(false);
            // Limpiar el input para permitir seleccionar la misma imagen nuevamente
            if (event.target) {
                event.target.value = '';
            }
        }
    };

    const handleAddMaterial = () => {
        if (!newMaterial.material_id || newMaterial.cantidad <= 0) return;

        const material = inventoryData?.data?.materials?.find(
            (m: any) => m.material_id === newMaterial.material_id
        ) as any;

        if (!material) return;

        // Verificar stock disponible
        if (material.cantidad_disponible < newMaterial.cantidad) {
            alert(`Stock insuficiente. Disponible: ${material.cantidad_disponible}`);
            return;
        }

        const materialConsumed: MaterialConsumed = {
            material_id: newMaterial.material_id,
            material_name: material.material?.nombre || 'Material desconocido',
            cantidad: newMaterial.cantidad,
            unidad_medida: material.material?.unidad_medida || 'unidad',
        };

        setMaterialsConsumed(prev => [...prev, materialConsumed]);
        setNewMaterial({ material_id: '', cantidad: 0 });
    };

    const handleRemoveMaterial = (index: number) => {
        setMaterialsConsumed(prev => prev.filter((_, i) => i !== index));
    };

    const handleStepSubmit = async () => {
        setLoading(true);
        try {
            const currentStep = steps[activeStep];
            const progressData: any = {
                fase: currentStep.fase,
            };

            // Agregar foto si existe
            if (photos[currentStep.fase]) {
                const imageSize = getImageSizeKB(photos[currentStep.fase]);
                console.log(`📸 Enviando imagen de ${imageSize}KB para fase ${currentStep.fase}`);
                progressData[`foto_${currentStep.fase}`] = photos[currentStep.fase];
            }
            // El backend registrará la fase como completada automáticamente

            // Si es la fase de materiales, agregar materiales consumidos
            if (currentStep.fase === 'materiales' && materialsConsumed.length > 0) {
                progressData.materiales_consumidos = materialsConsumed.map(m => ({
                    material_id: m.material_id,
                    cantidad: m.cantidad,
                }));

                // Consumir materiales del inventario
                console.log('Consumiendo materiales del inventario...');
                await consumeMaterialsMutation.mutateAsync({
                    materials: progressData.materiales_consumidos,
                    order_id: orderId,
                });
            }

            // Actualizar progreso de la orden
            console.log('📤 Enviando progressData:', progressData);
            await updateProgressMutation.mutateAsync(progressData);
            console.log('✅ Progreso actualizado exitosamente');

            // Avanzar al siguiente paso o cerrar si es el último
            if (activeStep < steps.length - 1) {
                setActiveStep(prev => prev + 1);
            } else {
                // Último paso completado
                onClose();
            }
        } catch (error) {
            console.error('Error actualizando progreso:', error);

            // Mostrar mensaje de error más específico
            if (error instanceof Error) {
                if (error.message.includes('404') || error.message.includes('Not Found')) {
                    alert('El endpoint de progreso no está disponible. Asegúrate de que el backend esté ejecutándose con la versión más reciente.');
                } else if (error.message.includes('413') || error.message.includes('Payload Too Large')) {
                    alert('La imagen es demasiado grande. Intenta con una imagen más pequeña o de menor calidad.');
                } else if (error.message.includes('Stock insuficiente')) {
                    alert(error.message);
                } else {
                    alert('Error al actualizar el progreso. Intenta nuevamente.');
                }
            } else {
                alert('Error al actualizar el progreso. Intenta nuevamente.');
            }
        } finally {
            setLoading(false);
        }
    };

    const canProceed = () => {
        const currentStep = steps[activeStep];

        // Para fotos, debe haber una foto capturada
        if (['inicial', 'durante', 'final'].includes(currentStep.fase)) {
            return !!photos[currentStep.fase];
        }

        // Para materiales, debe haber al menos un material o foto de materiales
        if (currentStep.fase === 'materiales') {
            return materialsConsumed.length > 0 || !!photos[currentStep.fase];
        }

        return false;
    };

    const getCurrentStepContent = () => {
        const currentStep = steps[activeStep];

        if (['inicial', 'durante', 'final'].includes(currentStep.fase)) {
            return (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="h6" gutterBottom>
                        {currentStep.description}
                    </Typography>

                    {photos[currentStep.fase] ? (
                        <Box sx={{ mb: 3 }}>
                            <img
                                src={photos[currentStep.fase]}
                                alt={`Foto ${currentStep.fase}`}
                                style={{
                                    maxWidth: '100%',
                                    maxHeight: '300px',
                                    borderRadius: '8px',
                                    boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                                }}
                            />
                            <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
                                <Chip
                                    icon={<CheckCircle />}
                                    label="Foto capturada"
                                    color="success"
                                />
                                <Chip
                                    icon={<CompressOutlined />}
                                    label={`${getImageSizeKB(photos[currentStep.fase])}KB`}
                                    size="small"
                                    variant="outlined"
                                />
                            </Box>
                        </Box>
                    ) : (
                        <Box sx={{ mb: 3 }}>
                            {compressing ? (
                                <Box sx={{ textAlign: 'center' }}>
                                    <CircularProgress size={60} />
                                    <Typography variant="body2" sx={{ mt: 2 }}>
                                        Comprimiendo imagen...
                                    </Typography>
                                </Box>
                            ) : (
                                <>
                                    <Fab
                                        color="primary"
                                        size="large"
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        <PhotoCamera />
                                    </Fab>
                                    <Typography variant="body2" sx={{ mt: 2 }}>
                                        Toca para capturar foto
                                    </Typography>
                                </>
                            )}
                        </Box>
                    )}

                    <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        ref={fileInputRef}
                        style={{ display: 'none' }}
                        onChange={handlePhotoCapture}
                    />
                </Box>
            );
        }

        if (currentStep.fase === 'materiales') {
            return (
                <Box sx={{ py: 2 }}>
                    <Typography variant="h6" gutterBottom>
                        Registrar Materiales Utilizados
                    </Typography>

                    {/* Agregar nuevo material */}
                    <Card sx={{ mb: 3 }}>
                        <CardContent>
                            <Typography variant="subtitle1" gutterBottom>
                                Agregar Material
                            </Typography>
                            <Grid container spacing={2} alignItems="center">
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        select
                                        fullWidth
                                        label="Material"
                                        value={newMaterial.material_id}
                                        onChange={(e) => setNewMaterial(prev => ({
                                            ...prev,
                                            material_id: e.target.value
                                        }))}
                                        SelectProps={{ native: true }}
                                    >
                                        <option value="">Seleccionar material</option>
                                        {inventoryData?.data?.materials?.map((material: any) => (
                                            <option key={material.material_id} value={material.material_id}>
                                                {material.material?.nombre || 'Material desconocido'} (Disponible: {material.cantidad_disponible})
                                            </option>
                                        ))}
                                    </TextField>
                                </Grid>
                                <Grid item xs={12} sm={4}>
                                    <TextField
                                        type="number"
                                        fullWidth
                                        label="Cantidad"
                                        value={newMaterial.cantidad}
                                        onChange={(e) => setNewMaterial(prev => ({
                                            ...prev,
                                            cantidad: parseInt(e.target.value) || 0
                                        }))}
                                        InputProps={{
                                            inputProps: { min: 1 }
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={2}>
                                    <Button
                                        variant="contained"
                                        startIcon={<Add />}
                                        onClick={handleAddMaterial}
                                        disabled={!newMaterial.material_id || newMaterial.cantidad <= 0}
                                        fullWidth
                                    >
                                        Agregar
                                    </Button>
                                </Grid>
                            </Grid>
                        </CardContent>
                    </Card>

                    {/* Lista de materiales agregados */}
                    {materialsConsumed.length > 0 && (
                        <Card sx={{ mb: 3 }}>
                            <CardContent>
                                <Typography variant="subtitle1" gutterBottom>
                                    Materiales a Consumir
                                </Typography>
                                <List>
                                    {materialsConsumed.map((material, index) => (
                                        <ListItem key={index}>
                                            <ListItemText
                                                primary={material.material_name}
                                                secondary={`${material.cantidad} ${material.unidad_medida}`}
                                            />
                                            <ListItemSecondaryAction>
                                                <IconButton
                                                    edge="end"
                                                    onClick={() => handleRemoveMaterial(index)}
                                                    color="error"
                                                >
                                                    <Delete />
                                                </IconButton>
                                            </ListItemSecondaryAction>
                                        </ListItem>
                                    ))}
                                </List>
                            </CardContent>
                        </Card>
                    )}

                    {/* Foto de materiales */}
                    <Card>
                        <CardContent>
                            <Typography variant="subtitle1" gutterBottom>
                                Foto de Materiales en el Predio
                            </Typography>
                            {photos[currentStep.fase] ? (
                                <Box sx={{ textAlign: 'center' }}>
                                    <img
                                        src={photos[currentStep.fase]}
                                        alt="Materiales en predio"
                                        style={{
                                            maxWidth: '100%',
                                            maxHeight: '200px',
                                            borderRadius: '8px',
                                        }}
                                    />
                                    <Box sx={{ mt: 1, display: 'flex', justifyContent: 'center', gap: 1 }}>
                                        <Chip
                                            icon={<CheckCircle />}
                                            label="Foto capturada"
                                            color="success"
                                            size="small"
                                        />
                                        <Chip
                                            icon={<CompressOutlined />}
                                            label={`${getImageSizeKB(photos[currentStep.fase])}KB`}
                                            size="small"
                                            variant="outlined"
                                        />
                                    </Box>
                                </Box>
                            ) : (
                                <Box sx={{ textAlign: 'center', py: 2 }}>
                                    {compressing ? (
                                        <Box>
                                            <CircularProgress size={40} />
                                            <Typography variant="body2" sx={{ mt: 1 }}>
                                                Comprimiendo...
                                            </Typography>
                                        </Box>
                                    ) : (
                                        <Button
                                            variant="outlined"
                                            startIcon={<PhotoCamera />}
                                            onClick={() => fileInputRef.current?.click()}
                                        >
                                            Capturar Foto de Materiales
                                        </Button>
                                    )}
                                </Box>
                            )}
                        </CardContent>
                    </Card>

                    <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        ref={fileInputRef}
                        style={{ display: 'none' }}
                        onChange={handlePhotoCapture}
                    />
                </Box>
            );
        }

        return null;
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="md"
            fullWidth
            PaperProps={{
                sx: { minHeight: '70vh' }
            }}
        >
            <DialogTitle>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Construction />
                    <Box>
                        <Typography variant="h6">
                            Progreso de Trabajo
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                            {orderData?.codigo} - {orderData?.cliente}
                        </Typography>
                    </Box>
                </Box>
            </DialogTitle>

            <DialogContent>
                <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
                    {steps.map((step, index) => (
                        <Step key={step.label}>
                            <StepLabel
                                icon={step.icon}
                                optional={
                                    index === steps.length - 1 ? (
                                        <Typography variant="caption">Último paso</Typography>
                                    ) : null
                                }
                            >
                                {step.label}
                            </StepLabel>
                        </Step>
                    ))}
                </Stepper>

                {getCurrentStepContent()}

                {(updateProgressMutation.isError || consumeMaterialsMutation.isError) && (
                    <Alert severity="error" sx={{ mt: 2 }}>
                        {updateProgressMutation.error instanceof Error &&
                            updateProgressMutation.error.message.includes('413') ?
                            'La imagen es demasiado grande. Intenta con una imagen más pequeña.' :
                            'Error al procesar la información. Intenta nuevamente.'
                        }
                    </Alert>
                )}

                {loading && (
                    <Box sx={{ mt: 2 }}>
                        <LinearProgress />
                        <Typography variant="body2" sx={{ mt: 1, textAlign: 'center' }}>
                            {updateProgressMutation.isLoading ? 'Enviando información...' :
                                consumeMaterialsMutation.isLoading ? 'Actualizando inventario...' :
                                    'Procesando...'}
                        </Typography>
                    </Box>
                )}
            </DialogContent>

            <DialogActions sx={{ p: 3 }}>
                <Button onClick={onClose} disabled={loading}>
                    Cancelar
                </Button>
                <Button
                    variant="contained"
                    onClick={handleStepSubmit}
                    disabled={!canProceed() || loading || compressing}
                    startIcon={loading ? <CircularProgress size={20} /> : null}
                >
                    {activeStep === steps.length - 1 ? 'Finalizar' : 'Siguiente'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};