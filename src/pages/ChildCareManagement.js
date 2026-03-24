import React, { useState, useEffect } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Button,
    Grid,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Alert,
    CircularProgress,
    Tabs,
    Tab,
    Paper,
    Avatar,
} from '@mui/material';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Refresh as RefreshIcon,
    ChildCare as ChildIcon,
    Schedule as ScheduleIcon,
    Warning as WarningIcon,
    LocationOn as LocationIcon,
} from '@mui/icons-material';
import { useDispatch } from 'react-redux';
import { adminApi } from '../services/api';

const ChildCareManagement = () => {
    const dispatch = useDispatch();
    const [tab, setTab] = useState(0);
    const [children, setChildren] = useState([]);
    const [schedules, setSchedules] = useState([]);
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [dialogType, setDialogType] = useState('child');
    const [selectedItem, setSelectedItem] = useState(null);
    const [formData, setFormData] = useState({
        firstName: '', lastName: '', dateOfBirth: '', gender: '', bloodGroup: '',
        title: '', scheduleTime: '', repeatDays: [], alertType: '', message: ''
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [childrenRes, schedulesRes, alertsRes] = await Promise.all([
                dispatch(adminApi.getChildren ? adminApi.getChildren() : Promise.resolve({ data: { success: true, data: [] } })),
                Promise.resolve({ data: { success: true, data: [] } }),
                Promise.resolve({ data: { success: true, data: [] } }),
            ]);
            if (childrenRes?.data?.success) setChildren(childrenRes.data.data);
            if (schedulesRes?.data?.success) setSchedules(schedulesRes.data.data);
            if (alertsRes?.data?.success) setAlerts(alertsRes.data.data);
        } catch (error) {
            console.error('Load error:', error);
        }
        setLoading(false);
    };

    const handleOpenDialog = (type, item = null) => {
        setDialogType(type);
        setSelectedItem(item);
        if (item) {
            if (type === 'child') {
                setFormData({
                    firstName: item.firstName || '',
                    lastName: item.lastName || '',
                    dateOfBirth: item.dateOfBirth ? new Date(item.dateOfBirth).toISOString().split('T')[0] : '',
                    gender: item.gender || '',
                    bloodGroup: item.bloodGroup || '',
                });
            }
        } else {
            setFormData({ firstName: '', lastName: '', dateOfBirth: '', gender: '', bloodGroup: '', title: '', scheduleTime: '', repeatDays: [], alertType: '', message: '' });
        }
        setDialogOpen(true);
    };

    const handleSubmit = async () => {
        try {
            if (dialogType === 'child') {
                if (selectedItem) {
                    // Update
                } else {
                    // Create
                }
            }
            setDialogOpen(false);
            loadData();
        } catch (error) {
            console.error('Submit error:', error);
        }
    };

    const getAlertColor = (type) => {
        switch (type) {
            case 'school_arrival': return 'success';
            case 'school_departure': return 'warning';
            case 'safety_concern': return 'error';
            case 'emergency': return 'error';
            default: return 'info';
        }
    };

    const formatDate = (date) => {
        if (!date) return '-';
        return new Date(date).toLocaleDateString();
    };

    const formatTime = (time) => {
        if (!time) return '-';
        return time.substring(0, 5);
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h5" sx={{ fontWeight: 600 }}>
                    <ChildIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Child Care Management
                </Typography>
                <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog('child')}>
                    Add Child
                </Button>
            </Box>

            <Card>
                <Tabs value={tab} onChange={(e, v) => setTab(v)} sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <Tab label="Children" icon={<ChildIcon />} iconPosition="start" />
                    <Tab label="Schedules" icon={<ScheduleIcon />} iconPosition="start" />
                    <Tab label="Alerts" icon={<WarningIcon />} iconPosition="start" />
                </Tabs>

                <CardContent>
                    {loading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                            <CircularProgress />
                        </Box>
                    ) : (
                        <>
                            {tab === 0 && (
                                <TableContainer>
                                    <Table>
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>Child</TableCell>
                                                <TableCell>Date of Birth</TableCell>
                                                <TableCell>Gender</TableCell>
                                                <TableCell>Blood Group</TableCell>
                                                <TableCell>Parent</TableCell>
                                                <TableCell>Actions</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {children.length === 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={6} align="center">No children registered</TableCell>
                                                </TableRow>
                                            ) : (
                                                children.map((child) => (
                                                    <TableRow key={child.id}>
                                                        <TableCell>
                                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                                <Avatar sx={{ bgcolor: 'primary.main' }}>
                                                                    <ChildIcon />
                                                                </Avatar>
                                                                <Box>
                                                                    <Typography variant="subtitle2">{child.firstName} {child.lastName}</Typography>
                                                                    <Typography variant="caption" color="text.secondary">{child.id}</Typography>
                                                                </Box>
                                                            </Box>
                                                        </TableCell>
                                                        <TableCell>{formatDate(child.dateOfBirth)}</TableCell>
                                                        <TableCell>{child.gender || '-'}</TableCell>
                                                        <TableCell>{child.bloodGroup || '-'}</TableCell>
                                                        <TableCell>{child.parentName || '-'}</TableCell>
                                                        <TableCell>
                                                            <IconButton size="small" onClick={() => handleOpenDialog('child', child)}>
                                                                <EditIcon />
                                                            </IconButton>
                                                            <IconButton size="small" color="error">
                                                                <DeleteIcon />
                                                            </IconButton>
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            )}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            )}

                            {tab === 1 && (
                                <TableContainer>
                                    <Table>
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>Title</TableCell>
                                                <TableCell>Child</TableCell>
                                                <TableCell>Time</TableCell>
                                                <TableCell>Alert Type</TableCell>
                                                <TableCell>Status</TableCell>
                                                <TableCell>Actions</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {schedules.length === 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={6} align="center">No schedules set</TableCell>
                                                </TableRow>
                                            ) : (
                                                schedules.map((schedule) => (
                                                    <TableRow key={schedule.id}>
                                                        <TableCell>{schedule.title}</TableCell>
                                                        <TableCell>{schedule.child_name}</TableCell>
                                                        <TableCell>{formatTime(schedule.schedule_time)}</TableCell>
                                                        <TableCell>
                                                            <Chip label={schedule.alert_type} size="small" color={schedule.alert_type === 'both' ? 'primary' : 'default'} />
                                                        </TableCell>
                                                        <TableCell>
                                                            <Chip label={schedule.is_active ? 'Active' : 'Inactive'} size="small" color={schedule.is_active ? 'success' : 'default'} />
                                                        </TableCell>
                                                        <TableCell>
                                                            <IconButton size="small" color="error">
                                                                <DeleteIcon />
                                                            </IconButton>
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            )}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            )}

                            {tab === 2 && (
                                <Grid container spacing={2}>
                                    {alerts.length === 0 ? (
                                        <Grid item xs={12}>
                                            <Alert severity="info">No alerts</Alert>
                                        </Grid>
                                    ) : (
                                        alerts.map((alert) => (
                                            <Grid item xs={12} md={6} key={alert.id}>
                                                <Paper sx={{ p: 2, borderLeft: 4, borderColor: `${getAlertColor(alert.alert_type)}.main` }}>
                                                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                                        <Typography variant="subtitle2">{alert.title}</Typography>
                                                        <Chip label={alert.alert_type} size="small" color={getAlertColor(alert.alert_type)} />
                                                    </Box>
                                                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                                        {alert.message}
                                                    </Typography>
                                                    <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                                                        <Typography variant="caption">{alert.child_name}</Typography>
                                                        <Typography variant="caption">{formatDate(alert.created_at)}</Typography>
                                                    </Box>
                                                </Paper>
                                            </Grid>
                                        ))
                                    )}
                                </Grid>
                            )}
                        </>
                    )}
                </CardContent>
            </Card>

            <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>{selectedItem ? 'Edit' : 'Add'} {dialogType === 'child' ? 'Child' : 'Schedule'}</DialogTitle>
                <DialogContent>
                    {dialogType === 'child' && (
                        <Grid container spacing={2} sx={{ mt: 1 }}>
                            <Grid item xs={12} sm={6}>
                                <TextField fullWidth label="First Name *" value={formData.firstName} onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField fullWidth label="Last Name" value={formData.lastName} onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField fullWidth type="date" label="Date of Birth *" value={formData.dateOfBirth} onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })} InputLabelProps={{ shrink: true }} />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <FormControl fullWidth>
                                    <InputLabel>Gender</InputLabel>
                                    <Select value={formData.gender} label="Gender" onChange={(e) => setFormData({ ...formData, gender: e.target.value })}>
                                        <MenuItem value="male">Male</MenuItem>
                                        <MenuItem value="female">Female</MenuItem>
                                        <MenuItem value="other">Other</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12}>
                                <FormControl fullWidth>
                                    <InputLabel>Blood Group</InputLabel>
                                    <Select value={formData.bloodGroup} label="Blood Group" onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}>
                                        {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(bg => <MenuItem key={bg} value={bg}>{bg}</MenuItem>)}
                                    </Select>
                                </FormControl>
                            </Grid>
                        </Grid>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
                    <Button variant="contained" onClick={handleSubmit}>{selectedItem ? 'Update' : 'Add'}</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default ChildCareManagement;
