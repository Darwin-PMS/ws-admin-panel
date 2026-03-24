import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { adminApi } from '../../services/api';

const initialState = {
    stats: null,
    analytics: null,
    loading: false,
    error: null,
    timeRange: 'week',
};

// Async thunks
export const fetchStats = createAsyncThunk(
    'analytics/fetchStats',
    async (_, { rejectWithValue }) => {
        try {
            const response = await adminApi.getStats();
            if (response.data.success) {
                return response.data.stats;
            }
            return rejectWithValue('Failed to fetch stats');
        } catch (error) {
            return rejectWithValue(error.message || 'Network error');
        }
    }
);

export const fetchAnalytics = createAsyncThunk(
    'analytics/fetchAnalytics',
    async (timeRange = 'week', { rejectWithValue }) => {
        try {
            const response = await adminApi.getAnalytics(timeRange);
            if (response.data.success) {
                return { data: response.data, timeRange };
            }
            return rejectWithValue('Failed to fetch analytics');
        } catch (error) {
            return rejectWithValue(error.message || 'Network error');
        }
    }
);

const analyticsSlice = createSlice({
    name: 'analytics',
    initialState,
    reducers: {
        setTimeRange: (state, action) => {
            state.timeRange = action.payload;
        },
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch Stats
            .addCase(fetchStats.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchStats.fulfilled, (state, action) => {
                state.loading = false;
                state.stats = action.payload;
            })
            .addCase(fetchStats.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Fetch Analytics
            .addCase(fetchAnalytics.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchAnalytics.fulfilled, (state, action) => {
                state.loading = false;
                state.analytics = action.payload.data;
                state.timeRange = action.payload.timeRange;
            })
            .addCase(fetchAnalytics.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const { setTimeRange, clearError } = analyticsSlice.actions;
export default analyticsSlice.reducer;
