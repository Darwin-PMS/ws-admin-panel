import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
    Box,
    Card,
    Typography,
    Button,
    Grid,
    Chip,
    IconButton,
    TextField,
    Drawer,
    CircularProgress,
    Alert,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    TablePagination,
    alpha,
    Avatar,
    Divider,
    Badge,
    Tooltip,
    InputAdornment,
    Tabs,
    Tab,
} from '@mui/material';
import {
    Refresh as RefreshIcon,
    Visibility as VisibilityIcon,
    Delete as DeleteIcon,
    Warning as WarningIcon,
    Close as CloseIcon,
    Send as SendIcon,
    Chat as ChatIcon,
    MoreVert as MoreVertIcon,
    Circle as CircleIcon,
    Support as SupportIcon,
    MarkEmailRead as ReadIcon,
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import {
    fetchGrievances,
    fetchGrievanceStats,
    updateGrievanceStatus,
    deleteGrievance,
    setStatusFilter,
    setPriorityFilter,
    setPage,
    setRowsPerPage,
    fetchGrievanceConversation,
    sendGrievanceMessage,
    clearConversation,
} from '../store/slices/grievanceSlice';
import { webSocketService } from '../services/realtime';

const statusConfig = {
    pending: { color: '#f59e0b', bg: '#fffbeb', label: 'Pending' },
    in_progress: { color: '#3b82f6', bg: '#eff6ff', label: 'In Progress' },
    resolved: { color: '#10b981', bg: '#ecfdf5', label: 'Resolved' },
    rejected: { color: '#ef4444', bg: '#fef2f2', label: 'Rejected' },
};

const priorityConfig = {
    low: { color: '#6b7280', bg: '#f9fafb', label: 'Low' },
    medium: { color: '#3b82f6', bg: '#eff6ff', label: 'Medium' },
    high: { color: '#f59e0b', bg: '#fffbeb', label: 'High' },
    urgent: { color: '#ef4444', bg: '#fef2f2', label: 'Urgent' },
};

const categoryConfig = {
    data_privacy: { label: 'Data Privacy', color: '#8b5cf6' },
    safety_concern: { label: 'Safety Concern', color: '#ef4444' },
    harassment: { label: 'Harassment', color: '#ef4444' },
    technical_issue: { label: 'Technical Issue', color: '#3b82f6' },
    billing: { label: 'Billing', color: '#f59e0b' },
    general: { label: 'General', color: '#6b7280' },
};

const formatCategory = (category) => {
    if (!category) return 'General';
    const config = categoryConfig[category];
    if (config) return config.label;
    return category.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
};

const GrievanceManagement = () => {
    const dispatch = useDispatch();
    const { grievances, stats, loading, filters, totalCount, conversation, conversationLoading } = useSelector((state) => state.grievance);
    const { user } = useSelector((state) => state.auth);

    const [viewDrawer, setViewDrawer] = useState({ open: false, data: null });
    const [chatDrawer, setChatDrawer] = useState({ open: false, data: null });
    const [updateDrawer, setUpdateDrawer] = useState({ open: false, data: null });
    const [updateForm, setUpdateForm] = useState({ status: '', priority: '', resolution_notes: '' });
    const [messageInput, setMessageInput] = useState('');
    const [localError, setLocalError] = useState(null);
    const [localSuccess, setLocalSuccess] = useState(null);
    const [wsConnected, setWsConnected] = useState(false);
    const [activeTab, setActiveTab] = useState(0);
    const [searchQuery, setSearchQuery] = useState('');
    const [sendingMessage, setSendingMessage] = useState(false);
    const [localMessages, setLocalMessages] = useState([]);
    const messagesEndRef = useRef(null);
    const chatUnsubscribeRef = useRef(null);

    const fetchData = useCallback(() => {
        dispatch(fetchGrievances());
    }, [dispatch]);

    const fetchStats = useCallback(() => {
        dispatch(fetchGrievanceStats());
    }, [dispatch]);

    useEffect(() => {
        fetchData();
        fetchStats();
    }, [fetchData, fetchStats]);

    useEffect(() => {
        const token = localStorage.getItem('adminToken');
        if (token) {
            webSocketService.connect(token);
            webSocketService.subscribe('connection', ({ status }) => {
                setWsConnected(status === 'connected');
            });
        }

        return () => {
            if (chatUnsubscribeRef.current) {
                chatUnsubscribeRef.current();
            }
        };
    }, []);

    useEffect(() => {
        const unsubscribe = webSocketService.subscribe('grievance_message', (message) => {
            if (chatDrawer.data && message.grievance_id === chatDrawer.data.id) {
                setLocalMessages(prev => {
                    if (!prev.find(m => m.id === message.id)) {
                        return [...prev, message];
                    }
                    return prev;
                });
                dispatch({ type: 'grievance/addMessage', payload: message });
                scrollToBottom();
            }
        });

        return unsubscribe;
    }, [chatDrawer.data]);

    const scrollToBottom = () => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    };

    useEffect(() => {
        if (conversation.length > 0) {
            setTimeout(scrollToBottom, 100);
        }
    }, [conversation, localMessages]);

    useEffect(() => {
        if (localMessages.length > 0) {
            setTimeout(scrollToBottom, 50);
        }
    }, [localMessages]);

    const handleChangePage = (event, newPage) => {
        dispatch(setPage(newPage));
    };

    const handleChangeRowsPerPage = (event) => {
        dispatch(setRowsPerPage(parseInt(event.target.value, 10)));
    };

    const openViewDrawer = (data) => {
        setViewDrawer({ open: true, data });
    };

    const closeViewDrawer = () => {
        setViewDrawer({ open: false, data: null });
    };

    const openChatDrawer = async (data) => {
        setChatDrawer({ open: true, data });
        dispatch(fetchGrievanceConversation(data.id));

        if (chatUnsubscribeRef.current) {
            chatUnsubscribeRef.current();
        }

        chatUnsubscribeRef.current = webSocketService.subscribe(`grievance_message:${data.id}`, (message) => {
            dispatch({ type: 'grievance/addMessage', payload: message });
            scrollToBottom();
        });

        webSocketService.send({
            type: 'subscribe',
            payload: { channels: [`grievance:${data.id}`] }
        });
    };

    const closeChatDrawer = () => {
        if (chatDrawer.data) {
            webSocketService.send({
                type: 'unsubscribe',
                payload: { channels: [`grievance:${chatDrawer.data.id}`] }
            });
        }
        if (chatUnsubscribeRef.current) {
            chatUnsubscribeRef.current();
            chatUnsubscribeRef.current = null;
        }
        dispatch(clearConversation());
        setLocalMessages([]);
        setChatDrawer({ open: false, data: null });
    };

    const openUpdateDrawer = (data) => {
        setUpdateForm({
            status: data.status,
            priority: data.priority,
            resolution_notes: data.resolution_notes || '',
        });
        setUpdateDrawer({ open: true, data });
    };

    const closeUpdateDrawer = () => {
        setUpdateDrawer({ open: false, data: null });
        setUpdateForm({ status: '', priority: '', resolution_notes: '' });
    };

    const handleUpdate = async () => {
        try {
            setLocalError(null);
            setLocalSuccess(null);
            await dispatch(updateGrievanceStatus({
                id: updateDrawer.data.id,
                data: updateForm
            })).unwrap();
            setLocalSuccess('Grievance updated successfully');
            closeUpdateDrawer();
            fetchData();
            fetchStats();
        } catch (err) {
            setLocalError(err || 'Update failed');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this grievance?')) return;
        try {
            setLocalError(null);
            setLocalSuccess(null);
            await dispatch(deleteGrievance(id)).unwrap();
            setLocalSuccess('Grievance deleted successfully');
            fetchData();
            fetchStats();
        } catch (err) {
            setLocalError(err || 'Delete failed');
        }
    };

    const handleSendMessage = async () => {
        if (!messageInput.trim() || !chatDrawer.data) return;

        const tempId = `temp_${Date.now()}`;
        const messagePayload = {
            grievance_id: chatDrawer.data.id,
            message: messageInput.trim(),
            sender_type: 'admin',
            sender_id: user?.id,
            sender_name: user?.name || 'Admin',
        };

        const messageData = {
            ...messagePayload,
            id: tempId,
            created_at: new Date().toISOString(),
            isSending: true,
        };

        setLocalMessages(prev => [...prev, messageData]);
        setMessageInput('');
        scrollToBottom();
        setSendingMessage(true);

        let success = false;

        if (wsConnected) {
            try {
                webSocketService.sendGrievanceMessage(
                    chatDrawer.data.id,
                    messageInput.trim(),
                    'admin',
                    user?.id
                );
                success = true;
            } catch (wsErr) {
                console.log('WebSocket send failed:', wsErr);
            }
        }

        if (!success) {
            try {
                await dispatch(sendGrievanceMessage({
                    grievance_id: chatDrawer.data.id,
                    message: messageInput.trim(),
                    sender_type: 'admin',
                    sender_id: user?.id,
                })).unwrap();
                success = true;
            } catch (err) {
                console.log('API send failed:', err);
            }
        }

        if (success) {
            setLocalMessages(prev => prev.map(m => 
                m.id === tempId ? { ...m, isSending: false } : m
            ));
        } else {
            setLocalMessages(prev => prev.map(m => 
                m.id === tempId ? { ...m, isSending: false, failed: true } : m
            ));
            setLocalError('Failed to send message. Please try again.');
        }
        
        setSendingMessage(false);
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const filteredGrievances = grievances.filter(g => {
        if (!searchQuery) return true;
        const query = searchQuery.toLowerCase();
        return (
            g.title?.toLowerCase().includes(query) ||
            g.description?.toLowerCase().includes(query) ||
            g.user_email?.toLowerCase().includes(query) ||
            g.category?.toLowerCase().includes(query)
        );
    });

    const unreadCount = grievances.filter(g => g.status === 'pending' || g.priority === 'urgent').length;

    return (
        <Box sx={{ minHeight: 'calc(100vh - 120px)' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3, flexWrap: 'wrap', gap: 2 }}>
                <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 0.5 }}>
                        <Typography variant="h4" sx={{ fontWeight: 800 }}>
                            Grievance Management
                        </Typography>
                        {unreadCount > 0 && (
                            <Badge badgeContent={unreadCount} color="error">
                                <Chip 
                                    label="New" 
                                    size="small" 
                                    sx={{ bgcolor: alpha('#ef4444', 0.1), color: '#ef4444', fontWeight: 600 }}
                                />
                            </Badge>
                        )}
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                        View, manage and communicate about user complaints
                    </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                    <Chip
                        label={wsConnected ? 'Live' : 'Offline'}
                        size="small"
                        icon={<CircleIcon sx={{ fontSize: 10, color: wsConnected ? '#10b981' : '#ef4444' }} />}
                        sx={{ bgcolor: alpha(wsConnected ? '#10b981' : '#ef4444', 0.1), fontWeight: 500 }}
                    />
                    <Button 
                        variant="outlined" 
                        startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <RefreshIcon />} 
                        onClick={() => { fetchData(); fetchStats(); }}
                        disabled={loading}
                    >
                        Refresh
                    </Button>
                </Box>
            </Box>

            {localError && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setLocalError(null)}>{localError}</Alert>}
            {localSuccess && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setLocalSuccess(null)}>{localSuccess}</Alert>}

            <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6} md={2}>
                    <Paper elevation={0} sx={{ p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider', textAlign: 'center', transition: 'all 0.2s', '&:hover': { borderColor: 'primary.main' } }}>
                        <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main' }}>{loading ? '-' : (stats?.total || 0)}</Typography>
                        <Typography variant="caption" color="text.secondary">Total</Typography>
                    </Paper>
                </Grid>
                <Grid item xs={12} sm={6} md={2}>
                    <Paper elevation={0} sx={{ p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider', textAlign: 'center', transition: 'all 0.2s', '&:hover': { borderColor: statusConfig.pending.color } }}>
                        <Typography variant="h4" sx={{ fontWeight: 700, color: statusConfig.pending.color }}>{loading ? '-' : (stats?.pending || 0)}</Typography>
                        <Typography variant="caption" color="text.secondary">Pending</Typography>
                    </Paper>
                </Grid>
                <Grid item xs={12} sm={6} md={2}>
                    <Paper elevation={0} sx={{ p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider', textAlign: 'center', transition: 'all 0.2s', '&:hover': { borderColor: statusConfig.in_progress.color } }}>
                        <Typography variant="h4" sx={{ fontWeight: 700, color: statusConfig.in_progress.color }}>{loading ? '-' : (stats?.inProgress || 0)}</Typography>
                        <Typography variant="caption" color="text.secondary">In Progress</Typography>
                    </Paper>
                </Grid>
                <Grid item xs={12} sm={6} md={2}>
                    <Paper elevation={0} sx={{ p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider', textAlign: 'center', transition: 'all 0.2s', '&:hover': { borderColor: statusConfig.resolved.color } }}>
                        <Typography variant="h4" sx={{ fontWeight: 700, color: statusConfig.resolved.color }}>{loading ? '-' : (stats?.resolved || 0)}</Typography>
                        <Typography variant="caption" color="text.secondary">Resolved</Typography>
                    </Paper>
                </Grid>
                <Grid item xs={12} sm={6} md={2}>
                    <Paper elevation={0} sx={{ p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider', textAlign: 'center', transition: 'all 0.2s', '&:hover': { borderColor: priorityConfig.urgent.color } }}>
                        <Typography variant="h4" sx={{ fontWeight: 700, color: priorityConfig.urgent.color }}>{loading ? '-' : (stats?.urgent || 0)}</Typography>
                        <Typography variant="caption" color="text.secondary">Urgent</Typography>
                    </Paper>
                </Grid>
                <Grid item xs={12} sm={6} md={2}>
                    <Paper elevation={0} sx={{ p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider', textAlign: 'center', transition: 'all 0.2s', '&:hover': { borderColor: statusConfig.rejected.color } }}>
                        <Typography variant="h4" sx={{ fontWeight: 700, color: statusConfig.rejected.color }}>{loading ? '-' : (stats?.rejected || 0)}</Typography>
                        <Typography variant="caption" color="text.secondary">Rejected</Typography>
                    </Paper>
                </Grid>
            </Grid>

            <Card sx={{ mb: 3 }}>
                <Box sx={{ p: 2, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                    <Tabs 
                        value={activeTab} 
                        onChange={(_, v) => {
                            setActiveTab(v);
                            const statusMap = { 0: '', 1: 'pending', 2: 'in_progress', 3: 'resolved' };
                            dispatch(setStatusFilter(statusMap[v] || ''));
                        }} 
                        sx={{ minHeight: 40, '& .MuiTab-root': { minHeight: 40 } }}
                    >
                        <Tab label={<Badge badgeContent={unreadCount} color="error"><Box sx={{ pr: unreadCount > 0 ? 1 : 0 }}>All</Box></Badge>} />
                        <Tab label="Pending" />
                        <Tab label="In Progress" />
                        <Tab label="Resolved" />
                    </Tabs>
                    <Box sx={{ flex: 1 }} />
                    <TextField
                        size="small"
                        placeholder="Search grievances..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        InputProps={{
                            startAdornment: <InputAdornment position="start"><WarningIcon sx={{ fontSize: 20, color: 'text.secondary' }} /></InputAdornment>,
                            endAdornment: searchQuery && (
                                <InputAdornment position="end">
                                    <IconButton size="small" onClick={() => setSearchQuery('')}><CloseIcon sx={{ fontSize: 16 }} /></IconButton>
                                </InputAdornment>
                            ),
                        }}
                        sx={{ minWidth: 250 }}
                    />
                    <FormControl size="small" sx={{ minWidth: 140 }}>
                        <InputLabel>Priority</InputLabel>
                        <Select value={filters.priority} onChange={(e) => dispatch(setPriorityFilter(e.target.value))} label="Priority">
                            <MenuItem value="">All</MenuItem>
                            <MenuItem value="low">Low</MenuItem>
                            <MenuItem value="medium">Medium</MenuItem>
                            <MenuItem value="high">High</MenuItem>
                            <MenuItem value="urgent">Urgent</MenuItem>
                        </Select>
                    </FormControl>
                </Box>
            </Card>

            <Card>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow sx={{ bgcolor: 'background.default' }}>
                                <TableCell sx={{ fontWeight: 600, width: 60 }}>ID</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>User</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Title</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Category</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Priority</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                                <TableCell align="right" sx={{ fontWeight: 600 }}>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading && grievances.length === 0 ? (
                                [...Array(5)].map((_, i) => (
                                    <TableRow key={i}>
                                        {[...Array(8)].map((_, j) => <TableCell key={j}><Box sx={{ height: 20, bgcolor: 'action.hover', borderRadius: 1 }} /></TableCell>)}
                                    </TableRow>
                                ))
                            ) : filteredGrievances.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={8} align="center" sx={{ py: 8 }}>
                                        <SupportIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
                                        <Typography variant="h6" color="text.secondary">No Grievances Found</Typography>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredGrievances.map((g) => {
                                    const status = statusConfig[g.status] || statusConfig.pending;
                                    const priority = priorityConfig[g.priority] || priorityConfig.medium;
                                    return (
                                        <TableRow key={g.id} hover sx={{ '&:hover': { bgcolor: alpha('#6366f1', 0.02) } }}>
                                            <TableCell>
                                                <Typography variant="caption" sx={{ fontFamily: 'monospace' }}>{g.id?.substring(0, 8)}...</Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <Avatar sx={{ width: 32, height: 32, fontSize: '0.875rem', bgcolor: alpha('#6366f1', 0.1), color: '#6366f1' }}>
                                                        {(g.user_first_name || 'U').charAt(0)}
                                                    </Avatar>
                                                    <Box>
                                                        <Typography variant="body2" fontWeight={600}>{g.user_first_name} {g.user_last_name}</Typography>
                                                        <Typography variant="caption" color="text.secondary">{g.user_email}</Typography>
                                                    </Box>
                                                </Box>
                                            </TableCell>
                                            <TableCell sx={{ maxWidth: 200 }}>
                                                <Typography variant="body2" noWrap sx={{ fontWeight: 500 }}>{g.title}</Typography>
                                            </TableCell>
                                            <TableCell><Chip label={formatCategory(g.category)} size="small" variant="outlined" sx={{ color: categoryConfig[g.category]?.color || 'text.primary' }} /></TableCell>
                                            <TableCell>
                                                <Chip label={status.label} size="small" sx={{ bgcolor: status.bg, color: status.color, fontWeight: 600 }} />
                                            </TableCell>
                                            <TableCell>
                                                <Chip label={priority.label} size="small" sx={{ bgcolor: priority.bg, color: priority.color, fontWeight: 600 }} />
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="caption" color="text.secondary">{new Date(g.created_at).toLocaleDateString()}</Typography>
                                            </TableCell>
                                            <TableCell align="right">
                                                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
                                                    <Tooltip title="Chat">
                                                        <IconButton size="small" onClick={() => openChatDrawer(g)} sx={{ color: '#6366f1' }}>
                                                            <ChatIcon fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Tooltip title="View Details">
                                                        <IconButton size="small" onClick={() => openViewDrawer(g)}>
                                                            <VisibilityIcon fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Tooltip title="Edit">
                                                        <IconButton size="small" color="primary" onClick={() => openUpdateDrawer(g)}>
                                                            <MoreVertIcon fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Tooltip title="Delete">
                                                        <IconButton size="small" color="error" onClick={() => handleDelete(g.id)}>
                                                            <DeleteIcon fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                </Box>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
                <TablePagination
                    rowsPerPageOptions={[10, 25, 50]}
                    component="div"
                    count={totalCount}
                    rowsPerPage={filters.rowsPerPage}
                    page={filters.page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                />
            </Card>

            <Drawer anchor="right" open={viewDrawer.open} onClose={closeViewDrawer} PaperProps={{ sx: { width: { xs: '100%', sm: 500 } } }}>
                {viewDrawer.data && (
                    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                        <Box sx={{ p: 3, borderBottom: '1px solid', borderColor: 'divider', bgcolor: alpha('#6366f1', 0.02) }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                                <Box>
                                    <Typography variant="h6" fontWeight={700}>Grievance Details</Typography>
                                    <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace' }}>ID: {viewDrawer.data.id?.substring(0, 12)}...</Typography>
                                </Box>
                                <IconButton onClick={closeViewDrawer}><CloseIcon /></IconButton>
                            </Box>
                            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                <Chip label={statusConfig[viewDrawer.data.status]?.label || 'Pending'} size="small" sx={{ bgcolor: statusConfig[viewDrawer.data.status]?.bg, color: statusConfig[viewDrawer.data.status]?.color, fontWeight: 600 }} />
                                <Chip label={priorityConfig[viewDrawer.data.priority]?.label || 'Medium'} size="small" sx={{ bgcolor: priorityConfig[viewDrawer.data.priority]?.bg, color: priorityConfig[viewDrawer.data.priority]?.color, fontWeight: 600 }} />
                                <Chip label={formatCategory(viewDrawer.data.category)} size="small" variant="outlined" sx={{ color: categoryConfig[viewDrawer.data.category]?.color || 'text.primary' }} />
                            </Box>
                        </Box>
                        <Box sx={{ flex: 1, overflow: 'auto', p: 3 }}>
                            <Paper variant="outlined" sx={{ p: 2, mb: 3, borderRadius: 2 }}>
                                <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>{viewDrawer.data.title}</Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>{viewDrawer.data.description}</Typography>
                                <Divider sx={{ my: 2 }} />
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                                    <Avatar sx={{ width: 40, height: 40, bgcolor: 'primary.main' }}>
                                        {(viewDrawer.data.user_first_name || 'U').charAt(0)}
                                    </Avatar>
                                    <Box>
                                        <Typography variant="body2" fontWeight={600}>{viewDrawer.data.user_first_name} {viewDrawer.data.user_last_name}</Typography>
                                        <Typography variant="caption" color="text.secondary">{viewDrawer.data.user_email}</Typography>
                                    </Box>
                                </Box>
                            </Paper>
                            {viewDrawer.data.resolution_notes && (
                                <Paper variant="outlined" sx={{ p: 2, mb: 3, borderRadius: 2, borderColor: statusConfig.resolved.color }}>
                                    <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ display: 'block', mb: 1 }}>RESOLUTION NOTES</Typography>
                                    <Typography variant="body2">{viewDrawer.data.resolution_notes}</Typography>
                                </Paper>
                            )}
                            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                                <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                                    <Typography variant="caption" color="text.secondary">Created</Typography>
                                    <Typography variant="body2">{new Date(viewDrawer.data.created_at).toLocaleString()}</Typography>
                                </Paper>
                                <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                                    <Typography variant="caption" color="text.secondary">Updated</Typography>
                                    <Typography variant="body2">{new Date(viewDrawer.data.updated_at).toLocaleString()}</Typography>
                                </Paper>
                            </Box>
                        </Box>
                        <Box sx={{ p: 3, borderTop: '1px solid', borderColor: 'divider', display: 'flex', gap: 2 }}>
                            <Button startIcon={<ChatIcon />} variant="outlined" onClick={() => { closeViewDrawer(); openChatDrawer(viewDrawer.data); }} fullWidth>Chat</Button>
                            <Button startIcon={<VisibilityIcon />} variant="contained" onClick={() => { closeViewDrawer(); openUpdateDrawer(viewDrawer.data); }} fullWidth>Edit</Button>
                        </Box>
                    </Box>
                )}
            </Drawer>

            <Drawer anchor="right" open={chatDrawer.open} onClose={closeChatDrawer} PaperProps={{ sx: { width: { xs: '100%', sm: 450 }, display: 'flex', flexDirection: 'column' } }}>
                {chatDrawer.data && (
                    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                        <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider', bgcolor: alpha('#6366f1', 0.02), display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Avatar sx={{ width: 40, height: 40, bgcolor: 'primary.main' }}>
                                {(chatDrawer.data.user_first_name || 'U').charAt(0)}
                            </Avatar>
                            <Box sx={{ flex: 1 }}>
                                <Typography variant="subtitle1" fontWeight={700}>{chatDrawer.data.user_first_name} {chatDrawer.data.user_last_name}</Typography>
                                <Typography variant="caption" color="text.secondary" noWrap sx={{ maxWidth: 250 }}>{chatDrawer.data.title}</Typography>
                            </Box>
                            <Chip label={wsConnected ? 'Online' : 'Offline'} size="small" icon={<CircleIcon sx={{ fontSize: 8, color: wsConnected ? '#10b981' : '#ef4444' }} />} sx={{ bgcolor: alpha(wsConnected ? '#10b981' : '#ef4444', 0.1) }} />
                            <IconButton onClick={closeChatDrawer}><CloseIcon /></IconButton>
                        </Box>
                        <Box sx={{ flex: 1, overflow: 'auto', p: 2, bgcolor: alpha('#6366f1', 0.02) }}>
                            {conversationLoading && conversation.length === 0 ? (
                                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress /></Box>
                            ) : (conversation.length === 0 && localMessages.length === 0) ? (
                                <Box sx={{ textAlign: 'center', py: 4 }}>
                                    <ChatIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
                                    <Typography variant="body2" color="text.secondary">No messages yet</Typography>
                                    <Typography variant="caption" color="text.disabled">Start the conversation</Typography>
                                </Box>
                            ) : (
                                <>
                                    {[...conversation, ...localMessages].map((msg, index) => {
                                        const isAdmin = msg.sender_type === 'admin';
                                        const prevMsg = index > 0 ? [...conversation, ...localMessages][index - 1] : null;
                                        const showAvatar = !prevMsg || prevMsg?.sender_type !== msg.sender_type;
                                        return (
                                            <Box key={msg.id || `local-${index}`} sx={{ display: 'flex', justifyContent: isAdmin ? 'flex-end' : 'flex-start', mb: 1 }}>
                                                {!isAdmin && showAvatar && (
                                                    <Avatar sx={{ width: 28, height: 28, mr: 1, fontSize: '0.75rem', bgcolor: alpha('#6366f1', 0.2), color: '#6366f1' }}>
                                                        {(msg.sender_name || 'U').charAt(0)}
                                                    </Avatar>
                                                )}
                                                <Box sx={{ maxWidth: '75%' }}>
                                                    {showAvatar && (
                                                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5, ml: isAdmin ? 0 : 1, mr: isAdmin ? 1 : 0, textAlign: isAdmin ? 'right' : 'left' }}>
                                                            {msg.sender_name || (isAdmin ? 'Admin' : 'User')}
                                                            {msg.isSending && <CircularProgress size={10} sx={{ ml: 1 }} />}
                                                            {msg.failed && <Typography component="span" color="error" variant="caption"> (Failed)</Typography>}
                                                        </Typography>
                                                    )}
                                                    <Box sx={{ 
                                                        p: 1.5, 
                                                        borderRadius: 2,
                                                        bgcolor: isAdmin ? 'primary.main' : 'background.paper',
                                                        color: isAdmin ? 'white' : 'text.primary',
                                                        borderBottomRightRadius: isAdmin ? 4 : 16,
                                                        borderBottomLeftRadius: isAdmin ? 16 : 4,
                                                        boxShadow: 1,
                                                        opacity: msg.failed ? 0.6 : 1,
                                                    }}>
                                                        <Typography variant="body2">{msg.message}</Typography>
                                                    </Box>
                                                    <Typography variant="caption" color="text.disabled" sx={{ display: 'block', mt: 0.5, ml: isAdmin ? 0 : 1, mr: isAdmin ? 1 : 0, textAlign: isAdmin ? 'right' : 'left' }}>
                                                        {msg.created_at ? new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Sending...'}
                                                        {!msg.isSending && msg.is_read && isAdmin && <ReadIcon sx={{ fontSize: 12, ml: 0.5, verticalAlign: 'middle' }} />}
                                                    </Typography>
                                                </Box>
                                                {isAdmin && showAvatar && (
                                                    <Avatar sx={{ width: 28, height: 28, ml: 1, fontSize: '0.75rem', bgcolor: 'primary.main' }}>
                                                        A
                                                    </Avatar>
                                                )}
                                            </Box>
                                        );
                                    })}
                                </>
                            )}
                            <div ref={messagesEndRef} />
                        </Box>
                        <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                                <TextField
                                    fullWidth
                                    size="small"
                                    placeholder="Type a message..."
                                    value={messageInput}
                                    onChange={(e) => setMessageInput(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    multiline
                                    maxRows={4}
                                    disabled={sendingMessage}
                                />
                                <Button 
                                    variant="contained" 
                                    onClick={handleSendMessage} 
                                    disabled={!messageInput.trim() || sendingMessage}
                                    sx={{ minWidth: 'auto', px: 2 }}
                                >
                                    {sendingMessage ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
                                </Button>
                            </Box>
                            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                                Press Enter to send, Shift+Enter for new line
                            </Typography>
                        </Box>
                    </Box>
                )}
            </Drawer>

            <Drawer anchor="right" open={updateDrawer.open} onClose={closeUpdateDrawer} PaperProps={{ sx: { width: { xs: '100%', sm: 450 } } }}>
                {updateDrawer.data && (
                    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                        <Box sx={{ p: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography variant="h6" fontWeight={700}>Update Grievance</Typography>
                                <IconButton onClick={closeUpdateDrawer}><CloseIcon /></IconButton>
                            </Box>
                        </Box>
                        <Box sx={{ flex: 1, overflow: 'auto', p: 3 }}>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                                <FormControl fullWidth size="small">
                                    <InputLabel>Status</InputLabel>
                                    <Select value={updateForm.status} onChange={(e) => setUpdateForm({ ...updateForm, status: e.target.value })} label="Status">
                                        <MenuItem value="pending">Pending</MenuItem>
                                        <MenuItem value="in_progress">In Progress</MenuItem>
                                        <MenuItem value="resolved">Resolved</MenuItem>
                                        <MenuItem value="rejected">Rejected</MenuItem>
                                    </Select>
                                </FormControl>
                                <FormControl fullWidth size="small">
                                    <InputLabel>Priority</InputLabel>
                                    <Select value={updateForm.priority} onChange={(e) => setUpdateForm({ ...updateForm, priority: e.target.value })} label="Priority">
                                        <MenuItem value="low">Low</MenuItem>
                                        <MenuItem value="medium">Medium</MenuItem>
                                        <MenuItem value="high">High</MenuItem>
                                        <MenuItem value="urgent">Urgent</MenuItem>
                                    </Select>
                                </FormControl>
                                <TextField fullWidth label="Resolution Notes" multiline rows={4} value={updateForm.resolution_notes} onChange={(e) => setUpdateForm({ ...updateForm, resolution_notes: e.target.value })} size="small" />
                            </Box>
                        </Box>
                        <Box sx={{ p: 3, borderTop: '1px solid', borderColor: 'divider', display: 'flex', gap: 2 }}>
                            <Button onClick={closeUpdateDrawer} fullWidth variant="outlined">Cancel</Button>
                            <Button variant="contained" onClick={handleUpdate} disabled={loading} fullWidth>{loading ? 'Updating...' : 'Update'}</Button>
                        </Box>
                    </Box>
                )}
            </Drawer>
        </Box>
    );
};

export default GrievanceManagement;
