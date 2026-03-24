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
    { value: 'system_admin', label: 'System Admin' },
    { value: 'agency_admin', label: 'Agency Admin' },
    { value: 'admin', label: 'Admin' },
    { value: 'supervisor', label: 'Supervisor' },
    { value: 'woman', label: 'Woman' },
    { value: 'parent', label: 'Parent' },
    { value: 'guardian', label: 'Guardian' },
];

const MENU_TYPES = [
    { value: 'primary', label: 'Primary Navigation' },
    { value: 'secondary', label: 'Secondary/Core Services' },
    { value: 'footer', label: 'Footer' },
    { value: 'sidebar', label: 'Sidebar' },
];

const Permissions = () => {
    const dispatch = useDispatch();
    const { menus, loading, error } = useSelector((state) => state.menus);
    const { user } = useSelector((state) => state.auth);

    const [success, setSuccess] = useState('');
    const [openDialog, setOpenDialog] = useState(false);
    const [dialogMode, setDialogMode] = useState('create');
    const [selectedMenu, setSelectedMenu] = useState(null);

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
        setSuccess('');
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
            setSuccess(`Menu "${menu.name}" visibility updated`);
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
            setSuccess(`Menu "${menu.name}" deleted successfully`);
        } catch (err) {
            console.error('Failed to delete menu:', err);
        }
    };

    const handleSubmit = async () => {
        try {
            if (dialogMode === 'create') {
                await dispatch(createMenu(formData)).unwrap();
                setSuccess('Menu created successfully');
            } else {
                await dispatch(updateMenu({ id: selectedMenu.id, data: formData })).unwrap();
                setSuccess('Menu updated successfully');
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

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                        Menu & Permissions
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Manage navigation menus and role-based access permissions
                    </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button
                        variant="outlined"
                        startIcon={<RefreshIcon />}
                        onClick={loadMenus}
                    >
                        Refresh
                    </Button>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={handleOpenCreate}
                    >
                        Add Menu
                    </Button>
                </Box>
            </Box>

            <Snackbar open={!!success} autoHideDuration={6000} onClose={handleSnackbarClose}>
                <Alert severity="success" onClose={handleSnackbarClose}>
                    {success}
                </Alert>
            </Snackbar>

            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} md={3}>
                    <Card>
                        <CardContent>
                            <Typography variant="body2" color="text.secondary">Total Menus</Typography>
                            <Typography variant="h4" sx={{ fontWeight: 700 }}>{menus.length}</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card>
                        <CardContent>
                            <Typography variant="body2" color="text.secondary">Active Menus</Typography>
                            <Typography variant="h4" sx={{ fontWeight: 700, color: 'success.main' }}>
                                {menus.filter(m => m.isVisible !== false).length}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card>
                        <CardContent>
                            <Typography variant="body2" color="text.secondary">Hidden Menus</Typography>
                            <Typography variant="h4" sx={{ fontWeight: 700, color: 'warning.main' }}>
                                {menus.filter(m => m.isVisible === false).length}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card>
                        <CardContent>
                            <Typography variant="body2" color="text.secondary">Menu Types</Typography>
                            <Typography variant="h4" sx={{ fontWeight: 700 }}>
                                {Object.keys(menusByType).length}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {Object.entries(menusByType).map(([type, typeMenus]) => (
                <Card key={type} sx={{ mb: 3 }}>
                    <CardContent>
                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                            {MENU_TYPES.find(t => t.value === type)?.label || type}
                        </Typography>
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Order</TableCell>
                                        <TableCell>Name</TableCell>
                                        <TableCell>Label</TableCell>
                                        <TableCell>Route/Path</TableCell>
                                        <TableCell>Required Roles</TableCell>
                                        <TableCell>Status</TableCell>
                                        <TableCell align="right">Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {typeMenus.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={7} align="center">
                                                <Typography variant="body2" color="text.secondary">
                                                    No menus in this category
                                                </Typography>
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        typeMenus
                                            .sort((a, b) => (a.order || 0) - (b.order || 0))
                                            .map((menu) => (
                                                <TableRow key={menu.id} hover>
                                                    <TableCell>{menu.order || 0}</TableCell>
                                                    <TableCell>
                                                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                                            {menu.name}
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell>{menu.label || '-'}</TableCell>
                                                    <TableCell>
                                                        <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                                                            {menu.route || '-'}
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                                                            {menu.requiredRoles && menu.requiredRoles.length > 0 ? (
                                                                menu.requiredRoles.slice(0, 3).map((role) => (
                                                                    <Chip key={role} label={role} size="small" variant="outlined" />
                                                                ))
                                                            ) : (
                                                                <Chip label="All" size="small" color="primary" variant="outlined" />
                                                            )}
                                                            {menu.requiredRoles && menu.requiredRoles.length > 3 && (
                                                                <Chip label={`+${menu.requiredRoles.length - 3}`} size="small" variant="outlined" />
                                                            )}
                                                        </Box>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Chip
                                                            label={menu.isVisible !== false ? 'Visible' : 'Hidden'}
                                                            size="small"
                                                            color={menu.isVisible !== false ? 'success' : 'default'}
                                                        />
                                                    </TableCell>
                                                    <TableCell align="right">
                                                        <Tooltip title={menu.isVisible !== false ? 'Hide Menu' : 'Show Menu'}>
                                                            <IconButton size="small" onClick={() => handleVisibilityToggle(menu)}>
                                                                {menu.isVisible !== false ? <VisibilityIcon /> : <VisibilityOffIcon />}
                                                            </IconButton>
                                                        </Tooltip>
                                                        <Tooltip title="Edit Menu">
                                                            <IconButton size="small" onClick={() => handleOpenEdit(menu)}>
                                                                <EditIcon />
                                                            </IconButton>
                                                        </Tooltip>
                                                        <Tooltip title="Delete Menu">
                                                            <IconButton size="small" color="error" onClick={() => handleDelete(menu)}>
                                                                <DeleteIcon />
                                                            </IconButton>
                                                        </Tooltip>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </CardContent>
                </Card>
            ))}

            <Drawer anchor="right" open={openDialog} onClose={handleCloseDialog}>
                <Box sx={{ width: 450, p: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                        <Typography variant="h6">
                            {dialogMode === 'create' ? 'Create New Menu' : 'Edit Menu'}
                        </Typography>
                        <IconButton onClick={handleCloseDialog}>
                            <CloseIcon />
                        </IconButton>
                    </Box>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <TextField label="Menu Name" value={formData.name} onChange={handleFormChange('name')} fullWidth required />
                        <FormControl fullWidth>
                            <InputLabel>Menu Type</InputLabel>
                            <Select value={formData.type} onChange={handleFormChange('type')} label="Menu Type">
                                {MENU_TYPES.map((type) => (
                                    <MenuItem key={type.value} value={type.value}>{type.label}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <TextField label="Label (Display Text)" value={formData.label} onChange={handleFormChange('label')} fullWidth />
                        <TextField label="Route/Path" value={formData.route} onChange={handleFormChange('route')} fullWidth placeholder="/dashboard" />
                        <TextField label="Icon Name" value={formData.icon} onChange={handleFormChange('icon')} fullWidth placeholder="dashboard" helperText="MUI icon name" />
                        <TextField label="Display Order" type="number" value={formData.order} onChange={handleFormChange('order')} fullWidth />
                        <FormControl fullWidth>
                            <InputLabel>Required Roles</InputLabel>
                            <Select multiple value={formData.requiredRoles} onChange={handleRolesChange} label="Required Roles"
                                renderValue={(selected) => (
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                        {selected.map((value) => (<Chip key={value} label={value} size="small" />))}
                                    </Box>
                                )}>
                                {AVAILABLE_ROLES.map((role) => (
                                    <MenuItem key={role.value} value={role.value}>{role.label}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Switch checked={formData.isVisible} onChange={handleFormChange('isVisible')} />
                            <Typography>Visible</Typography>
                        </Box>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
                        <Button onClick={handleCloseDialog} fullWidth>Cancel</Button>
                        <Button onClick={handleSubmit} variant="contained" disabled={!formData.name || loading} fullWidth>
                            {dialogMode === 'create' ? 'Create' : 'Save Changes'}
                        </Button>
                    </Box>
                </Box>
            </Drawer>
        </Box>
    );
};

export default Permissions;
