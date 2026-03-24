import React, { createContext, useContext, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    loginUser,
    logoutUser,
    checkAuth,
    clearError,
    selectCurrentUser,
    selectIsAuthenticated,
    selectAuthLoading,
    selectAuthError,
    selectUserRole,
    isAdminRole,
    refreshToken
} from '../store/slices/authSlice';

const AuthContext = createContext(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

// Role-based access helper
export const hasRole = (userRole, allowedRoles) => {
    if (!userRole) return false;
    if (Array.isArray(allowedRoles)) {
        return allowedRoles.includes(userRole);
    }
    return userRole === allowedRoles;
};

export const isAdmin = (userRole) => {
    return isAdminRole(userRole);
};

export const AuthProvider = ({ children }) => {
    const dispatch = useDispatch();

    // Redux state
    const user = useSelector(selectCurrentUser);
    const isAuthenticated = useSelector(selectIsAuthenticated);
    const loading = useSelector(selectAuthLoading);
    const error = useSelector(selectAuthError);
    const userRole = useSelector(selectUserRole);

    // Local state for navigation
    const [initialized, setInitialized] = useState(false);

    useEffect(() => {
        // Check auth on mount
        const initAuth = async () => {
            const token = localStorage.getItem('adminToken');
            if (token && !isAuthenticated) {
                await dispatch(checkAuth());
            }
            setInitialized(true);
        };

        initAuth();
    }, [dispatch, isAuthenticated]);

    const login = async (email, password) => {
        const result = await dispatch(loginUser({ email, password }));
        if (loginUser.fulfilled.match(result)) {
            return { success: true, user: result.payload.user };
        }
        return { success: false, message: result.payload };
    };

    const logout = async () => {
        await dispatch(logoutUser());
    };

    const refresh = async () => {
        const result = await dispatch(refreshToken());
        return refreshToken.fulfilled.match(result);
    };

    const clearAuthError = () => {
        dispatch(clearError());
    };

    const value = {
        user,
        isAuthenticated,
        loading,
        error,
        userRole,
        initialized,
        isAdmin: userRole ? isAdminRole(userRole) : false,
        login,
        logout,
        refresh,
        clearError: clearAuthError,
        // Role checking
        hasRole: (allowedRoles) => hasRole(userRole, allowedRoles),
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

// Higher-order component for role-based access
export const withRole = (Component, allowedRoles) => {
    return function RoleProtectedComponent(props) {
        const { userRole, isAuthenticated, loading } = useAuth();

        if (loading) {
            return null; // Or a loading spinner
        }

        if (!isAuthenticated) {
            return null; // Will be redirected by protected route
        }

        if (!hasRole(userRole, allowedRoles)) {
            return null; // Will be redirected to unauthorized page
        }

        return <Component {...props} />;
    };
};

export default AuthContext;
