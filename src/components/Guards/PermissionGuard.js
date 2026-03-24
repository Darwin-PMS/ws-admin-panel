import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { Lock as LockIcon } from '@mui/icons-material';
import { usePermission, PERMISSIONS } from '../../context/PermissionContext';

/**
 * PermissionGuard - Component to conditionally render content based on permissions
 * 
 * Usage:
 * <PermissionGuard permission={PERMISSIONS.USERS_VIEW}>
 *   <UsersTable />
 * </PermissionGuard>
 * 
 * <PermissionGuard permission={[PERMISSIONS.USERS_VIEW, PERMISSIONS.USERS_EDIT]} requireAll>
 *   <EditUsersButton />
 * </PermissionGuard>
 */
export const PermissionGuard = ({ 
    children, 
    permission = null, 
    permissions = null,
    requireAll = false,
    fallback = null,
    showFallback = false,
    roles = null,
}) => {
    const { hasPermission, hasAnyPermission, hasAllPermissions, hasRole, userRole } = usePermission();

    // Check role access
    if (roles !== null) {
        const allowedRoles = Array.isArray(roles) ? roles : [roles];
        if (!allowedRoles.includes(userRole)) {
            return showFallback ? fallback : null;
        }
    }

    // Check permission access
    if (permission !== null) {
        if (!hasPermission(permission)) {
            return showFallback ? fallback : null;
        }
    }

    // Check multiple permissions
    if (permissions !== null) {
        const permArray = Array.isArray(permissions) ? permissions : [permissions];
        const hasAccess = requireAll 
            ? hasAllPermissions(permArray) 
            : hasAnyPermission(permArray);
        
        if (!hasAccess) {
            return showFallback ? fallback : null;
        }
    }

    return <>{children}</>;
};

/**
 * PermissionButton - Button that is disabled/hidden based on permissions
 */
export const PermissionButton = ({ 
    children, 
    permission, 
    permissions,
    requireAll = false,
    disabledProps = {},
    showDisabled = true,
    variant = 'contained',
    size = 'medium',
    ...props 
}) => {
    const { hasPermission, hasAnyPermission, hasAllPermissions } = usePermission();

    let disabled = false;
    if (permission) {
        disabled = !hasPermission(permission);
    }
    if (permissions) {
        const permArray = Array.isArray(permissions) ? permissions : [permissions];
        disabled = requireAll 
            ? !hasAllPermissions(permArray) 
            : !hasAnyPermission(permArray);
    }

    if (disabled && !showDisabled) {
        return null;
    }

    return (
        <Button
            {...props}
            variant={variant}
            size={size}
            disabled={disabled}
            {...disabledProps}
        >
            {children}
        </Button>
    );
};

/**
 * PermissionIconButton - Icon button with permission check
 */
export const PermissionIconButton = ({ 
    children, 
    permission, 
    permissions,
    requireAll = false,
    showDisabled = true,
    ...props 
}) => {
    const { hasPermission, hasAnyPermission, hasAllPermissions } = usePermission();

    let disabled = false;
    if (permission) {
        disabled = !hasPermission(permission);
    }
    if (permissions) {
        const permArray = Array.isArray(permissions) ? permissions : [permissions];
        disabled = requireAll 
            ? !hasAllPermissions(permArray) 
            : !hasAnyPermission(permArray);
    }

    if (disabled && !showDisabled) {
        return null;
    }

    return React.cloneElement(children, { disabled, ...props });
};

/**
 * PermissionTooltip - Shows tooltip when user lacks permission
 */
export const PermissionTooltip = ({ 
    children, 
    permission, 
    tooltipText = 'You do not have permission for this action' 
}) => {
    const { hasPermission } = usePermission();
    
    if (!hasPermission(permission)) {
        return (
            <Box 
                sx={{ 
                    opacity: 0.5, 
                    cursor: 'not-allowed',
                    position: 'relative',
                    '&:hover::after': {
                        content: `"${tooltipText}"`,
                        position: 'absolute',
                        bottom: '100%',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        backgroundColor: 'error.main',
                        color: 'white',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        whiteSpace: 'nowrap',
                        zIndex: 1000,
                    }
                }}
            >
                {children}
            </Box>
        );
    }

    return <>{children}</>;
};

/**
 * AccessDenied - Component shown when access is denied
 */
export const AccessDenied = ({ 
    title = 'Access Denied', 
    message = 'You do not have permission to view this page.' 
}) => {
    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '400px',
                p: 3,
                textAlign: 'center',
            }}
        >
            <LockIcon sx={{ fontSize: 64, color: 'error.main', mb: 2 }} />
            <Typography variant="h5" sx={{ mb: 1, fontWeight: 600 }}>
                {title}
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                {message}
            </Typography>
            <Button variant="outlined" href="/dashboard">
                Go to Dashboard
            </Button>
        </Box>
    );
};

/**
 * RoleBadge - Shows role display name
 */
export const RoleBadge = ({ role, ...props }) => {
    const { getRoleDisplayName } = usePermission();
    const displayName = getRoleDisplayName(role);

    const getRoleColor = (r) => {
        const colors = {
            system_admin: '#ef4444',
            agency_admin: '#f59e0b',
            admin: '#8b5cf6',
            supervisor: '#3b82f6',
            parent: '#10b981',
            guardian: '#06b6d4',
            woman: '#ec4899',
        };
        return colors[r] || '#6b7280';
    };

    return (
        <Box
            component="span"
            sx={{
                display: 'inline-block',
                px: 1.5,
                py: 0.5,
                borderRadius: 1,
                fontSize: '0.75rem',
                fontWeight: 600,
                textTransform: 'uppercase',
                backgroundColor: `${getRoleColor(role)}20`,
                color: getRoleColor(role),
            }}
            {...props}
        >
            {displayName}
        </Box>
    );
};

/**
 * RequireRole - Component that only renders for specific roles
 */
export const RequireRole = ({ children, roles }) => {
    const { hasRole } = usePermission();
    const allowedRoles = Array.isArray(roles) ? roles : [roles];
    
    if (!hasRole(allowedRoles)) {
        return null;
    }

    return <>{children}</>;
};

/**
 * RoleGate - Higher-order component for role-based rendering
 */
export const RoleGate = ({ children, roles }) => {
    const { hasRole } = usePermission();
    const allowedRoles = Array.isArray(roles) ? roles : [roles];
    
    if (!hasRole(allowedRoles)) {
        return null;
    }

    return children;
};

export default PermissionGuard;
