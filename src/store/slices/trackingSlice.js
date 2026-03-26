import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { adminApi } from '../../services/api';

const initialState = {
    locations: [],
    selectedUser: null,
    selectedFamily: null,
    selectedUsers: [],
    sosAlerts: [],
    loading: false,
    error: null,
    lastUpdated: null,
    trackingMode: 'all',
    filters: {
        showSafe: true,
        showDanger: true,
        showSOS: true,
    },
    userHistory: {},
    emergencyServices: [],
};

export const fetchAllLocations = createAsyncThunk(
    'tracking/fetchAllLocations',
    async (_, { rejectWithValue }) => {
        try {
            const response = await adminApi.getTrackingLocations();
            return response.data;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const fetchFamilyLocations = createAsyncThunk(
    'tracking/fetchFamilyLocations',
    async (familyId, { rejectWithValue }) => {
        try {
            const response = await adminApi.getFamilyLocations(familyId);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const fetchUserLocation = createAsyncThunk(
    'tracking/fetchUserLocation',
    async (userId, { rejectWithValue }) => {
        try {
            const response = await adminApi.getUserLocation(userId);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const fetchUserHistory = createAsyncThunk(
    'tracking/fetchUserHistory',
    async ({ userId, minutes = 30 }, { rejectWithValue }) => {
        try {
            const response = await adminApi.getUserLocationHistory(userId, { minutes });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const fetchSOSAlerts = createAsyncThunk(
    'tracking/fetchSOSAlerts',
    async (_, { rejectWithValue }) => {
        try {
            const response = await adminApi.getSOSAlerts({ status: 'active' });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const fetchNearbyEmergencyServices = createAsyncThunk(
    'tracking/fetchNearbyEmergencyServices',
    async ({ lat, lng, radius = 5000 }, { rejectWithValue }) => {
        try {
            const response = await adminApi.getNearbyEmergencyServices({ lat, lng, radius });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

const trackingSlice = createSlice({
    name: 'tracking',
    initialState,
    reducers: {
        setSelectedUser: (state, action) => {
            state.selectedUser = action.payload;
            state.trackingMode = 'individual';
        },
        setSelectedFamily: (state, action) => {
            state.selectedFamily = action.payload;
            state.trackingMode = 'family';
        },
        setSelectedUsers: (state, action) => {
            state.selectedUsers = action.payload;
            state.trackingMode = 'selected';
        },
        toggleUserSelection: (state, action) => {
            const userId = action.payload;
            const index = state.selectedUsers.indexOf(userId);
            if (index > -1) {
                state.selectedUsers.splice(index, 1);
            } else {
                state.selectedUsers.push(userId);
            }
            state.trackingMode = state.selectedUsers.length > 0 ? 'selected' : 'all';
        },
        setTrackingMode: (state, action) => {
            state.trackingMode = action.payload;
        },
        updateFilters: (state, action) => {
            state.filters = { ...state.filters, ...action.payload };
        },
        clearSelection: (state) => {
            state.selectedUser = null;
            state.selectedFamily = null;
            state.selectedUsers = [];
            state.trackingMode = 'all';
        },
        updateLocation: (state, action) => {
            const { userId, latitude, longitude, status } = action.payload;
            const index = state.locations.findIndex(loc => loc.user_id === userId);
            if (index > -1) {
                state.locations[index] = {
                    ...state.locations[index],
                    latitude,
                    longitude,
                    status,
                    last_updated: new Date().toISOString(),
                };
            }
            state.lastUpdated = new Date().toISOString();
        },
        addSOSAlert: (state, action) => {
            state.sosAlerts.unshift(action.payload);
        },
        setUserHistory: (state, action) => {
            const { userId, history } = action.payload;
            state.userHistory[userId] = history;
            if (state.selectedUser && state.selectedUser.user_id === userId) {
                state.selectedUser.history = history;
            }
        },
        setEmergencyServices: (state, action) => {
            state.emergencyServices = action.payload;
        },
        setLocations: (state, action) => {
            state.locations = action.payload || [];
            state.lastUpdated = new Date().toISOString();
        },
        setSOSAlerts: (state, action) => {
            state.sosAlerts = action.payload || [];
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchAllLocations.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchAllLocations.fulfilled, (state, action) => {
                state.loading = false;
                state.locations = action.payload.locations || action.payload || [];
                state.lastUpdated = new Date().toISOString();
            })
            .addCase(fetchAllLocations.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(fetchFamilyLocations.fulfilled, (state, action) => {
                state.locations = action.payload.locations || [];
                state.lastUpdated = new Date().toISOString();
            })
            .addCase(fetchUserLocation.fulfilled, (state, action) => {
                state.selectedUser = action.payload.location;
            })
            .addCase(fetchUserHistory.fulfilled, (state, action) => {
                const { userId, history } = action.payload;
                state.userHistory[userId] = history;
                if (state.selectedUser) {
                    state.selectedUser.history = history;
                }
            })
            .addCase(fetchSOSAlerts.fulfilled, (state, action) => {
                state.sosAlerts = action.payload.alerts || action.payload || [];
            })
            .addCase(fetchNearbyEmergencyServices.fulfilled, (state, action) => {
                state.emergencyServices = action.payload.services || [];
            });
    },
});

export const {
    setSelectedUser,
    setSelectedFamily,
    setSelectedUsers,
    toggleUserSelection,
    setTrackingMode,
    updateFilters,
    clearSelection,
    updateLocation,
    addSOSAlert,
    setUserHistory,
    setEmergencyServices,
    setLocations,
    setSOSAlerts,
} = trackingSlice.actions;

export const selectTracking = (state) => state.tracking;
export const selectLocations = (state) => state.tracking.locations;
export const selectSOSAlerts = (state) => state.tracking.sosAlerts;
export const selectUserHistory = (state, userId) => state.tracking.userHistory[userId];
export const selectEmergencyServices = (state) => state.tracking.emergencyServices;

export default trackingSlice.reducer;