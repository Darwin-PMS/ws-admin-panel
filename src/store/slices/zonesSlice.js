import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { adminApi } from '../../services/api';

const initialState = {
    zones: [],
    selectedZone: null,
    totalCount: 0,
    loading: false,
    error: null,
    filters: {
        search: '',
        type: 'all',
    },
};

export const fetchZones = createAsyncThunk(
    'zones/fetchZones',
    async (params = {}, { rejectWithValue }) => {
        try {
            const response = await adminApi.getZones(params);
            if (response.data.success) {
                return {
                    zones: response.data.data || [],
                    total: response.data.data?.length || 0
                };
            }
            return rejectWithValue('Failed to fetch zones');
        } catch (error) {
            return rejectWithValue(error.message || 'Network error');
        }
    }
);

export const fetchZoneById = createAsyncThunk(
    'zones/fetchZoneById',
    async (id, { rejectWithValue }) => {
        try {
            const response = await adminApi.getZoneById(id);
            if (response.data.success) {
                return response.data.data;
            }
            return rejectWithValue('Failed to fetch zone');
        } catch (error) {
            return rejectWithValue(error.message || 'Network error');
        }
    }
);

export const createZone = createAsyncThunk(
    'zones/createZone',
    async (data, { rejectWithValue }) => {
        try {
            const response = await adminApi.createZone(data);
            if (response.data.success) {
                return response.data.data;
            }
            return rejectWithValue(response.data.message || 'Failed to create zone');
        } catch (error) {
            return rejectWithValue(error.message || 'Network error');
        }
    }
);

export const updateZone = createAsyncThunk(
    'zones/updateZone',
    async ({ id, data }, { rejectWithValue }) => {
        try {
            const response = await adminApi.updateZone(id, data);
            if (response.data.success) {
                return response.data.data;
            }
            return rejectWithValue(response.data.message || 'Failed to update zone');
        } catch (error) {
            return rejectWithValue(error.message || 'Network error');
        }
    }
);

export const deleteZone = createAsyncThunk(
    'zones/deleteZone',
    async (id, { rejectWithValue }) => {
        try {
            const response = await adminApi.deleteZone(id);
            if (response.data.success) {
                return id;
            }
            return rejectWithValue(response.data.message || 'Failed to delete zone');
        } catch (error) {
            return rejectWithValue(error.message || 'Network error');
        }
    }
);

const zonesSlice = createSlice({
    name: 'zones',
    initialState,
    reducers: {
        setFilters: (state, action) => {
            state.filters = { ...state.filters, ...action.payload };
        },
        setSearch: (state, action) => {
            state.filters.search = action.payload;
        },
        setTypeFilter: (state, action) => {
            state.filters.type = action.payload;
        },
        clearError: (state) => {
            state.error = null;
        },
        clearSelectedZone: (state) => {
            state.selectedZone = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchZones.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchZones.fulfilled, (state, action) => {
                state.loading = false;
                state.zones = action.payload.zones;
                state.totalCount = action.payload.total;
            })
            .addCase(fetchZones.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(fetchZoneById.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchZoneById.fulfilled, (state, action) => {
                state.loading = false;
                state.selectedZone = action.payload;
            })
            .addCase(fetchZoneById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(createZone.fulfilled, (state, action) => {
                state.zones.push(action.payload);
            })
            .addCase(updateZone.fulfilled, (state, action) => {
                const index = state.zones.findIndex(z => z.id === action.payload.id);
                if (index !== -1) {
                    state.zones[index] = action.payload;
                }
                if (state.selectedZone?.id === action.payload.id) {
                    state.selectedZone = action.payload;
                }
            })
            .addCase(deleteZone.fulfilled, (state, action) => {
                state.zones = state.zones.filter(z => z.id !== action.payload);
                state.totalCount = Math.max(0, state.totalCount - 1);
            });
    },
});

export const {
    setFilters,
    setSearch,
    setTypeFilter,
    clearError,
    clearSelectedZone
} = zonesSlice.actions;

export default zonesSlice.reducer;
