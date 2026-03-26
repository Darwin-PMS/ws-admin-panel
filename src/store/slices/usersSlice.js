import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { adminApi } from '../../services/api';

const initialState = {
    users: [],
    selectedUser: null,
    totalCount: 0,
    loading: false,
    error: null,
    filters: {
        search: '',
        role: 'all',
        page: 0,
        rowsPerPage: 10,
    },
};

// Async thunks
export const fetchUsers = createAsyncThunk(
    'users/fetchUsers',
    async (params = {}, { rejectWithValue }) => {
        try {
            const response = await adminApi.getUsers(params);
            if (response.data.success) {
                const users = (response.data.users || []).map(u => ({
                    id: u.id,
                    firstName: u.first_name,
                    lastName: u.last_name,
                    email: u.email,
                    phone: u.phone,
                    role: u.role,
                    isActive: u.is_active,
                    isVerified: u.is_verified,
                    createdAt: u.created_at,
                }));
                return {
                    users,
                    total: response.data.total || response.data.users?.length || 0
                };
            }
            return rejectWithValue('Failed to fetch users');
        } catch (error) {
            return rejectWithValue(error.message || 'Network error');
        }
    }
);

export const fetchUserById = createAsyncThunk(
    'users/fetchUserById',
    async (id, { rejectWithValue }) => {
        try {
            const response = await adminApi.getUserById(id);
            if (response.data.success) {
                const u = response.data.user;
                return {
                    id: u.id,
                    firstName: u.first_name,
                    lastName: u.last_name,
                    email: u.email,
                    phone: u.phone,
                    role: u.role,
                    isActive: u.is_active,
                    isVerified: u.is_verified,
                    createdAt: u.created_at,
                };
            }
            return rejectWithValue('Failed to fetch user');
        } catch (error) {
            return rejectWithValue(error.message || 'Network error');
        }
    }
);

export const updateUser = createAsyncThunk(
    'users/updateUser',
    async ({ id, data }, { rejectWithValue }) => {
        try {
            const response = await adminApi.updateUser(id, data);
            if (response.data.success) {
                return response.data.user;
            }
            return rejectWithValue('Failed to update user');
        } catch (error) {
            return rejectWithValue(error.message || 'Network error');
        }
    }
);

export const deleteUser = createAsyncThunk(
    'users/deleteUser',
    async (id, { rejectWithValue }) => {
        try {
            const response = await adminApi.deleteUser(id);
            if (response.data.success) {
                return id;
            }
            return rejectWithValue('Failed to delete user');
        } catch (error) {
            return rejectWithValue(error.message || 'Network error');
        }
    }
);

const usersSlice = createSlice({
    name: 'users',
    initialState,
    reducers: {
        setFilters: (state, action) => {
            state.filters = { ...state.filters, ...action.payload };
        },
        setSearch: (state, action) => {
            state.filters.search = action.payload;
        },
        setRoleFilter: (state, action) => {
            state.filters.role = action.payload;
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
        clearSelectedUser: (state) => {
            state.selectedUser = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch Users
            .addCase(fetchUsers.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchUsers.fulfilled, (state, action) => {
                state.loading = false;
                state.users = action.payload.users;
                state.totalCount = action.payload.total;
            })
            .addCase(fetchUsers.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Fetch User By ID
            .addCase(fetchUserById.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchUserById.fulfilled, (state, action) => {
                state.loading = false;
                state.selectedUser = action.payload;
            })
            .addCase(fetchUserById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Update User
            .addCase(updateUser.fulfilled, (state, action) => {
                const index = state.users.findIndex(u => u.id === action.payload.id);
                if (index !== -1) {
                    state.users[index] = action.payload;
                }
                if (state.selectedUser?.id === action.payload.id) {
                    state.selectedUser = action.payload;
                }
            })
            // Delete User
            .addCase(deleteUser.fulfilled, (state, action) => {
                state.users = state.users.filter(u => u.id !== action.payload);
                state.totalCount = Math.max(0, state.totalCount - 1);
            });
    },
});

export const {
    setFilters,
    setSearch,
    setRoleFilter,
    setPage,
    setRowsPerPage,
    clearError,
    clearSelectedUser
} = usersSlice.actions;
export default usersSlice.reducer;
