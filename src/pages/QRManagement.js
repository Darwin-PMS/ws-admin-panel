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
} from '@mui/material';
import {
    QrCode as QrCodeIcon,
    Delete as DeleteIcon,
    Visibility as VisibilityIcon,
    Refresh as RefreshIcon,
    Add as AddIcon,
    History as HistoryIcon,
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
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(25);
    const [totalCount, setTotalCount] = useState(0);
    const [filter, setFilter] = useState({ userId: '', activeOnly: false });
    const [grantDialogOpen, setGrantDialogOpen] = useState(false);
    const [logsDialogOpen, setLogsDialogOpen] = useState(false);
    const [grantForm, setGrantForm] = useState({ targetUserId: '', permissionType: '', reason: '' });
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    const fetchTokens = useCallback(async () => {
        setLoading(true);
        try {
            const params = { page: page + 1, limit: rowsPerPage };
            if (filter.userId) params.userId = filter.userId;
            if (filter.activeOnly) params.activeOnly = 'true';
            
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
        try {
            const response = await adminApi.qr.accessLogs({ page: 1, limit: 50 });
            if (response.data.success) {
                setAccessLogs(response.data.data);
            }
        } catch (error) {
            showSnackbar('Failed to fetch access logs', 'error');
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

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                        QR Permission Management
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Manage QR codes and access permissions
                    </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 2 }}>
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
                    >
                        Force Grant Permission
                    </Button>
                </Box>
            </Box>

            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                        <TextField
                            label="Filter by User ID"
                            value={filter.userId}
                            onChange={(e) => setFilter({ ...filter, userId: e.target.value })}
                            sx={{ minWidth: 250 }}
                            size="small"
                        />
                        <FormControl sx={{ minWidth: 150 }} size="small">
                            <InputLabel>Status</InputLabel>
                            <Select
                                value={filter.activeOnly ? 'active' : 'all'}
                                onChange={(e) => setFilter({ ...filter, activeOnly: e.target.value === 'active' })}
                                label="Status"
                            >
                                <MenuItem value="all">All</MenuItem>
                                <MenuItem value="active">Active Only</MenuItem>
                            </Select>
                        </FormControl>
                        <Button variant="outlined" onClick={fetchTokens} startIcon={<RefreshIcon />}>
                            Refresh
                        </Button>
                    </Box>
                </CardContent>
            </Card>

            <Card>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>User</TableCell>
                                <TableCell>Type</TableCell>
                                <TableCell>Permissions</TableCell>
                                <TableCell>Uses</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell>Expires</TableCell>
                                <TableCell>Created</TableCell>
                                <TableCell align="right">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                                        <CircularProgress size={24} />
                                    </TableCell>
                                </TableRow>
                            ) : tokens.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                                        <Typography variant="body2" color="text.secondary">
                                            No QR codes found
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                tokens.map((token) => (
                                    <TableRow key={token.id} hover>
                                        <TableCell>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <QrCodeIcon fontSize="small" color="action" />
                                                <Box>
                                                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                                        {token.user?.name || 'Unknown'}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        {token.user?.email}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={token.type?.replace('_', ' ')}
                                                size="small"
                                                sx={{
                                                    bgcolor: `${getTokenTypeColor(token.type)}20`,
                                                    color: getTokenTypeColor(token.type),
                                                    fontWeight: 500,
                                                    textTransform: 'capitalize',
                                                }}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                                                {token.permissions?.map((perm) => (
                                                    <Chip
                                                        key={perm}
                                                        label={perm.replace('_', ' ')}
                                                        size="small"
                                                        sx={{
                                                            bgcolor: `${getPermissionColor(perm)}15`,
                                                            color: getPermissionColor(perm),
                                                            fontSize: '0.7rem',
                                                            height: 22,
                                                        }}
                                                    />
                                                ))}
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2">
                                                {token.useCount || 0} / {token.maxUses || '∞'}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={token.isActive ? 'Active' : 'Revoked'}
                                                size="small"
                                                color={token.isActive ? 'success' : 'default'}
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
                                        <TableCell align="right">
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
                />
            </Card>

            <Dialog open={grantDialogOpen} onClose={() => setGrantDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Force Grant Permission</DialogTitle>
                <DialogContent>
                    <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <TextField
                            label="Target User ID"
                            value={grantForm.targetUserId}
                            onChange={(e) => setGrantForm({ ...grantForm, targetUserId: e.target.value })}
                            fullWidth
                            required
                        />
                        <FormControl fullWidth required>
                            <InputLabel>Permission Type</InputLabel>
                            <Select
                                value={grantForm.permissionType}
                                onChange={(e) => setGrantForm({ ...grantForm, permissionType: e.target.value })}
                                label="Permission Type"
                            >
                                {Object.entries(PERMISSION_TYPES).map(([key, value]) => (
                                    <MenuItem key={value} value={value}>
                                        {key.replace('_', ' ')}
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
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setGrantDialogOpen(false)}>Cancel</Button>
                    <Button
                        variant="contained"
                        onClick={handleForceGrant}
                        disabled={!grantForm.targetUserId || !grantForm.permissionType}
                    >
                        Grant
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog open={logsDialogOpen} onClose={() => setLogsDialogOpen(false)} maxWidth="md" fullWidth>
                <DialogTitle>Access Logs</DialogTitle>
                <DialogContent>
                    <TableContainer sx={{ maxHeight: 400 }}>
                        <Table size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell>Owner</TableCell>
                                    <TableCell>Accessor</TableCell>
                                    <TableCell>Type</TableCell>
                                    <TableCell>Result</TableCell>
                                    <TableCell>Time</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {accessLogs.map((log) => (
                                    <TableRow key={log.id} hover>
                                        <TableCell>{log.owner_first_name} {log.owner_last_name}</TableCell>
                                        <TableCell>{log.accessor_id ? `${log.first_name || ''} ${log.last_name || ''}`.trim() : 'Anonymous'}</TableCell>
                                        <TableCell>{log.access_type}</TableCell>
                                        <TableCell>
                                            <Chip
                                                label={log.access_result}
                                                size="small"
                                                color={log.access_result === 'granted' ? 'success' : 'error'}
                                            />
                                        </TableCell>
                                        <TableCell>{new Date(log.accessed_at).toLocaleString()}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setLogsDialogOpen(false)}>Close</Button>
                </DialogActions>
            </Dialog>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default QRManagement;
