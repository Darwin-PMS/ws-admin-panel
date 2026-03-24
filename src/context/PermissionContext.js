import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';

// Role definitions
export const ROLES = {
    SYSTEM_ADMIN: 'system_admin',
    AGENCY_ADMIN: 'agency_admin',
    ADMIN: 'admin',
    SUPERVISOR: 'supervisor',
    WOMAN: 'woman',
    PARENT: 'parent',
    GUARDIAN: 'guardian',
};

// Permission definitions
export const PERMISSIONS = {
    USERS_VIEW: 'users.view',
    USERS_CREATE: 'users.create',
    USERS_EDIT: 'users.edit',
    USERS_DELETE: 'users.delete',
    SOS_VIEW: 'sos.view',
    SOS_RESOLVE: 'sos.resolve',
    CONTENT_VIEW: 'content.view',
    CONTENT_CREATE: 'content.create',
    CONTENT_EDIT: 'content.edit',
    CONTENT_DELETE: 'content.delete',
    GRIEVANCES_VIEW: 'grievances.view',
    GRIEVANCES_RESOLVE: 'grievances.resolve',
    GRIEVANCES_DELETE: 'grievances.delete',
    ANALYTICS_VIEW: 'analytics.view',
    FAMILIES_VIEW: 'families.view',
    FAMILIES_CREATE: 'families.create',
    FAMILIES_EDIT: 'families.edit',
    FAMILIES_DELETE: 'families.delete',
    HOME_AUTO_VIEW: 'home_auto.view',
    HOME_AUTO_CONTROL: 'home_auto.control',
    ACTIVITY_VIEW: 'activity.view',
    PERMISSIONS_MANAGE: 'permissions.manage',
    SETTINGS_VIEW: 'settings.view',
    SETTINGS_EDIT: 'settings.edit',
    REPORTS_VIEW: 'reports.view',
    REPORTS_EXPORT: 'reports.export',
    TRACKING_VIEW: 'tracking.view',
    TRACKING_CONTROL: 'tracking.control',
    TRACKING_HISTORY: 'tracking.history',
    TRACKING_GEOFENCE: 'tracking.geofence',
    QR_MANAGE: 'qr.manage',
};

// Role hierarchy (higher number = more powerful)
const ROLE_HIERARCHY = {
    [ROLES.SYSTEM_ADMIN]: 7,
    [ROLES.AGENCY_ADMIN]: 6,
    [ROLES.ADMIN]: 5,
    [ROLES.SUPERVISOR]: 4,
    [ROLES.PARENT]: 3,
    [ROLES.GUARDIAN]: 2,
    [ROLES.WOMAN]: 1,
};

// Role display names
const ROLE_DISPLAY_NAMES = {
    [ROLES.SYSTEM_ADMIN]: 'System Administrator',
    [ROLES.AGENCY_ADMIN]: 'Agency Administrator',
    [ROLES.ADMIN]: 'Administrator',
    [ROLES.SUPERVISOR]: 'Supervisor',
    [ROLES.PARENT]: 'Parent',
    [ROLES.GUARDIAN]: 'Guardian',
    [ROLES.WOMAN]: 'Women Safety User',
};

// Default role permissions
const ROLE_PERMISSIONS = {
    [ROLES.SYSTEM_ADMIN]: Object.values(PERMISSIONS),
    [ROLES.AGENCY_ADMIN]: [
        PERMISSIONS.USERS_VIEW, PERMISSIONS.USERS_CREATE, PERMISSIONS.USERS_EDIT,
        PERMISSIONS.SOS_VIEW, PERMISSIONS.SOS_RESOLVE,
        PERMISSIONS.CONTENT_VIEW, PERMISSIONS.CONTENT_CREATE, PERMISSIONS.CONTENT_EDIT, PERMISSIONS.CONTENT_DELETE,
        PERMISSIONS.GRIEVANCES_VIEW, PERMISSIONS.GRIEVANCES_RESOLVE, PERMISSIONS.GRIEVANCES_DELETE,
        PERMISSIONS.ANALYTICS_VIEW,
        PERMISSIONS.FAMILIES_VIEW, PERMISSIONS.FAMILIES_CREATE, PERMISSIONS.FAMILIES_EDIT, PERMISSIONS.FAMILIES_DELETE,
        PERMISSIONS.HOME_AUTO_VIEW, PERMISSIONS.HOME_AUTO_CONTROL,
        PERMISSIONS.ACTIVITY_VIEW,
        PERMISSIONS.SETTINGS_VIEW, PERMISSIONS.SETTINGS_EDIT,
        PERMISSIONS.REPORTS_VIEW, PERMISSIONS.REPORTS_EXPORT,
        PERMISSIONS.TRACKING_VIEW, PERMISSIONS.TRACKING_CONTROL, PERMISSIONS.TRACKING_HISTORY, PERMISSIONS.TRACKING_GEOFENCE,
        PERMISSIONS.QR_MANAGE,
    ],
    [ROLES.ADMIN]: [
        PERMISSIONS.USERS_VIEW, PERMISSIONS.USERS_CREATE, PERMISSIONS.USERS_EDIT,
        PERMISSIONS.SOS_VIEW, PERMISSIONS.SOS_RESOLVE,
        PERMISSIONS.CONTENT_VIEW, PERMISSIONS.CONTENT_CREATE, PERMISSIONS.CONTENT_EDIT, PERMISSIONS.CONTENT_DELETE,
        PERMISSIONS.GRIEVANCES_VIEW, PERMISSIONS.GRIEVANCES_RESOLVE,
        PERMISSIONS.ANALYTICS_VIEW,
        PERMISSIONS.FAMILIES_VIEW, PERMISSIONS.FAMILIES_CREATE, PERMISSIONS.FAMILIES_EDIT, PERMISSIONS.FAMILIES_DELETE,
        PERMISSIONS.HOME_AUTO_VIEW, PERMISSIONS.HOME_AUTO_CONTROL,
        PERMISSIONS.ACTIVITY_VIEW,
        PERMISSIONS.PERMISSIONS_MANAGE,
        PERMISSIONS.SETTINGS_VIEW, PERMISSIONS.SETTINGS_EDIT,
        PERMISSIONS.REPORTS_VIEW,
        PERMISSIONS.TRACKING_VIEW, PERMISSIONS.TRACKING_CONTROL, PERMISSIONS.TRACKING_HISTORY, PERMISSIONS.TRACKING_GEOFENCE,
        PERMISSIONS.QR_MANAGE,
    ],
    [ROLES.SUPERVISOR]: [
        PERMISSIONS.USERS_VIEW,
        PERMISSIONS.SOS_VIEW, PERMISSIONS.SOS_RESOLVE,
        PERMISSIONS.CONTENT_VIEW,
        PERMISSIONS.GRIEVANCES_VIEW, PERMISSIONS.GRIEVANCES_RESOLVE,
        PERMISSIONS.ANALYTICS_VIEW,
        PERMISSIONS.FAMILIES_VIEW,
        PERMISSIONS.HOME_AUTO_VIEW,
        PERMISSIONS.ACTIVITY_VIEW,
        PERMISSIONS.SETTINGS_VIEW,
        PERMISSIONS.REPORTS_VIEW,
        PERMISSIONS.TRACKING_VIEW, PERMISSIONS.TRACKING_HISTORY,
    ],
    [ROLES.WOMAN]: [
        PERMISSIONS.SOS_VIEW,
        PERMISSIONS.CONTENT_VIEW,
        PERMISSIONS.FAMILIES_VIEW,
        PERMISSIONS.HOME_AUTO_VIEW,
        PERMISSIONS.SETTINGS_VIEW, PERMISSIONS.SETTINGS_EDIT,
        PERMISSIONS.TRACKING_VIEW,
    ],
    [ROLES.PARENT]: [
        PERMISSIONS.SOS_VIEW,
        PERMISSIONS.CONTENT_VIEW,
        PERMISSIONS.FAMILIES_VIEW, PERMISSIONS.FAMILIES_CREATE, PERMISSIONS.FAMILIES_EDIT,
        PERMISSIONS.HOME_AUTO_VIEW, PERMISSIONS.HOME_AUTO_CONTROL,
        PERMISSIONS.SETTINGS_VIEW, PERMISSIONS.SETTINGS_EDIT,
        PERMISSIONS.TRACKING_VIEW, PERMISSIONS.TRACKING_HISTORY,
    ],
    [ROLES.GUARDIAN]: [
        PERMISSIONS.SOS_VIEW,
        PERMISSIONS.CONTENT_VIEW,
        PERMISSIONS.FAMILIES_VIEW,
        PERMISSIONS.HOME_AUTO_VIEW,
        PERMISSIONS.SETTINGS_VIEW,
        PERMISSIONS.TRACKING_VIEW,
    ],
};

// Create context
const PermissionContext = createContext(null);

// Provider component
export const PermissionProvider = ({ children }) => {
    const { user } = useSelector((state) => state.auth);
    const [userPermissions, setUserPermissions] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    // Get current user's role
    const userRole = user?.role || ROLES.WOMAN;

    // Get permissions for current role
    const permissions = useMemo(() => {
        return ROLE_PERMISSIONS[userRole] || [];
    }, [userRole]);

    // Check if user has a specific permission
    const hasPermission = useCallback((permission) => {
        return permissions.includes(permission);
    }, [permissions]);

    // Check if user has any of the given permissions
    const hasAnyPermission = useCallback((perms) => {
        if (!Array.isArray(perms)) perms = [perms];
        return perms.some(p => permissions.includes(p));
    }, [permissions]);

    // Check if user has all of the given permissions
    const hasAllPermissions = useCallback((perms) => {
        if (!Array.isArray(perms)) perms = [perms];
        return perms.every(p => permissions.includes(p));
    }, [permissions]);

    // Check if user has a specific role
    const hasRole = useCallback((role) => {
        if (Array.isArray(role)) {
            return role.includes(userRole);
        }
        return userRole === role;
    }, [userRole]);

    // Check if user's role is at least the specified level
    const hasRoleLevel = useCallback((minRole) => {
        const userLevel = ROLE_HIERARCHY[userRole] || 0;
        const minLevel = ROLE_HIERARCHY[minRole] || 0;
        return userLevel >= minLevel;
    }, [userRole]);

    // Check if user can manage another user with given role
    const canManageUser = useCallback((targetRole) => {
        const userLevel = ROLE_HIERARCHY[userRole] || 0;
        const targetLevel = ROLE_HIERARCHY[targetRole] || 0;
        return userLevel > targetLevel;
    }, [userRole]);

    // Get display name for a role
    const getRoleDisplayName = useCallback((role) => {
        return ROLE_DISPLAY_NAMES[role] || role;
    }, []);

    // Get all roles
    const getAllRoles = useCallback(() => {
        return Object.entries(ROLES).map(([key, value]) => ({
            key,
            value,
            name: ROLE_DISPLAY_NAMES[value] || value,
            level: ROLE_HIERARCHY[value] || 0,
        }));
    }, []);

    // Get menu items based on user role
    const getMenuItems = useCallback(() => {
        const menuItems = [
            {
                key: 'dashboard',
                label: 'Dashboard',
                icon: 'Dashboard',
                path: '/dashboard',
                permission: null,
                roles: Object.values(ROLES),
            },
            {
                key: 'tracking',
                label: 'Tracking',
                icon: 'Security',
                path: '/tracking',
                permission: PERMISSIONS.TRACKING_VIEW,
                roles: Object.values(ROLES),
                submenu: [
                    {
                        key: 'live-tracking',
                        label: 'Live Map',
                        path: '/tracking/live',
                        icon: 'Security',
                    },
                    {
                        key: 'family-tracking',
                        label: 'Family Tracking',
                        path: '/tracking/family',
                        icon: 'FamilyRestroom',
                    },
                    {
                        key: 'history',
                        label: 'Location History',
                        path: '/tracking/history',
                        icon: 'History',
                    },
                    {
                        key: 'geofencing',
                        label: 'Geofencing',
                        path: '/tracking/geofencing',
                        icon: 'Article',
                    },
                ],
            },
            {
                key: 'users',
                label: 'Users',
                icon: 'People',
                path: '/users',
                permission: PERMISSIONS.USERS_VIEW,
                roles: [ROLES.SYSTEM_ADMIN, ROLES.AGENCY_ADMIN, ROLES.ADMIN, ROLES.SUPERVISOR],
            },
            {
                key: 'sosAlerts',
                label: 'SOS Alerts',
                icon: 'Warning',
                path: '/sos-alerts',
                permission: PERMISSIONS.SOS_VIEW,
                roles: Object.values(ROLES),
            },
            {
                key: 'analytics',
                label: 'Analytics',
                icon: 'Analytics',
                path: '/analytics',
                permission: PERMISSIONS.ANALYTICS_VIEW,
                roles: [ROLES.SYSTEM_ADMIN, ROLES.AGENCY_ADMIN, ROLES.ADMIN, ROLES.SUPERVISOR],
            },
            {
                key: 'families',
                label: 'Families',
                icon: 'FamilyRestroom',
                path: '/families',
                permission: PERMISSIONS.FAMILIES_VIEW,
                roles: [ROLES.SYSTEM_ADMIN, ROLES.AGENCY_ADMIN, ROLES.ADMIN, ROLES.SUPERVISOR, ROLES.PARENT, ROLES.GUARDIAN],
            },
            {
                key: 'homeAutomation',
                label: 'Home Automation',
                icon: 'Home',
                path: '/home-automation',
                permission: PERMISSIONS.HOME_AUTO_VIEW,
                roles: [ROLES.SYSTEM_ADMIN, ROLES.AGENCY_ADMIN, ROLES.ADMIN, ROLES.PARENT, ROLES.GUARDIAN],
            },
            {
                key: 'content',
                label: 'Content',
                icon: 'Article',
                path: '/content',
                permission: PERMISSIONS.CONTENT_VIEW,
                roles: [ROLES.SYSTEM_ADMIN, ROLES.AGENCY_ADMIN, ROLES.ADMIN],
            },
            {
                key: 'grievances',
                label: 'Grievances',
                icon: 'Report',
                path: '/grievances',
                permission: PERMISSIONS.GRIEVANCES_VIEW,
                roles: [ROLES.SYSTEM_ADMIN, ROLES.AGENCY_ADMIN, ROLES.ADMIN, ROLES.SUPERVISOR],
            },
            {
                key: 'activityLogs',
                label: 'Activity Logs',
                icon: 'History',
                path: '/activity',
                permission: PERMISSIONS.ACTIVITY_VIEW,
                roles: [ROLES.SYSTEM_ADMIN, ROLES.AGENCY_ADMIN, ROLES.ADMIN, ROLES.SUPERVISOR],
            },
            {
                key: 'permissions',
                label: 'Permissions',
                icon: 'Security',
                path: '/permissions',
                permission: PERMISSIONS.PERMISSIONS_MANAGE,
                roles: [ROLES.SYSTEM_ADMIN, ROLES.AGENCY_ADMIN, ROLES.ADMIN],
            },
            {
                key: 'qrManagement',
                label: 'QR Management',
                icon: 'QrCode',
                path: '/qr-management',
                permission: PERMISSIONS.QR_MANAGE,
                roles: [ROLES.SYSTEM_ADMIN, ROLES.AGENCY_ADMIN, ROLES.ADMIN],
            },
            {
                key: 'safeRoute',
                label: 'Safe Route',
                icon: 'Route',
                path: '/safe-route',
                permission: PERMISSIONS.TRACKING_VIEW,
                roles: [ROLES.SYSTEM_ADMIN, ROLES.AGENCY_ADMIN, ROLES.ADMIN, ROLES.SUPERVISOR],
            },
            {
                key: 'themeManagement',
                label: 'Theme Management',
                icon: 'Palette',
                path: '/theme-management',
                permission: PERMISSIONS.SETTINGS_EDIT,
                roles: [ROLES.SYSTEM_ADMIN, ROLES.AGENCY_ADMIN, ROLES.ADMIN],
            },
            {
                key: 'settings',
                label: 'Settings',
                icon: 'Settings',
                path: '/settings',
                permission: null,
                roles: Object.values(ROLES),
            },
        ];

        // Filter menu items based on user role
        return menuItems.filter(item => {
            // Check if role is allowed
            if (!item.roles.includes(userRole)) return false;
            // Check if permission is required and user has it
            if (item.permission && !permissions.includes(item.permission)) return false;
            return true;
        });
    }, [userRole, permissions]);

    const value = {
        // State
        userRole,
        permissions,
        userPermissions,
        isLoading,

        // Helper functions
        hasPermission,
        hasAnyPermission,
        hasAllPermissions,
        hasRole,
        hasRoleLevel,
        canManageUser,
        getRoleDisplayName,
        getAllRoles,
        getMenuItems,

        // Constants
        ROLES,
        PERMISSIONS,
        ROLE_DISPLAY_NAMES,
        ROLE_HIERARCHY,
    };

    return (
        <PermissionContext.Provider value={value}>
            {children}
        </PermissionContext.Provider>
    );
};

// Custom hook to use permissions
export const usePermission = () => {
    const context = useContext(PermissionContext);
    if (!context) {
        throw new Error('usePermission must be used within a PermissionProvider');
    }
    return context;
};

// HOC for permission checking
export const withPermission = (WrappedComponent, requiredPermission, options = {}) => {
    const { requireAll = false } = options;

    return function PermissionWrapper(props) {
        const { hasPermission, hasAnyPermission, hasAllPermissions } = usePermission();

        const hasRequiredPermission = requireAll
            ? hasAllPermissions(requiredPermission)
            : hasAnyPermission(requiredPermission);

        if (!hasRequiredPermission) {
            return null; // Or a "No Permission" component
        }

        return <WrappedComponent {...props} />;
    };
};

export default PermissionContext;
