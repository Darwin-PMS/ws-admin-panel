import React, { useEffect, useCallback, useState } from 'react';
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
    TextField,
    InputAdornment,
    FormControl,
    Select,
    MenuItem,
    Skeleton,
} from '@mui/material';
import {
    Search as SearchIcon,
    Login as LoginIcon,
    Logout as LogoutIcon,
    Warning as WarningIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Add as AddIcon,
    Refresh as RefreshIcon,
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { fetchActivityLogs, setSearch, setActionFilter, setPage, setRowsPerPage } from '../store/slices/activityLogsSlice';

// Action icons will be fetched from API configuration
const actionIcons = {
    login: <LoginIcon fontSize="small" />,
    logout: <LogoutIcon fontSize="small" />,
    sos: <WarningIcon fontSize="small" />,
    edit: <EditIcon fontSize="small" />,
    delete: <DeleteIcon fontSize="small" />,
    create: <AddIcon fontSize="small" />,
};

// Action colors will be fetched from API configuration
const actionColors = {
    login: '#10b981',
    logout: '#6366f1',
    sos: '#ef4444',
    edit: '#f59e0b',
    delete: '#ef4444',
    create: '#8b5cf6',
};

const ActivityLogs = () => {
    const dispatch = useDispatch();
    const { logs, loading, filters, totalCount } = useSelector((state) => state.activityLogs);

    const page = filters.page;
    const rowsPerPage = filters.rowsPerPage;

    const fetchLogs = useCallback(() => {
        dispatch(fetchActivityLogs());
    }, [dispatch]);

    useEffect(() => {
        fetchLogs();
    }, [fetchLogs]);

    const filteredLogs = logs.filter(log => {
        const matchesSearch =
            (log.user_name || '').toLowerCase().includes(filters.search.toLowerCase()) ||
            (log.description || '').toLowerCase().includes(filters.search.toLowerCase());
        const matchesAction = filters.action === 'all' || log.action === filters.action;
        return matchesSearch && matchesAction;
    });

    return (
        <Box>
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                        Activity Logs
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Track all user activities and system events
                    </Typography>
                </Box>
            </Box>

            {/* Filters */}
            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                        <TextField
                            placeholder="Search logs..."
                            value={filters.search}
                            onChange={(e) => dispatch(setSearch(e.target.value))}
                            sx={{ flex: 1, minWidth: 250 }}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon />
                                    </InputAdornment>
                                ),
                            }}
                        />
                        <FormControl sx={{ minWidth: 150 }}>
                            <Select
                                value={filters.action}
                                onChange={(e) => dispatch(setActionFilter(e.target.value))}
                                displayEmpty
                            >
                                <MenuItem value="all">All Actions</MenuItem>
                                <MenuItem value="login">Login</MenuItem>
                                <MenuItem value="logout">Logout</MenuItem>
                                <MenuItem value="sos">SOS</MenuItem>
                                <MenuItem value="create">Create</MenuItem>
                                <MenuItem value="edit">Edit</MenuItem>
                                <MenuItem value="delete">Delete</MenuItem>
                            </Select>
                        </FormControl>
                    </Box>
                </CardContent>
            </Card>

            {/* Logs Table */}
            <Card>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Action</TableCell>
                                <TableCell>User</TableCell>
                                <TableCell>Details</TableCell>
                                <TableCell>IP Address</TableCell>
                                <TableCell>Timestamp</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    {[...Array(5)].map((_, i) => (
                                        <TableCell key={i}><Skeleton /></TableCell>
                                    ))}
                                </TableRow>
                            ) : (
                                filteredLogs.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                                            <Typography variant="body2" color="text.secondary">
                                                No activity logs found
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredLogs.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((log) => (
                                        <TableRow key={log.id} hover>
                                            <TableCell>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <Box
                                                        sx={{
                                                            p: 0.5,
                                                            borderRadius: 1,
                                                            bgcolor: `${actionColors[log.action]}20`,
                                                            color: actionColors[log.action],
                                                            display: 'flex',
                                                        }}
                                                    >
                                                        {actionIcons[log.action]}
                                                    </Box>
                                                    <Chip
                                                        label={log.action}
                                                        size="small"
                                                        sx={{
                                                            bgcolor: `${actionColors[log.action]}20`,
                                                            color: actionColors[log.action],
                                                            fontWeight: 500,
                                                            textTransform: 'capitalize',
                                                        }}
                                                    />
                                                </Box>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                                    {log.user_name || 'System'}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2" color="text.secondary">
                                                    {log.description || '-'}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
                                                    {log.ip_address || '-'}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2" color="text.secondary">
                                                    {log.timestamp ? new Date(log.timestamp).toLocaleString() : '-'}
                                                </Typography>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
                <TablePagination
                    component="div"
                    count={totalCount}
                    page={page}
                    onPageChange={(e, newPage) => dispatch(setPage(newPage))}
                    rowsPerPage={rowsPerPage}
                    onRowsPerPageChange={(e) => {
                        dispatch(setRowsPerPage(parseInt(e.target.value, 10)));
                        dispatch(setPage(0));
                    }}
                />
            </Card>
        </Box>
    );
};

export default ActivityLogs;
