import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';
import storage from 'redux-persist/lib/storage';

import authReducer from './slices/authSlice';
import usersReducer from './slices/usersSlice';
import alertsReducer from './slices/alertsSlice';
import analyticsReducer from './slices/analyticsSlice';
import uiReducer from './slices/uiSlice';
import activityLogsReducer from './slices/activityLogsSlice';
import familiesReducer from './slices/familiesSlice';
import devicesReducer from './slices/devicesSlice';
import contentReducer from './slices/contentSlice';
import settingsReducer from './slices/settingsSlice';
import trackingReducer from './slices/trackingSlice';
import grievanceReducer from './slices/grievanceSlice';
import menusReducer from './slices/menusSlice';

const persistConfig = {
    key: 'root',
    version: 1,
    storage,
    whitelist: ['auth', 'users', 'alerts', 'analytics', 'ui'],
};

const rootReducer = combineReducers({
    auth: authReducer,
    users: usersReducer,
    alerts: alertsReducer,
    analytics: analyticsReducer,
    ui: uiReducer,
    activityLogs: activityLogsReducer,
    families: familiesReducer,
    devices: devicesReducer,
    content: contentReducer,
    settings: settingsReducer,
    tracking: trackingReducer,
    grievance: grievanceReducer,
    menus: menusReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
            },
        }),
});

export const persistor = persistStore(store);
