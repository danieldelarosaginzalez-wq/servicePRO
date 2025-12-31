import React, { useState, useEffect, useCallback } from 'react';
import {
    Badge,
    IconButton,
    Popover,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    Typography,
    Box,
    Button,
    Divider,
    Chip,
    CircularProgress,
    Tooltip,
} from '@mui/material';
import {
    Notifications as NotificationsIcon,
    Circle as CircleIcon,
    MarkEmailRead as MarkReadIcon,
    Delete as DeleteIcon,
} from '@mui/icons-material';
import { websocketService } from '../services/websocketService';
import notificationService, { Notification } from '../services/notificationService';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

const NotificationCenter: React.FC = () => {
    const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    const loadNotifications = useCallback(async (pageNum: number = 1, append: boolean = false) => {
        try {
            setLoading(true);
            const response = await notificationService.getNotifications({ page: pageNum, limit: 10 });

            if (append) {
                setNotifications(prev => [...prev, ...response.data]);
            } else {
                setNotifications(response.data);
            }

            setUnreadCount(response.unread);
            setHasMore(response.data.length === 10);
        } catch (error) {
            console.error('Error loading notifications:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadNotifications();

        // Escuchar notificaciones en tiempo real
        const unsubscribe = websocketService.on('notification', (notification: any) => {
            setNotifications(prev => [notification, ...prev]);
            setUnreadCount(prev => prev + 1);

            // Mostrar notificación del navegador si está permitido
            if (Notification.permission === 'granted') {
                new Notification(notification.title, {
                    body: notification.message,
                    icon: '/logo192.png',
                });
            }
        });

        // Solicitar permiso para notificaciones del navegador
        if (Notification.permission === 'default') {
            Notification.requestPermission();
        }

        return () => {
            unsubscribe();
        };
    }, [loadNotifications]);

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleMarkAsRead = async (notificationId: string) => {
        try {
            await notificationService.markAsRead(notificationId);
            setNotifications(prev =>
                prev.map(n => (n._id === notificationId ? { ...n, read: true } : n))
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await notificationService.markAllAsRead();
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
            setUnreadCount(0);
        } catch (error) {
            console.error('Error marking all as read:', error);
        }
    };

    const handleLoadMore = () => {
        const nextPage = page + 1;
        setPage(nextPage);
        loadNotifications(nextPage, true);
    };

    const getPriorityChip = (priority: string) => {
        const config: Record<string, { label: string; color: 'default' | 'primary' | 'warning' | 'error' }> = {
            low: { label: 'Baja', color: 'default' },
            medium: { label: 'Media', color: 'primary' },
            high: { label: 'Alta', color: 'warning' },
            urgent: { label: 'Urgente', color: 'error' },
        };
        const { label, color } = config[priority] || config.medium;
        return <Chip label={label} color={color} size="small" sx={{ ml: 1 }} />;
    };

    const open = Boolean(anchorEl);

    return (
        <>
            <Tooltip title="Notificaciones">
                <IconButton color="inherit" onClick={handleClick}>
                    <Badge badgeContent={unreadCount} color="error">
                        <NotificationsIcon />
                    </Badge>
                </IconButton>
            </Tooltip>

            <Popover
                open={open}
                anchorEl={anchorEl}
                onClose={handleClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                PaperProps={{ sx: { width: 400, maxHeight: 500 } }}
            >
                <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6">Notificaciones</Typography>
                    {unreadCount > 0 && (
                        <Button
                            size="small"
                            startIcon={<MarkReadIcon />}
                            onClick={handleMarkAllAsRead}
                        >
                            Marcar todas leídas
                        </Button>
                    )}
                </Box>
                <Divider />

                {notifications.length === 0 ? (
                    <Box sx={{ p: 4, textAlign: 'center' }}>
                        <Typography color="text.secondary">
                            No tienes notificaciones
                        </Typography>
                    </Box>
                ) : (
                    <List sx={{ maxHeight: 350, overflow: 'auto' }}>
                        {notifications.map((notification) => (
                            <ListItem
                                key={notification._id}
                                sx={{
                                    bgcolor: notification.read ? 'transparent' : 'action.hover',
                                    cursor: 'pointer',
                                    '&:hover': { bgcolor: 'action.selected' },
                                }}
                                onClick={() => !notification.read && handleMarkAsRead(notification._id)}
                            >
                                <ListItemIcon sx={{ minWidth: 40 }}>
                                    <Typography fontSize={24}>
                                        {notificationService.getNotificationIcon(notification.type)}
                                    </Typography>
                                </ListItemIcon>
                                <ListItemText
                                    primary={
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            <Typography variant="subtitle2" sx={{ flex: 1 }}>
                                                {notification.title}
                                            </Typography>
                                            {!notification.read && (
                                                <CircleIcon sx={{ fontSize: 10, color: 'primary.main', ml: 1 }} />
                                            )}
                                        </Box>
                                    }
                                    secondary={
                                        <>
                                            <Typography variant="body2" color="text.secondary" noWrap>
                                                {notification.message}
                                            </Typography>
                                            <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                                                <Typography variant="caption" color="text.disabled">
                                                    {formatDistanceToNow(new Date(notification.created_at), {
                                                        addSuffix: true,
                                                        locale: es,
                                                    })}
                                                </Typography>
                                                {notification.priority !== 'medium' && getPriorityChip(notification.priority)}
                                            </Box>
                                        </>
                                    }
                                />
                            </ListItem>
                        ))}

                        {hasMore && (
                            <Box sx={{ p: 2, textAlign: 'center' }}>
                                <Button
                                    onClick={handleLoadMore}
                                    disabled={loading}
                                    startIcon={loading && <CircularProgress size={16} />}
                                >
                                    {loading ? 'Cargando...' : 'Cargar más'}
                                </Button>
                            </Box>
                        )}
                    </List>
                )}
            </Popover>
        </>
    );
};

export default NotificationCenter;
