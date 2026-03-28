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
    conversation: [],
    conversationLoading: false,
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
                const grievances = (response.data.data || []).map(g => ({
                    id: g.id,
                    user_id: g.user_id,
                    user_first_name: g.user_first_name || '',
                    user_last_name: g.user_last_name || '',
                    user_email: g.user_email || '',
                    user_phone: g.user_phone || '',
                    title: g.title || '',
                    description: g.description || '',
                    category: g.category || '',
                    priority: g.priority || 'medium',
                    status: g.status || 'pending',
                    resolution_notes: g.resolution_notes || '',
                    assigned_to: g.assigned_to,
                    created_at: g.created_at,
                    updated_at: g.updated_at,
                }));
                return {
                    grievances,
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
                const stats = response.data.data || {};
                return {
                    total: stats.total || 0,
                    pending: stats.pending || 0,
                    inProgress: stats.inProgress || 0,
                    resolved: stats.resolved || 0,
                    rejected: stats.rejected || 0,
                    urgent: stats.urgent || 0,
                    byCategory: stats.byCategory || [],
                };
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

export const fetchGrievanceConversation = createAsyncThunk(
    'grievance/fetchConversation',
    async (grievanceId, { rejectWithValue }) => {
        try {
            const response = await adminApi.getGrievanceConversation(grievanceId);
            if (response.data.success) {
                return response.data.messages || [];
            }
            return rejectWithValue('Failed to fetch conversation');
        } catch (error) {
            return rejectWithValue(error.message || 'Network error');
        }
    }
);

export const sendGrievanceMessage = createAsyncThunk(
    'grievance/sendMessage',
    async (messageData, { rejectWithValue }) => {
        try {
            const response = await adminApi.sendGrievanceMessage(messageData);
            return response.data.message || {
                ...messageData,
                id: response.data.id || `temp_${Date.now()}`,
                created_at: new Date().toISOString(),
            };
        } catch (error) {
            console.warn('API call failed, message may be sent via WebSocket:', error);
            return {
                ...messageData,
                id: `temp_${Date.now()}`,
                created_at: new Date().toISOString(),
                via_websocket: true,
            };
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
        clearConversation: (state) => {
            state.conversation = [];
        },
        addMessage: (state, action) => {
            const newMessage = action.payload;
            if (!state.conversation.find(m => m.id === newMessage.id)) {
                state.conversation.push(newMessage);
            }
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
            })
            .addCase(fetchGrievanceConversation.pending, (state) => {
                state.conversationLoading = true;
            })
            .addCase(fetchGrievanceConversation.fulfilled, (state, action) => {
                state.conversationLoading = false;
                state.conversation = action.payload;
            })
            .addCase(fetchGrievanceConversation.rejected, (state) => {
                state.conversationLoading = false;
            })
            .addCase(sendGrievanceMessage.fulfilled, (state, action) => {
                state.conversation.push(action.payload);
            });
    },
});

export const {
    setStatusFilter,
    setPriorityFilter,
    setPage,
    setRowsPerPage,
    clearError,
    clearConversation,
    addMessage,
} = grievanceSlice.actions;

export default grievanceSlice.reducer;
