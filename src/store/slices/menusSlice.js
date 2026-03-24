import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { adminApi } from '../../services/api';

const initialState = {
    menus: [],
    loading: false,
    error: null,
};

export const fetchMenus = createAsyncThunk(
    'menus/fetchMenus',
    async (params = {}, { rejectWithValue }) => {
        try {
            const response = await adminApi.getAllMenus({ includeInactive: 'true', ...params });
            if (response.data.success) {
                return response.data.data || [];
            }
            return rejectWithValue('Failed to fetch menus');
        } catch (error) {
            return rejectWithValue(error.message || 'Network error');
        }
    }
);

export const createMenu = createAsyncThunk(
    'menus/createMenu',
    async (data, { rejectWithValue }) => {
        try {
            const response = await adminApi.createMenu(data);
            if (response.data.success) {
                return response.data.data;
            }
            return rejectWithValue('Failed to create menu');
        } catch (error) {
            return rejectWithValue(error.message || 'Network error');
        }
    }
);

export const updateMenu = createAsyncThunk(
    'menus/updateMenu',
    async ({ id, data }, { rejectWithValue }) => {
        try {
            const response = await adminApi.updateMenu(id, data);
            if (response.data.success) {
                return { id, data: response.data.data };
            }
            return rejectWithValue('Failed to update menu');
        } catch (error) {
            return rejectWithValue(error.message || 'Network error');
        }
    }
);

export const deleteMenu = createAsyncThunk(
    'menus/deleteMenu',
    async (id, { rejectWithValue }) => {
        try {
            const response = await adminApi.deleteMenu(id);
            if (response.data.success) {
                return id;
            }
            return rejectWithValue('Failed to delete menu');
        } catch (error) {
            return rejectWithValue(error.message || 'Network error');
        }
    }
);

export const toggleMenuVisibility = createAsyncThunk(
    'menus/toggleVisibility',
    async (menu, { rejectWithValue }) => {
        try {
            const newVisibility = !menu.isVisible;
            const response = await adminApi.updateMenu(menu.id, {
                isVisible: newVisibility,
                isActive: newVisibility,
            });
            if (response.data.success) {
                return { id: menu.id, isVisible: newVisibility };
            }
            return rejectWithValue('Failed to toggle visibility');
        } catch (error) {
            return rejectWithValue(error.message || 'Network error');
        }
    }
);

const menusSlice = createSlice({
    name: 'menus',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchMenus.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchMenus.fulfilled, (state, action) => {
                state.loading = false;
                state.menus = action.payload;
            })
            .addCase(fetchMenus.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(createMenu.fulfilled, (state, action) => {
                state.menus.push(action.payload);
            })
            .addCase(updateMenu.fulfilled, (state, action) => {
                const index = state.menus.findIndex(m => m.id === action.payload.id);
                if (index !== -1) {
                    state.menus[index] = { ...state.menus[index], ...action.payload.data };
                }
            })
            .addCase(deleteMenu.fulfilled, (state, action) => {
                state.menus = state.menus.filter(m => m.id !== action.payload);
            })
            .addCase(toggleMenuVisibility.fulfilled, (state, action) => {
                const index = state.menus.findIndex(m => m.id === action.payload.id);
                if (index !== -1) {
                    state.menus[index].isVisible = action.payload.isVisible;
                    state.menus[index].isActive = action.payload.isVisible;
                }
            });
    },
});

export const { clearError } = menusSlice.actions;

export default menusSlice.reducer;
