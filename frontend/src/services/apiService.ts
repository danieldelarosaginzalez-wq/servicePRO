import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { ApiResponse, PaginatedResponse, InventoryTechnician } from '../types';

class ApiService {
    private api: AxiosInstance;

    constructor() {
        this.api = axios.create({
            baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3001/api',
            timeout: 10000,
        });

        this.api.interceptors.request.use((config) => {
            const token = localStorage.getItem('token');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
            return config;
        });

        this.api.interceptors.response.use(
            (response) => response,
            (error) => {
                if (error.response?.status === 401) {
                    const currentToken = localStorage.getItem('token');
                    if (currentToken) {
                        localStorage.removeItem('token');
                    }
                }
                return Promise.reject(error);
            }
        );
    }

    async get<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
        const response = await this.api.get(url, config);
        return response.data;
    }

    async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
        const response = await this.api.post(url, data, config);
        return response.data;
    }

    async patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
        const response = await this.api.patch(url, data, config);
        return response.data;
    }

    async delete<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
        const response = await this.api.delete(url, config);
        return response.data;
    }

    async getPaginated<T>(url: string, params?: any): Promise<PaginatedResponse<T>> {
        const response = await this.api.get(url, { params });
        return response.data;
    }

    // Usuarios
    getUsers(params?: any) { return this.getPaginated('/users', params); }
    getUser(id: string) { return this.get(`/users/${id}`); }
    createUser(userData: any) { return this.post('/users', userData); }
    updateUser(id: string, userData: any) { return this.patch(`/users/${id}`, userData); }

    // Pólizas
    getPolizas(params?: any) { return this.getPaginated('/polizas', params); }
    getPoliza(id: string) { return this.get(`/polizas/${id}`); }
    createPoliza(polizaData: any) { return this.post('/polizas', polizaData); }
    updatePoliza(id: string, polizaData: any) { return this.patch(`/polizas/${id}`, polizaData); }

    // Órdenes
    getOrders(params?: any): Promise<PaginatedResponse<any>> { return this.getPaginated('/orders', params); }
    getOrder(id: string) { return this.get(`/orders/${id}`); }
    createOrder(orderData: any) { return this.post('/orders', orderData); }
    updateOrder(id: string, orderData: any) { return this.patch(`/orders/${id}`, orderData); }
    assignTechnician(orderId: string, technicianId: string) { return this.post(`/orders/${orderId}/assign-technician`, { technicianId }); }
    startOrder(orderId: string) { return this.post(`/orders/${orderId}/start`); }
    finishOrder(orderId: string, data: any) { return this.post(`/orders/${orderId}/finish`, data); }
    reportImpossibility(orderId: string, data: any) { return this.post(`/orders/${orderId}/impossibility`, data); }
    updateWorkProgress(orderId: string, progressData: any) { return this.post(`/orders/${orderId}/progress`, progressData); }

    // Materiales
    getMaterials(params?: any) { return this.getPaginated('/materials', params); }
    getMaterial(id: string) { return this.get(`/materials/${id}`); }
    createMaterial(materialData: any) { return this.post('/materials', materialData); }
    updateMaterial(id: string, materialData: any) { return this.patch(`/materials/${id}`, materialData); }

    // Inventario
    getMyInventory() { return this.get<InventoryTechnician>('/inventario/mi-inventario'); }
    getTechnicianInventory(technicianId: string) { return this.get<InventoryTechnician>(`/inventario/tecnico/${technicianId}`); }
    initTechnicianInventory(technicianId: string) { return this.post(`/inventario/tecnico/${technicianId}/init`); }
    getTechnicianMovements(technicianId: string, params?: any) { return this.getPaginated(`/inventario/tecnico/${technicianId}/movimientos`, params); }
    assignMaterials(data: any) { return this.post(`/inventario/tecnico/${data.tecnico_id}/assign`, data); }
    consumeMaterials(technicianId: string, data: any) { return this.post(`/inventario/tecnico/${technicianId}/consume`, data); }

    // Control de materiales
    getMaterialControls(params?: any) { return this.getPaginated('/material-control', params); }
    getMaterialControl(id: string) { return this.get(`/material-control/${id}`); }
    createMaterialControl(data: any) { return this.post('/material-control', data); }
    registerMaterialUsage(controlId: string, usageData: any) { return this.post(`/material-control/${controlId}/usage`, usageData); }
    registerMaterialReturn(controlId: string, returnData: any) { return this.post(`/material-control/${controlId}/return`, returnData); }
    getDiscrepancies(params?: any) { return this.getPaginated('/material-control/discrepancies', params); }
    resolveDiscrepancy(controlId: string, data: any) { return this.post(`/material-control/${controlId}/resolve-discrepancy`, data); }
    closeMaterialControl(controlId: string) { return this.post(`/material-control/${controlId}/close`); }

    // Comprobantes de visita
    getVisitReports(params?: any) { return this.getPaginated('/visit-reports', params); }
    getVisitReport(id: string) { return this.get(`/visit-reports/${id}`); }
    getVisitReportByOrder(orderId: string) { return this.get(`/visit-reports/by-order/${orderId}`); }
    createVisitReport(reportData: any) { return this.post('/visit-reports', reportData); }
    updateVisitReport(id: string, reportData: any) { return this.patch(`/visit-reports/${id}`, reportData); }
    addVisitReportSignature(id: string, signatureData: any) { return this.post(`/visit-reports/${id}/signature`, signatureData); }
    finalizeVisitReport(id: string) { return this.post(`/visit-reports/${id}/finalize`); }

    // Archivos
    uploadFile(file: File, folder?: string) {
        const formData = new FormData();
        formData.append('file', file);
        if (folder) formData.append('folder', folder);
        return this.post('/files/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
    }
}

export const apiService = new ApiService();
