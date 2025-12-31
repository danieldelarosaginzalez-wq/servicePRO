import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Box,
    Alert,
    CircularProgress,
} from '@mui/material';
import { Send as SendIcon } from '@mui/icons-material';
import apiService from '../services/apiService';
import notificationService from '../services/notificationService';

interface User {
    _id: string;
    nombre: string;
    email: string;
    rol: string;
}

interface SendMessageDialogProps {
    open: boolean;
    onClose: () => void;
    preselectedUserId?: string;
}

const SendMessageDialog: React.FC<SendMessageDialogProps> = ({
    open,
    onClose,
    preselectedUserId,
}) => {
    const [users, setUsers] = useState<User[]>([]);
    const [selectedUserId, setSelectedUserId] = useState(preselectedUserId || '');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (open) {
            loadUsers();
            setSelectedUserId(preselectedUserId || '');
            setMessage('');
            setError('');
            setSuccess(false);
        }
    }, [open, preselectedUserId]);

    const loadUsers = async () => {
        try {
            const response = await apiService.get<{ data: User[] }>('/users');
            setUsers(response.data.data || []);
        } catch (err) {
            console.error('Error loading users:', err);
        }
    };

    const handleSend = async () => {
        if (!selectedUserId || !message.trim()) {
            setError('Selecciona un destinatario y escribe un mensaje');
            return;
        }

        try {
            setLoading(true);
            setError('');
            await notificationService.sendDirectMessage(selectedUserId, message.trim());
            setSuccess(true);
            setTimeout(() => {
                onClose();
            }, 1500);
        } catch (err: any) {
            setError(err.message || 'Error al enviar el mensaje');
        } finally {
            setLoading(false);
        }
    };

    const getRolLabel = (rol: string) => {
        const labels: Record<string, string> = {
            analista: 'Analista',
            tecnico: 'Técnico',
            analista_inventario_oculto: 'Analista Inventario',
        };
        return labels[rol] || rol;
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>Enviar Mensaje</DialogTitle>
            <DialogContent>
                <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {error && <Alert severity="error">{error}</Alert>}
                    {success && <Alert severity="success">Mensaje enviado correctamente</Alert>}

                    <FormControl fullWidth>
                        <InputLabel>Destinatario</InputLabel>
                        <Select
                            value={selectedUserId}
                            onChange={(e) => setSelectedUserId(e.target.value)}
                            label="Destinatario"
                            disabled={loading || !!preselectedUserId}
                        >
                            {users.map((user) => (
                                <MenuItem key={user._id} value={user._id}>
                                    {user.nombre} ({getRolLabel(user.rol)})
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <TextField
                        label="Mensaje"
                        multiline
                        rows={4}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Escribe tu mensaje aquí..."
                        disabled={loading}
                        fullWidth
                    />
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} disabled={loading}>
                    Cancelar
                </Button>
                <Button
                    onClick={handleSend}
                    variant="contained"
                    disabled={loading || !selectedUserId || !message.trim()}
                    startIcon={loading ? <CircularProgress size={20} /> : <SendIcon />}
                >
                    {loading ? 'Enviando...' : 'Enviar'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default SendMessageDialog;
