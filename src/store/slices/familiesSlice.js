import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { adminApi } from '../../services/api';

const initialState = {
    families: [],
    selectedFamily: null,
    familyMembers: [],
    totalCount: 0,
    loading: false,
    error: null,
    filters: {
        search: '',
        status: 'all',
        page: 0,
        rowsPerPage: 10,
    },
};

export const fetchFamilies = createAsyncThunk(
    'families/fetchFamilies',
    async (params = {}, { rejectWithValue }) => {
        try {
            const response = await adminApi.families.list(params);
            if (response.data.success) {
                const families = (response.data.families || []).map((f) => ({
                    id: f.id,
                    name: f.name || 'Unnamed Family',
                    code: f.code,
                    description: f.description,
                    status: f.status || 'active',
                    createdAt: f.createdAt ? new Date(f.createdAt).toLocaleDateString() : 'N/A',
                    creatorName: f.creatorName || 'Unknown',
                    memberCount: f.memberCount || 0,
                    locationCount: f.locationCount || 0,
                }));
                return {
                    families,
                    total: response.data.total || families.length
                };
            }
            return rejectWithValue('Failed to fetch families');
        } catch (error) {
            return rejectWithValue(error.message || 'Network error');
        }
    }
);

export const fetchFamilyById = createAsyncThunk(
    'families/fetchFamilyById',
    async (id, { rejectWithValue }) => {
        try {
            const response = await adminApi.families.get(id);
            if (response.data.success) {
                const family = response.data.family;
                const members = response.data.members || [];
                return {
                    family: {
                        id: family.id,
                        name: family.name || 'Unnamed Family',
                        code: family.code,
                        description: family.description,
                        status: family.status || 'active',
                        createdAt: family.createdAt ? new Date(family.createdAt).toLocaleDateString() : 'N/A',
                        creatorName: family.creatorName || 'Unknown',
                        memberCount: family.memberCount || members.length,
                        locationCount: family.locationCount || 0,
                    },
                    members: members.map(m => ({
                        id: m.id,
                        user_id: m.user_id,
                        name: m.name || `${m.first_name || ''} ${m.last_name || ''}`.trim() || m.email || 'Unknown',
                        email: m.email,
                        phone: m.phone,
                        role: m.role || m.user_role,
                        joinedAt: m.joinedAt || m.joined_at,
                    }))
                };
            }
            return rejectWithValue('Failed to fetch family');
        } catch (error) {
            return rejectWithValue(error.message || 'Network error');
        }
    }
);

export const createFamily = createAsyncThunk(
    'families/createFamily',
    async (data, { rejectWithValue }) => {
        try {
            const response = await adminApi.families.create(data);
            if (response.data.success) {
                return response.data;
            }
            return rejectWithValue('Failed to create family');
        } catch (error) {
            return rejectWithValue(error.message || 'Network error');
        }
    }
);

export const updateFamily = createAsyncThunk(
    'families/updateFamily',
    async ({ id, data }, { rejectWithValue }) => {
        try {
            const response = await adminApi.families.update(id, data);
            if (response.data.success) {
                return { id, data };
            }
            return rejectWithValue('Failed to update family');
        } catch (error) {
            return rejectWithValue(error.message || 'Network error');
        }
    }
);

export const deleteFamily = createAsyncThunk(
    'families/deleteFamily',
    async (id, { rejectWithValue }) => {
        try {
            const response = await adminApi.families.delete(id);
            if (response.data.success) {
                return id;
            }
            return rejectWithValue('Failed to delete family');
        } catch (error) {
            return rejectWithValue(error.message || 'Network error');
        }
    }
);

const familiesSlice = createSlice({
    name: 'families',
    initialState,
    reducers: {
        setFilters: (state, action) => {
            state.filters = { ...state.filters, ...action.payload };
        },
        setSearch: (state, action) => {
            state.filters.search = action.payload;
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
        clearSelectedFamily: (state) => {
            state.selectedFamily = null;
            state.familyMembers = [];
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchFamilies.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchFamilies.fulfilled, (state, action) => {
                state.loading = false;
                state.families = action.payload.families;
                state.totalCount = action.payload.total;
            })
            .addCase(fetchFamilies.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(fetchFamilyById.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchFamilyById.fulfilled, (state, action) => {
                state.loading = false;
                state.selectedFamily = action.payload.family;
                state.familyMembers = action.payload.members;
            })
            .addCase(fetchFamilyById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(createFamily.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createFamily.fulfilled, (state) => {
                state.loading = false;
            })
            .addCase(createFamily.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(updateFamily.fulfilled, (state, action) => {
                state.loading = false;
                const index = state.families.findIndex(f => f.id === action.payload.id);
                if (index !== -1) {
                    state.families[index] = { ...state.families[index], ...action.payload.data };
                }
                if (state.selectedFamily?.id === action.payload.id) {
                    state.selectedFamily = { ...state.selectedFamily, ...action.payload.data };
                }
            })
            .addCase(deleteFamily.fulfilled, (state, action) => {
                state.loading = false;
                state.families = state.families.filter(f => f.id !== action.payload);
                state.totalCount = Math.max(0, state.totalCount - 1);
            });
    },
});

export const {
    setFilters,
    setSearch,
    setStatusFilter,
    setPage,
    setRowsPerPage,
    clearError,
    clearSelectedFamily
} = familiesSlice.actions;

export default familiesSlice.reducer;
