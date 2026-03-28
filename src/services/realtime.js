import { adminApi } from './api';

const WS_CONFIG = {
    RECONNECT_DELAY: 3000,
    MAX_RECONNECT_ATTEMPTS: 5,
    HEARTBEAT_INTERVAL: 25000,
};

let notificationServiceInstance = null;

class NotificationService {
    constructor() {
        this.permission = typeof Notification !== 'undefined' ? Notification.permission : 'default';
        this.soundEnabled = localStorage.getItem('sos_sound_enabled') !== 'false';
    }

    async requestPermission() {
        if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
            this.permission = await Notification.requestPermission();
        }
        return this.permission;
    }

    setSoundEnabled(enabled) {
        this.soundEnabled = enabled;
        localStorage.setItem('sos_sound_enabled', enabled.toString());
    }

    isSoundEnabled() {
        return this.soundEnabled;
    }

    async notify(title, options = {}) {
        if (typeof Notification !== 'undefined' && this.permission === 'granted') {
            const notification = new Notification(title, {
                icon: options.icon || '/logo192.png',
                badge: options.badge || '/logo192.png',
                tag: options.tag || 'sos-alert',
                requireInteraction: options.requireInteraction !== false,
                vibrate: options.vibrate || [200, 100, 200],
                ...options,
            });

            notification.onclick = () => {
                window.focus();
                notification.close();
                if (options.onClick) options.onClick();
            };

            return notification;
        }
    }

    async notifySOS(sosData) {
        await this.notify('SOS ALERT', {
            body: `${sosData.user?.name || 'Unknown user'} triggered SOS alert!`,
            tag: 'sos-alert',
            requireInteraction: true,
            onClick: () => {
                if (sosData.onNavigate) sosData.onNavigate();
            },
        });
    }

    playSOSSound() {
        if (!this.soundEnabled) return;

        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            const playBeep = (frequency, startTime, duration) => {
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();
                
                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);
                
                oscillator.frequency.value = frequency;
                oscillator.type = 'sine';
                
                gainNode.gain.setValueAtTime(0.5, startTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
                
                oscillator.start(startTime);
                oscillator.stop(startTime + duration);
            };

            const now = audioContext.currentTime;
            
            for (let i = 0; i < 3; i++) {
                const offset = i * 0.8;
                playBeep(800, now + offset, 0.3);
                playBeep(600, now + offset + 0.35, 0.3);
            }
        } catch (error) {
            console.error('Error playing SOS sound:', error);
        }
    }
}

const getNotificationService = () => {
    if (!notificationServiceInstance) {
        notificationServiceInstance = new NotificationService();
    }
    return notificationServiceInstance;
};

class WebSocketService {
    constructor() {
        this.ws = null;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = WS_CONFIG.MAX_RECONNECT_ATTEMPTS;
        this.reconnectDelay = WS_CONFIG.RECONNECT_DELAY;
        this.listeners = new Map();
        this.isConnected = false;
        this.subscriptions = new Set(['admin', 'tracking']);
        this.heartbeatTimer = null;
        this.token = null;
    }

    connect(token) {
        if (this.ws?.readyState === WebSocket.OPEN) return;
        
        this.token = token || localStorage.getItem('adminToken');
        const wsUrl = this.getWebSocketUrl(this.token);
        
        try {
            console.log('WebSocketService: Connecting to', wsUrl);
            this.ws = new WebSocket(wsUrl);
            this.setupEventHandlers();
        } catch (error) {
            console.error('WebSocketService: Error creating connection', error);
            this.scheduleReconnect();
        }
    }

    setupEventHandlers() {
        this.ws.onopen = () => {
            console.log('WebSocketService: Connected');
            this.isConnected = true;
            this.reconnectAttempts = 0;
            this.emit('connection', { status: 'connected' });
            this.startHeartbeat();
            this.subscribeToChannels();
        };

        this.ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                this.handleMessage(data);
            } catch (error) {
                console.error('WebSocketService: Parse error', error);
            }
        };

        this.ws.onerror = (error) => {
            console.error('WebSocketService: Error', error);
            this.emit('error', error);
        };

        this.ws.onclose = (event) => {
            console.log('WebSocketService: Disconnected', event.code);
            this.isConnected = false;
            this.emit('connection', { status: 'disconnected' });
            this.stopHeartbeat();
            this.scheduleReconnect();
        };
    }

    getWebSocketUrl(token) {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsPort = process.env.REACT_APP_WS_PORT || process.env.REACT_APP_API_PORT || 3000;
        const host = process.env.REACT_APP_WS_URL || `${window.location.hostname}:${wsPort}`;
        return `${protocol}//${host}/ws?token=${token || ''}`;
    }

    scheduleReconnect() {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            console.log(`WebSocketService: Reconnecting (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
            setTimeout(() => this.connect(this.token), this.reconnectDelay);
        } else {
            console.log('WebSocketService: Max reconnect attempts reached');
            this.emit('connection', { status: 'failed' });
        }
    }

    startHeartbeat() {
        this.stopHeartbeat();
        this.heartbeatTimer = setInterval(() => {
            this.send({ type: 'ping' });
        }, WS_CONFIG.HEARTBEAT_INTERVAL);
    }

    stopHeartbeat() {
        if (this.heartbeatTimer) {
            clearInterval(this.heartbeatTimer);
            this.heartbeatTimer = null;
        }
    }

    subscribeToChannels() {
        if (this.isConnected) {
            this.send({
                type: 'subscribe',
                payload: { channels: Array.from(this.subscriptions) }
            });
        }
    }

    handleMessage(data) {
        const { type, payload } = data;
        
        switch (type) {
            case 'connected':
                console.log('WebSocketService: Server confirmed connection', payload);
                break;
            case 'location_update':
                this.emit('location_update', payload);
                break;
            case 'sos_alert':
                this.playSOSSound();
                this.emit('sos_alert', payload);
                break;
            case 'sos_confirmed':
            case 'sos_resolved':
                this.emit('sos_resolved', payload);
                break;
            case 'geofence_alert':
                this.emit('geofence_alert', payload);
                break;
            case 'family_update':
                this.emit('family_update', payload);
                break;
            case 'grievance_message':
                this.emit(`grievance_message:${payload.grievance_id}`, payload);
                this.emit('grievance_message', payload);
                break;
            case 'grievance_update':
                this.emit('grievance_update', payload);
                break;
            case 'subscribed':
                console.log('WebSocketService: Subscribed to', payload?.channels);
                break;
            case 'pong':
            case 'heartbeat':
                break;
            default:
                this.emit(type, payload);
        }
    }

    playSOSSound() {
        getNotificationService().playSOSSound();
    }

    subscribe(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event).push(callback);

        return () => {
            const callbacks = this.listeners.get(event);
            const index = callbacks.indexOf(callback);
            if (index > -1) {
                callbacks.splice(index, 1);
            }
        };
    }

    emit(event, data) {
        const callbacks = this.listeners.get(event) || [];
        callbacks.forEach(callback => {
            try {
                callback(data);
            } catch (error) {
                console.error('WebSocketService: Listener error', error);
            }
        });
    }

    send(data) {
        if (this.ws?.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify(data));
        } else {
            console.warn('WebSocketService: Not connected, message not sent');
        }
    }

    sendLocationUpdate(location) {
        this.send({ type: 'location_update', payload: location });
    }

    triggerSOS(latitude, longitude, message) {
        this.send({ type: 'sos_trigger', payload: { latitude, longitude, message } });
    }

    sendGrievanceMessage(grievanceId, message, senderType = 'admin', senderId = null) {
        const payload = { 
            grievance_id: grievanceId, 
            message,
            sender_type: senderType,
            sender_id: senderId
        };
        
        this.send({ 
            type: 'grievance_message', 
            payload
        });
        
        return adminApi.sendGrievanceMessage(payload).then(response => {
            if (response.data.success) {
                return response.data;
            }
            throw new Error(response.data.message || 'Failed to save message');
        }).catch(err => {
            console.error('Failed to persist grievance message:', err);
            return { success: true, message: payload };
        });
    }

    subscribeToGrievance(grievanceId) {
        this.send({ type: 'subscribe', payload: { channels: [`grievance:${grievanceId}`] } });
    }

    unsubscribeFromGrievance(grievanceId) {
        this.send({ type: 'unsubscribe', payload: { channels: [`grievance:${grievanceId}`] } });
    }

    subscribeTo(channel) {
        this.subscriptions.add(channel);
        if (this.isConnected) {
            this.send({ type: 'subscribe', payload: { channels: [channel] } });
        }
    }

    unsubscribeFrom(channel) {
        this.subscriptions.delete(channel);
        if (this.isConnected) {
            this.send({ type: 'unsubscribe', payload: { channels: [channel] } });
        }
    }

    disconnect() {
        this.reconnectAttempts = this.maxReconnectAttempts;
        this.stopHeartbeat();
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
        this.listeners.clear();
        this.isConnected = false;
    }

    getConnectionStatus() {
        return this.isConnected;
    }

    getStats() {
        return {
            isConnected: this.isConnected,
            reconnectAttempts: this.reconnectAttempts,
            subscriptions: Array.from(this.subscriptions),
        };
    }
}

class LocationService {
    constructor() {
        this.watchId = null;
        this.onLocationUpdate = null;
    }

    startTracking(callback, options = {}) {
        if (!('geolocation' in navigator)) {
            console.error('Geolocation not supported');
            return false;
        }

        this.onLocationUpdate = callback;

        const watchOptions = {
            enableHighAccuracy: options.highAccuracy || false,
            maximumAge: options.maximumAge || 10000,
            timeout: options.timeout || 10000,
        };

        this.watchId = navigator.geolocation.watchPosition(
            (position) => {
                const location = {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                    accuracy: position.coords.accuracy,
                    speed: position.coords.speed,
                    heading: position.coords.heading,
                    altitude: position.coords.altitude,
                    timestamp: new Date(position.timestamp),
                };
                
                if (this.onLocationUpdate) {
                    this.onLocationUpdate(location);
                }
            },
            (error) => {
                console.error('Geolocation error:', error);
            },
            watchOptions
        );

        return this.watchId;
    }

    stopTracking() {
        if (this.watchId !== null) {
            navigator.geolocation.clearWatch(this.watchId);
            this.watchId = null;
        }
    }

    async getCurrentPosition() {
        return new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    resolve({
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                        accuracy: position.coords.accuracy,
                        speed: position.coords.speed,
                        heading: position.coords.heading,
                        timestamp: new Date(position.timestamp),
                    });
                },
                reject,
                { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
            );
        });
    }
}

class SOSService {
    constructor() {
        this.sosHistory = [];
    }

    async triggerSOS(location, message = '') {
        try {
            const response = await adminApi.post('/sos/trigger', {
                latitude: location.latitude,
                longitude: location.longitude,
                accuracy: location.accuracy,
                speed: location.speed,
                message,
                timestamp: new Date().toISOString(),
            });

            if (response.data.success) {
                this.addToHistory({
                    id: response.data.alertId,
                    location,
                    message,
                    triggeredAt: new Date(),
                    status: 'active',
                });
                return response.data;
            }
        } catch (error) {
            console.error('Error triggering SOS:', error);
            throw error;
        }
    }

    async resolveSOS(alertId, resolution = '') {
        try {
            const response = await adminApi.put(`/sos/${alertId}/resolve`, {
                resolution,
                resolvedAt: new Date().toISOString(),
            });

            if (response.data.success) {
                this.updateHistory(alertId, { status: 'resolved', resolvedAt: new Date() });
            }

            return response.data;
        } catch (error) {
            console.error('Error resolving SOS:', error);
            throw error;
        }
    }

    async notifyFamily(familyId, sosData) {
        try {
            const response = await adminApi.post(`/families/${familyId}/notify`, {
                type: 'sos_alert',
                sosData,
            });
            return response.data;
        } catch (error) {
            console.error('Error notifying family:', error);
            throw error;
        }
    }

    async sendEmergencyAlert(emergencyService, sosData) {
        try {
            const response = await adminApi.post(`/emergency/alert`, {
                serviceType: emergencyService,
                sosData,
            });
            return response.data;
        } catch (error) {
            console.error('Error sending emergency alert:', error);
            throw error;
        }
    }

    addToHistory(entry) {
        this.sosHistory.unshift(entry);
        if (this.sosHistory.length > 100) {
            this.sosHistory.pop();
        }
    }

    updateHistory(id, updates) {
        const index = this.sosHistory.findIndex(entry => entry.id === id);
        if (index > -1) {
            this.sosHistory[index] = { ...this.sosHistory[index], ...updates };
        }
    }

    getHistory() {
        return this.sosHistory;
    }
}

export const webSocketService = new WebSocketService();
export const notificationService = new NotificationService();
export const locationService = new LocationService();
export const sosService = new SOSService();

export default {
    webSocketService,
    notificationService,
    locationService,
    sosService,
};
