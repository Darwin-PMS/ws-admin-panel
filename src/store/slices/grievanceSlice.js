import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { adminApi } from '../../services/api';

const initialState = {
    grievances: [],
    stats: null,
    loading: false,
    error: null,
    filters: {
        status: '',
        priority: '',
        page: 0,
        rowsPerPage: 10,
    },
    totalCount: 0,
};

export const fetchGrievances = createAsyncThunk(
    'grievance/fetchGrievances',
    async (params = {}, { getState, rejectWithValue }) => {
        try {
            const state = getState().grievance;
            const queryParams = {
                page: (state.filters.page + 1) || params.page || 1,
                limit: state.filters.rowsPerPage || params.limit || 10,
                ...(state.filters.status && { status: state.filters.status }),
                ...(state.filters.priority && { priority: state.filters.priority }),
                ...params,
            };
            const response = await adminApi.getGrievances(queryParams);
            if (response.data.success) {
                return {
                    grievances: response.data.data || [],
                    totalCount: response.data.pagination?.total || 0,
                };
            }
            return rejectWithValue('Failed to fetch grievances');
        } catch (error) {
            return rejectWithValue(error.message || 'Network error');
        }
    }
);

export const fetchGrievanceStats = createAsyncThunk(
    'grievance/fetchStats',
    async (_, { rejectWithValue }) => {
        try {
            const response = await adminApi.getGrievanceStats();
            if (response.data.success) {
                return response.data.data;
            }
            return rejectWithValue('Failed to fetch stats');
        } catch (error) {
            return rejectWithValue(error.message || 'Network error');
        }
    }
);

export const updateGrievanceStatus = createAsyncThunk(
    'grievance/updateStatus',
    async ({ id, data }, { rejectWithValue }) => {
        try {
            const response = await adminApi.updateGrievanceStatus(id, data);
            if (response.data.success) {
                return { id, data };
            }
            return rejectWithValue('Failed to update grievance');
        } catch (error) {
            return rejectWithValue(error.message || 'Network error');
        }
    }
);

export const deleteGrievance = createAsyncThunk(
    'grievance/delete',
    async (id, { rejectWithValue }) => {
        try {
            const response = await adminApi.deleteGrievance(id);
            if (response.data.success) {
                return id;
            }
            return rejectWithValue('Failed to delete grievance');
        } catch (error) {
            return rejectWithValue(error.message || 'Network error');
        }
    }
);

const grievanceSlice = createSlice({
    name: 'grievance',
    initialState,
    reducers: {
        setStatusFilter: (state, action) => {
            state.filters.status = action.payload;
            state.filters.page = 0;
        },
        setPriorityFilter: (state, action) => {
            state.filters.priority = action.payload;
            state.filters.page = 0;
        },
        setPage: (state, action) => {
            state.filters.page = action.payload;
        },
        setRowsPerPage: (state, action) => {
            state.filters.rowsPerPage = action.payload;
            state.filters.page = 0;
        },
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchGrievances.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchGrievances.fulfilled, (state, action) => {
                state.loading = false;
                state.grievances = action.payload.grievances;
                state.totalCount = action.payload.totalCount;
            })
            .addCase(fetchGrievances.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(fetchGrievanceStats.fulfilled, (state, action) => {
                state.stats = action.payload;
            })
            .addCase(updateGrievanceStatus.fulfilled, (state, action) => {
                const index = state.grievances.findIndex(g => g.id === action.payload.id);
                if (index !== -1) {
                    state.grievances[index] = { ...state.grievances[index], ...action.payload.data };
                }
            })
            .addCase(deleteGrievance.fulfilled, (state, action) => {
                state.grievances = state.grievances.filter(g => g.id !== action.payload);
            });
    },
});

export const {
    setStatusFilter,
    setPriorityFilter,
    setPage,
    setRowsPerPage,
    clearError,
} = grievanceSlice.actions;

export default grievanceSlice.reducer;
