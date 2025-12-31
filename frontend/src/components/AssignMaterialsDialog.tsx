import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Box,
    Typography,
    Autocomplete,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    IconButton,
    Alert,
    Chip,
} from '@mui/material';
import { Add, Delete } from '@mui/icons-material';
import { apiService } from '../services/apiService';
import { Material } from '../types';

interface AssignMaterialsDialogProps {
    open: boolean;
    onClose: () => void;
    technicianId: string;
    technicianName: string;
}

interface MaterialAssignment {
    material_id: string;
    material: Material;
    cantidad: number;
}

export const AssignMaterialsDialog: React.FC<AssignMaterialsDialogProps> = ({
    open,
    onClose,
    technicianId,
    technicianName,
}) => {
    const queryClient = useQueryClient();
    const [assignments, setAssignments] = useState<MaterialAssignment[]>([]);
    const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);
    const [quantity, setQuantity] = useState<number>(1);
    const [motivo, setMotivo] = useState<string>('');

    // Consulta de materiales disponibles
    const { data: materialsData } = useQuery(
        ['materials'],
        () => apiService.getMaterials()
    );

    // Mutación para asignar materiales
    const assignMaterialsMutation = useMutation(
        (data: any) => apiService.assignMaterials(data),
        {
            onSuccess: () => {
                queryClient.invalidateQueries(['technician-inventory', technicianId]);
                queryClient.invalidateQueries(['inventory-movements', technicianId]);
                onClose();
                resetForm();
            },
        }
    );

    const resetForm = () => {
        setAssignments([]);
        setSelectedMaterial(null);
        setQuantity(1);
        setMotivo('');
    };

    const handleAddMaterial = () => {
        if (!selectedMaterial || quantity <= 0) return;

        // Verificar si el material ya está en la lista
        const existingIndex = assignments.findIndex(
            (assignment) => assignment.material_id === selectedMaterial._id
        );

        if (existingIndex >= 0) {
            // Actualizar cantidad existente
            const updatedAssignments = [...assignments];
            updatedAssignments[existingIndex].cantidad += quantity;
            setAssignments(updatedAssignments);
        } else {
            // Agregar nuevo material
            setAssignments([
                ...assignments,
                {
                    material_id: selectedMaterial._id,
                    material: selectedMaterial,
                    cantidad: quantity,
                },
            ]);
        }

        // Limpiar selección
        setSelectedMaterial(null);
        setQuantity(1);
    };

    const handleRemoveMaterial = (materialId: string) => {
        setAssignments(assignments.filter((assignment) => assignment.material_id !== materialId));
    };

    const handleUpdateQuantity = (materialId: string, newQuantity: number) => {
        if (newQuantity <= 0) {
            handleRemoveMaterial(materialId);
            return;
        }

        setAssignments(
            assignments.map((assignment) =>
                assignment.material_id === materialId
                    ? { ...assignment, cantidad: newQuantity }
                    : assignment
            )
        );
    };

    const handleSubmit = () => {
        if (assignments.length === 0) return;

        const assignData = {
            tecnico_id: technicianId,
            materials: assignments.map((assignment) => ({
                material_id: assignment.material_id,
                cantidad: assignment.cantidad,
            })),
            motivo: motivo || `Asignación de materiales a ${technicianName}`,
        };

        assignMaterialsMutation.mutate(assignData);
    };

    const getTotalItems = () => {
        return assignments.reduce((total, assignment) => total + assignment.cantidad, 0);
    };

    const availableMaterials: Material[] = ((materialsData?.data || []) as Material[]).filter(
        (material: Material) => material.estado === 'activo'
    );

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>
                Asignar Materiales a {technicianName}
            </DialogTitle>
            <DialogContent>
                <Box sx={{ mb: 3 }}>
                    <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                        Seleccione los materiales y cantidades a asignar al técnico.
                    </Typography>

                    {/* Selector de material */}
                    <Box sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'flex-end' }}>
                        <Autocomplete<Material, false, false, false>
                            sx={{ flex: 1 }}
                            options={availableMaterials}
                            getOptionLabel={(option: Material) => `${option.codigo} - ${option.nombre}`}
                            value={selectedMaterial}
                            onChange={(_, newValue) => setSelectedMaterial(newValue)}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Buscar material"
                                    placeholder="Escriba el código o nombre del material"
                                />
                            )}
                            renderOption={(props, option: Material) => {
                                const { key, ...otherProps } = props;
                                return (
                                    <Box component="li" key={key} {...otherProps}>
                                        <Box>
                                            <Typography variant="body1">
                                                <strong>{option.codigo}</strong> - {option.nombre}
                                            </Typography>
                                            <Typography variant="body2" color="textSecondary">
                                                {option.unidad_medida} | {option.categoria}
                                            </Typography>
                                        </Box>
                                    </Box>
                                );
                            }}
                        />
                        <TextField
                            type="number"
                            label="Cantidad"
                            value={quantity}
                            onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                            sx={{ width: 120 }}
                            inputProps={{ min: 1 }}
                        />
                        <Button
                            variant="contained"
                            startIcon={<Add />}
                            onClick={handleAddMaterial}
                            disabled={!selectedMaterial || quantity <= 0}
                        >
                            Agregar
                        </Button>
                    </Box>

                    {/* Motivo */}
                    <TextField
                        fullWidth
                        label="Motivo de asignación"
                        value={motivo}
                        onChange={(e) => setMotivo(e.target.value)}
                        placeholder="Ej: Asignación para orden #123"
                        sx={{ mb: 2 }}
                    />

                    {/* Lista de materiales asignados */}
                    {assignments.length > 0 && (
                        <Box>
                            <Typography variant="h6" sx={{ mb: 1 }}>
                                Materiales a asignar ({assignments.length} tipos, {getTotalItems()} items)
                            </Typography>
                            <TableContainer component={Paper} variant="outlined">
                                <Table size="small">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Código</TableCell>
                                            <TableCell>Material</TableCell>
                                            <TableCell>Cantidad</TableCell>
                                            <TableCell>Unidad</TableCell>
                                            <TableCell>Acciones</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {assignments.map((assignment) => (
                                            <TableRow key={assignment.material_id}>
                                                <TableCell>
                                                    <Chip
                                                        label={assignment.material.codigo}
                                                        size="small"
                                                        color="primary"
                                                        variant="outlined"
                                                    />
                                                </TableCell>
                                                <TableCell>{assignment.material.nombre}</TableCell>
                                                <TableCell>
                                                    <TextField
                                                        type="number"
                                                        value={assignment.cantidad}
                                                        onChange={(e) =>
                                                            handleUpdateQuantity(
                                                                assignment.material_id,
                                                                parseInt(e.target.value) || 0
                                                            )
                                                        }
                                                        size="small"
                                                        sx={{ width: 80 }}
                                                        inputProps={{ min: 1 }}
                                                    />
                                                </TableCell>
                                                <TableCell>{assignment.material.unidad_medida}</TableCell>
                                                <TableCell>
                                                    <IconButton
                                                        size="small"
                                                        color="error"
                                                        onClick={() => handleRemoveMaterial(assignment.material_id)}
                                                    >
                                                        <Delete />
                                                    </IconButton>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Box>
                    )}

                    {assignments.length === 0 && (
                        <Alert severity="info">
                            No hay materiales seleccionados. Use el selector de arriba para agregar materiales.
                        </Alert>
                    )}
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} disabled={assignMaterialsMutation.isLoading}>
                    Cancelar
                </Button>
                <Button
                    variant="contained"
                    onClick={handleSubmit}
                    disabled={assignments.length === 0 || assignMaterialsMutation.isLoading}
                >
                    {assignMaterialsMutation.isLoading ? 'Asignando...' : `Asignar ${getTotalItems()} Items`}
                </Button>
            </DialogActions>
        </Dialog>
    );
};