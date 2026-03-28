import React, { useEffect, useState, useCallback } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TablePagination,
    Chip,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    IconButton,
    Tooltip,
    Alert,
    Snackbar,
    CircularProgress,
    Paper,
    alpha,
    Grid,
    Skeleton,
    InputAdornment,
    Avatar,
    Divider,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    Tabs,
    Tab,
} from '@mui/material';
import {
    QrCode as QrCodeIcon,
    Delete as DeleteIcon,
    Visibility as VisibilityIcon,
    Refresh as RefreshIcon,
    Add as AddIcon,
    History as HistoryIcon,
    Search as SearchIcon,
    Person as PersonIcon,
    LockOpen as GrantIcon,
    AccessTime as TimeIcon,
    CheckCircle as CheckCircleIcon,
    Cancel as CancelIcon,
    Close as CloseIcon,
    Warning as WarningIcon,
} from '@mui/icons-material';
import { adminApi } from '../services/api';

const PERMISSION_TYPES = {
    VIEW_PROFILE: 'view_profile',
    VIEW_LOCATION: 'view_location',
    VIEW_CONTACT: 'view_contact',
    EMERGENCY_ACCESS: 'emergency_access',
    TRACK: 'track',
};

const TOKEN_TYPES = {
    PROFILE: 'profile',
    PERMISSION: 'permission',
    EMERGENCY: 'emergency',
    TEMP_ACCESS: 'temp_access',
};

const QRManagement = () => {
    const [tokens, setTokens] = useState([]);
    const [accessLogs, setAccessLogs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [logsLoading, setLogsLoading] = useState(false);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(25);
    const [totalCount, setTotalCount] = useState(0);
    const [filter, setFilter] = useState({ search: '', activeOnly: false, type: 'all' });
    const [grantDialogOpen, setGrantDialogOpen] = useState(false);
    const [logsDialogOpen, setLogsDialogOpen] = useState(false);
    const [viewDialogOpen, setViewDialogOpen] = useState(false);
    const [selectedToken, setSelectedToken] = useState(null);
    const [grantForm, setGrantForm] = useState({ targetUserId: '', permissionType: '', reason: '' });
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    const fetchTokens = useCallback(async () => {
        setLoading(true);
        try {
            const params = { page: page + 1, limit: rowsPerPage };
            if (filter.search) params.search = filter.search;
            if (filter.activeOnly) params.activeOnly = 'true';
            if (filter.type !== 'all') params.type = filter.type;
            
            const response = await adminApi.qr.list(params);
            if (response.data.success) {
                setTokens(response.data.data);
                setTotalCount(response.data.total);
            }
        } catch (error) {
            showSnackbar('Failed to fetch QR codes', 'error');
        } finally {
            setLoading(false);
        }
    }, [page, rowsPerPage, filter]);

    const fetchAccessLogs = async () => {
        setLogsLoading(true);
        try {
            const response = await adminApi.qr.accessLogs({ page: 1, limit: 100 });
            if (response.data.success) {
                setAccessLogs(response.data.data);
            }
        } catch (error) {
            showSnackbar('Failed to fetch access logs', 'error');
        } finally {
            setLogsLoading(false);
        }
    };

    useEffect(() => {
        fetchTokens();
    }, [fetchTokens]);

    const handleRevoke = async (tokenId) => {
        if (!window.confirm('Are you sure you want to revoke this QR code?')) return;
        try {
            await adminApi.qr.revoke(tokenId);
            showSnackbar('QR code revoked successfully');
            fetchTokens();
        } catch (error) {
            showSnackbar('Failed to revoke QR code', 'error');
        }
    };

    const handleForceGrant = async () => {
        try {
            await adminApi.qr.forceGrant({
                targetUserId: grantForm.targetUserId,
                permissionType: grantForm.permissionType,
                reason: grantForm.reason,
            });
            showSnackbar('Permission granted successfully');
            setGrantDialogOpen(false);
            setGrantForm({ targetUserId: '', permissionType: '', reason: '' });
        } catch (error) {
            showSnackbar('Failed to grant permission', 'error');
        }
    };

    const showSnackbar = (message, severity = 'success') => {
        setSnackbar({ open: true, message, severity });
    };

    const getTokenTypeColor = (type) => {
        const colors = {
            profile: '#6366f1',
            permission: '#10b981',
            emergency: '#ef4444',
            temp_access: '#f59e0b',
        };
        return colors[type] || '#6366f1';
    };

    const getPermissionColor = (perm) => {
        const colors = {
            view_profile: '#6366f1',
            view_location: '#10b981',
            view_contact: '#f59e0b',
            emergency_access: '#ef4444',
            track: '#ec4899',
        };
        return colors[perm] || '#6366f1';
    };

    const stats = {
        total: totalCount,
        active: tokens.filter(t => t.isActive).length,
        expired: tokens.filter(t => !t.isActive).length,
        byType: tokens.reduce((acc, t) => {
            acc[t.type] = (acc[t.type] || 0) + 1;
            return acc;
        }, {}),
    };

    const formatPermission = (perm) => {
        return perm.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    };

    const formatTokenType = (type) => {
        return type.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    };

    return (
        <Box sx={{ minHeight: 'calc(100vh - 120px)' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3, flexWrap: 'wrap', gap: 2 }}>
                <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 0.5 }}>
                        <Typography variant="h4" sx={{ fontWeight: 800 }}>
                            QR Permission Management
                        </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                        Manage QR codes and access permissions
                    </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                    <Button 
                        variant="outlined" 
                        startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <RefreshIcon />} 
                        onClick={fetchTokens}
                        disabled={loading}
                    >
                        Refresh
                    </Button>
                    <Button
                        variant="outlined"
                        startIcon={<HistoryIcon />}
                        onClick={() => { fetchAccessLogs(); setLogsDialogOpen(true); }}
                    >
                        Access Logs
                    </Button>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => setGrantDialogOpen(true)}
                        sx={{ fontWeight: 600 }}
                    >
                        Force Grant
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
                            <QrCodeIcon />
                        </Box>
                        <Box>
                            <Typography variant="h4" sx={{ fontWeight: 700, color: '#6366f1', lineHeight: 1 }}>
                                {loading ? <Skeleton width={40} /> : stats.total}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">Total QR Codes</Typography>
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
                            <CheckCircleIcon />
                        </Box>
                        <Box>
                            <Typography variant="h4" sx={{ fontWeight: 700, color: '#10b981', lineHeight: 1 }}>
                                {loading ? <Skeleton width={40} /> : stats.active}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">Active</Typography>
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
                            '&:hover': { borderColor: 'error.main', boxShadow: 1 }
                        }}
                    >
                        <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: alpha('#ef4444', 0.1), color: '#ef4444' }}>
                            <CancelIcon />
                        </Box>
                        <Box>
                            <Typography variant="h4" sx={{ fontWeight: 700, color: '#ef4444', lineHeight: 1 }}>
                                {loading ? <Skeleton width={40} /> : stats.expired}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">Revoked</Typography>
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
                            <TimeIcon />
                        </Box>
                        <Box>
                            <Typography variant="h4" sx={{ fontWeight: 700, color: '#f59e0b', lineHeight: 1 }}>
                                {loading ? <Skeleton width={40} /> : Object.keys(stats.byType).length}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">Types</Typography>
                        </Box>
                    </Paper>
                </Grid>
            </Grid>

            <Card sx={{ mb: 3 }}>
                <Box sx={{ p: 2, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                    <TextField
                        size="small"
                        placeholder="Search by user or email..."
                        value={filter.search}
                        onChange={(e) => setFilter({ ...filter, search: e.target.value })}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
                                </InputAdornment>
                            ),
                            endAdornment: filter.search && (
                                <InputAdornment position="end">
                                    <IconButton size="small" onClick={() => setFilter({ ...filter, search: '' })}>
                                        <CloseIcon sx={{ fontSize: 16 }} />
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }}
                        sx={{ minWidth: 250 }}
                    />

                    <Tabs 
                        value={filter.type} 
                        onChange={(_, v) => setFilter({ ...filter, type: v })}
                        sx={{ minHeight: 40, '& .MuiTab-root': { minHeight: 40 } }}
                    >
                        <Tab value="all" label="All Types" />
                        <Tab value="profile" label="Profile" />
                        <Tab value="permission" label="Permission" />
                        <Tab value="emergency" label="Emergency" />
                        <Tab value="temp_access" label="Temp Access" />
                    </Tabs>

                    <Box sx={{ flex: 1 }} />

                    <Chip
                        label={filter.activeOnly ? 'Active Only' : 'All Status'}
                        onClick={() => setFilter({ ...filter, activeOnly: !filter.activeOnly })}
                        variant={filter.activeOnly ? 'filled' : 'outlined'}
                        color={filter.activeOnly ? 'success' : 'default'}
                        icon={filter.activeOnly ? <CheckCircleIcon sx={{ fontSize: 16 }} /> : undefined}
                        sx={{ fontWeight: 500 }}
                    />

                    <Chip
                        label={`${tokens.length} results`}
                        size="small"
                        variant="outlined"
                    />
                </Box>
            </Card>

            <Card>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow sx={{ bgcolor: 'background.default' }}>
                                <TableCell sx={{ fontWeight: 600 }}>User</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Permissions</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Usage</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Expires</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Created</TableCell>
                                <TableCell align="right" sx={{ fontWeight: 600 }}>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading ? (
                                [...Array(5)].map((_, i) => (
                                    <TableRow key={i}>
                                        {[...Array(8)].map((_, j) => (
                                            <TableCell key={j}><Skeleton /></TableCell>
                                        ))}
                                    </TableRow>
                                ))
                            ) : tokens.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={8} align="center" sx={{ py: 8 }}>
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
                                            <QrCodeIcon sx={{ fontSize: 48, color: '#6366f1' }} />
                                        </Box>
                                        <Typography variant="h6" fontWeight={600} sx={{ mb: 0.5 }}>
                                            {filter.search ? 'No Matching QR Codes' : 'No QR Codes Yet'}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                            {filter.search 
                                                ? `No QR codes match "${filter.search}"`
                                                : 'Create your first QR code to get started'}
                                        </Typography>
                                        {filter.search && (
                                            <Button 
                                                variant="text" 
                                                onClick={() => setFilter({ ...filter, search: '' })}
                                            >
                                                Clear Search
                                            </Button>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ) : (
                                tokens.map((token) => (
                                    <TableRow 
                                        key={token.id} 
                                        hover
                                        sx={{ 
                                            cursor: 'pointer',
                                            transition: 'background-color 0.15s',
                                            '&:hover': { bgcolor: alpha('#6366f1', 0.04) }
                                        }}
                                        onClick={() => { setSelectedToken(token); setViewDialogOpen(true); }}
                                    >
                                        <TableCell>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                <Avatar sx={{ width: 36, height: 36, bgcolor: 'primary.main', fontSize: '0.875rem' }}>
                                                    {(token.user?.name || token.user?.email || 'U').charAt(0)}
                                                </Avatar>
                                                <Box>
                                                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                                        {token.user?.name || 'Unknown User'}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        {token.user?.email || 'No email'}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={formatTokenType(token.type)}
                                                size="small"
                                                sx={{
                                                    bgcolor: alpha(getTokenTypeColor(token.type), 0.1),
                                                    color: getTokenTypeColor(token.type),
                                                    fontWeight: 600,
                                                    fontSize: '0.7rem',
                                                }}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                                                {token.permissions?.slice(0, 2).map((perm) => (
                                                    <Chip
                                                        key={perm}
                                                        label={formatPermission(perm)}
                                                        size="small"
                                                        sx={{
                                                            bgcolor: alpha(getPermissionColor(perm), 0.1),
                                                            color: getPermissionColor(perm),
                                                            fontSize: '0.65rem',
                                                            height: 22,
                                                            fontWeight: 500,
                                                        }}
                                                    />
                                                ))}
                                                {token.permissions?.length > 2 && (
                                                    <Chip
                                                        label={`+${token.permissions.length - 2}`}
                                                        size="small"
                                                        sx={{
                                                            bgcolor: 'action.hover',
                                                            fontSize: '0.65rem',
                                                            height: 22,
                                                        }}
                                                    />
                                                )}
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                                {token.useCount || 0} / {token.maxUses || '∞'}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={token.isActive ? 'Active' : 'Revoked'}
                                                size="small"
                                                sx={{
                                                    bgcolor: token.isActive ? alpha('#10b981', 0.1) : alpha('#ef4444', 0.1),
                                                    color: token.isActive ? '#10b981' : '#ef4444',
                                                    fontWeight: 600,
                                                    fontSize: '0.7rem',
                                                }}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2" color="text.secondary">
                                                {token.expiresAt ? new Date(token.expiresAt).toLocaleDateString() : 'Never'}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2" color="text.secondary">
                                                {new Date(token.createdAt).toLocaleDateString()}
                                            </Typography>
                                        </TableCell>
                                        <TableCell align="right" onClick={(e) => e.stopPropagation()}>
                                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
                                                <Tooltip title="View Details">
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => { setSelectedToken(token); setViewDialogOpen(true); }}
                                                    >
                                                        <VisibilityIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Revoke">
                                                    <IconButton
                                                        size="small"
                                                        color="error"
                                                        onClick={() => handleRevoke(token.id)}
                                                        disabled={!token.isActive}
                                                    >
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
                <TablePagination
                    component="div"
                    count={totalCount}
                    page={page}
                    onPageChange={(e, newPage) => setPage(newPage)}
                    rowsPerPage={rowsPerPage}
                    onRowsPerPageChange={(e) => {
                        setRowsPerPage(parseInt(e.target.value, 10));
                        setPage(0);
                    }}
                    rowsPerPageOptions={[10, 25, 50, 100]}
                />
            </Card>

            <Dialog open={grantDialogOpen} onClose={() => setGrantDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box sx={{ p: 1, borderRadius: 1.5, bgcolor: alpha('#10b981', 0.1), color: '#10b981' }}>
                            <GrantIcon />
                        </Box>
                        Force Grant Permission
                    </Box>
                    <IconButton onClick={() => setGrantDialogOpen(false)}>
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent>
                    <Alert severity="info" sx={{ mt: 1, mb: 2 }}>
                        This will grant permission directly to a user without QR code verification.
                    </Alert>
                    <Box sx={{ pt: 1, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                        <TextField
                            label="Target User ID"
                            value={grantForm.targetUserId}
                            onChange={(e) => setGrantForm({ ...grantForm, targetUserId: e.target.value })}
                            fullWidth
                            required
                            size="small"
                        />
                        <FormControl fullWidth required size="small">
                            <InputLabel>Permission Type</InputLabel>
                            <Select
                                value={grantForm.permissionType}
                                onChange={(e) => setGrantForm({ ...grantForm, permissionType: e.target.value })}
                                label="Permission Type"
                            >
                                {Object.entries(PERMISSION_TYPES).map(([key, value]) => (
                                    <MenuItem key={value} value={value}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Box
                                                sx={{
                                                    width: 8,
                                                    height: 8,
                                                    borderRadius: '50%',
                                                    bgcolor: getPermissionColor(value),
                                                }}
                                            />
                                            {formatPermission(value)}
                                        </Box>
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <TextField
                            label="Reason"
                            value={grantForm.reason}
                            onChange={(e) => setGrantForm({ ...grantForm, reason: e.target.value })}
                            fullWidth
                            multiline
                            rows={2}
                            size="small"
                            placeholder="Reason for granting this permission"
                        />
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 2.5 }}>
                    <Button onClick={() => setGrantDialogOpen(false)}>Cancel</Button>
                    <Button
                        variant="contained"
                        onClick={handleForceGrant}
                        disabled={!grantForm.targetUserId || !grantForm.permissionType}
                    >
                        Grant Permission
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog open={logsDialogOpen} onClose={() => setLogsDialogOpen(false)} maxWidth="md" fullWidth>
                <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box sx={{ p: 1, borderRadius: 1.5, bgcolor: alpha('#6366f1', 0.1), color: '#6366f1' }}>
                            <HistoryIcon />
                        </Box>
                        Access Logs
                    </Box>
                    <IconButton onClick={() => setLogsDialogOpen(false)}>
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent sx={{ p: 0 }}>
                    {logsLoading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                            <CircularProgress />
                        </Box>
                    ) : accessLogs.length === 0 ? (
                        <Box sx={{ textAlign: 'center', p: 4 }}>
                            <HistoryIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                            <Typography variant="h6" color="text.secondary">
                                No Access Logs
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Access logs will appear here when QR codes are scanned
                            </Typography>
                        </Box>
                    ) : (
                        <TableContainer sx={{ maxHeight: 500 }}>
                            <Table size="small" stickyHeader>
                                <TableHead>
                                    <TableRow>
                                        <TableCell sx={{ fontWeight: 600, bgcolor: 'background.paper' }}>Owner</TableCell>
                                        <TableCell sx={{ fontWeight: 600, bgcolor: 'background.paper' }}>Accessor</TableCell>
                                        <TableCell sx={{ fontWeight: 600, bgcolor: 'background.paper' }}>Type</TableCell>
                                        <TableCell sx={{ fontWeight: 600, bgcolor: 'background.paper' }}>Result</TableCell>
                                        <TableCell sx={{ fontWeight: 600, bgcolor: 'background.paper' }}>Time</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {accessLogs.map((log) => (
                                        <TableRow key={log.id} hover>
                                            <TableCell>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <Avatar sx={{ width: 28, height: 28, fontSize: '0.75rem', bgcolor: 'primary.main' }}>
                                                        {(log.owner_first_name || 'U').charAt(0)}
                                                    </Avatar>
                                                    <Typography variant="body2">
                                                        {log.owner_first_name} {log.owner_last_name}
                                                    </Typography>
                                                </Box>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2">
                                                    {log.accessor_id 
                                                        ? `${log.first_name || ''} ${log.last_name || ''}`.trim() || 'Unknown'
                                                        : 'Anonymous'
                                                    }
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={formatTokenType(log.access_type)}
                                                    size="small"
                                                    sx={{
                                                        bgcolor: alpha(getTokenTypeColor(log.access_type), 0.1),
                                                        color: getTokenTypeColor(log.access_type),
                                                        fontSize: '0.65rem',
                                                        fontWeight: 500,
                                                    }}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={log.access_result}
                                                    size="small"
                                                    sx={{
                                                        bgcolor: log.access_result === 'granted' ? alpha('#10b981', 0.1) : alpha('#ef4444', 0.1),
                                                        color: log.access_result === 'granted' ? '#10b981' : '#ef4444',
                                                        fontWeight: 600,
                                                        fontSize: '0.7rem',
                                                    }}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="caption" color="text.secondary">
                                                    {new Date(log.accessed_at).toLocaleString()}
                                                </Typography>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setLogsDialogOpen(false)}>Close</Button>
                </DialogActions>
            </Dialog>

            <Dialog 
                open={viewDialogOpen} 
                onClose={() => setViewDialogOpen(false)} 
                maxWidth="sm" 
                fullWidth
            >
                {selectedToken && (
                    <>
                        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Box sx={{ p: 1, borderRadius: 1.5, bgcolor: alpha(getTokenTypeColor(selectedToken.type), 0.1), color: getTokenTypeColor(selectedToken.type) }}>
                                    <QrCodeIcon />
                                </Box>
                                QR Code Details
                            </Box>
                            <IconButton onClick={() => setViewDialogOpen(false)}>
                                <CloseIcon />
                            </IconButton>
                        </DialogTitle>
                        <DialogContent>
                            <Paper variant="outlined" sx={{ p: 2, mb: 2, borderRadius: 2 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                                    <Avatar sx={{ width: 48, height: 48, bgcolor: 'primary.main', fontSize: '1.25rem' }}>
                                        {(selectedToken.user?.name || selectedToken.user?.email || 'U').charAt(0)}
                                    </Avatar>
                                    <Box sx={{ flex: 1 }}>
                                        <Typography variant="h6" fontWeight={700}>
                                            {selectedToken.user?.name || 'Unknown User'}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            {selectedToken.user?.email || 'No email'}
                                        </Typography>
                                    </Box>
                                    <Chip
                                        label={selectedToken.isActive ? 'Active' : 'Revoked'}
                                        sx={{
                                            bgcolor: selectedToken.isActive ? alpha('#10b981', 0.1) : alpha('#ef4444', 0.1),
                                            color: selectedToken.isActive ? '#10b981' : '#ef4444',
                                            fontWeight: 600,
                                        }}
                                    />
                                </Box>
                                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                    <Chip
                                        label={formatTokenType(selectedToken.type)}
                                        sx={{
                                            bgcolor: alpha(getTokenTypeColor(selectedToken.type), 0.1),
                                            color: getTokenTypeColor(selectedToken.type),
                                            fontWeight: 600,
                                        }}
                                    />
                                    <Chip
                                        label={`ID: ${selectedToken.id}`}
                                        size="small"
                                        variant="outlined"
                                        sx={{ fontFamily: 'monospace' }}
                                    />
                                </Box>
                            </Paper>

                            <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ display: 'block', mb: 1 }}>
                                PERMISSIONS
                            </Typography>
                            <Paper variant="outlined" sx={{ p: 2, mb: 2, borderRadius: 2 }}>
                                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                    {selectedToken.permissions?.map((perm) => (
                                        <Chip
                                            key={perm}
                                            label={formatPermission(perm)}
                                            sx={{
                                                bgcolor: alpha(getPermissionColor(perm), 0.1),
                                                color: getPermissionColor(perm),
                                                fontWeight: 500,
                                            }}
                                        />
                                    ))}
                                </Box>
                            </Paper>

                            <Grid container spacing={2}>
                                <Grid item xs={6}>
                                    <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ display: 'block', mb: 0.5 }}>
                                        USAGE
                                    </Typography>
                                    <Typography variant="body2">
                                        {selectedToken.useCount || 0} / {selectedToken.maxUses || '∞'} uses
                                    </Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ display: 'block', mb: 0.5 }}>
                                        EXPIRES
                                    </Typography>
                                    <Typography variant="body2">
                                        {selectedToken.expiresAt ? new Date(selectedToken.expiresAt).toLocaleString() : 'Never'}
                                    </Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ display: 'block', mb: 0.5 }}>
                                        CREATED
                                    </Typography>
                                    <Typography variant="body2">
                                        {new Date(selectedToken.createdAt).toLocaleString()}
                                    </Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ display: 'block', mb: 0.5 }}>
                                        UPDATED
                                    </Typography>
                                    <Typography variant="body2">
                                        {selectedToken.updatedAt ? new Date(selectedToken.updatedAt).toLocaleString() : 'N/A'}
                                    </Typography>
                                </Grid>
                            </Grid>
                        </DialogContent>
                        <DialogActions sx={{ p: 2.5 }}>
                            <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
                            {selectedToken.isActive && (
                                <Button
                                    variant="contained"
                                    color="error"
                                    startIcon={<DeleteIcon />}
                                    onClick={() => {
                                        handleRevoke(selectedToken.id);
                                        setViewDialogOpen(false);
                                    }}
                                >
                                    Revoke QR Code
                                </Button>
                            )}
                        </DialogActions>
                    </>
                )}
            </Dialog>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert severity={snackbar.severity || 'info'} onClose={() => setSnackbar({ ...snackbar, open: false })}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default QRManagement;
