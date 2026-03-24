import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { adminApi } from '../../services/api';

// Define user roles
export const USER_ROLES = {
    SYSTEM_ADMIN: 'system_admin',
    AGENCY_ADMIN: 'agency_admin',
    ADMIN: 'admin',
    SUPERVISOR: 'supervisor',
    WOMAN: 'woman',
    PARENT: 'parent',
    GUARDIAN: 'guardian',
};

// Check if user has admin role
export const isAdminRole = (role) => {
    return [USER_ROLES.SYSTEM_ADMIN, USER_ROLES.AGENCY_ADMIN, USER_ROLES.ADMIN, USER_ROLES.SUPERVISOR].includes(role);
};

const initialState = {
    user: null,
    isAuthenticated: false,
    loading: false,
    error: null,
    token: localStorage.getItem('adminToken') || null,
    // Token refresh state
    tokenRefreshFailed: false,
};

// Async thunks
export const loginUser = createAsyncThunk(
    'auth/login',
    async ({ email, password }, { rejectWithValue }) => {
        try {
            const response = await adminApi.login({ email, password });

            if (response.data.success) {
                localStorage.setItem('adminToken', response.data.token);
                return {
                    user: response.data.user,
                    token: response.data.token
                };
            }

            // Login failed with error message from server
            return rejectWithValue(response.data.message || 'Login failed');
        } catch (error) {
            // Network error or server not running
            const errorMessage = error.message || 'Unable to connect to server. Please check your connection.';
            return rejectWithValue(errorMessage);
        }
    }
);

export const checkAuth = createAsyncThunk(
    'auth/checkAuth',
    async (_, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem('adminToken');
            if (!token) {
                return rejectWithValue('No token found');
            }

            const response = await adminApi.getProfile();

            if (response.data.success) {
                return { user: response.data.user, token };
            }

            // Token invalid or expired
            localStorage.removeItem('adminToken');
            return rejectWithValue('Session expired. Please login again.');
        } catch (error) {
            localStorage.removeItem('adminToken');
            const errorMessage = error.response?.data?.message || 'Session expired. Please login again.';
            return rejectWithValue(errorMessage);
        }
    }
);

export const logoutUser = createAsyncThunk(
    'auth/logout',
    async (_, { rejectWithValue }) => {
        try {
            // Try to invalidate token on server, but continue with local logout even if it fails
            await adminApi.logout();
        } catch (error) {
            console.log('Logout API call failed, continuing with local logout');
        } finally {
            localStorage.removeItem('adminToken');
        }
    }
);

// Helper function to check if user is logged in (has valid token)
export const isLoggedIn = () => {
    return !!localStorage.getItem('adminToken');
};

export const refreshToken = createAsyncThunk(
    'auth/refreshToken',
    async (_, { rejectWithValue }) => {
        try {
            const response = await adminApi.refreshToken();

            if (response.data.success) {
                localStorage.setItem('adminToken', response.data.token);
                return { token: response.data.token };
            }

            return rejectWithValue('Token refresh failed');
        } catch (error) {
            return rejectWithValue('Token refresh failed. Please login again.');
        }
    }
);

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        setUser: (state, action) => {
            state.user = action.payload;
            state.isAuthenticated = true;
        },
        setTokenRefreshFailed: (state, action) => {
            state.tokenRefreshFailed = action.payload;
        },
        // Synchronous logout (clears state without API call)
        logout: (state) => {
            state.user = null;
            state.token = null;
            state.isAuthenticated = false;
            state.error = null;
            state.tokenRefreshFailed = false;
            localStorage.removeItem('adminToken');
        },
    },
    extraReducers: (builder) => {
        builder
            // Login
            .addCase(loginUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(loginUser.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload.user;
                state.token = action.payload.token;
                state.isAuthenticated = true;
                state.error = null;
                state.tokenRefreshFailed = false;
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
                state.isAuthenticated = false;
            })
            // Check Auth
            .addCase(checkAuth.pending, (state) => {
                state.loading = true;
            })
            .addCase(checkAuth.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload.user;
                state.token = action.payload.token;
                state.isAuthenticated = true;
                state.error = null;
            })
            .addCase(checkAuth.rejected, (state, action) => {
                state.loading = false;
                state.user = null;
                state.token = null;
                state.isAuthenticated = false;
                state.error = action.payload;
            })
            // Logout
            .addCase(logoutUser.fulfilled, (state) => {
                state.user = null;
                state.token = null;
                state.isAuthenticated = false;
                state.error = null;
                state.tokenRefreshFailed = false;
            })
            // Refresh Token
            .addCase(refreshToken.fulfilled, (state, action) => {
                state.token = action.payload.token;
                state.tokenRefreshFailed = false;
            })
            .addCase(refreshToken.rejected, (state) => {
                state.tokenRefreshFailed = true;
            });
    },
});

export const { clearError, setUser, setTokenRefreshFailed, logout } = authSlice.actions;

// Selectors
export const selectCurrentUser = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectAuthLoading = (state) => state.auth.loading;
export const selectAuthError = (state) => state.auth.error;
export const selectUserRole = (state) => state.auth.user?.role;
export const selectIsAdmin = (state) => state.auth.user && isAdminRole(state.auth.user.role);

export default authSlice.reducer;
