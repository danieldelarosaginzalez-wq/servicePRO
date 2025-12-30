import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

export const authService = {
    async login(email: string, password: string) {
        const response = await axios.post(`${API_BASE_URL}/auth/login`, {
            username: email,
            password,
        });
        return response.data;
    },

    async register(userData: {
        nombre: string;
        email: string;
        password: string;
        rol: 'analista' | 'tecnico' | 'analista_inventario_oculto';
    }) {
        const response = await axios.post(`${API_BASE_URL}/auth/register`, userData);
        return response.data;
    },

    async validateToken(token: string) {
        const response = await axios.post(`${API_BASE_URL}/auth/validate-token`, {
            token,
        });
        return response.data;
    },

    async getProfile(token: string) {
        const response = await axios.get(`${API_BASE_URL}/auth/profile`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data;
    },
};