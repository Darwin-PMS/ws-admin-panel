import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { adminApi } from '../../services/api';

const initialState = {
    alerts: [],
    selectedAlert: null,
    totalCount: 0,
    loading: false,
    error: null,
    filters: {
        status: 'all',
        page: 0,
        rowsPerPage: 10,
    },
};

// Async thunks
export const fetchAlerts = createAsyncThunk(
    'alerts/fetchAlerts',
    async (params = {}, { rejectWithValue }) => {
        try {
            const response = await adminApi.getSOSAlerts(params);
            if (response.data.success) {
                const alerts = (response.data.alerts || []).map(a => ({
                    id: a.id,
                    userId: a.user_id,
                    type: a.type || 'emergency',
                    message: a.message || a.description || 'Emergency alert triggered',
                    status: a.status || 'active',
                    latitude: a.latitude,
                    longitude: a.longitude,
                    location: a.latitude && a.longitude ? `${a.latitude}, ${a.longitude}` : null,
                    mapUrl: a.latitude && a.longitude ? `https://www.google.com/maps?q=${a.latitude},${a.longitude}` : null,
                    userName: a.user_name || a.userName || 'Unknown User',
                    userPhone: a.user_phone || a.userPhone || null,
                    createdAt: a.created_at,
                    resolvedAt: a.resolved_at,
                }));
                return {
                    alerts,
                    total: response.data.total || response.data.alerts?.length || 0
                };
            }
            return rejectWithValue('Failed to fetch alerts');
        } catch (error) {
            return rejectWithValue(error.message || 'Network error');
        }
    }
);

export const fetchAlertById = createAsyncThunk(
    'alerts/fetchAlertById',
    async (id, { rejectWithValue }) => {
        try {
            const response = await adminApi.getSOSAlertById(id);
            if (response.data.success) {
                const a = response.data.alert;
                return {
                    id: a.id,
                    userId: a.user_id,
                    type: a.type || 'emergency',
                    message: a.message || a.description || 'Emergency alert triggered',
                    status: a.status || 'active',
                    latitude: a.latitude,
                    longitude: a.longitude,
                    location: a.latitude && a.longitude ? `${a.latitude}, ${a.longitude}` : null,
                    mapUrl: a.latitude && a.longitude ? `https://www.google.com/maps?q=${a.latitude},${a.longitude}` : null,
                    userName: a.user_name || a.userName || 'Unknown User',
                    userPhone: a.user_phone || a.userPhone || null,
                    createdAt: a.created_at,
                    resolvedAt: a.resolved_at,
                };
            }
            return rejectWithValue('Failed to fetch alert');
        } catch (error) {
            return rejectWithValue(error.message || 'Network error');
        }
    }
);

export const resolveAlert = createAsyncThunk(
    'alerts/resolveAlert',
    async (id, { rejectWithValue }) => {
        try {
            const response = await adminApi.resolveSOSAlert(id);
            if (response.data.success) {
                return id;
            }
            return rejectWithValue('Failed to resolve alert');
        } catch (error) {
            return rejectWithValue(error.message || 'Network error');
        }
    }
);

const alertsSlice = createSlice({
    name: 'alerts',
    initialState,
    reducers: {
        setFilters: (state, action) => {
            state.filters = { ...state.filters, ...action.payload };
        },
        setStatusFilter: (state, action) => {
            state.filters.status = action.payload;
        },
        setPage: (state, action) => {
            state.filters.page = action.payload;
        },
        setRowsPerPage: (state, action) => {
            state.filters.rowsPerPage = action.payload;
        },
        clearError: (state) => {
            state.error = null;
        },
        clearSelectedAlert: (state) => {
            state.selectedAlert = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch Alerts
            .addCase(fetchAlerts.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchAlerts.fulfilled, (state, action) => {
                state.loading = false;
                state.alerts = action.payload.alerts;
                state.totalCount = action.payload.total;
            })
            .addCase(fetchAlerts.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Fetch Alert By ID
            .addCase(fetchAlertById.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchAlertById.fulfilled, (state, action) => {
                state.loading = false;
                state.selectedAlert = action.payload;
            })
            .addCase(fetchAlertById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Resolve Alert
            .addCase(resolveAlert.fulfilled, (state, action) => {
                const index = state.alerts.findIndex(a => a.id === action.payload);
                if (index !== -1) {
                    state.alerts[index] = { ...state.alerts[index], status: 'resolved' };
                }
                if (state.selectedAlert?.id === action.payload) {
                    state.selectedAlert = { ...state.selectedAlert, status: 'resolved' };
                }
            });
    },
});

export const {
    setFilters,
    setStatusFilter,
    setPage,
    setRowsPerPage,
    clearError,
    clearSelectedAlert
} = alertsSlice.actions;

// Selectors
export const selectAlerts = (state) => state.alerts.alerts;
export const selectAlertsLoading = (state) => state.alerts.loading;
export const selectAlertsError = (state) => state.alerts.error;
export const selectAlertsTotalCount = (state) => state.alerts.totalCount;
export const selectAlertFilters = (state) => state.alerts.filters;
export const selectAlertsPage = (state) => state.alerts.filters.page;
export const selectAlertsRowsPerPage = (state) => state.alerts.filters.rowsPerPage;
export default alertsSlice.reducer;
