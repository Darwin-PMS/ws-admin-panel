import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    Box,
    Drawer,
    AppBar,
    Toolbar,
    Typography,
    Divider,
    IconButton,
    List,
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
    Tooltip,
    Badge,
    LinearProgress,
    Paper,
    alpha,
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
    Notifications as NotificationsIcon,
    ChevronLeft as ChevronLeftIcon,
    ChevronRight as ChevronRightIcon,
    Map as MapIcon,
    GppBad as GppBadIcon,
    BabyChangingStation as BabyIcon,
    Feedback as FeedbackIcon,
    ManageAccounts as ManageIcon,
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../store/slices/authSlice';
import { usePermission } from '../../context/PermissionContext';
import { fetchAlerts } from '../../store/slices/alertsSlice';
import { toggleSidebar } from '../../store/slices/uiSlice';

const DRAWER_WIDTH = 280;
const COLLAPSED_WIDTH = 72;

const AdminLayout = ({ children }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);
    const { sosAlerts } = useSelector((state) => state.alerts);
    const { getMenuItems, getRoleDisplayName, userRole } = usePermission();

    const menuItems = getMenuItems();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [anchorEl, setAnchorEl] = useState(null);
    const [expandedMenu, setExpandedMenu] = useState(null);
    const [mounted, setMounted] = useState(false);
    const sidebarOpen = useSelector((state) => state.ui.sidebarOpen ?? true);
    const collapsed = !sidebarOpen;

    const [manuallyExpanded, setManuallyExpanded] = useState(null);

    useEffect(() => {
        setMounted(true);
        dispatch(fetchAlerts());
    }, [dispatch]);

    useEffect(() => {
        if (menuItems && !collapsed) {
            const activeItem = menuItems.find(item =>
                location.pathname === item.path ||
                (item.submenu && item.submenu.some(sub => location.pathname === sub.path))
            );
            if (activeItem && manuallyExpanded !== activeItem.key) {
                setExpandedMenu(activeItem.key);
            }
        }
    }, [location.pathname, menuItems, collapsed, manuallyExpanded]);

    const activeSOSCount = sosAlerts?.filter(a => a.status === 'active').length || 0;

    const handleDrawerToggle = () => setMobileOpen(!mobileOpen);
    const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
    const handleMenuClose = () => setAnchorEl(null);
    const handleLogout = () => {
        handleMenuClose();
        dispatch(logout());
        navigate('/login');
    };

    const handleMenuClick = (item) => {
        if (item.submenu && item.submenu.length > 0) {
            setManuallyExpanded(item.key);
            setExpandedMenu(prev => {
                return prev === item.key ? null : item.key;
            });
        } else {
            navigate(item.path);
            if (isMobile) setMobileOpen(false);
        }
    };

    const handleSubmenuClick = (path, parentKey) => {
        if (parentKey) {
            setManuallyExpanded(parentKey);
        }
        setExpandedMenu(prev => {
            if (parentKey && prev !== parentKey) {
                return parentKey;
            }
            return prev;
        });
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
            Map: <MapIcon />,
            GppBad: <GppBadIcon />,
            BabyChangingStation: <BabyIcon />,
            Feedback: <FeedbackIcon />,
            ManageAccounts: <ManageIcon />,
        };
        return icons[iconName] || <DashboardIcon />;
    };

    const isActive = (item) => {
        if (item.path === location.pathname) return true;
        if (item.submenu) {
            return item.submenu.some(sub => location.pathname === sub.path);
        }
        return false;
    };

    const drawerContent = (
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: 'background.paper' }}>
            {/* Logo */}
            <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2, minHeight: 64 }}>
                <Box
                    sx={{
                        width: 40,
                        height: 40,
                        borderRadius: 2,
                        background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 800,
                        fontSize: 16,
                        color: 'white',
                        boxShadow: '0 4px 14px rgba(99, 102, 241, 0.4)',
                    }}
                >
                    AI
                </Box>
                {!collapsed && (
                    <Box sx={{ overflow: 'hidden' }}>
                        <Typography variant="subtitle1" fontWeight={700} noWrap sx={{ lineHeight: 1.2 }}>
                            Safety Admin
                        </Typography>
                        <Typography variant="caption" color="text.secondary" noWrap>
                            Women Safety Portal
                        </Typography>
                    </Box>
                )}
            </Box>

            <Divider />

            {/* Role Badge */}
            {!collapsed && (
                <Box sx={{ px: 2, py: 1.5 }}>
                    <Chip
                        size="small"
                        label={getRoleDisplayName(userRole)}
                        sx={{
                            fontWeight: 600,
                            fontSize: '0.7rem',
                            background: alpha(theme.palette.primary.main, 0.1),
                            color: theme.palette.primary.main,
                        }}
                    />
                </Box>
            )}

            {/* Navigation */}
            <Box sx={{ flex: 1, overflow: 'auto', px: collapsed ? 1 : 1.5, py: 1 }}>
                {!collapsed && (
                    <Typography variant="caption" color="text.secondary" sx={{ px: 1, mb: 1, display: 'block', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>
                        Main Menu
                    </Typography>
                )}
                <List disablePadding>
                    {menuItems.map((item) => {
                        const active = isActive(item);
                        return (
                            <React.Fragment key={item.key}>
                                <Tooltip title={collapsed ? item.label : ''} placement="right">
                                    <ListItemButton
                                        onClick={() => handleMenuClick(item)}
                                        sx={{
                                            mb: 0.5,
                                            borderRadius: 2,
                                            minHeight: 44,
                                            justifyContent: collapsed ? 'center' : 'flex-start',
                                            px: collapsed ? 1 : 2,
                                            background: active ? alpha(theme.palette.primary.main, 0.15) : 'transparent',
                                            color: active ? theme.palette.primary.main : 'text.primary',
                                            '&:hover': {
                                                background: active ? alpha(theme.palette.primary.main, 0.2) : alpha(theme.palette.primary.main, 0.05),
                                            },
                                        }}
                                    >
                                        <ListItemIcon
                                            sx={{
                                                minWidth: collapsed ? 0 : 40,
                                                color: active ? theme.palette.primary.main : 'text.secondary',
                                                justifyContent: 'center',
                                            }}
                                        >
                                            {item.key === 'sosAlerts' && activeSOSCount > 0 ? (
                                                <Badge badgeContent={activeSOSCount} color="error" max={99}>
                                                    {getIcon(item.icon)}
                                                </Badge>
                                            ) : (
                                                <>
                                                    {getIcon(item.icon)}
                                                    {collapsed && item.submenu && item.submenu.length > 0 && (
                                                        <span
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleMenuClick(item);
                                                            }}
                                                        >
                                                            <ChevronRightIcon sx={{ fontSize: 14, ml: 0.5 }} />
                                                        </span>
                                                    )}
                                                </>
                                            )}
                                        </ListItemIcon>
                                        {!collapsed && (
                                            <>
                                                <ListItemText
                                                    primary={item.label}
                                                    primaryTypographyProps={{
                                                        fontWeight: active ? 600 : 400,
                                                        fontSize: '0.875rem',
                                                        noWrap: true,
                                                    }}
                                                />
                                                {item.submenu && item.submenu.length > 0 && (
                                                    <span
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleMenuClick(item);
                                                        }}
                                                    >
                                                        {expandedMenu === item.key ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
                                                    </span>
                                                )}
                                            </>
                                        )}
                                    </ListItemButton>
                                </Tooltip>

                                {/* Submenu */}
                                {item.submenu && item.submenu.length > 0 && (
                                    <Collapse in={!collapsed && expandedMenu === item.key} timeout="auto" unmountOnExit>
                                        <List component="div" disablePadding sx={{ pl: 1 }}>
                                            {item.submenu.map((subItem) => {
                                                const subActive = location.pathname === subItem.path;
                                                return (
                                                    <ListItemButton
                                                        key={subItem.key}
                                                        onClick={() => handleSubmenuClick(subItem.path, item.key)}
                                                        sx={{
                                                            mb: 0.5,
                                                            borderRadius: 2,
                                                            py: 0.75,
                                                            pl: collapsed ? 1 : 3,
                                                            justifyContent: collapsed ? 'center' : 'flex-start',
                                                            background: subActive ? alpha(theme.palette.primary.main, 0.1) : 'transparent',
                                                            '&:hover': {
                                                                background: alpha(theme.palette.primary.main, 0.08),
                                                            },
                                                        }}
                                                    >
                                                        {!collapsed && (
                                                            <ListItemText
                                                                primary={subItem.label}
                                                                primaryTypographyProps={{
                                                                    fontWeight: subActive ? 600 : 400,
                                                                    fontSize: '0.8rem',
                                                                    noWrap: true,
                                                                }}
                                                            />
                                                        )}
                                                        {collapsed && (
                                                            <Tooltip title={subItem.label} placement="right">
                                                                <ListItemIcon sx={{ minWidth: 0, color: subActive ? theme.palette.primary.main : 'text.secondary' }}>
                                                                    {getIcon(subItem.icon)}
                                                                </ListItemIcon>
                                                            </Tooltip>
                                                        )}
                                                    </ListItemButton>
                                                );
                                            })}
                                        </List>
                                    </Collapse>
                                )}
                            </React.Fragment>
                        );
                    })}
                </List>
            </Box>

            <Divider />

            {/* Collapse Toggle */}
            <Box sx={{ px: 1.5, py: 1, display: { md: 'flex' }, justifyContent: 'center' }}>
                <Tooltip title={collapsed ? 'Expand' : 'Collapse'} placement="right">
                    <IconButton onClick={() => dispatch(toggleSidebar())} size="small">
                        <ChevronLeftIcon sx={{ transform: collapsed ? 'rotate(180deg)' : 'none', transition: '0.3s' }} />
                    </IconButton>
                </Tooltip>
            </Box>

            {/* User Section */}
            <Box sx={{ p: collapsed ? 1 : 2 }}>
                <Paper
                    elevation={0}
                    sx={{
                        p: collapsed ? 1 : 2,
                        borderRadius: 2,
                        background: alpha(theme.palette.primary.main, 0.05),
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.5,
                        justifyContent: collapsed ? 'center' : 'flex-start',
                    }}
                >
                    <Badge
                        overlap="circular"
                        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                        badgeContent={
                            <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: 'success.main', border: '2px solid', borderColor: 'background.paper' }} />
                        }
                    >
                        <Avatar sx={{ bgcolor: theme.palette.primary.main, width: 36, height: 36 }}>
                            {user?.firstName?.charAt(0) || user?.name?.charAt(0) || <PersonIcon />}
                        </Avatar>
                    </Badge>
                    {!collapsed && (
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography variant="body2" fontWeight={600} noWrap>
                                {user?.firstName ? `${user.firstName} ${user.lastName || ''}` : user?.email?.split('@')[0] || 'User'}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" noWrap>
                                {user?.email}
                            </Typography>
                        </Box>
                    )}
                </Paper>
            </Box>
        </Box>
    );

    const drawerWidth = collapsed ? COLLAPSED_WIDTH : DRAWER_WIDTH;

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh' }}>
            {/* App Bar */}
            <AppBar
                position="fixed"
                elevation={0}
                sx={{
                    width: { md: `calc(100% - ${drawerWidth}px)` },
                    ml: { md: `${drawerWidth}px` },
                    bgcolor: 'background.paper',
                    borderBottom: `1px solid ${theme.palette.divider}`,
                    transition: 'width 0.3s ease, margin 0.3s ease',
                }}
            >
                <Toolbar sx={{ minHeight: 64 }}>
                    <IconButton
                        color="inherit"
                        edge="start"
                        onClick={handleDrawerToggle}
                        sx={{ display: { md: 'none' }, mr: 2 }}
                    >
                        <MenuIcon />
                    </IconButton>

                    {/* Breadcrumb / Page Title */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {menuItems.find(item => {
                            if (item.path === location.pathname) return true;
                            if (item.submenu) {
                                return item.submenu.some(sub => location.pathname === sub.path);
                            }
                            return false;
                        })?.icon && (
                                <Box sx={{ color: 'text.secondary', display: 'flex' }}>
                                    {getIcon(menuItems.find(item => {
                                        if (item.path === location.pathname) return true;
                                        if (item.submenu) return item.submenu.some(sub => location.pathname === sub.path);
                                        return false;
                                    })?.icon)}
                                </Box>
                            )}
                        <Typography variant="h6" fontWeight={600} color="text.primary">
                            {menuItems.find(item => {
                                if (item.path === location.pathname) return true;
                                if (item.submenu) return item.submenu.some(sub => location.pathname === sub.path);
                                return false;
                            })?.label || 'Dashboard'}
                        </Typography>
                    </Box>

                    <Box sx={{ flexGrow: 1 }} />

                    {/* Right Actions */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {/* SOS Notification */}
                        <Tooltip title={`${activeSOSCount} Active SOS Alerts`}>
                            <IconButton onClick={() => navigate('/sos-alerts')} sx={{ position: 'relative' }}>
                                <Badge badgeContent={activeSOSCount} color="error" max={99}>
                                    <NotificationsIcon />
                                </Badge>
                            </IconButton>
                        </Tooltip>

                        <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />

                        {/* User Menu */}
                        <Box
                            onClick={handleMenuOpen}
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1.5,
                                cursor: 'pointer',
                                p: 0.5,
                                borderRadius: 2,
                                '&:hover': { bgcolor: 'action.hover' },
                            }}
                        >
                            <Avatar sx={{ width: 36, height: 36, bgcolor: 'primary.main', fontSize: '0.875rem' }}>
                                {user?.firstName?.charAt(0) || user?.name?.charAt(0) || 'U'}
                            </Avatar>
                            <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                                <Typography variant="body2" fontWeight={600} lineHeight={1.2}>
                                    {user?.firstName ? `${user.firstName} ${user.lastName || ''}` : 'User'}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    {getRoleDisplayName(userRole)}
                                </Typography>
                            </Box>
                        </Box>

                        <Menu
                            anchorEl={anchorEl}
                            open={Boolean(anchorEl)}
                            onClose={handleMenuClose}
                            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                            PaperProps={{ sx: { minWidth: 200, mt: 1 } }}
                        >
                            <MenuItem onClick={() => { handleMenuClose(); navigate('/settings'); }}>
                                <ListItemIcon><PersonIcon fontSize="small" /></ListItemIcon>
                                Profile Settings
                            </MenuItem>
                            <Divider />
                            <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
                                <ListItemIcon><LogoutIcon fontSize="small" color="error" /></ListItemIcon>
                                Sign Out
                            </MenuItem>
                        </Menu>
                    </Box>
                </Toolbar>
            </AppBar>

            {/* Drawer */}
            <Box component="nav" sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 }, transition: 'width 0.3s ease' }}>
                {/* Mobile Drawer */}
                <Drawer
                    variant="temporary"
                    open={mobileOpen}
                    onClose={handleDrawerToggle}
                    ModalProps={{ keepMounted: true }}
                    sx={{ display: { xs: 'block', md: 'none' }, '& .MuiDrawer-paper': { width: DRAWER_WIDTH } }}
                >
                    {drawerContent}
                </Drawer>

                {/* Desktop Drawer */}
                <Drawer
                    variant="permanent"
                    sx={{
                        display: { xs: 'none', md: 'block' },
                        '& .MuiDrawer-paper': {
                            width: drawerWidth,
                            borderRight: 'none',
                            boxShadow: '4px 0 20px rgba(0,0,0,0.05)',
                            transition: 'width 0.3s ease',
                        },
                    }}
                    open
                >
                    {drawerContent}
                </Drawer>
            </Box>

            {/* Main Content */}
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    width: { md: `calc(100% - ${drawerWidth}px)` },
                    minHeight: '100vh',
                    bgcolor: 'background.default',
                    transition: 'width 0.3s ease, margin 0.3s ease',
                }}
            >
                <Toolbar sx={{ minHeight: 64 }} />
                <Box sx={{ p: { xs: 2, sm: 3 } }}>
                    {children}
                </Box>
            </Box>
        </Box>
    );
};

export default AdminLayout;
