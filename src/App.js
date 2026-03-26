import React, { useEffect, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline, CircularProgress, Box, Alert, AlertTitle } from '@mui/material';
import { Provider, useSelector, useDispatch } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './store';
import { checkAuth, logout, clearError, USER_ROLES, isAdminRole, selectAuthError } from './store/slices/authSlice';

import AdminLayout from './components/Layout/AdminLayout';
import { PermissionProvider } from './context/PermissionContext';
import Login from './pages/Login';
import { LandingPage, FeaturesPage, HowItWorksPage, AboutPage } from './pages/LandingPages';

const LoadingView = () => (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', bgcolor: '#0f172a' }}>
        <CircularProgress color="primary" />
    </Box>
);

const theme = createTheme({
    palette: {
        mode: 'dark',
        primary: { main: '#6366f1', light: '#818cf8', dark: '#4f46e5' },
        secondary: { main: '#ec4899', light: '#f472b6', dark: '#db2777' },
        background: { default: '#0f172a', paper: '#1e293b' },
        success: { main: '#10b981' },
        warning: { main: '#f59e0b' },
        error: { main: '#ef4444' },
        text: { primary: '#f8fafc', secondary: '#94a3b8' },
    },
    typography: {
        fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
        h1: { fontWeight: 700 }, h2: { fontWeight: 600 }, h3: { fontWeight: 600 },
        h4: { fontWeight: 600 }, h5: { fontWeight: 500 }, h6: { fontWeight: 500 },
    },
    components: {
        MuiButton: { styleOverrides: { root: { textTransform: 'none', borderRadius: 8, fontWeight: 500 } } },
        MuiPaper: { styleOverrides: { root: { borderRadius: 12 } } },
        MuiCard: { styleOverrides: { root: { borderRadius: 12 } } },
    },
});

const ProtectedRoute = ({ children, allowedRoles }) => {
    const dispatch = useDispatch();
    const location = useLocation();
    const { isAuthenticated, loading, token, user } = useSelector((state) => state.auth);
    const authError = useSelector(selectAuthError);

    useEffect(() => {
        if (token && !isAuthenticated && !loading) {
            dispatch(checkAuth());
        }
    }, [dispatch, token, isAuthenticated, loading]);

    if (loading) return <LoadingView />;

    if (!isAuthenticated) {
        if (token && authError) localStorage.removeItem('adminToken');
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (allowedRoles && allowedRoles.length > 0) {
        const userRole = user?.role;
        if (!userRole || !allowedRoles.includes(userRole)) {
            return <Navigate to="/dashboard" replace />;
        }
    }

    return children;
};

const AdminRoute = ({ children }) => {
    const { user, isAuthenticated, loading } = useSelector((state) => state.auth);
    if (loading) return <LoadingView />;
    if (!isAuthenticated) return <Navigate to="/login" replace />;
    if (user && !isAdminRole(user.role)) return <Navigate to="/dashboard" replace />;
    return children;
};

const PublicRoute = ({ children }) => {
    const { isAuthenticated, loading } = useSelector((state) => state.auth);
    if (loading) return <LoadingView />;
    if (isAuthenticated) return <Navigate to="/dashboard" replace />;
    return children;
};

const Dashboard = lazy(() => import('./pages/Dashboard'));
const Users = lazy(() => import('./pages/Users'));
const UserDetail = lazy(() => import('./pages/UserDetail'));
const SOSAlerts = lazy(() => import('./pages/SOSAlerts'));
const Analytics = lazy(() => import('./pages/Analytics'));
const Settings = lazy(() => import('./pages/Settings'));
const FamilyManagement = lazy(() => import('./pages/FamilyManagement'));
const HomeAutomation = lazy(() => import('./pages/HomeAutomation'));
const ContentManagement = lazy(() => import('./pages/ContentManagement'));
const ActivityLogs = lazy(() => import('./pages/ActivityLogs'));
const Permissions = lazy(() => import('./pages/Permissions'));
const GrievanceManagement = lazy(() => import('./pages/GrievanceManagement'));
const TrackingMap = lazy(() => import('./pages/TrackingMap'));
const FamilyTracking = lazy(() => import('./pages/FamilyTracking'));
const LocationHistory = lazy(() => import('./pages/LocationHistory'));
const Geofencing = lazy(() => import('./pages/Geofencing'));
const DeviceDetail = lazy(() => import('./pages/DeviceDetail'));
const FamilyDetail = lazy(() => import('./pages/FamilyDetail'));
const SOSAlertDetail = lazy(() => import('./pages/SOSAlertDetail'));
const ChildCareManagement = lazy(() => import('./pages/ChildCareManagement'));
const QRManagement = lazy(() => import('./pages/QRManagement'));
const SafeRouteManagement = lazy(() => import('./pages/SafeRouteManagement'));
const ThemeManagement = lazy(() => import('./pages/ThemeManagement'));

const PageLoader = () => (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress color="primary" />
    </Box>
);

const AppContent = () => {
    const authError = useSelector((state) => state.auth.error);
    const dispatch = useDispatch();

    useEffect(() => {
        const handleAuthLogout = () => {
            dispatch(logout());
        };
        window.addEventListener('auth:logout', handleAuthLogout);
        return () => window.removeEventListener('auth:logout', handleAuthLogout);
    }, [dispatch]);

    const handleClearError = () => dispatch(clearError());

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            {authError && (
                <Alert severity="error" onClose={handleClearError} sx={{ position: 'fixed', top: 16, right: 16, zIndex: 9999, maxWidth: 400 }}>
                    <AlertTitle>Error</AlertTitle>
                    {authError}
                </Alert>
            )}
            <Suspense fallback={<LoadingView />}>
                <Routes>
                    {/* <Route path="/" element={<LandingPage />} />
                    <Route path="/features" element={<FeaturesPage />} />
                    <Route path="/how-it-works" element={<HowItWorksPage />} />
                    <Route path="/about" element={<AboutPage />} /> */}
                    <Route path="/" element={<PublicRoute><Login /></PublicRoute>} />
                    <Route path="/*" element={
                        <ProtectedRoute>
                            <AdminLayout>
                                <Suspense fallback={<PageLoader />}>
                                    <Routes>
                                        <Route path="/" element={<Navigate to="/dashboard" replace />} />
                                        <Route path="/dashboard" element={<Dashboard />} />
                                        <Route path="/users" element={<AdminRoute><Users /></AdminRoute>} />
                                        <Route path="/users/:id" element={<AdminRoute><UserDetail /></AdminRoute>} />
                                        <Route path="/analytics" element={<AdminRoute><Analytics /></AdminRoute>} />
                                        <Route path="/activity" element={<AdminRoute><ActivityLogs /></AdminRoute>} />
                                        <Route path="/content" element={<AdminRoute><ContentManagement /></AdminRoute>} />
                                        <Route path="/sos-alerts" element={<SOSAlerts />} />
                                        <Route path="/sos-alerts/:id" element={<SOSAlertDetail />} />
                                        <Route path="/families" element={<FamilyManagement />} />
                                        <Route path="/families/:id" element={<FamilyDetail />} />
                                        <Route path="/devices/:id" element={<DeviceDetail />} />
                                        <Route path="/home-automation" element={<HomeAutomation />} />
                                        <Route path="/settings" element={<Settings />} />
                                        <Route path="/permissions" element={<AdminRoute><Permissions /></AdminRoute>} />
                                        <Route path="/grievances" element={<AdminRoute><GrievanceManagement /></AdminRoute>} />
                                        {/* Tracking Routes */}
                                        <Route path="/tracking" element={<Navigate to="/tracking/live" replace />} />
                                        <Route path="/tracking/live" element={<TrackingMap />} />
                                        <Route path="/tracking/family" element={<FamilyTracking />} />
                                        <Route path="/tracking/history" element={<LocationHistory />} />
                                        <Route path="/tracking/geofencing" element={<Geofencing />} />

                                        {/* Child Care Routes */}
                                        <Route path="/childcare" element={<ChildCareManagement />} />

                                        {/* QR Routes */}
                                        <Route path="/qr-management" element={<AdminRoute><QRManagement /></AdminRoute>} />

                                        {/* Safe Route Routes */}
                                        <Route path="/safe-route" element={<AdminRoute><SafeRouteManagement /></AdminRoute>} />

                                        {/* Theme Routes */}
                                        <Route path="/theme-management" element={<AdminRoute><ThemeManagement /></AdminRoute>} />

                                        <Route path="*" element={<Navigate to="/dashboard" replace />} />
                                    </Routes>
                                </Suspense>
                            </AdminLayout>
                        </ProtectedRoute>
                    } />
                </Routes>
            </Suspense>
        </ThemeProvider>
    );
};

function App() {
    return (
        <Provider store={store}>
            <PersistGate loading={<LoadingView />} persistor={persistor}>
                <PermissionProvider>
                    <Router>
                        <AppContent />
                    </Router>
                </PermissionProvider>
            </PersistGate>
        </Provider>
    );
}

export default App;
