import { useDispatch, useSelector } from 'react-redux';

// Auth hooks
export const useAuthDispatch = () => useDispatch();
export const useAuthSelector = () => useSelector((state) => state.auth);

// Users hooks
export const useUsersDispatch = () => useDispatch();
export const useUsersSelector = () => useSelector((state) => state.users);

// Alerts hooks
export const useAlertsDispatch = () => useDispatch();
export const useAlertsSelector = () => useSelector((state) => state.alerts);

// Analytics hooks
export const useAnalyticsDispatch = () => useDispatch();
export const useAnalyticsSelector = () => useSelector((state) => state.analytics);

// UI hooks
export const useUIDispatch = () => useDispatch();
export const useUISelector = () => useSelector((state) => state.ui);

// Activity Logs hooks
export const useActivityLogsDispatch = () => useDispatch();
export const useActivityLogsSelector = () => useSelector((state) => state.activityLogs);

// Families hooks
export const useFamiliesDispatch = () => useDispatch();
export const useFamiliesSelector = () => useSelector((state) => state.families);

// Devices hooks
export const useDevicesDispatch = () => useDispatch();
export const useDevicesSelector = () => useSelector((state) => state.devices);

// Content hooks
export const useContentDispatch = () => useDispatch();
export const useContentSelector = () => useSelector((state) => state.content);

// Settings hooks
export const useSettingsDispatch = () => useDispatch();
export const useSettingsSelector = () => useSelector((state) => state.settings);

// Combined hooks for convenience
export const useAppDispatch = useDispatch;
export const useAppSelector = useSelector;
