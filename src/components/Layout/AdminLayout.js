import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    Box,
    Drawer,
    AppBar,
    Toolbar,
    List,
    Typography,
    Divider,
    IconButton,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Avatar,
    Menu,
    MenuItem,
    useTheme,
    useMediaQuery,
    Chip,
    Collapse,
} from '@mui/material';
import {
    Menu as MenuIcon,
    Dashboard as DashboardIcon,
    People as PeopleIcon,
    Warning as WarningIcon,
    Analytics as AnalyticsIcon,
    FamilyRestroom as FamilyIcon,
    Home as HomeIcon,
    Article as ArticleIcon,
    History as HistoryIcon,
    Settings as SettingsIcon,
    Logout as LogoutIcon,
    Person as PersonIcon,
    Security as SecurityIcon,
    Report as ReportIcon,
    ExpandMore as ExpandMoreIcon,
    ExpandLess as ExpandLessIcon,
    QrCode as QrCodeIcon,
    Route as RouteIcon,
    Palette as PaletteIcon,
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { logoutUser, logout, isAdminRole, isLoggedIn } from '../../store/slices/authSlice';
import { usePermission, ROLES } from '../../context/PermissionContext';
import { RoleBadge } from '../Guards/PermissionGuard';

const drawerWidth = 260;

const AdminLayout = ({ children }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);
    const { getMenuItems, getRoleDisplayName, userRole } = usePermission();

    const menuItems = getMenuItems();

    const [mobileOpen, setMobileOpen] = useState(false);
    const [anchorEl, setAnchorEl] = useState(null);
    const [expandedMenu, setExpandedMenu] = useState(null);

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    const handleMenuOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = () => {
        handleMenuClose();
        dispatch(logout());
        navigate('/login');
    };

    const handleMenuClick = (item) => {
        if (item.submenu && item.submenu.length > 0) {
            // Toggle submenu expansion
            setExpandedMenu(expandedMenu === item.key ? null : item.key);
        } else {
            // Navigate to path
            navigate(item.path);
            if (isMobile) setMobileOpen(false);
        }
    };

    const handleSubmenuClick = (path) => {
        navigate(path);
        if (isMobile) setMobileOpen(false);
    };

    const getIcon = (iconName) => {
        const icons = {
            Dashboard: <DashboardIcon />,
            People: <PeopleIcon />,
            Warning: <WarningIcon />,
            Analytics: <AnalyticsIcon />,
            FamilyRestroom: <FamilyIcon />,
            Home: <HomeIcon />,
            Article: <ArticleIcon />,
            History: <HistoryIcon />,
            Settings: <SettingsIcon />,
            Security: <SecurityIcon />,
            Report: <ReportIcon />,
            QrCode: <QrCodeIcon />,
            Route: <RouteIcon />,
            Palette: <PaletteIcon />,
        };
        return icons[iconName] || <DashboardIcon />;
    };

    const drawer = (
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* Logo Section */}
            <Box sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box
                    sx={{
                        width: 42,
                        height: 42,
                        borderRadius: 2,
                        background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700,
                        fontSize: 18,
                        color: 'white',
                    }}
                >
                    AI
                </Box>
                <Box>
                    <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                        Admin Panel
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        Women Safety App
                    </Typography>
                </Box>
            </Box>

            <Divider sx={{ mx: 2 }} />

            {/* Role Badge */}
            <Box sx={{ px: 2, py: 1 }}>
                <Chip
                    size="small"
                    label={getRoleDisplayName(userRole)}
                    sx={{
                        fontWeight: 600,
                        fontSize: '0.7rem',
                    }}
                />
            </Box>

            {/* Navigation */}
            <List sx={{ flex: 1, px: 2, py: 2 }}>
                {menuItems.map((item) => (
                    <React.Fragment key={item.key}>
                        <ListItem disablePadding sx={{ mb: 0.5 }}>
                            <ListItemButton
                                onClick={() => handleMenuClick(item)}
                                selected={location.pathname === item.path || location.pathname.startsWith(item.path + '/')}
                                sx={{
                                    borderRadius: 2,
                                    '&.Mui-selected': {
                                        backgroundColor: 'primary.main',
                                        '&:hover': {
                                            backgroundColor: 'primary.dark',
                                        },
                                    },
                                }}
                            >
                                <ListItemIcon sx={{ color: location.pathname === item.path || location.pathname.startsWith(item.path + '/') ? 'white' : 'inherit', minWidth: 40 }}>
                                    {getIcon(item.icon)}
                                </ListItemIcon>
                                <ListItemText
                                    primary={item.label}
                                    primaryTypographyProps={{
                                        fontWeight: location.pathname === item.path || location.pathname.startsWith(item.path + '/') ? 600 : 400,
                                        color: location.pathname === item.path || location.pathname.startsWith(item.path + '/') ? 'white' : 'inherit',
                                    }}
                                />
                                {item.submenu && item.submenu.length > 0 && (
                                    <ListItemIcon sx={{ minWidth: 'auto', color: 'inherit' }}>
                                        {expandedMenu === item.key ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                                    </ListItemIcon>
                                )}
                            </ListItemButton>
                        </ListItem>
                        {/* Submenu items */}
                        {item.submenu && item.submenu.length > 0 && (
                            <Collapse in={expandedMenu === item.key} timeout="auto" unmountOnExit>
                                <List component="div" disablePadding>
                                    {item.submenu.map((subItem) => (
                                        <ListItem key={subItem.key} disablePadding sx={{ mb: 0.5, pl: 4 }}>
                                            <ListItemButton
                                                onClick={() => handleSubmenuClick(subItem.path)}
                                                selected={location.pathname === subItem.path}
                                                sx={{
                                                    borderRadius: 2,
                                                    borderLeft: location.pathname === subItem.path ? '3px solid' : '3px solid transparent',
                                                    borderColor: 'primary.main',
                                                    '&.Mui-selected': {
                                                        backgroundColor: 'primary.light',
                                                        '&:hover': {
                                                            backgroundColor: 'primary.main',
                                                        },
                                                    },
                                                }}
                                            >
                                                <ListItemIcon sx={{ color: location.pathname === subItem.path ? 'white' : 'inherit', minWidth: 40 }}>
                                                    {getIcon(subItem.icon)}
                                                </ListItemIcon>
                                                <ListItemText
                                                    primary={subItem.label}
                                                    primaryTypographyProps={{
                                                        fontWeight: location.pathname === subItem.path ? 600 : 400,
                                                        color: location.pathname === subItem.path ? 'white' : 'inherit',
                                                    }}
                                                />
                                            </ListItemButton>
                                        </ListItem>
                                    ))}
                                </List>
                            </Collapse>
                        )}
                    </React.Fragment>
                ))}
            </List>

            <Divider sx={{ mx: 2 }} />

            {/* User Section */}
            <Box sx={{ p: 2 }}>
                <Box
                    sx={{
                        p: 2,
                        borderRadius: 2,
                        backgroundColor: 'background.default',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                    }}
                >
                    <Avatar sx={{ bgcolor: 'primary.main' }}>
                        <PersonIcon />
                    </Avatar>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>
                            {user?.name || user?.email?.split('@')[0] || 'User'}
                        </Typography>
                        <Box sx={{ mt: 0.5 }}>
                            <RoleBadge role={userRole} />
                        </Box>
                    </Box>
                </Box>
            </Box>
        </Box>
    );

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh' }}>
            <AppBar
                position="fixed"
                sx={{
                    width: { md: `calc(100% - ${drawerWidth}px)` },
                    ml: { md: `${drawerWidth}px` },
                    bgcolor: 'background.paper',
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    boxShadow: 'none',
                }}
            >
                <Toolbar>
                    <IconButton
                        color="inherit"
                        edge="start"
                        onClick={handleDrawerToggle}
                        sx={{ mr: 2, display: { md: 'none' } }}
                    >
                        <MenuIcon />
                    </IconButton>

                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {menuItems.find(item => item.path === location.pathname)?.label || 'Dashboard'}
                    </Typography>

                    <Box sx={{ flexGrow: 1 }} />

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Chip
                            size="small"
                            label={getRoleDisplayName(userRole)}
                            sx={{
                                fontWeight: 600,
                                display: { xs: 'none', sm: 'flex' }
                            }}
                        />
                        <IconButton onClick={handleMenuOpen} sx={{ p: 0 }}>
                            <Avatar sx={{ bgcolor: 'primary.main' }}>
                                <PersonIcon />
                            </Avatar>
                        </IconButton>
                    </Box>

                    <Menu
                        anchorEl={anchorEl}
                        open={Boolean(anchorEl)}
                        onClose={handleMenuClose}
                        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                    >
                        <MenuItem onClick={() => { handleMenuClose(); navigate('/settings'); }}>
                            <ListItemIcon><PersonIcon fontSize="small" /></ListItemIcon>
                            Profile
                        </MenuItem>
                        <Divider />
                        <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
                            <ListItemIcon><LogoutIcon fontSize="small" color="error" /></ListItemIcon>
                            Logout
                        </MenuItem>
                    </Menu>
                </Toolbar>
            </AppBar>

            <Box
                component="nav"
                sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
            >
                <Drawer
                    variant="temporary"
                    open={mobileOpen}
                    onClose={handleDrawerToggle}
                    ModalProps={{ keepMounted: true }}
                    sx={{
                        display: { xs: 'block', md: 'none' },
                        '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
                    }}
                >
                    {drawer}
                </Drawer>
                <Drawer
                    variant="permanent"
                    sx={{
                        display: { xs: 'none', md: 'block' },
                        '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, borderRight: 'none' },
                    }}
                    open
                >
                    {drawer}
                </Drawer>
            </Box>

            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    p: 3,
                    width: { md: `calc(100% - ${drawerWidth}px)` },
                    mt: 8,
                    bgcolor: 'background.default',
                    minHeight: 'calc(100vh - 64px)',
                }}
            >
                {children}
            </Box>
        </Box>
    );
};

export default AdminLayout;
