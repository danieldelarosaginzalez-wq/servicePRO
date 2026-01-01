import React, { useState, useCallback, useMemo } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Box,
    Typography,
    Stepper,
    Step,
    StepLabel,
    TextField,
    MenuItem,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Chip,
    Alert,
    LinearProgress,
    IconButton,
    Tooltip,
    FormControlLabel,
    Checkbox,
} from '@mui/material';
import {
    CloudUpload,
    CheckCircle,
    Warning,
    Error as ErrorIcon,
    Delete,
    Refresh,
    Save,
} from '@mui/icons-material';
import * as XLSX from 'xlsx';
import { useMutation, useQueryClient } from 'react-query';
import { apiService } from '../services/apiService';

// Definición de esquemas de importación para cada entidad
const IMPORT_SCHEMAS = {
    polizas: {
        name: 'Pólizas',
        fields: [
            { key: 'poliza_number', label: 'Número de Póliza', required: true, type: 'string' },
            { key: 'cliente', label: 'Cliente', required: true, type: 'string' },
            { key: 'descripcion', label: 'Descripción', required: false, type: 'string' },
            { key: 'direccion', label: 'Dirección', required: true, type: 'string' },
            { key: 'ubicacion.lat', label: 'Latitud', required: false, type: 'number' },
            { key: 'ubicacion.lng', label: 'Longitud', required: false, type: 'number' },
            { key: 'estado', label: 'Estado', required: false, type: 'enum', options: ['activo', 'anulada'], default: 'activo' },
            { key: 'metadata.costo_maximo', label: 'Costo Máximo', required: false, type: 'number' },
        ],
        endpoint: '/polizas',
        uniqueKey: 'poliza_number',
    },
    materials: {
        name: 'Materiales',
        fields: [
            { key: 'codigo', label: 'Código', required: true, type: 'string' },
            { key: 'nombre', label: 'Nombre', required: true, type: 'string' },
            { key: 'descripcion', label: 'Descripción', required: false, type: 'string' },
            { key: 'categoria', label: 'Categoría', required: false, type: 'string' },
            { key: 'unidad_medida', label: 'Unidad de Medida', required: true, type: 'enum', options: ['unidad', 'metro', 'litro', 'kilogramo', 'caja', 'rollo'], default: 'unidad' },
            { key: 'stock_actual', label: 'Stock Actual', required: false, type: 'number', default: 0 },
            { key: 'stock_minimo', label: 'Stock Mínimo', required: false, type: 'number', default: 10 },
            { key: 'precio_unitario', label: 'Precio Unitario', required: false, type: 'number' },
            { key: 'estado', label: 'Estado', required: false, type: 'enum', options: ['activo', 'inactivo'], default: 'activo' },
        ],
        endpoint: '/materials',
        uniqueKey: 'codigo',
    },
    orders: {
        name: 'Órdenes de Trabajo',
        fields: [
            { key: 'poliza_number', label: 'Número de Póliza', required: true, type: 'string' },
            { key: 'cliente', label: 'Cliente', required: true, type: 'string' },
            { key: 'direccion', label: 'Dirección', required: true, type: 'string' },
            { key: 'tipo_trabajo', label: 'Tipo de Trabajo', required: true, type: 'enum', options: ['instalacion', 'mantenimiento', 'reparacion', 'inspeccion'] },
            { key: 'descripcion', label: 'Descripción', required: false, type: 'string' },
            { key: 'prioridad', label: 'Prioridad', required: false, type: 'enum', options: ['baja', 'media', 'alta', 'urgente'], default: 'media' },
            { key: 'ubicacion.lat', label: 'Latitud', required: false, type: 'number' },
            { key: 'ubicacion.lng', label: 'Longitud', required: false, type: 'number' },
        ],
        endpoint: '/orders',
        uniqueKey: null,
    },
    users: {
        name: 'Usuarios',
        fields: [
            { key: 'nombre', label: 'Nombre', required: true, type: 'string' },
            { key: 'email', label: 'Email', required: true, type: 'email' },
            { key: 'password', label: 'Contraseña', required: true, type: 'string' },
            { key: 'rol', label: 'Rol', required: true, type: 'enum', options: ['analista', 'tecnico', 'analista_inventario_oculto'] },
            { key: 'estado', label: 'Estado', required: false, type: 'enum', options: ['activo', 'inactivo'], default: 'activo' },
        ],
        endpoint: '/users',
        uniqueKey: 'email',
    },
};

type SchemaKey = keyof typeof IMPORT_SCHEMAS;
type FieldMapping = { [excelColumn: string]: string };

interface ImportRow {
    original: any;
    mapped: any;
    status: 'valid' | 'warning' | 'error';
    errors: string[];
}

interface ExcelImporterProps {
    open: boolean;
    onClose: () => void;
    defaultSchema?: SchemaKey;
}

const BATCH_SIZE = 50; // Procesar en lotes para no sobrecargar

export const ExcelImporter: React.FC<ExcelImporterProps> = ({ open, onClose, defaultSchema }) => {
    const queryClient = useQueryClient();
    const [activeStep, setActiveStep] = useState(0);
    const [selectedSchema, setSelectedSchema] = useState<SchemaKey | ''>(defaultSchema || '');
    const [excelData, setExcelData] = useState<any[]>([]);
    const [excelColumns, setExcelColumns] = useState<string[]>([]);
    const [fieldMapping, setFieldMapping] = useState<FieldMapping>({});
    const [processedRows, setProcessedRows] = useState<ImportRow[]>([]);
    const [importing, setImporting] = useState(false);
    const [importProgress, setImportProgress] = useState(0);
    const [importResults, setImportResults] = useState<{ success: number; errors: number; messages: string[] }>({ success: 0, errors: 0, messages: [] });
    const [updateExisting, setUpdateExisting] = useState(false);
    const [fileName, setFileName] = useState('');

    const steps = ['Seleccionar Destino', 'Cargar Excel', 'Mapear Campos', 'Previsualizar', 'Importar'];

    const currentSchema = selectedSchema ? IMPORT_SCHEMAS[selectedSchema] : null;

    // Leer archivo Excel (solo primeras 1000 filas para preview)
    const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setFileName(file.name);
        const reader = new FileReader();

        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target?.result as ArrayBuffer);
                const workbook = XLSX.read(data, { type: 'array' });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];

                // Convertir a JSON (limitar a 1000 filas para preview)
                const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });

                if (jsonData.length < 2) {
                    alert('El archivo debe tener al menos una fila de encabezados y una de datos');
                    return;
                }

                // Primera fila son los encabezados
                const headers = (jsonData[0] as string[]).map(h => String(h).trim());
                const rows = jsonData.slice(1, 1001).map(row => {
                    const obj: any = {};
                    headers.forEach((header, index) => {
                        obj[header] = (row as any[])[index];
                    });
                    return obj;
                });

                setExcelColumns(headers.filter(h => h)); // Filtrar columnas vacías
                setExcelData(rows);

                // Auto-mapear campos por similitud
                autoMapFields(headers);

                setActiveStep(2);
            } catch (error) {
                console.error('Error leyendo Excel:', error);
                alert('Error al leer el archivo. Asegúrate de que sea un archivo Excel válido.');
            }
        };

        reader.readAsArrayBuffer(file);
    }, []);

    // Auto-mapear campos basado en similitud de nombres
    const autoMapFields = useCallback((headers: string[]) => {
        if (!currentSchema) return;

        const newMapping: FieldMapping = {};

        headers.forEach(header => {
            const headerLower = header.toLowerCase().replace(/[_\s-]/g, '');

            // Buscar coincidencia en los campos del schema
            for (const field of currentSchema.fields) {
                const fieldLower = field.key.toLowerCase().replace(/[._\s-]/g, '');
                const labelLower = field.label.toLowerCase().replace(/[_\s-]/g, '');

                // Coincidencia exacta o parcial
                if (headerLower === fieldLower ||
                    headerLower === labelLower ||
                    headerLower.includes(fieldLower) ||
                    fieldLower.includes(headerLower) ||
                    headerLower.includes(labelLower) ||
                    labelLower.includes(headerLower)) {
                    newMapping[header] = field.key;
                    break;
                }
            }
        });

        setFieldMapping(newMapping);
    }, [currentSchema]);

    // Procesar y validar datos mapeados
    const processData = useCallback(() => {
        if (!currentSchema) return;

        const processed: ImportRow[] = excelData.map(row => {
            const mapped: any = {};
            const errors: string[] = [];

            // Aplicar mapeo
            Object.entries(fieldMapping).forEach(([excelCol, schemaField]) => {
                if (schemaField && row[excelCol] !== undefined && row[excelCol] !== '') {
                    // Manejar campos anidados (ej: ubicacion.lat)
                    if (schemaField.includes('.')) {
                        const [parent, child] = schemaField.split('.');
                        if (!mapped[parent]) mapped[parent] = {};
                        mapped[parent][child] = row[excelCol];
                    } else {
                        mapped[schemaField] = row[excelCol];
                    }
                }
            });

            // Validar campos requeridos
            currentSchema.fields.forEach(field => {
                const value = field.key.includes('.')
                    ? mapped[field.key.split('.')[0]]?.[field.key.split('.')[1]]
                    : mapped[field.key];

                if (field.required && (value === undefined || value === null || value === '')) {
                    errors.push(`Campo requerido: ${field.label}`);
                }

                // Aplicar valores por defecto
                if ((value === undefined || value === null || value === '') && field.default !== undefined) {
                    if (field.key.includes('.')) {
                        const [parent, child] = field.key.split('.');
                        if (!mapped[parent]) mapped[parent] = {};
                        mapped[parent][child] = field.default;
                    } else {
                        mapped[field.key] = field.default;
                    }
                }

                // Validar tipos
                if (value !== undefined && value !== null && value !== '') {
                    if (field.type === 'number' && isNaN(Number(value))) {
                        errors.push(`${field.label} debe ser un número`);
                    }
                    if (field.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value))) {
                        errors.push(`${field.label} debe ser un email válido`);
                    }
                    if (field.type === 'enum' && field.options && !field.options.includes(String(value).toLowerCase())) {
                        errors.push(`${field.label} debe ser uno de: ${field.options.join(', ')}`);
                    }
                }
            });

            // Convertir valores enum a minúsculas
            currentSchema.fields.forEach(field => {
                if (field.type === 'enum' && mapped[field.key]) {
                    mapped[field.key] = String(mapped[field.key]).toLowerCase();
                }
                if (field.type === 'number' && mapped[field.key]) {
                    mapped[field.key] = Number(mapped[field.key]);
                }
            });

            return {
                original: row,
                mapped,
                status: errors.length > 0 ? 'error' : 'valid',
                errors,
            };
        });

        setProcessedRows(processed);
        setActiveStep(3);
    }, [currentSchema, excelData, fieldMapping]);

    // Importar datos en lotes
    const handleImport = useCallback(async () => {
        if (!currentSchema) return;

        setImporting(true);
        setImportProgress(0);
        setImportResults({ success: 0, errors: 0, messages: [] });

        const validRows = processedRows.filter(r => r.status === 'valid');
        const totalBatches = Math.ceil(validRows.length / BATCH_SIZE);
        let successCount = 0;
        let errorCount = 0;
        const errorMessages: string[] = [];

        for (let i = 0; i < totalBatches; i++) {
            const batch = validRows.slice(i * BATCH_SIZE, (i + 1) * BATCH_SIZE);

            // Procesar cada registro del lote
            for (const row of batch) {
                try {
                    await apiService.post(currentSchema.endpoint, row.mapped);
                    successCount++;
                } catch (error: any) {
                    errorCount++;
                    const msg = error.response?.data?.message || error.message || 'Error desconocido';
                    if (errorMessages.length < 10) {
                        errorMessages.push(`Fila: ${JSON.stringify(row.mapped[currentSchema.uniqueKey || 'nombre'] || 'N/A')} - ${msg}`);
                    }
                }
            }

            setImportProgress(Math.round(((i + 1) / totalBatches) * 100));

            // Pequeña pausa entre lotes para no sobrecargar
            if (i < totalBatches - 1) {
                await new Promise(resolve => setTimeout(resolve, 100));
            }
        }

        setImportResults({ success: successCount, errors: errorCount, messages: errorMessages });
        setImporting(false);
        setActiveStep(4);

        // Invalidar queries relacionadas
        queryClient.invalidateQueries([selectedSchema]);
    }, [currentSchema, processedRows, selectedSchema, queryClient]);

    // Estadísticas de preview
    const stats = useMemo(() => {
        const valid = processedRows.filter(r => r.status === 'valid').length;
        const warnings = processedRows.filter(r => r.status === 'warning').length;
        const errors = processedRows.filter(r => r.status === 'error').length;
        return { valid, warnings, errors, total: processedRows.length };
    }, [processedRows]);

    // Reset completo
    const handleReset = useCallback(() => {
        setActiveStep(0);
        setSelectedSchema(defaultSchema || '');
        setExcelData([]);
        setExcelColumns([]);
        setFieldMapping({});
        setProcessedRows([]);
        setImportProgress(0);
        setImportResults({ success: 0, errors: 0, messages: [] });
        setFileName('');
    }, [defaultSchema]);

    const handleClose = useCallback(() => {
        handleReset();
        onClose();
    }, [handleReset, onClose]);

    // Renderizar contenido según el paso
    const renderStepContent = () => {
        switch (activeStep) {
            case 0: // Seleccionar destino
                return (
                    <Box sx={{ py: 4 }}>
                        <Typography variant="h6" gutterBottom>
                            ¿Qué tipo de datos vas a importar?
                        </Typography>
                        <TextField
                            select
                            fullWidth
                            label="Tipo de Datos"
                            value={selectedSchema}
                            onChange={(e) => setSelectedSchema(e.target.value as SchemaKey)}
                            sx={{ mt: 2 }}
                        >
                            {Object.entries(IMPORT_SCHEMAS).map(([key, schema]) => (
                                <MenuItem key={key} value={key}>
                                    {schema.name}
                                </MenuItem>
                            ))}
                        </TextField>

                        {currentSchema && (
                            <Box sx={{ mt: 3 }}>
                                <Typography variant="subtitle2" color="textSecondary">
                                    Campos disponibles para {currentSchema.name}:
                                </Typography>
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                                    {currentSchema.fields.map(field => (
                                        <Chip
                                            key={field.key}
                                            label={field.label}
                                            size="small"
                                            color={field.required ? 'primary' : 'default'}
                                            variant={field.required ? 'filled' : 'outlined'}
                                        />
                                    ))}
                                </Box>
                                <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
                                    * Los campos en azul son requeridos
                                </Typography>
                            </Box>
                        )}
                    </Box>
                );

            case 1: // Cargar Excel
                return (
                    <Box sx={{ py: 4, textAlign: 'center' }}>
                        <input
                            type="file"
                            accept=".xlsx,.xls,.csv"
                            onChange={handleFileUpload}
                            style={{ display: 'none' }}
                            id="excel-upload"
                        />
                        <label htmlFor="excel-upload">
                            <Button
                                variant="outlined"
                                component="span"
                                size="large"
                                startIcon={<CloudUpload />}
                                sx={{ py: 3, px: 6 }}
                            >
                                Seleccionar Archivo Excel
                            </Button>
                        </label>
                        <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
                            Formatos soportados: .xlsx, .xls, .csv
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                            Máximo 1000 filas para preview (se importarán todas)
                        </Typography>
                    </Box>
                );

            case 2: // Mapear campos
                return (
                    <Box sx={{ py: 2 }}>
                        <Alert severity="info" sx={{ mb: 2 }}>
                            Archivo: <strong>{fileName}</strong> - {excelData.length} filas detectadas
                        </Alert>

                        <Typography variant="subtitle1" gutterBottom>
                            Mapea las columnas de tu Excel a los campos del sistema:
                        </Typography>

                        <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 400 }}>
                            <Table size="small" stickyHeader>
                                <TableHead>
                                    <TableRow>
                                        <TableCell sx={{ fontWeight: 'bold', width: '40%' }}>Columna Excel</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold', width: '40%' }}>Campo Sistema</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold', width: '20%' }}>Ejemplo</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {excelColumns.map(col => (
                                        <TableRow key={col}>
                                            <TableCell>
                                                <Typography variant="body2" fontWeight="medium">
                                                    {col}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <TextField
                                                    select
                                                    size="small"
                                                    fullWidth
                                                    value={fieldMapping[col] || ''}
                                                    onChange={(e) => setFieldMapping(prev => ({
                                                        ...prev,
                                                        [col]: e.target.value
                                                    }))}
                                                >
                                                    <MenuItem value="">
                                                        <em>(Ignorar)</em>
                                                    </MenuItem>
                                                    {currentSchema?.fields.map(field => (
                                                        <MenuItem key={field.key} value={field.key}>
                                                            {field.label} {field.required && '*'}
                                                        </MenuItem>
                                                    ))}
                                                </TextField>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="caption" color="textSecondary" noWrap>
                                                    {String(excelData[0]?.[col] || '').substring(0, 30)}
                                                </Typography>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>

                        <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                            <Button size="small" onClick={() => autoMapFields(excelColumns)} startIcon={<Refresh />}>
                                Auto-mapear
                            </Button>
                            <Button size="small" onClick={() => setFieldMapping({})} color="warning">
                                Limpiar mapeo
                            </Button>
                        </Box>
                    </Box>
                );

            case 3: // Previsualizar
                return (
                    <Box sx={{ py: 2 }}>
                        {/* Estadísticas */}
                        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                            <Chip
                                icon={<CheckCircle />}
                                label={`${stats.valid} válidos`}
                                color="success"
                                variant="outlined"
                            />
                            <Chip
                                icon={<Warning />}
                                label={`${stats.warnings} advertencias`}
                                color="warning"
                                variant="outlined"
                            />
                            <Chip
                                icon={<ErrorIcon />}
                                label={`${stats.errors} errores`}
                                color="error"
                                variant="outlined"
                            />
                        </Box>

                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={updateExisting}
                                    onChange={(e) => setUpdateExisting(e.target.checked)}
                                />
                            }
                            label="Actualizar registros existentes (si el campo único ya existe)"
                        />

                        {/* Preview de datos */}
                        <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 350, mt: 2 }}>
                            <Table size="small" stickyHeader>
                                <TableHead>
                                    <TableRow>
                                        <TableCell sx={{ width: 60 }}>Estado</TableCell>
                                        {currentSchema?.fields.slice(0, 5).map(field => (
                                            <TableCell key={field.key}>{field.label}</TableCell>
                                        ))}
                                        <TableCell>Errores</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {processedRows.slice(0, 50).map((row, index) => (
                                        <TableRow key={index} sx={{ bgcolor: row.status === 'error' ? 'error.light' : 'inherit' }}>
                                            <TableCell>
                                                {row.status === 'valid' && <CheckCircle color="success" fontSize="small" />}
                                                {row.status === 'warning' && <Warning color="warning" fontSize="small" />}
                                                {row.status === 'error' && <ErrorIcon color="error" fontSize="small" />}
                                            </TableCell>
                                            {currentSchema?.fields.slice(0, 5).map(field => {
                                                const value = field.key.includes('.')
                                                    ? row.mapped[field.key.split('.')[0]]?.[field.key.split('.')[1]]
                                                    : row.mapped[field.key];
                                                return (
                                                    <TableCell key={field.key}>
                                                        <Typography variant="caption" noWrap sx={{ maxWidth: 150, display: 'block' }}>
                                                            {String(value || '-')}
                                                        </Typography>
                                                    </TableCell>
                                                );
                                            })}
                                            <TableCell>
                                                {row.errors.length > 0 && (
                                                    <Tooltip title={row.errors.join(', ')}>
                                                        <Typography variant="caption" color="error" noWrap sx={{ maxWidth: 200, display: 'block' }}>
                                                            {row.errors[0]}
                                                        </Typography>
                                                    </Tooltip>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>

                        {processedRows.length > 50 && (
                            <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
                                Mostrando 50 de {processedRows.length} registros
                            </Typography>
                        )}
                    </Box>
                );

            case 4: // Resultados
                return (
                    <Box sx={{ py: 4, textAlign: 'center' }}>
                        {importing ? (
                            <>
                                <Typography variant="h6" gutterBottom>
                                    Importando datos...
                                </Typography>
                                <LinearProgress variant="determinate" value={importProgress} sx={{ my: 2 }} />
                                <Typography variant="body2" color="textSecondary">
                                    {importProgress}% completado
                                </Typography>
                            </>
                        ) : (
                            <>
                                <CheckCircle color="success" sx={{ fontSize: 64, mb: 2 }} />
                                <Typography variant="h5" gutterBottom>
                                    Importación Completada
                                </Typography>

                                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3, my: 3 }}>
                                    <Box>
                                        <Typography variant="h4" color="success.main">
                                            {importResults.success}
                                        </Typography>
                                        <Typography variant="body2" color="textSecondary">
                                            Importados
                                        </Typography>
                                    </Box>
                                    <Box>
                                        <Typography variant="h4" color="error.main">
                                            {importResults.errors}
                                        </Typography>
                                        <Typography variant="body2" color="textSecondary">
                                            Errores
                                        </Typography>
                                    </Box>
                                </Box>

                                {importResults.messages.length > 0 && (
                                    <Alert severity="warning" sx={{ mt: 2, textAlign: 'left' }}>
                                        <Typography variant="subtitle2">Errores encontrados:</Typography>
                                        {importResults.messages.map((msg, i) => (
                                            <Typography key={i} variant="caption" display="block">
                                                • {msg}
                                            </Typography>
                                        ))}
                                    </Alert>
                                )}
                            </>
                        )}
                    </Box>
                );

            default:
                return null;
        }
    };

    // Determinar si se puede avanzar
    const canProceed = () => {
        switch (activeStep) {
            case 0: return !!selectedSchema;
            case 1: return excelData.length > 0;
            case 2: return Object.values(fieldMapping).some(v => v); // Al menos un campo mapeado
            case 3: return stats.valid > 0;
            default: return false;
        }
    };

    const handleNext = () => {
        if (activeStep === 2) {
            processData();
        } else if (activeStep === 3) {
            handleImport();
        } else {
            setActiveStep(prev => prev + 1);
        }
    };

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CloudUpload />
                Importador de Excel
                {fileName && (
                    <Chip label={fileName} size="small" sx={{ ml: 'auto' }} onDelete={() => handleReset()} />
                )}
            </DialogTitle>

            <DialogContent>
                <Stepper activeStep={activeStep} sx={{ mb: 3 }}>
                    {steps.map((label, index) => (
                        <Step key={label} completed={activeStep > index}>
                            <StepLabel>{label}</StepLabel>
                        </Step>
                    ))}
                </Stepper>

                {renderStepContent()}
            </DialogContent>

            <DialogActions sx={{ px: 3, pb: 2 }}>
                <Button onClick={handleClose} disabled={importing}>
                    {activeStep === 4 ? 'Cerrar' : 'Cancelar'}
                </Button>

                {activeStep > 0 && activeStep < 4 && (
                    <Button onClick={() => setActiveStep(prev => prev - 1)} disabled={importing}>
                        Anterior
                    </Button>
                )}

                {activeStep < 4 && (
                    <Button
                        variant="contained"
                        onClick={handleNext}
                        disabled={!canProceed() || importing}
                    >
                        {activeStep === 3 ? `Importar ${stats.valid} registros` : 'Siguiente'}
                    </Button>
                )}

                {activeStep === 4 && !importing && (
                    <Button variant="contained" onClick={handleReset} startIcon={<Refresh />}>
                        Nueva Importación
                    </Button>
                )}
            </DialogActions>
        </Dialog>
    );
};

export default ExcelImporter;
