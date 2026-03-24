import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { adminApi } from '../../services/api';

const initialState = {
    families: [],
    selectedFamily: null,
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

// Async thunks
export const fetchFamilies = createAsyncThunk(
    'families/fetchFamilies',
    async (params = {}, { rejectWithValue }) => {
        try {
            const response = await adminApi.getFamilies(params);
            if (response.data.success) {
                // Transform users into families
                const familyData = (response.data.families || []).map((user) => ({
                    id: user.id,
                    name: `${user.firstName} ${user.lastName}'s Family`,
                    owner: `${user.firstName} ${user.lastName}`,
                    members: user.familyMembers || user.membersCount || 2,
                    children: user.childrenCount || 1,
                    createdAt: user.createdAt ? new Date(user.createdAt).toLocaleDateString() : new Date().toLocaleDateString(),
                    status: user.isActive ? 'active' : 'inactive',
                }));
                return {
                    families: familyData,
                    total: response.data.total || response.data.families?.length || 0
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
            const response = await adminApi.getFamilyById(id);
            if (response.data.success) {
                return response.data.family;
            }
            return rejectWithValue('Failed to fetch family');
        } catch (error) {
            return rejectWithValue(error.message || 'Network error');
        }
    }
);

export const updateFamily = createAsyncThunk(
    'families/updateFamily',
    async ({ id, data }, { rejectWithValue }) => {
        try {
            const response = await adminApi.updateFamily(id, data);
            if (response.data.success) {
                return response.data.family;
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
            const response = await adminApi.deleteFamily(id);
            if (response.data.success) {
                return id;
            }
            return rejectWithValue('Failed to delete family');
        } catch (error) {
            return rejectWithValue(error.message || 'Network error');
        }
    }
);

export const createFamily = createAsyncThunk(
    'families/createFamily',
    async (data, { rejectWithValue }) => {
        try {
            const response = await adminApi.createFamily(data);
            if (response.data.success) {
                return response.data.family;
            }
            return rejectWithValue('Failed to create family');
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
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch Families
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
            // Fetch Family By ID
            .addCase(fetchFamilyById.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchFamilyById.fulfilled, (state, action) => {
                state.loading = false;
                state.selectedFamily = action.payload;
            })
            .addCase(fetchFamilyById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Update Family
            .addCase(updateFamily.fulfilled, (state, action) => {
                const index = state.families.findIndex(f => f.id === action.payload.id);
                if (index !== -1) {
                    state.families[index] = action.payload;
                }
                if (state.selectedFamily?.id === action.payload.id) {
                    state.selectedFamily = action.payload;
                }
            })
            // Delete Family
            .addCase(deleteFamily.fulfilled, (state, action) => {
                state.families = state.families.filter(f => f.id !== action.payload);
                state.totalCount = Math.max(0, state.totalCount - 1);
            })
            // Create Family
            .addCase(createFamily.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createFamily.fulfilled, (state, action) => {
                state.loading = false;
                state.families.unshift(action.payload);
                state.totalCount += 1;
            })
            .addCase(createFamily.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
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
