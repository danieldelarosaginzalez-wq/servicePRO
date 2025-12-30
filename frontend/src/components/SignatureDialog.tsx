import React, { useRef, useState } from 'react';
import { useMutation, useQueryClient } from 'react-query';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Box,
    TextField,
    Typography,
    ToggleButton,
    ToggleButtonGroup,
    Alert,
} from '@mui/material';
import { Draw, Clear, Save } from '@mui/icons-material';
import SignatureCanvas from 'react-signature-canvas';
import { apiService } from '../services/apiService';

interface SignatureDialogProps {
    open: boolean;
    onClose: () => void;
    reportId: string;
}

export const SignatureDialog: React.FC<SignatureDialogProps> = ({
    open,
    onClose,
    reportId,
}) => {
    const queryClient = useQueryClient();
    const sigCanvas = useRef<SignatureCanvas>(null);
    const [signatureType, setSignatureType] = useState<string>('operario');
    const [nombre, setNombre] = useState('');
    const [documento, setDocumento] = useState('');
    const [cargo, setCargo] = useState('');
    const [error, setError] = useState('');

    const signatureMutation = useMutation(
        (data: any) => apiService.post(`/visit-reports/${reportId}/signature`, data),
        {
            onSuccess: () => {
                queryClient.invalidateQueries(['visit-reports']);
                handleClose();
            },
            onError: (err: any) => {
                setError(err.response?.data?.message || 'Error al guardar firma');
            },
        }
    );

    const handleClear = () => {
        sigCanvas.current?.clear();
    };

    const handleSave = () => {
        if (!sigCanvas.current || sigCanvas.current.isEmpty()) {
            setError('Por favor, dibuje su firma');
            return;
        }

        if (!nombre.trim()) {
            setError('El nombre es requerido');
            return;
        }

        const firmaImagen = sigCanvas.current.toDataURL('image/png');

        signatureMutation.mutate({
            tipo: signatureType,
            nombre,
            documento,
            cargo,
            firma_imagen: firmaImagen,
        });
    };

    const handleClose = () => {
        sigCanvas.current?.clear();
        setNombre('');
        setDocumento('');
        setCargo('');
        setError('');
        onClose();
    };

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
            <DialogTitle>
                <Draw sx={{ mr: 1, verticalAlign: 'middle' }} />
                Capturar Firma
            </DialogTitle>
            <DialogContent>
                {error && (
                    <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
                        {error}
                    </Alert>
                )}

                <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                        Tipo de Firma
                    </Typography>
                    <ToggleButtonGroup
                        value={signatureType}
                        exclusive
                        onChange={(_, value) => value && setSignatureType(value)}
                        size="small"
                        fullWidth
                    >
                        <ToggleButton value="operario">Operario</ToggleButton>
                        <ToggleButton value="usuario_suscriptor">Cliente</ToggleButton>
                        <ToggleButton value="funcionario">Funcionario</ToggleButton>
                        <ToggleButton value="testigo">Testigo</ToggleButton>
                    </ToggleButtonGroup>
                </Box>

                <TextField
                    label="Nombre Completo"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    fullWidth
                    required
                    sx={{ mb: 2 }}
                />

                {(signatureType === 'usuario_suscriptor' || signatureType === 'testigo') && (
                    <TextField
                        label="Documento de Identidad"
                        value={documento}
                        onChange={(e) => setDocumento(e.target.value)}
                        fullWidth
                        sx={{ mb: 2 }}
                    />
                )}

                {signatureType === 'funcionario' && (
                    <TextField
                        label="Cargo"
                        value={cargo}
                        onChange={(e) => setCargo(e.target.value)}
                        fullWidth
                        sx={{ mb: 2 }}
                    />
                )}

                <Typography variant="subtitle2" gutterBottom>
                    Firma
                </Typography>
                <Box
                    sx={{
                        border: '2px dashed #ccc',
                        borderRadius: 1,
                        bgcolor: '#fafafa',
                        mb: 1,
                    }}
                >
                    <SignatureCanvas
                        ref={sigCanvas}
                        canvasProps={{
                            width: 450,
                            height: 200,
                            style: { width: '100%', height: '200px' },
                        }}
                        backgroundColor="white"
                    />
                </Box>
                <Button
                    size="small"
                    startIcon={<Clear />}
                    onClick={handleClear}
                >
                    Limpiar
                </Button>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose}>Cancelar</Button>
                <Button
                    variant="contained"
                    startIcon={<Save />}
                    onClick={handleSave}
                    disabled={signatureMutation.isLoading}
                >
                    Guardar Firma
                </Button>
            </DialogActions>
        </Dialog>
    );
};
