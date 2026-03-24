import React, { useEffect } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Button,
    Grid,
    Tabs,
    Tab,
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
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Refresh as RefreshIcon,
    School as SchoolIcon,
    Article as ArticleIcon,
    Gavel as LawIcon,
    Phone as PhoneIcon,
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import {
    fetchTutorials,
    fetchNews,
    fetchLaws,
    fetchHelplines,
    createTutorial,
    updateTutorial,
    deleteTutorial,
    createNews,
    updateNews,
    deleteNews,
    createLaw,
    updateLaw,
    deleteLaw,
    createHelpline,
    updateHelpline,
    deleteHelpline,
    setCurrentTab,
    setContentPage,
    setContentRowsPerPage,
} from '../store/slices/contentSlice';

const categoryColors = {
    health: '#ef4444',
    nutrition: '#10b981',
    safety: '#f59e0b',
    development: '#6366f1',
    tutorial: '#8b5cf6',
    guide: '#ec4899',
};

const CONTENT_TYPES = ['tutorials', 'news', 'laws', 'helplines'];

const ContentManagement = () => {
    const dispatch = useDispatch();
    const { tutorials, news, laws, helplines, loading, currentTab, pagination } = useSelector((state) => state.content);

    const [success, setSuccess] = React.useState(null);
    const [localError, setLocalError] = React.useState(null);
    const [dialog, setDialog] = React.useState({ open: false, mode: 'create', data: null });

    const [formData, setFormData] = React.useState({
        title: '', description: '', content: '', category: '',
        image_url: '', video_url: '', duration: 0, difficulty: 'beginner',
        is_premium: false, is_active: true, is_featured: false,
        author: '', source: '', penalty: '', effective_date: '',
        name: '', phone: '', description_helpline: '', country: 'India',
        service_type: 'emergency', display_order: 0, icon: ''
    });

    const currentContent = [tutorials, news, laws, helplines][currentTab] || [];
    const currentPagination = pagination[CONTENT_TYPES[currentTab]] || { page: 0, rowsPerPage: 10, total: 0 };

    useEffect(() => {
        fetchData();
    }, [currentTab]);

    const fetchData = () => {
        const params = { page: currentPagination.page + 1, limit: currentPagination.rowsPerPage };
        switch (currentTab) {
            case 0: dispatch(fetchTutorials(params)); break;
            case 1: dispatch(fetchNews(params)); break;
            case 2: dispatch(fetchLaws(params)); break;
            case 3: dispatch(fetchHelplines(params)); break;
            default: break;
        }
    };

    const handleTabChange = (event, newValue) => {
        dispatch(setCurrentTab(newValue));
    };

    const handleChangePage = (event, newPage) => {
        dispatch(setContentPage({ contentType: CONTENT_TYPES[currentTab], page: newPage }));
    };

    const handleChangeRowsPerPage = (event) => {
        dispatch(setContentRowsPerPage({ contentType: CONTENT_TYPES[currentTab], rowsPerPage: parseInt(event.target.value, 10) }));
    };

    const openDialog = (mode, data = null) => {
        setFormData({
            title: data?.title || '', description: data?.description || '', content: data?.content || '',
            category: data?.category || '', image_url: data?.image_url || '', video_url: data?.video_url || '',
            duration: data?.duration || 0, difficulty: data?.difficulty || 'beginner',
            is_premium: data?.is_premium || false, is_active: data?.is_active !== false, is_featured: data?.is_featured || false,
            author: data?.author || '', source: data?.source || '', penalty: data?.penalty || '',
            effective_date: data?.effective_date || '',
            name: data?.name || '', phone: data?.phone || '', description_helpline: data?.description || '',
            country: data?.country || 'India', service_type: data?.service_type || 'emergency',
            display_order: data?.display_order || 0, icon: data?.icon || ''
        });
        setDialog({ open: true, mode, data });
        setLocalError(null);
        setSuccess(null);
    };

    const closeDialog = () => {
        setDialog({ open: false, mode: 'create', data: null });
        setLocalError(null);
        setSuccess(null);
    };

    const handleSubmit = async () => {
        setLocalError(null);
        setSuccess(null);
        const id = dialog.data?.id;

        try {
            switch (currentTab) {
                case 0:
                    if (dialog.mode === 'create') {
                        await dispatch(createTutorial(formData)).unwrap();
                    } else {
                        await dispatch(updateTutorial({ id, data: formData })).unwrap();
                    }
                    break;
                case 1:
                    if (dialog.mode === 'create') {
                        await dispatch(createNews(formData)).unwrap();
                    } else {
                        await dispatch(updateNews({ id, data: formData })).unwrap();
                    }
                    break;
                case 2:
                    if (dialog.mode === 'create') {
                        await dispatch(createLaw(formData)).unwrap();
                    } else {
                        await dispatch(updateLaw({ id, data: formData })).unwrap();
                    }
                    break;
                case 3:
                    const helplineData = {
                        name: formData.name, phone: formData.phone,
                        description: formData.description_helpline, country: formData.country,
                        service_type: formData.service_type, display_order: formData.display_order,
                        icon: formData.icon, is_active: formData.is_active
                    };
                    if (dialog.mode === 'create') {
                        await dispatch(createHelpline(helplineData)).unwrap();
                    } else {
                        await dispatch(updateHelpline({ id, data: helplineData })).unwrap();
                    }
                    break;
                default: break;
            }
            setSuccess('Operation successful');
            setTimeout(() => { closeDialog(); fetchData(); }, 1000);
        } catch (err) {
            setLocalError(err || 'Operation failed');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this item?')) return;
        setLocalError(null);
        setSuccess(null);
        try {
            switch (currentTab) {
                case 0: await dispatch(deleteTutorial(id)).unwrap(); break;
                case 1: await dispatch(deleteNews(id)).unwrap(); break;
                case 2: await dispatch(deleteLaw(id)).unwrap(); break;
                case 3: await dispatch(deleteHelpline(id)).unwrap(); break;
                default: break;
            }
            setSuccess('Deleted successfully');
            fetchData();
        } catch (err) {
            setLocalError(err || 'Delete failed');
        }
    };

    const renderTutorialForm = () => (
        <>
            <TextField fullWidth label="Title" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} margin="dense" required />
            <TextField fullWidth label="Description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} margin="dense" />
            <TextField fullWidth label="Content" value={formData.content} onChange={(e) => setFormData({ ...formData, content: e.target.value })} margin="dense" multiline rows={4} />
            <TextField fullWidth label="Category" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} margin="dense" />
            <TextField fullWidth label="Image URL" value={formData.image_url} onChange={(e) => setFormData({ ...formData, image_url: e.target.value })} margin="dense" />
            <TextField fullWidth label="Video URL" value={formData.video_url} onChange={(e) => setFormData({ ...formData, video_url: e.target.value })} margin="dense" />
            <TextField fullWidth label="Duration (seconds)" type="number" value={formData.duration} onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 0 })} margin="dense" />
            <FormControl fullWidth margin="dense">
                <InputLabel>Difficulty</InputLabel>
                <Select value={formData.difficulty} onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}>
                    <MenuItem value="beginner">Beginner</MenuItem>
                    <MenuItem value="intermediate">Intermediate</MenuItem>
                    <MenuItem value="advanced">Advanced</MenuItem>
                </Select>
            </FormControl>
        </>
    );

    const renderNewsForm = () => (
        <>
            <TextField fullWidth label="Title" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} margin="dense" required />
            <TextField fullWidth label="Summary" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} margin="dense" multiline rows={2} />
            <TextField fullWidth label="Content" value={formData.content} onChange={(e) => setFormData({ ...formData, content: e.target.value })} margin="dense" multiline rows={4} />
            <TextField fullWidth label="Category" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} margin="dense" />
            <TextField fullWidth label="Image URL" value={formData.image_url} onChange={(e) => setFormData({ ...formData, image_url: e.target.value })} margin="dense" />
            <TextField fullWidth label="Author" value={formData.author} onChange={(e) => setFormData({ ...formData, author: e.target.value })} margin="dense" />
            <TextField fullWidth label="Source" value={formData.source} onChange={(e) => setFormData({ ...formData, source: e.target.value })} margin="dense" />
        </>
    );

    const renderLawForm = () => (
        <>
            <TextField fullWidth label="Title" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} margin="dense" required />
            <TextField fullWidth label="Description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} margin="dense" />
            <TextField fullWidth label="Content" value={formData.content} onChange={(e) => setFormData({ ...formData, content: e.target.value })} margin="dense" multiline rows={6} />
            <TextField fullWidth label="Category" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} margin="dense" />
            <TextField fullWidth label="Jurisdiction" value={formData.source} onChange={(e) => setFormData({ ...formData, source: e.target.value })} margin="dense" />
            <TextField fullWidth label="Penalty" value={formData.penalty} onChange={(e) => setFormData({ ...formData, penalty: e.target.value })} margin="dense" />
            <TextField fullWidth label="Effective Date" type="date" value={formData.effective_date} onChange={(e) => setFormData({ ...formData, effective_date: e.target.value })} margin="dense" InputLabelProps={{ shrink: true }} />
        </>
    );

    const renderHelplineForm = () => (
        <>
            <TextField fullWidth label="Name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} margin="dense" required />
            <TextField fullWidth label="Phone Number" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} margin="dense" required />
            <TextField fullWidth label="Description" value={formData.description_helpline} onChange={(e) => setFormData({ ...formData, description_helpline: e.target.value })} margin="dense" />
            <FormControl fullWidth margin="dense">
                <InputLabel>Country</InputLabel>
                <Select value={formData.country} onChange={(e) => setFormData({ ...formData, country: e.target.value })}>
                    <MenuItem value="India">India</MenuItem>
                    <MenuItem value="USA">USA</MenuItem>
                    <MenuItem value="UK">UK</MenuItem>
                </Select>
            </FormControl>
            <FormControl fullWidth margin="dense">
                <InputLabel>Service Type</InputLabel>
                <Select value={formData.service_type} onChange={(e) => setFormData({ ...formData, service_type: e.target.value })}>
                    <MenuItem value="emergency">Emergency</MenuItem>
                    <MenuItem value="police">Police</MenuItem>
                    <MenuItem value="medical">Medical</MenuItem>
                    <MenuItem value="fire">Fire</MenuItem>
                    <MenuItem value="women">Women Helpline</MenuItem>
                </Select>
            </FormControl>
            <TextField fullWidth label="Display Order" type="number" value={formData.display_order} onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })} margin="dense" />
        </>
    );

    const allColumns = [
        ['Title', 'Category', 'Difficulty', 'Active', 'Created'],
        ['Title', 'Category', 'Author', 'Featured', 'Views'],
        ['Title', 'Category', 'Jurisdiction', 'Active', 'Created'],
        ['Name', 'Phone', 'Type', 'Country', 'Active']
    ];
    const columns = allColumns[currentTab] || allColumns[0];

    const renderTable = () => (
        <TableContainer component={Paper}>
            <Table size="small">
                <TableHead>
                    <TableRow sx={{ bgcolor: 'primary.main' }}>
                        {columns.map((col) => (
                            <TableCell key={col} sx={{ color: 'white', fontWeight: 'bold' }}>{col}</TableCell>
                        ))}
                        <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Actions</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {currentContent.map((item) => (
                        <TableRow key={item.id} hover>
                            <TableCell sx={{ maxWidth: 200 }}>
                                <Typography variant="body2" noWrap>{item.title || item.name}</Typography>
                            </TableCell>
                            <TableCell>
                                <Chip label={item.category || item.service_type} size="small" sx={{ bgcolor: `${categoryColors[item.category] || '#666'}20`, color: categoryColors[item.category] || '#666' }} />
                            </TableCell>
                            <TableCell>{item.difficulty || item.author || item.jurisdiction || item.country || '-'}</TableCell>
                            <TableCell>
                                <Chip label={item.is_active !== false ? 'Active' : 'Inactive'} size="small"
                                    sx={{ bgcolor: item.is_active !== false ? 'success.main' : 'error.main', color: 'white' }} />
                            </TableCell>
                            <TableCell>{item.created_at ? new Date(item.created_at).toLocaleDateString() : '-'}</TableCell>
                            <TableCell>
                                <IconButton size="small" onClick={() => openDialog('edit', item)}><EditIcon /></IconButton>
                                <IconButton size="small" color="error" onClick={() => handleDelete(item.id)}><DeleteIcon /></IconButton>
                            </TableCell>
                        </TableRow>
                    ))}
                    {currentContent.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                                <Typography color="text.secondary">No data available</Typography>
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
            <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={currentPagination.total}
                rowsPerPage={currentPagination.rowsPerPage}
                page={currentPagination.page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
            />
        </TableContainer>
    );

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>Content Management</Typography>
                    <Typography variant="body2" color="text.secondary">Manage tutorials, news, laws, and helplines</Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button variant="outlined" startIcon={<RefreshIcon />} onClick={fetchData}>Refresh</Button>
                    <Button variant="contained" startIcon={<AddIcon />} onClick={() => openDialog('create')}>Add Content</Button>
                </Box>
            </Box>

            {localError && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setLocalError(null)}>{localError}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>{success}</Alert>}

            <Card sx={{ mb: 3 }}>
                <Tabs value={currentTab} onChange={handleTabChange} sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <Tab icon={<SchoolIcon />} iconPosition="start" label="Tutorials" />
                    <Tab icon={<ArticleIcon />} iconPosition="start" label="News" />
                    <Tab icon={<LawIcon />} iconPosition="start" label="Laws" />
                    <Tab icon={<PhoneIcon />} iconPosition="start" label="Helplines" />
                </Tabs>
            </Card>

            <Card>
                <CardContent>
                    {loading && <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress /></Box>}
                    {!loading && renderTable()}
                </CardContent>
            </Card>

            <Drawer anchor="right" open={dialog.open} onClose={closeDialog}>
                <Box sx={{ width: 450, p: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                        <Typography variant="h6">{dialog.mode === 'create' ? 'Add' : 'Edit'} {CONTENT_TYPES[currentTab]}</Typography>
                        <IconButton onClick={closeDialog}><CloseIcon /></IconButton>
                    </Box>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        {currentTab === 0 && renderTutorialForm()}
                        {currentTab === 1 && renderNewsForm()}
                        {currentTab === 2 && renderLawForm()}
                        {currentTab === 3 && renderHelplineForm()}
                    </Box>
                    <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
                        <Button onClick={closeDialog} fullWidth>Cancel</Button>
                        <Button variant="contained" onClick={handleSubmit} disabled={loading} fullWidth>
                            {loading ? 'Saving...' : 'Save'}
                        </Button>
                    </Box>
                </Box>
            </Drawer>
        </Box>
    );
};

export default ContentManagement;
