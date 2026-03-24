import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    sidebarOpen: true,
    theme: 'dark',
    notifications: [],
    snackbar: {
        open: false,
        message: '',
        severity: 'info',
    },
};

const uiSlice = createSlice({
    name: 'ui',
    initialState,
    reducers: {
        toggleSidebar: (state) => {
            state.sidebarOpen = !state.sidebarOpen;
        },
        setSidebarOpen: (state, action) => {
            state.sidebarOpen = action.payload;
        },
        setTheme: (state, action) => {
            state.theme = action.payload;
        },
        addNotification: (state, action) => {
            state.notifications.unshift({
                id: Date.now(),
                ...action.payload,
                timestamp: new Date().toISOString(),
            });
        },
        removeNotification: (state, action) => {
            state.notifications = state.notifications.filter(n => n.id !== action.payload);
        },
        clearNotifications: (state) => {
            state.notifications = [];
        },
        showSnackbar: (state, action) => {
            state.snackbar = {
                open: true,
                message: action.payload.message,
                severity: action.payload.severity || 'info',
            };
        },
        hideSnackbar: (state) => {
            state.snackbar.open = false;
        },
    },
});

export const {
    toggleSidebar,
    setSidebarOpen,
    setTheme,
    addNotification,
    removeNotification,
    clearNotifications,
    showSnackbar,
    hideSnackbar,
} = uiSlice.actions;

export default uiSlice.reducer;
