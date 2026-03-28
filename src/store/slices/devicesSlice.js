import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { adminApi } from '../../services/api';

const initialState = {
    devices: [],
    selectedDevice: null,
    totalCount: 0,
    loading: false,
    error: null,
    filters: {
        type: 'all',
        status: 'all',
        page: 0,
        rowsPerPage: 10,
    },
};

// Async thunks
export const fetchDevices = createAsyncThunk(
    'devices/fetchDevices',
    async (params = {}, { rejectWithValue }) => {
        try {
            const response = await adminApi.iot.list(params);
            if (response.data.success) {
                return {
                    devices: response.data.devices || [],
                    total: response.data.total || response.data.devices?.length || 0
                };
            }
            return rejectWithValue('Failed to fetch devices');
        } catch (error) {
            return rejectWithValue(error.message || 'Network error');
        }
    }
);

export const fetchDeviceById = createAsyncThunk(
    'devices/fetchDeviceById',
    async (id, { rejectWithValue }) => {
        try {
            const response = await adminApi.iot.get(id);
            if (response.data.success) {
                return response.data.device;
            }
            return rejectWithValue('Failed to fetch device');
        } catch (error) {
            return rejectWithValue(error.message || 'Network error');
        }
    }
);

export const toggleDevice = createAsyncThunk(
    'devices/toggleDevice',
    async (id, { rejectWithValue }) => {
        try {
            const response = await adminApi.iot.toggle(id);
            if (response.data.success) {
                return response.data.device;
            }
            return rejectWithValue('Failed to toggle device');
        } catch (error) {
            return rejectWithValue(error.message || 'Network error');
        }
    }
);

export const updateDevice = createAsyncThunk(
    'devices/updateDevice',
    async ({ id, data }, { rejectWithValue }) => {
        try {
            const response = await adminApi.iot.update(id, data);
            if (response.data.success) {
                return response.data.device;
            }
            return rejectWithValue('Failed to update device');
        } catch (error) {
            return rejectWithValue(error.message || 'Network error');
        }
    }
);

export const deleteDevice = createAsyncThunk(
    'devices/deleteDevice',
    async (id, { rejectWithValue }) => {
        try {
            const response = await adminApi.iot.delete(id);
            if (response.data.success) {
                return id;
            }
            return rejectWithValue('Failed to delete device');
        } catch (error) {
            return rejectWithValue(error.message || 'Network error');
        }
    }
);

export const addDevice = createAsyncThunk(
    'devices/addDevice',
    async (data, { rejectWithValue }) => {
        try {
            const response = await adminApi.iot.create(data);
            if (response.data.success) {
                return response.data.device;
            }
            return rejectWithValue('Failed to add device');
        } catch (error) {
            return rejectWithValue(error.message || 'Network error');
        }
    }
);

export const controlDevice = createAsyncThunk(
    'devices/controlDevice',
    async ({ id, command }, { rejectWithValue }) => {
        try {
            const response = await adminApi.iot.control(id, command);
            if (response.data.success) {
                return response.data.device;
            }
            return rejectWithValue('Failed to control device');
        } catch (error) {
            return rejectWithValue(error.message || 'Network error');
        }
    }
);

const devicesSlice = createSlice({
    name: 'devices',
    initialState,
    reducers: {
        setFilters: (state, action) => {
            state.filters = { ...state.filters, ...action.payload };
        },
        setTypeFilter: (state, action) => {
            state.filters.type = action.payload;
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
        clearSelectedDevice: (state) => {
            state.selectedDevice = null;
        },
        // Optimistic toggle update
        optimisticToggleDevice: (state, action) => {
            const device = state.devices.find(d => d.id === action.payload);
            if (device) {
                device.status = device.status === 'on' ? 'off' : 'on';
            }
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch Devices
            .addCase(fetchDevices.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchDevices.fulfilled, (state, action) => {
                state.loading = false;
                // Normalize device data from API (snake_case to camelCase)
                state.devices = (action.payload.devices || []).map(device => ({
                    id: device.id,
                    name: device.name,
                    device_type: device.device_type,
                    room: device.room,
                    status: device.status,
                    brightness: device.brightness,
                    temperature: device.temperature,
                    speed: device.speed,
                    isLocked: device.is_locked,
                    first_name: device.first_name,
                    last_name: device.last_name,
                    email: device.email,
                    user_id: device.user_id,
                    created_at: device.created_at,
                    updated_at: device.updated_at,
                }));
                state.totalCount = action.payload.total;
            })
            .addCase(fetchDevices.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Fetch Device By ID
            .addCase(fetchDeviceById.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchDeviceById.fulfilled, (state, action) => {
                state.loading = false;
                state.selectedDevice = action.payload;
            })
            .addCase(fetchDeviceById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Toggle Device
            .addCase(toggleDevice.fulfilled, (state, action) => {
                const index = state.devices.findIndex(d => d.id === action.payload.id);
                if (index !== -1) {
                    state.devices[index] = action.payload;
                }
                if (state.selectedDevice?.id === action.payload.id) {
                    state.selectedDevice = action.payload;
                }
            })
            // Update Device
            .addCase(updateDevice.fulfilled, (state, action) => {
                const index = state.devices.findIndex(d => d.id === action.payload.id);
                if (index !== -1) {
                    state.devices[index] = action.payload;
                }
                if (state.selectedDevice?.id === action.payload.id) {
                    state.selectedDevice = action.payload;
                }
            })
            // Delete Device
            .addCase(deleteDevice.fulfilled, (state, action) => {
                state.devices = state.devices.filter(d => d.id !== action.payload);
                state.totalCount = Math.max(0, state.totalCount - 1);
            })
            // Add Device
            .addCase(addDevice.fulfilled, (state, action) => {
                state.devices.push(action.payload);
                state.totalCount += 1;
            })
            // Control Device
            .addCase(controlDevice.fulfilled, (state, action) => {
                const index = state.devices.findIndex(d => d.id === action.payload.id);
                if (index !== -1) {
                    state.devices[index] = action.payload;
                }
                if (state.selectedDevice?.id === action.payload.id) {
                    state.selectedDevice = action.payload;
                }
            });
    },
});

export const {
    setFilters,
    setTypeFilter,
    setStatusFilter,
    setPage,
    setRowsPerPage,
    clearError,
    clearSelectedDevice,
    optimisticToggleDevice,
} = devicesSlice.actions;

export default devicesSlice.reducer;
