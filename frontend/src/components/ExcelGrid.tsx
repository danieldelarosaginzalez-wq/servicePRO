import React, { useMemo, useCallback, useState } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { ColDef, GridReadyEvent, CellValueChangedEvent, GridApi, ColumnApi } from 'ag-grid-community';
import { Box, Toolbar, Typography, IconButton, Menu, MenuItem } from '@mui/material';
import { Download, Upload, FilterList, Refresh } from '@mui/icons-material';
import * as XLSX from 'xlsx';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';

interface ExcelGridProps {
    data: any[];
    columns: ColDef[];
    title: string;
    onCellValueChanged?: (event: CellValueChangedEvent) => void;
    onRowSelected?: (selectedRows: any[]) => void;
    enableEdit?: boolean;
    enableExport?: boolean;
    enableImport?: boolean;
    loading?: boolean;
    onRefresh?: () => void;
    height?: string;
}

export const ExcelGrid: React.FC<ExcelGridProps> = ({
    data,
    columns,
    title,
    onCellValueChanged,
    onRowSelected,
    enableEdit = false,
    enableExport = true,
    enableImport = false,
    loading = false,
    onRefresh,
    height = '600px'
}) => {
    const [gridApi, setGridApi] = useState<GridApi | null>(null);
    const [columnApi, setColumnApi] = useState<ColumnApi | null>(null);
    const [exportMenuAnchor, setExportMenuAnchor] = useState<null | HTMLElement>(null);

    const defaultColDef = useMemo(() => ({
        sortable: true,
        filter: true,
        resizable: true,
        editable: enableEdit,
        minWidth: 100,
    }), [enableEdit]);

    const onGridReady = useCallback((params: GridReadyEvent) => {
        setGridApi(params.api);
        setColumnApi(params.columnApi);
    }, []);

    const onSelectionChanged = useCallback(() => {
        if (gridApi && onRowSelected) {
            const selectedRows = gridApi.getSelectedRows();
            onRowSelected(selectedRows);
        }
    }, [gridApi, onRowSelected]);

    const exportToExcel = useCallback(() => {
        if (gridApi) {
            // Obtener todos los datos visibles del grid
            const rowData: any[] = [];
            gridApi.forEachNodeAfterFilterAndSort((node) => {
                rowData.push(node.data);
            });

            // Crear un nuevo workbook
            const wb = XLSX.utils.book_new();

            // Convertir los datos a una hoja de cálculo
            const ws = XLSX.utils.json_to_sheet(rowData);

            // Agregar la hoja al workbook
            XLSX.utils.book_append_sheet(wb, ws, title);

            // Generar el archivo y descargarlo
            const fileName = `${title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`;
            XLSX.writeFile(wb, fileName);
        }
        setExportMenuAnchor(null);
    }, [gridApi, title]);

    const exportToCsv = useCallback(() => {
        if (gridApi) {
            gridApi.exportDataAsCsv({
                fileName: `${title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`
            });
        }
        setExportMenuAnchor(null);
    }, [gridApi, title]);

    const handleRefresh = useCallback(() => {
        if (onRefresh) {
            onRefresh();
        }
        if (gridApi) {
            gridApi.refreshCells();
        }
    }, [gridApi, onRefresh]);

    const autoSizeColumns = useCallback(() => {
        if (columnApi) {
            columnApi.autoSizeAllColumns();
        }
    }, [columnApi]);

    return (
        <Box sx={{ width: '100%', height: '100%' }}>
            <Toolbar sx={{ pl: { sm: 2 }, pr: { xs: 1, sm: 1 } }}>
                <Typography
                    sx={{ flex: '1 1 100%' }}
                    variant="h6"
                    component="div"
                >
                    {title}
                </Typography>

                {onRefresh && (
                    <IconButton onClick={handleRefresh} disabled={loading}>
                        <Refresh />
                    </IconButton>
                )}

                <IconButton onClick={autoSizeColumns}>
                    <FilterList />
                </IconButton>

                {enableExport && (
                    <>
                        <IconButton
                            onClick={(e) => setExportMenuAnchor(e.currentTarget)}
                        >
                            <Download />
                        </IconButton>
                        <Menu
                            anchorEl={exportMenuAnchor}
                            open={Boolean(exportMenuAnchor)}
                            onClose={() => setExportMenuAnchor(null)}
                        >
                            <MenuItem onClick={exportToExcel}>Exportar a Excel (.xlsx)</MenuItem>
                            <MenuItem onClick={exportToCsv}>Exportar a CSV</MenuItem>
                        </Menu>
                    </>
                )}

                {enableImport && (
                    <IconButton>
                        <Upload />
                    </IconButton>
                )}
            </Toolbar>

            <Box
                className="ag-theme-alpine"
                sx={{
                    height: height,
                    width: '100%',
                    '& .ag-header': {
                        backgroundColor: '#f5f5f5',
                        fontWeight: 'bold',
                    },
                    '& .ag-row-even': {
                        backgroundColor: '#fafafa',
                    },
                    '& .ag-row-selected': {
                        backgroundColor: '#e3f2fd !important',
                    }
                }}
            >
                <AgGridReact
                    rowData={data}
                    columnDefs={columns}
                    defaultColDef={defaultColDef}
                    onGridReady={onGridReady}
                    onCellValueChanged={onCellValueChanged}
                    onSelectionChanged={onSelectionChanged}
                    rowSelection="multiple"
                    suppressRowClickSelection={false}
                    animateRows={true}
                    enableCellTextSelection={true}
                    ensureDomOrder={true}
                    loadingOverlayComponentParams={{
                        loadingMessage: loading ? "Cargando datos..." : undefined
                    }}
                    overlayNoRowsTemplate="<span>No hay datos para mostrar</span>"
                />
            </Box>
        </Box>
    );
};