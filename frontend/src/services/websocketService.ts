import { io, Socket } from 'socket.io-client';

class WebSocketService {
    private socket: Socket | null = null;
    private listeners: Map<string, Set<(data: any) => void>> = new Map();

    connect(userId: string, rol: string, nombre: string) {
        if (this.socket?.connected) {
            return;
        }

        this.socket = io(process.env.REACT_APP_WS_URL || 'http://localhost:3001', {
            transports: ['websocket'],
            autoConnect: true,
        });

        this.socket.on('connect', () => {
            console.log('🔌 WebSocket conectado');
            this.socket?.emit('register', { userId, rol, nombre });
        });

        this.socket.on('disconnect', () => {
            console.log('🔌 WebSocket desconectado');
        });

        // Configurar listeners para eventos
        this.setupEventListeners();
    }

    private setupEventListeners() {
        const events = [
            'order-created',
            'order-assigned',
            'order-updated',
            'order-status-changed',
            'order-progress',
            'inventory-updated',
            'materials-assigned',
            'visit-report-created',
            'notification',
            'online-users',
        ];

        events.forEach(event => {
            this.socket?.on(event, (data: any) => {
                const callbacks = this.listeners.get(event);
                if (callbacks) {
                    callbacks.forEach(cb => cb(data));
                }
            });
        });
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }

    on(event: string, callback: (data: any) => void) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, new Set());
        }
        this.listeners.get(event)?.add(callback);

        return () => {
            this.listeners.get(event)?.delete(callback);
        };
    }

    off(event: string, callback: (data: any) => void) {
        this.listeners.get(event)?.delete(callback);
    }

    joinOrder(orderId: string) {
        this.socket?.emit('join-order', { orderId });
    }

    leaveOrder(orderId: string) {
        this.socket?.emit('leave-order', { orderId });
    }

    isConnected(): boolean {
        return this.socket?.connected || false;
    }
}

export const websocketService = new WebSocketService();
