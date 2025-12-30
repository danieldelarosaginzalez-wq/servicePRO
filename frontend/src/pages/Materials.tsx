import React, { useState, useMemo, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { ColDef, CellValueChangedEvent } from 'ag-grid-community';
import {
    Box,
    Paper,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    MenuItem,
    Chip,
    IconButton,
    Tooltip,
    InputAdornment,
} from '@mui/material';
import { Add, Edit, Delete, Inventory, AttachMoney } from '@mui/icons-material';
import { ExcelGrid } from '../components/ExcelGrid';
import { apiService } from '../services/apiService';
import { useAuth } from '../contexts/AuthContext';
import { Material } from '../../../shared/types';

const Materials: React.FC = () => {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const [selectedMaterials, setSelectedMaterials] = useState<Material[]>([]);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);
    const [formData, setFormData] = useState({
        nombre: '',
        codigo: '',
        descripcion: '',
        unidad_medida: 'unidad',
        costo_unitario: 0,
        categoria: '',
        stock_minimo: 0,
        estado: 'activo' as 'activo' | 'inactivo',
    });

    // Consulta de materiales
    const { data: materialsData, isLoading, refetch } = useQuery(
        ['materials'],
        () => apiService.getMaterials()
    );

    // Mutación para crear/actualizar material
    const saveMaterialMutation = useMutation(
        (data: any) => {
            if (editingMaterial) {
                return apiService.updateMaterial(editingMaterial._id, data);
            } else {
                return apiService.createMaterial(data);
            }
        },
        {
            onSuccess: () => {
                queryClient.invalidateQueries(['materials']);
                setDialogOpen(false);
                resetForm();
            },
        }
    );

    // Mutación para actualización inline
    const updateMaterialMutation = useMutation(
        ({ id, data }: { id: string; data: any }) => apiService.updateMaterial(id, data),
        {
            onSuccess: () => {
                queryClient.invalidateQueries(['materials']);
            },
        }
    );

    // Handlers
    const handleEditMaterial = useCallback((material: Material) => {
        setEditingMaterial(material);
        setFormData({
            nombre: material.nombre,
            codigo: material.codigo,
            descripcion: material.descripcion,
            unidad_medida: material.unidad_medida,
            costo_unitario: material.costo_unitario,
            categoria: material.categoria,
            stock_minimo: material.stock_minimo,
            estado: material.estado,
        });
        setDialogOpen(true);
    }, []);

    const handleDeleteMaterial = useCallback((material: Material) => {
        if (window.confirm(`¿Está seguro de eliminar el material "${material.nombre}"?`)) {
            // Implementar eliminación
            console.log('Eliminar material:', material);
        }
    }, []);

    // Definición de columnas para el grid
    const columnDefs = useMemo<ColDef[]>(() => [
        {
            field: 'codigo',
            headerName: 'Código',
            width: 120,
            pinned: 'left',
            cellRenderer: (params: any) => (
                <strong style={{ color: '#1976d2' }}>{params.value}</strong>
            ),
            editable: user?.rol === 'analista_inventario_oculto',
        },
        {
            field: 'nombre',
            headerName: 'Nombre',
            width: 200,
            filter: 'agTextColumnFilter',
            editable: user?.rol === 'analista_inventario_oculto',
        },
        {
            field: 'descripcion',
            headerName: 'Descripción',
            width: 250,
            filter: 'agTextColumnFilter',
            editable: user?.rol === 'analista_inventario_oculto',
        },
        {
            field: 'categoria',
            headerName: 'Categoría',
            width: 150,
            filter: 'agSetColumnFilter',
            editable: user?.rol === 'analista_inventario_oculto',
        },
        {
            field: 'unidad_medida',
            headerName: 'Unidad',
            width: 100,
            cellEditor: 'agSelectCellEditor',
            cellEditorParams: {
                values: ['unidad', 'metro', 'litro', 'kilogramo', 'caja', 'rollo'],
            },
            editable: user?.rol === 'analista_inventario_oculto',
        },
        {
            field: 'costo_unitario',
            headerName: 'Costo Unit.',
            width: 120,
            valueFormatter: (params) => {
                return params.value ? `$${params.value.toLocaleString()}` : '$0';
            },
            cellRenderer: (params: any) => (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <AttachMoney fontSize="small" color="success" />
                    {params.value ? params.value.toLocaleString() : '0'}
                </Box>
            ),
            editable: user?.rol === 'analista_inventario_oculto',
            cellEditor: 'agNumberCellEditor',
        },
        {
            field: 'stock_minimo',
            headerName: 'Stock Mín.',
            width: 110,
            cellRenderer: (params: any) => (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Inventory fontSize="small" color="warning" />
                    {params.value || 0}
                </Box>
            ),
            editable: user?.rol === 'analista_inventario_oculto',
            cellEditor: 'agNumberCellEditor',
        },
        {
            field: 'estado',
            headerName: 'Estado',
            width: 100,
            cellRenderer: (params: any) => (
                <Chip
                    label={params.value}
                    color={params.value === 'activo' ? 'success' : 'default'}
                    size="small"
                    variant="outlined"
                />
            ),
            cellEditor: 'agSelectCellEditor',
            cellEditorParams: {
                values: ['activo', 'inactivo'],
            },
            editable: user?.rol === 'analista_inventario_oculto',
        },
        {
            field: 'acciones',
            headerName: 'Acciones',
            width: 120,
            cellRenderer: (params: any) => (
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                    {user?.rol === 'analista_inventario_oculto' && (
                        <>
                            <Tooltip title="Editar">
                                <IconButton size="small" onClick={() => handleEditMaterial(params.data)}>
                                    <Edit fontSize="small" />
                                </IconButton>
                            </Tooltip>

                            <Tooltip title="Eliminar">
                                <IconButton
                                    size="small"
                                    onClick={() => handleDeleteMaterial(params.data)}
                                    color="error"
                                >
                                    <Delete fontSize="small" />
                                </IconButton>
                            </Tooltip>
                        </>
                    )}
                </Box>
            ),
            sortable: false,
            filter: false,
        },
    ], [user, handleEditMaterial, handleDeleteMaterial]);

    const handleCellValueChanged = useCallback((event: CellValueChangedEvent) => {
        if (user?.rol === 'analista_inventario_oculto') {
            const { data, colDef, newValue } = event;
            updateMaterialMutation.mutate({
                id: data._id,
                data: { [colDef.field!]: newValue },
            });
        }
    }, [user, updateMaterialMutation]);

    const resetForm = useCallback(() => {
        setFormData({
            nombre: '',
            codigo: '',
            descripcion: '',
            unidad_medida: 'unidad',
            costo_unitario: 0,
            categoria: '',
            stock_minimo: 0,
            estado: 'activo',
        });
        setEditingMaterial(null);
    }, []);

    const handleCreateMaterial = useCallback(() => {
        setEditingMaterial(null);
        resetForm();
        setDialogOpen(true);
    }, [resetForm]);

    const handleSaveMaterial = useCallback(() => {
        saveMaterialMutation.mutate(formData);
    }, [formData, saveMaterialMutation]);

    const handleInputChange = useCallback((field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    }, []);

    return (
        <Box sx={{ p: 3 }}>
            <Paper sx={{ p: 2 }}>
                <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                        {user?.rol === 'analista_inventario_oculto' && (
                            <Button
                                variant="contained"
                                startIcon={<Add />}
                                onClick={handleCreateMaterial}
                                sx={{ mr: 2 }}
                            >
                                Nuevo Material
                            </Button>
                        )}
                    </Box>
                </Box>

                <ExcelGrid
                    data={materialsData?.data || []}
                    columns={columnDefs}
                    title="Catálogo de Materiales"
                    onCellValueChanged={handleCellValueChanged}
                    onRowSelected={setSelectedMaterials}
                    enableEdit={user?.rol === 'analista_inventario_oculto'}
                    enableExport={true}
                    loading={isLoading}
                    onRefresh={refetch}
                    height="calc(100vh - 250px)"
                />
            </Paper>

            {/* Diálogo de edición/creación */}
            <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
                <DialogTitle>
                    {editingMaterial ? 'Editar Material' : 'Nuevo Material'}
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mt: 1 }}>
                        <TextField
                            label="Código"
                            value={formData.codigo}
                            onChange={(e) => handleInputChange('codigo', e.target.value)}
                            required
                        />
                        <TextField
                            label="Nombre"
                            value={formData.nombre}
                            onChange={(e) => handleInputChange('nombre', e.target.value)}
                            required
                        />
                        <TextField
                            label="Descripción"
                            value={formData.descripcion}
                            onChange={(e) => handleInputChange('descripcion', e.target.value)}
                            multiline
                            rows={2}
                            sx={{ gridColumn: '1 / -1' }}
                        />
                        <TextField
                            label="Categoría"
                            value={formData.categoria}
                            onChange={(e) => handleInputChange('categoria', e.target.value)}
                        />
                        <TextField
                            select
                            label="Unidad de Medida"
                            value={formData.unidad_medida}
                            onChange={(e) => handleInputChange('unidad_medida', e.target.value)}
                        >
                            <MenuItem value="unidad">Unidad</MenuItem>
                            <MenuItem value="metro">Metro</MenuItem>
                            <MenuItem value="litro">Litro</MenuItem>
                            <MenuItem value="kilogramo">Kilogramo</MenuItem>
                            <MenuItem value="caja">Caja</MenuItem>
                            <MenuItem value="rollo">Rollo</MenuItem>
                        </TextField>
                        <TextField
                            label="Costo Unitario"
                            type="number"
                            value={formData.costo_unitario}
                            onChange={(e) => handleInputChange('costo_unitario', parseFloat(e.target.value) || 0)}
                            InputProps={{
                                startAdornment: <InputAdornment position="start">$</InputAdornment>,
                            }}
                        />
                        <TextField
                            label="Stock Mínimo"
                            type="number"
                            value={formData.stock_minimo}
                            onChange={(e) => handleInputChange('stock_minimo', parseInt(e.target.value) || 0)}
                        />
                        <TextField
                            select
                            label="Estado"
                            value={formData.estado}
                            onChange={(e) => handleInputChange('estado', e.target.value)}
                        >
                            <MenuItem value="activo">Activo</MenuItem>
                            <MenuItem value="inactivo">Inactivo</MenuItem>
                        </TextField>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDialogOpen(false)}>Cancelar</Button>
                    <Button
                        variant="contained"
                        onClick={handleSaveMaterial}
                        disabled={saveMaterialMutation.isLoading}
                    >
                        {editingMaterial ? 'Actualizar' : 'Crear'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default Materials;