import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { adminApi } from '../../services/api';

const initialState = {
    settings: {
        siteName: '',
        siteDescription: '',
        emailNotifications: true,
        sosAlerts: true,
        weeklyReports: false,
        language: 'en',
        theme: 'dark',
        maintenanceMode: false,
    },
    loading: false,
    error: null,
    saved: false,
};

// Async thunks
export const fetchSettings = createAsyncThunk(
    'settings/fetchSettings',
    async (_, { rejectWithValue }) => {
        try {
            const response = await adminApi.getSettings();
            if (response.data.success) {
                const settingsArray = response.data.settings || [];
                const settingsMap = {};
                settingsArray.forEach(s => {
                    settingsMap[s.setting_key] = s.setting_value;
                });
                return {
                    siteName: settingsMap.siteName || 'Women Safety App',
                    siteDescription: settingsMap.siteDescription || 'A comprehensive women safety application',
                    emailNotifications: settingsMap.emailNotifications === 'true' || settingsMap.emailNotifications === true,
                    sosAlerts: settingsMap.sosAlerts !== 'false',
                    weeklyReports: settingsMap.weeklyReports === 'true',
                    language: settingsMap.language || 'en',
                    theme: settingsMap.theme || 'dark',
                    maintenanceMode: settingsMap.maintenanceMode === 'true',
                };
            }
            return rejectWithValue('Failed to fetch settings');
        } catch (error) {
            return rejectWithValue(error.message || 'Network error');
        }
    }
);

export const updateSettings = createAsyncThunk(
    'settings/updateSettings',
    async (settings, { rejectWithValue }) => {
        try {
            const updates = [];
            for (const [key, value] of Object.entries(settings)) {
                updates.push(adminApi.updateSettings({ key, value: String(value) }));
            }
            await Promise.all(updates);
            return settings;
        } catch (error) {
            return rejectWithValue(error.message || 'Network error');
        }
    }
);

const settingsSlice = createSlice({
    name: 'settings',
    initialState,
    reducers: {
        setSetting: (state, action) => {
            state.settings = { ...state.settings, ...action.payload };
        },
        clearSaved: (state) => {
            state.saved = false;
        },
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch Settings
            .addCase(fetchSettings.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchSettings.fulfilled, (state, action) => {
                state.loading = false;
                state.settings = action.payload;
            })
            .addCase(fetchSettings.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Update Settings
            .addCase(updateSettings.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateSettings.fulfilled, (state, action) => {
                state.loading = false;
                state.settings = { ...state.settings, ...action.payload };
                state.saved = true;
            })
            .addCase(updateSettings.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const {
    setSetting,
    clearSaved,
    clearError
} = settingsSlice.actions;

export default settingsSlice.reducer;
