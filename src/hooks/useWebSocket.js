import { useEffect, useRef, useState, useCallback } from 'react';
import { notificationService } from '../services/realtime';

const WS_RECONNECT_DELAY = 3000;
const MAX_RECONNECT_ATTEMPTS = 5;
const HEARTBEAT_INTERVAL = 25000;

export const useWebSocket = (options = {}) => {
    const {
        autoConnect = true,
        channels = ['admin', 'tracking'],
        onLocationUpdate,
        onSOSAlert,
        onSOSResolved,
        onGeofenceAlert,
        onConnectionChange,
    } = options;

    const wsRef = useRef(null);
    const reconnectAttempts = useRef(0);
    const heartbeatInterval = useRef(null);
    const subscriptions = useRef(new Set(channels));

    const [isConnected, setIsConnected] = useState(false);
    const [lastMessage, setLastMessage] = useState(null);

    const getWebSocketUrl = useCallback(() => {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const host = process.env.REACT_APP_WS_URL || `${window.location.hostname}:${process.env.REACT_APP_API_PORT || 3000}`;
        const token = localStorage.getItem('adminToken');
        return `${protocol}//${host}/ws?token=${token || ''}`;
    }, []);

    const handleMessage = useCallback((event) => {
        try {
            const message = JSON.parse(event.data);
            setLastMessage(message);

            switch (message.type) {
                case 'connected':
                    console.log('WebSocket connected:', message.payload);
                    if (message.payload?.clientId) {
                        subscribeToChannels();
                    }
                    break;

                case 'location_update':
                    onLocationUpdate?.(message.payload);
                    break;

                case 'sos_alert':
                    notificationService.playSOSSound();
                    notificationService.notifySOS({
                        user: message.payload,
                        onNavigate: () => {
                            if (message.payload?.userId) {
                                window.dispatchEvent(new CustomEvent('navigate:sos', {
                                    detail: { userId: message.payload.userId, alertId: message.payload.id }
                                }));
                            }
                        }
                    });
                    onSOSAlert?.(message.payload);
                    break;

                case 'sos_resolved':
                case 'sos_confirmed':
                    onSOSResolved?.(message.payload);
                    break;

                case 'geofence_alert':
                    onGeofenceAlert?.(message.payload);
                    break;

                case 'heartbeat':
                case 'pong':
                    break;

                default:
                    console.log('WebSocket message:', message.type, message.payload);
            }
        } catch (error) {
            console.error('Error parsing WebSocket message:', error);
        }
    }, [onLocationUpdate, onSOSAlert, onSOSResolved, onGeofenceAlert]);

    const subscribeToChannels = useCallback(() => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({
                type: 'subscribe',
                payload: { channels: Array.from(subscriptions.current) }
            }));
        }
    }, []);

    const connect = useCallback(() => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
            return;
        }

        const url = getWebSocketUrl();
        console.log('Connecting to WebSocket:', url);

        try {
            wsRef.current = new WebSocket(url);

            wsRef.current.onopen = () => {
                console.log('WebSocket connected');
                setIsConnected(true);
                reconnectAttempts.current = 0;
                onConnectionChange?.(true);

                startHeartbeat();
                subscribeToChannels();
            };

            wsRef.current.onmessage = handleMessage;

            wsRef.current.onerror = (error) => {
                console.error('WebSocket error:', error);
            };

            wsRef.current.onclose = () => {
                console.log('WebSocket disconnected');
                setIsConnected(false);
                onConnectionChange?.(false);
                stopHeartbeat();
                attemptReconnect();
            };
        } catch (error) {
            console.error('Error creating WebSocket:', error);
            attemptReconnect();
        }
    }, [getWebSocketUrl, handleMessage, onConnectionChange, subscribeToChannels]);

    const disconnect = useCallback(() => {
        reconnectAttempts.current = MAX_RECONNECT_ATTEMPTS;
        if (wsRef.current) {
            wsRef.current.close();
            wsRef.current = null;
        }
        stopHeartbeat();
    }, []);

    const attemptReconnect = useCallback(() => {
        if (reconnectAttempts.current < MAX_RECONNECT_ATTEMPTS) {
            reconnectAttempts.current++;
            console.log(`Reconnecting... (${reconnectAttempts.current}/${MAX_RECONNECT_ATTEMPTS})`);
            setTimeout(connect, WS_RECONNECT_DELAY);
        } else {
            console.log('Max reconnect attempts reached');
        }
    }, [connect]);

    const startHeartbeat = useCallback(() => {
        stopHeartbeat();
        heartbeatInterval.current = setInterval(() => {
            if (wsRef.current?.readyState === WebSocket.OPEN) {
                wsRef.current.send(JSON.stringify({ type: 'ping' }));
            }
        }, HEARTBEAT_INTERVAL);
    }, []);

    const stopHeartbeat = useCallback(() => {
        if (heartbeatInterval.current) {
            clearInterval(heartbeatInterval.current);
            heartbeatInterval.current = null;
        }
    }, []);

    const send = useCallback((type, payload = {}) => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({ type, payload }));
        } else {
            console.warn('WebSocket not connected, message not sent');
        }
    }, []);

    const sendLocationUpdate = useCallback((location) => {
        send('location_update', location);
    }, [send]);

    const triggerSOS = useCallback((latitude, longitude, message) => {
        send('sos_trigger', { latitude, longitude, message });
    }, [send]);

    const subscribe = useCallback((channel) => {
        subscriptions.current.add(channel);
        if (isConnected) {
            send('subscribe', { channels: [channel] });
        }
    }, [send, isConnected]);

    const unsubscribe = useCallback((channel) => {
        subscriptions.current.delete(channel);
        if (isConnected) {
            send('unsubscribe', { channels: [channel] });
        }
    }, [send, isConnected]);

    useEffect(() => {
        if (autoConnect) {
            connect();
        }

        return () => {
            disconnect();
        };
    }, [autoConnect, connect, disconnect]);

    return {
        isConnected,
        lastMessage,
        connect,
        disconnect,
        send,
        sendLocationUpdate,
        triggerSOS,
        subscribe,
        unsubscribe,
    };
};

export default useWebSocket;
