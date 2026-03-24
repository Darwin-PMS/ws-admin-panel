import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { adminApi } from '../../services/api';

const initialState = {
    logs: [],
    totalCount: 0,
    loading: false,
    error: null,
    filters: {
        search: '',
        action: 'all',
        page: 0,
        rowsPerPage: 10,
    },
};

// Async thunks
export const fetchActivityLogs = createAsyncThunk(
    'activityLogs/fetchActivityLogs',
    async (params = {}, { rejectWithValue }) => {
        try {
            const response = await adminApi.getActivityLogs(params);
            if (response.data.success) {
                // Transform timestamps to readable format
                const logs = (response.data.logs || []).map((log) => ({
                    ...log,
                    timestamp: log.timestamp ? new Date(log.timestamp).toLocaleString() : new Date().toLocaleString(),
                }));
                return {
                    logs,
                    total: response.data.total || response.data.logs?.length || 0
                };
            }
            return rejectWithValue('Failed to fetch activity logs');
        } catch (error) {
            return rejectWithValue(error.message || 'Network error');
        }
    }
);

const activityLogsSlice = createSlice({
    name: 'activityLogs',
    initialState,
    reducers: {
        setFilters: (state, action) => {
            state.filters = { ...state.filters, ...action.payload };
        },
        setSearch: (state, action) => {
            state.filters.search = action.payload;
        },
        setActionFilter: (state, action) => {
            state.filters.action = action.payload;
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
    },
    extraReducers: (builder) => {
        builder
            // Fetch Activity Logs
            .addCase(fetchActivityLogs.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchActivityLogs.fulfilled, (state, action) => {
                state.loading = false;
                state.logs = action.payload.logs;
                state.totalCount = action.payload.total;
            })
            .addCase(fetchActivityLogs.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const {
    setFilters,
    setSearch,
    setActionFilter,
    setPage,
    setRowsPerPage,
    clearError
} = activityLogsSlice.actions;

export default activityLogsSlice.reducer;
