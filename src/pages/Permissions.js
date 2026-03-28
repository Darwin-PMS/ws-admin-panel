import React, { useState, useEffect, useCallback } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    IconButton,
    Switch,
    Drawer,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Chip,
    Alert,
    Snackbar,
    Tooltip,
    Paper,
    Grid,
    Skeleton,
    CircularProgress,
    InputAdornment,
    Divider,
    List,
    ListItem,
    ListItemText,
    alpha,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Tabs,
    Tab,
    Badge,
} from '@mui/material';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Visibility as VisibilityIcon,
    VisibilityOff as VisibilityOffIcon,
    Refresh as RefreshIcon,
    Settings as SettingsIcon,
    Close as CloseIcon,
    ExpandMore as ExpandMoreIcon,
    Menu as MenuIcon,
    Security as SecurityIcon,
    AdminPanelSettings as AdminIcon,
    Person as PersonIcon,
    FilterList as FilterIcon,
    Search as SearchIcon,
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import {
    fetchMenus,
    createMenu,
    updateMenu,
    deleteMenu,
    toggleMenuVisibility,
} from '../store/slices/menusSlice';

const AVAILABLE_ROLES = [
    { value: 'system_admin', label: 'System Admin', color: '#ef4444' },
    { value: 'agency_admin', label: 'Agency Admin', color: '#f59e0b' },
    { value: 'admin', label: 'Admin', color: '#10b981' },
    { value: 'supervisor', label: 'Supervisor', color: '#6366f1' },
    { value: 'woman', label: 'Woman', color: '#ec4899' },
    { value: 'parent', label: 'Parent', color: '#8b5cf6' },
    { value: 'guardian', label: 'Guardian', color: '#14b8a6' },
];

const MENU_TYPES = [
    { value: 'primary', label: 'Primary Navigation', icon: <MenuIcon />, color: '#6366f1' },
    { value: 'secondary', label: 'Secondary/Core Services', icon: <SecurityIcon />, color: '#10b981' },
    { value: 'footer', label: 'Footer', icon: <AdminIcon />, color: '#f59e0b' },
    { value: 'sidebar', label: 'Sidebar', icon: <MenuIcon />, color: '#8b5cf6' },
];

const Permissions = () => {
    const dispatch = useDispatch();
    const { menus, loading, error } = useSelector((state) => state.menus);
    const { user } = useSelector((state) => state.auth);

    const [success, setSuccess] = useState('');
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [openDialog, setOpenDialog] = useState(false);
    const [dialogMode, setDialogMode] = useState('create');
    const [selectedMenu, setSelectedMenu] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedType, setExpandedType] = useState('primary');

    const [formData, setFormData] = useState({
        name: '',
        type: 'primary',
        label: '',
        route: '',
        icon: '',
        order: 0,
        isVisible: true,
        requiredRoles: [],
        parent_id: '',
    });

    const loadMenus = useCallback(() => {
        dispatch(fetchMenus());
    }, [dispatch]);

    useEffect(() => {
        loadMenus();
    }, [loadMenus]);

    const handleSnackbarClose = () => {
        setSnackbarOpen(false);
        setSuccess('');
    };

    const showSuccess = (message) => {
        setSuccess(message);
        setSnackbarOpen(true);
    };

    const handleOpenCreate = () => {
        setDialogMode('create');
        setFormData({
            name: '',
            type: 'primary',
            label: '',
            route: '',
            icon: '',
            order: menus.length + 1,
            isVisible: true,
            requiredRoles: [],
            parent_id: '',
        });
        setSelectedMenu(null);
        setOpenDialog(true);
    };

    const handleOpenEdit = (menu) => {
        setDialogMode('edit');
        setSelectedMenu(menu);
        setFormData({
            name: menu.name || '',
            type: menu.type || 'primary',
            label: menu.label || '',
            route: menu.route || '',
            icon: menu.icon || '',
            order: menu.order || 0,
            isVisible: menu.isVisible !== false,
            requiredRoles: menu.requiredRoles || [],
            parent_id: menu.parent_id || '',
        });
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setSelectedMenu(null);
    };

    const handleFormChange = (field) => (event) => {
        const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleRolesChange = (event) => {
        setFormData(prev => ({
            ...prev,
            requiredRoles: event.target.value
        }));
    };

    const handleVisibilityToggle = async (menu) => {
        try {
            await dispatch(toggleMenuVisibility(menu)).unwrap();
            showSuccess(`Menu "${menu.name}" visibility updated`);
        } catch (err) {
            console.error('Failed to toggle visibility:', err);
        }
    };

    const handleDelete = async (menu) => {
        if (!window.confirm(`Are you sure you want to delete "${menu.name}"?`)) {
            return;
        }
        try {
            await dispatch(deleteMenu(menu.id)).unwrap();
            showSuccess(`Menu "${menu.name}" deleted successfully`);
        } catch (err) {
            console.error('Failed to delete menu:', err);
        }
    };

    const handleSubmit = async () => {
        try {
            if (dialogMode === 'create') {
                await dispatch(createMenu(formData)).unwrap();
                showSuccess('Menu created successfully');
            } else {
                await dispatch(updateMenu({ id: selectedMenu.id, data: formData })).unwrap();
                showSuccess('Menu updated successfully');
            }
            handleCloseDialog();
            loadMenus();
        } catch (err) {
            console.error('Failed to save menu:', err);
        }
    };

    const menusByType = menus.reduce((acc, menu) => {
        const type = menu.type || 'other';
        if (!acc[type]) {
            acc[type] = [];
        }
        acc[type].push(menu);
        return acc;
    }, {});

    const filteredMenusByType = Object.entries(menusByType).reduce((acc, [type, typeMenus]) => {
        if (!searchQuery) {
            acc[type] = typeMenus;
            return acc;
        }
        const filtered = typeMenus.filter(menu =>
            menu.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            menu.label?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            menu.route?.toLowerCase().includes(searchQuery.toLowerCase())
        );
        acc[type] = filtered;
        return acc;
    }, {});

    const stats = {
        total: menus.length,
        visible: menus.filter(m => m.isVisible !== false).length,
        hidden: menus.filter(m => m.isVisible === false).length,
        types: Object.keys(menusByType).length,
    };

    const getRoleColor = (role) => {
        const found = AVAILABLE_ROLES.find(r => r.value === role);
        return found?.color || '#6366f1';
    };

    const getTypeConfig = (type) => {
        return MENU_TYPES.find(t => t.value === type) || { label: type, color: '#6366f1', icon: <MenuIcon /> };
    };

    return (
        <Box sx={{ minHeight: 'calc(100vh - 120px)' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3, flexWrap: 'wrap', gap: 2 }}>
                <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 0.5 }}>
                        <Typography variant="h4" sx={{ fontWeight: 800 }}>
                            Menu & Permissions
                        </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                        Manage navigation menus and role-based access permissions
                    </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                    <Button 
                        variant="outlined" 
                        startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <RefreshIcon />} 
                        onClick={loadMenus}
                        disabled={loading}
                    >
                        Refresh
                    </Button>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={handleOpenCreate}
                        sx={{ fontWeight: 600 }}
                    >
                        Add Menu
                    </Button>
                </Box>
            </Box>

            <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6} md={3}>
                    <Paper
                        elevation={0}
                        sx={{
                            p: 2.5,
                            borderRadius: 3,
                            border: '1px solid',
                            borderColor: 'divider',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 2,
                            transition: 'all 0.2s',
                            '&:hover': { borderColor: 'primary.main', boxShadow: 1 }
                        }}
                    >
                        <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: alpha('#6366f1', 0.1), color: '#6366f1' }}>
                            <MenuIcon />
                        </Box>
                        <Box>
                            <Typography variant="h4" sx={{ fontWeight: 700, color: '#6366f1', lineHeight: 1 }}>
                                {loading ? <Skeleton width={40} /> : stats.total}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">Total Menus</Typography>
                        </Box>
                    </Paper>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Paper
                        elevation={0}
                        sx={{
                            p: 2.5,
                            borderRadius: 3,
                            border: '1px solid',
                            borderColor: 'divider',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 2,
                            transition: 'all 0.2s',
                            '&:hover': { borderColor: 'success.main', boxShadow: 1 }
                        }}
                    >
                        <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: alpha('#10b981', 0.1), color: '#10b981' }}>
                            <VisibilityIcon />
                        </Box>
                        <Box>
                            <Typography variant="h4" sx={{ fontWeight: 700, color: '#10b981', lineHeight: 1 }}>
                                {loading ? <Skeleton width={40} /> : stats.visible}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">Visible</Typography>
                        </Box>
                    </Paper>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Paper
                        elevation={0}
                        sx={{
                            p: 2.5,
                            borderRadius: 3,
                            border: '1px solid',
                            borderColor: 'divider',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 2,
                            transition: 'all 0.2s',
                            '&:hover': { borderColor: 'warning.main', boxShadow: 1 }
                        }}
                    >
                        <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: alpha('#f59e0b', 0.1), color: '#f59e0b' }}>
                            <VisibilityOffIcon />
                        </Box>
                        <Box>
                            <Typography variant="h4" sx={{ fontWeight: 700, color: '#f59e0b', lineHeight: 1 }}>
                                {loading ? <Skeleton width={40} /> : stats.hidden}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">Hidden</Typography>
                        </Box>
                    </Paper>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Paper
                        elevation={0}
                        sx={{
                            p: 2.5,
                            borderRadius: 3,
                            border: '1px solid',
                            borderColor: 'divider',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 2,
                            transition: 'all 0.2s',
                            '&:hover': { borderColor: 'secondary.main', boxShadow: 1 }
                        }}
                    >
                        <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: alpha('#8b5cf6', 0.1), color: '#8b5cf6' }}>
                            <SecurityIcon />
                        </Box>
                        <Box>
                            <Typography variant="h4" sx={{ fontWeight: 700, color: '#8b5cf6', lineHeight: 1 }}>
                                {loading ? <Skeleton width={40} /> : stats.types}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">Menu Types</Typography>
                        </Box>
                    </Paper>
                </Grid>
            </Grid>

            <Card sx={{ mb: 3 }}>
                <Box sx={{ p: 2, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                    <TextField
                        size="small"
                        placeholder="Search menus..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
                                </InputAdornment>
                            ),
                            endAdornment: searchQuery && (
                                <InputAdornment position="end">
                                    <IconButton size="small" onClick={() => setSearchQuery('')}>
                                        <CloseIcon sx={{ fontSize: 16 }} />
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }}
                        sx={{ minWidth: 250 }}
                    />
                    <Chip
                        label={`${menus.length} menus`}
                        size="small"
                        variant="outlined"
                    />
                </Box>
            </Card>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }} action={
                    <Button color="inherit" size="small" onClick={loadMenus}>
                        Retry
                    </Button>
                }>
                    {error}
                </Alert>
            )}

            {Object.keys(filteredMenusByType).length === 0 ? (
                <Card sx={{ p: 6, textAlign: 'center' }}>
                    <Box
                        sx={{
                            width: 100,
                            height: 100,
                            borderRadius: '50%',
                            bgcolor: alpha('#6366f1', 0.1),
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            mx: 'auto',
                            mb: 2,
                        }}
                    >
                        <MenuIcon sx={{ fontSize: 48, color: '#6366f1' }} />
                    </Box>
                    <Typography variant="h6" fontWeight={600} sx={{ mb: 0.5 }}>
                        {searchQuery ? 'No Matching Menus' : 'No Menus Yet'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {searchQuery 
                            ? `No menus match "${searchQuery}"`
                            : 'Create your first menu to get started'}
                    </Typography>
                    {searchQuery ? (
                        <Button variant="text" onClick={() => setSearchQuery('')}>
                            Clear Search
                        </Button>
                    ) : (
                        <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenCreate}>
                            Add Menu
                        </Button>
                    )}
                </Card>
            ) : (
                Object.entries(filteredMenusByType).map(([type, typeMenus]) => {
                    const typeConfig = getTypeConfig(type);
                    return (
                        <Card key={type} sx={{ mb: 2, overflow: 'hidden' }}>
                            <Box 
                                sx={{ 
                                    p: 2.5, 
                                    bgcolor: alpha(typeConfig.color, 0.05),
                                    borderBottom: '1px solid',
                                    borderColor: 'divider',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    cursor: 'pointer',
                                }}
                                onClick={() => setExpandedType(expandedType === type ? null : type)}
                            >
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <Box sx={{ color: typeConfig.color }}>
                                        {typeConfig.icon}
                                    </Box>
                                    <Box>
                                        <Typography variant="subtitle1" fontWeight={700}>
                                            {typeConfig.label}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            {typeMenus.length} {typeMenus.length === 1 ? 'menu' : 'menus'}
                                        </Typography>
                                    </Box>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Chip 
                                        label={`${typeMenus.filter(m => m.isVisible !== false).length} visible`}
                                        size="small"
                                        sx={{ bgcolor: alpha('#10b981', 0.1), color: '#10b981', fontWeight: 500 }}
                                    />
                                    <IconButton size="small">
                                        <ExpandMoreIcon sx={{ 
                                            transform: expandedType === type ? 'rotate(180deg)' : 'rotate(0deg)',
                                            transition: 'transform 0.2s'
                                        }} />
                                    </IconButton>
                                </Box>
                            </Box>

                            {expandedType === type && (
                                <TableContainer>
                                    <Table>
                                        <TableHead>
                                            <TableRow sx={{ bgcolor: 'background.default' }}>
                                                <TableCell sx={{ fontWeight: 600, width: 60 }}>#</TableCell>
                                                <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                                                <TableCell sx={{ fontWeight: 600 }}>Label</TableCell>
                                                <TableCell sx={{ fontWeight: 600 }}>Route</TableCell>
                                                <TableCell sx={{ fontWeight: 600 }}>Roles</TableCell>
                                                <TableCell sx={{ fontWeight: 600, width: 100 }}>Status</TableCell>
                                                <TableCell align="right" sx={{ fontWeight: 600 }}>Actions</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {typeMenus.length === 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                                                        <Typography variant="body2" color="text.secondary">
                                                            No menus in this category
                                                        </Typography>
                                                    </TableCell>
                                                </TableRow>
                                            ) : (
                                                typeMenus
                                                    .sort((a, b) => (a.order || 0) - (b.order || 0))
                                                    .map((menu, index) => (
                                                        <TableRow 
                                                            key={menu.id} 
                                                            hover
                                                            sx={{ 
                                                                transition: 'background-color 0.15s',
                                                                '&:hover': { bgcolor: alpha(typeConfig.color, 0.02) }
                                                            }}
                                                        >
                                                            <TableCell>
                                                                <Box
                                                                    sx={{
                                                                        width: 24,
                                                                        height: 24,
                                                                        borderRadius: 1,
                                                                        bgcolor: 'background.default',
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        justifyContent: 'center',
                                                                        fontSize: '0.75rem',
                                                                        fontWeight: 600,
                                                                        color: 'text.secondary',
                                                                    }}
                                                                >
                                                                    {menu.order || index + 1}
                                                                </Box>
                                                            </TableCell>
                                                            <TableCell>
                                                                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                                                    {menu.name}
                                                                </Typography>
                                                            </TableCell>
                                                            <TableCell>
                                                                <Typography variant="body2" color="text.secondary">
                                                                    {menu.label || '-'}
                                                                </Typography>
                                                            </TableCell>
                                                            <TableCell>
                                                                <Chip 
                                                                    label={menu.route || '-'} 
                                                                    size="small" 
                                                                    variant="outlined"
                                                                    sx={{ 
                                                                        fontFamily: 'monospace',
                                                                        fontSize: '0.7rem',
                                                                    }}
                                                                />
                                                            </TableCell>
                                                            <TableCell>
                                                                <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                                                                    {menu.requiredRoles && menu.requiredRoles.length > 0 ? (
                                                                        <>
                                                                            {menu.requiredRoles.slice(0, 2).map((role) => (
                                                                                <Chip 
                                                                                    key={role} 
                                                                                    label={role} 
                                                                                    size="small" 
                                                                                    sx={{
                                                                                        bgcolor: alpha(getRoleColor(role), 0.1),
                                                                                        color: getRoleColor(role),
                                                                                        fontSize: '0.65rem',
                                                                                        height: 22,
                                                                                        fontWeight: 500,
                                                                                    }}
                                                                                />
                                                                            ))}
                                                                            {menu.requiredRoles.length > 2 && (
                                                                                <Chip 
                                                                                    label={`+${menu.requiredRoles.length - 2}`} 
                                                                                    size="small" 
                                                                                    sx={{
                                                                                        bgcolor: 'action.hover',
                                                                                        fontSize: '0.65rem',
                                                                                        height: 22,
                                                                                    }}
                                                                                />
                                                                            )}
                                                                        </>
                                                                    ) : (
                                                                        <Chip 
                                                                            label="All" 
                                                                            size="small" 
                                                                            sx={{ 
                                                                                bgcolor: alpha('#6366f1', 0.1),
                                                                                color: '#6366f1',
                                                                                fontSize: '0.65rem',
                                                                                height: 22,
                                                                                fontWeight: 500,
                                                                            }}
                                                                        />
                                                                    )}
                                                                </Box>
                                                            </TableCell>
                                                            <TableCell>
                                                                <Switch
                                                                    checked={menu.isVisible !== false}
                                                                    onChange={() => handleVisibilityToggle(menu)}
                                                                    size="small"
                                                                    sx={{
                                                                        '& .MuiSwitch-switchBase.Mui-checked': {
                                                                            color: '#10b981',
                                                                        },
                                                                        '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                                                                            bgcolor: '#10b981',
                                                                        },
                                                                    }}
                                                                />
                                                            </TableCell>
                                                            <TableCell align="right">
                                                                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
                                                                    <Tooltip title={menu.isVisible !== false ? 'Hide Menu' : 'Show Menu'}>
                                                                        <IconButton 
                                                                            size="small" 
                                                                            onClick={() => handleVisibilityToggle(menu)}
                                                                            sx={{ color: menu.isVisible !== false ? 'success.main' : 'text.secondary' }}
                                                                        >
                                                                            {menu.isVisible !== false ? <VisibilityIcon fontSize="small" /> : <VisibilityOffIcon fontSize="small" />}
                                                                        </IconButton>
                                                                    </Tooltip>
                                                                    <Tooltip title="Edit Menu">
                                                                        <IconButton size="small" onClick={() => handleOpenEdit(menu)}>
                                                                            <EditIcon fontSize="small" />
                                                                        </IconButton>
                                                                    </Tooltip>
                                                                    <Tooltip title="Delete Menu">
                                                                        <IconButton size="small" color="error" onClick={() => handleDelete(menu)}>
                                                                            <DeleteIcon fontSize="small" />
                                                                        </IconButton>
                                                                    </Tooltip>
                                                                </Box>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))
                                            )}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            )}
                        </Card>
                    );
                })
            )}

            <Divider sx={{ my: 3 }} />

            <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
                <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>
                    Available Roles
                </Typography>
                <Grid container spacing={2}>
                    {AVAILABLE_ROLES.map((role) => (
                        <Grid item xs={12} sm={6} md={4} key={role.value}>
                            <Box
                                sx={{
                                    p: 2,
                                    borderRadius: 2,
                                    bgcolor: alpha(role.color, 0.05),
                                    border: '1px solid',
                                    borderColor: alpha(role.color, 0.2),
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1.5,
                                }}
                            >
                                <Box
                                    sx={{
                                        width: 8,
                                        height: 8,
                                        borderRadius: '50%',
                                        bgcolor: role.color,
                                    }}
                                />
                                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                    {role.label}
                                </Typography>
                                <Typography variant="caption" color="text.secondary" sx={{ ml: 'auto' }}>
                                    {role.value}
                                </Typography>
                            </Box>
                        </Grid>
                    ))}
                </Grid>
            </Paper>

            <Drawer 
                anchor="right" 
                open={openDialog} 
                onClose={handleCloseDialog}
                PaperProps={{ sx: { width: { xs: '100%', sm: 480 } } }}
            >
                <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <Box sx={{ 
                        p: 3, 
                        borderBottom: '1px solid', 
                        borderColor: 'divider',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                    }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Box sx={{ 
                                p: 1, 
                                borderRadius: 1.5, 
                                bgcolor: alpha('#6366f1', 0.1), 
                                color: '#6366f1' 
                            }}>
                                {dialogMode === 'create' ? <AddIcon /> : <EditIcon />}
                            </Box>
                            <Typography variant="h6">
                                {dialogMode === 'create' ? 'Create New Menu' : 'Edit Menu'}
                            </Typography>
                        </Box>
                        <IconButton onClick={handleCloseDialog}>
                            <CloseIcon />
                        </IconButton>
                    </Box>

                    <Box sx={{ flex: 1, overflow: 'auto', p: 3 }}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                            <TextField 
                                label="Menu Name" 
                                value={formData.name} 
                                onChange={handleFormChange('name')} 
                                fullWidth 
                                required
                                size="small"
                                placeholder="e.g., Dashboard"
                            />
                            
                            <FormControl fullWidth size="small">
                                <InputLabel>Menu Type</InputLabel>
                                <Select 
                                    value={formData.type} 
                                    onChange={handleFormChange('type')} 
                                    label="Menu Type"
                                >
                                    {MENU_TYPES.map((type) => (
                                        <MenuItem key={type.value} value={type.value}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <Box sx={{ color: type.color }}>{type.icon}</Box>
                                                {type.label}
                                            </Box>
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>

                            <TextField 
                                label="Label (Display Text)" 
                                value={formData.label} 
                                onChange={handleFormChange('label')} 
                                fullWidth 
                                size="small"
                                placeholder="e.g., My Dashboard"
                            />
                            
                            <TextField 
                                label="Route/Path" 
                                value={formData.route} 
                                onChange={handleFormChange('route')} 
                                fullWidth 
                                size="small"
                                placeholder="/dashboard"
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <Typography variant="body2" color="text.secondary">/</Typography>
                                        </InputAdornment>
                                    ),
                                }}
                            />

                            <TextField 
                                label="Icon Name" 
                                value={formData.icon} 
                                onChange={handleFormChange('icon')} 
                                fullWidth 
                                size="small"
                                placeholder="dashboard"
                                helperText="MUI icon component name"
                            />

                            <TextField 
                                label="Display Order" 
                                type="number" 
                                value={formData.order} 
                                onChange={handleFormChange('order')} 
                                fullWidth 
                                size="small"
                                inputProps={{ min: 0 }}
                            />

                            <FormControl fullWidth size="small">
                                <InputLabel>Required Roles</InputLabel>
                                <Select 
                                    multiple 
                                    value={formData.requiredRoles} 
                                    onChange={handleRolesChange} 
                                    label="Required Roles"
                                    renderValue={(selected) => (
                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                            {selected.map((value) => {
                                                const role = AVAILABLE_ROLES.find(r => r.value === value);
                                                return (
                                                    <Chip 
                                                        key={value} 
                                                        label={role?.label || value} 
                                                        size="small"
                                                        sx={{
                                                            bgcolor: alpha(role?.color || '#6366f1', 0.1),
                                                            color: role?.color || '#6366f1',
                                                        }}
                                                    />
                                                );
                                            })}
                                        </Box>
                                    )}
                                >
                                    {AVAILABLE_ROLES.map((role) => (
                                        <MenuItem key={role.value} value={role.value}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <Box
                                                    sx={{
                                                        width: 8,
                                                        height: 8,
                                                        borderRadius: '50%',
                                                        bgcolor: role.color,
                                                    }}
                                                />
                                                {role.label}
                                            </Box>
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>

                            <Box sx={{ 
                                p: 2, 
                                borderRadius: 2, 
                                bgcolor: 'background.default',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                            }}>
                                <Box>
                                    <Typography variant="body2" fontWeight={500}>
                                        Visible
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        Show this menu in navigation
                                    </Typography>
                                </Box>
                                <Switch 
                                    checked={formData.isVisible} 
                                    onChange={handleFormChange('isVisible')}
                                    sx={{
                                        '& .MuiSwitch-switchBase.Mui-checked': {
                                            color: '#10b981',
                                        },
                                        '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                                            bgcolor: '#10b981',
                                        },
                                    }}
                                />
                            </Box>
                        </Box>
                    </Box>

                    <Box sx={{ p: 3, borderTop: '1px solid', borderColor: 'divider', bgcolor: 'background.default' }}>
                        <Grid container spacing={2}>
                            <Grid item xs={6}>
                                <Button 
                                    onClick={handleCloseDialog} 
                                    fullWidth
                                    variant="outlined"
                                >
                                    Cancel
                                </Button>
                            </Grid>
                            <Grid item xs={6}>
                                <Button 
                                    onClick={handleSubmit} 
                                    variant="contained" 
                                    disabled={!formData.name || loading} 
                                    fullWidth
                                >
                                    {loading ? 'Saving...' : dialogMode === 'create' ? 'Create' : 'Save Changes'}
                                </Button>
                            </Grid>
                        </Grid>
                    </Box>
                </Box>
            </Drawer>

            <Snackbar 
                open={snackbarOpen} 
                autoHideDuration={6000} 
                onClose={handleSnackbarClose} 
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert severity="success" onClose={handleSnackbarClose}>
                    {success}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default Permissions;
