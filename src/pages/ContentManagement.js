import React, { useEffect, useState } from 'react';
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
    alpha,
    Tooltip,
    Avatar,
    Switch,
    FormControlLabel,
} from '@mui/material';
import { 
    Close as CloseIcon,
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Refresh as RefreshIcon,
    School as SchoolIcon,
    Article as ArticleIcon,
    Gavel as LawIcon,
    Phone as PhoneIcon,
    Image as ImageIcon,
    VideoLibrary as VideoIcon,
    CheckCircle as CheckCircleIcon,
    Cancel as CancelIcon,
    Star as StarIcon,
    Visibility as ViewsIcon,
    TrendingUp as TrendingIcon,
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
const TAB_ICONS = [SchoolIcon, ArticleIcon, LawIcon, PhoneIcon];
const TAB_LABELS = ['Tutorials', 'News', 'Laws', 'Helplines'];

const ContentManagement = () => {
    const dispatch = useDispatch();
    const { tutorials, news, laws, helplines, loading, currentTab, pagination } = useSelector((state) => state.content);

    const [success, setSuccess] = useState(null);
    const [localError, setLocalError] = useState(null);
    const [dialog, setDialog] = useState({ open: false, mode: 'create', data: null });

    const [formData, setFormData] = useState({
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

    const getCounts = () => ({
        tutorials: tutorials.length,
        news: news.length,
        laws: laws.length,
        helplines: helplines.length,
    });

    const counts = getCounts();

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

    const renderContentCard = (item) => {
        const tabIcon = TAB_ICONS[currentTab];
        const title = item.title || item.name;
        const category = item.category || item.service_type;
        const hasImage = item.image_url;
        
        return (
            <Card 
                key={item.id}
                sx={{ 
                    height: '100%',
                    transition: 'all 0.2s',
                    '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: 4,
                    }
                }}
            >
                {hasImage ? (
                    <Box 
                        sx={{ 
                            height: 140, 
                            backgroundImage: `url(${item.image_url})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            borderRadius: '12px 12px 0 0',
                        }}
                    />
                ) : (
                    <Box 
                        sx={{ 
                            height: 140, 
                            bgcolor: alpha(categoryColors[category] || '#6366f1', 0.1),
                            borderRadius: '12px 12px 0 0',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <tabIcon sx={{ fontSize: 48, color: categoryColors[category] || '#6366f1', opacity: 0.5 }} />
                    </Box>
                )}
                <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                        <Chip 
                            label={category} 
                            size="small" 
                            sx={{ 
                                bgcolor: alpha(categoryColors[category] || '#666', 0.1), 
                                color: categoryColors[category] || '#666',
                                fontWeight: 600,
                            }} 
                        />
                        {item.is_featured && (
                            <StarIcon sx={{ color: '#f59e0b', fontSize: 20 }} />
                        )}
                    </Box>
                    <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1, lineHeight: 1.3 }}>
                        {title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2, minHeight: 40, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {(item.description || item.description_helpline || '').substring(0, 80)}...
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Chip 
                            icon={item.is_active !== false ? <CheckCircleIcon sx={{ fontSize: 16 }} /> : <CancelIcon sx={{ fontSize: 16 }} />}
                            label={item.is_active !== false ? 'Active' : 'Inactive'} 
                            size="small"
                            sx={{ 
                                bgcolor: item.is_active !== false ? alpha('#10b981', 0.1) : alpha('#ef4444', 0.1),
                                color: item.is_active !== false ? '#10b981' : '#ef4444',
                                '& .MuiChip-icon': { color: 'inherit' }
                            }} 
                        />
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                            <Tooltip title="Edit">
                                <IconButton size="small" onClick={() => openDialog('edit', item)}>
                                    <EditIcon fontSize="small" />
                                </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete">
                                <IconButton size="small" color="error" onClick={() => handleDelete(item.id)}>
                                    <DeleteIcon fontSize="small" />
                                </IconButton>
                            </Tooltip>
                        </Box>
                    </Box>
                </CardContent>
            </Card>
        );
    };

    const allColumns = [
        ['Title', 'Category', 'Difficulty', 'Active', 'Created'],
        ['Title', 'Category', 'Author', 'Featured', 'Views'],
        ['Title', 'Category', 'Jurisdiction', 'Active', 'Created'],
        ['Name', 'Phone', 'Type', 'Country', 'Active']
    ];
    const columns = allColumns[currentTab] || allColumns[0];

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5 }}>
                        Content Management
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Manage tutorials, news, laws, and helplines for users
                    </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button variant="outlined" startIcon={<RefreshIcon />} onClick={fetchData}>Refresh</Button>
                    <Button variant="contained" startIcon={<AddIcon />} onClick={() => openDialog('create')}>Add Content</Button>
                </Box>
            </Box>

            {localError && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setLocalError(null)}>{localError}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>{success}</Alert>}

            <Grid container spacing={2} sx={{ mb: 3 }}>
                {CONTENT_TYPES.map((type, index) => {
                    const Icon = TAB_ICONS[index];
                    const color = index === 0 ? '#6366f1' : index === 1 ? '#10b981' : index === 2 ? '#f59e0b' : '#ef4444';
                    return (
                        <Grid item xs={6} sm={3} key={type}>
                            <Card 
                                sx={{ 
                                    cursor: 'pointer',
                                    border: currentTab === index ? 2 : 1,
                                    borderColor: currentTab === index ? color : 'divider',
                                    transition: 'all 0.2s',
                                    '&:hover': { borderColor: color }
                                }}
                                onClick={() => dispatch(setCurrentTab(index))}
                            >
                                <CardContent sx={{ py: 2 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <Avatar sx={{ bgcolor: alpha(color, 0.1), color }}>
                                            <Icon />
                                        </Avatar>
                                        <Box>
                                            <Typography variant="h5" fontWeight={700}>{counts[type]}</Typography>
                                            <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'capitalize' }}>
                                                {type}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                    );
                })}
            </Grid>

            <Card sx={{ mb: 3 }}>
                <Tabs 
                    value={currentTab} 
                    onChange={handleTabChange} 
                    sx={{ 
                        borderBottom: 1, 
                        borderColor: 'divider',
                        '& .MuiTab-root': { minHeight: 56 }
                    }}
                >
                    {TAB_LABELS.map((label, index) => {
                        const Icon = TAB_ICONS[index];
                        return (
                            <Tab 
                                key={label} 
                                icon={<Icon />} 
                                iconPosition="start" 
                                label={label} 
                            />
                        );
                    })}
                </Tabs>
            </Card>

            <Grid container spacing={3}>
                {currentContent.length === 0 ? (
                    <Grid item xs={12}>
                        <Card sx={{ py: 8 }}>
                            <Box sx={{ textAlign: 'center' }}>
                                {React.createElement(TAB_ICONS[currentTab], { sx: { fontSize: 80, color: 'text.disabled', mb: 2 } })}
                                <Typography variant="h5" color="text.secondary" sx={{ mb: 1 }}>
                                    No {TAB_LABELS[currentTab]} Found
                                </Typography>
                                <Typography variant="body2" color="text.disabled" sx={{ mb: 3 }}>
                                    Click "Add Content" to create your first {TAB_LABELS[currentTab].slice(0, -1)}
                                </Typography>
                                <Button 
                                    variant="contained" 
                                    startIcon={<AddIcon />} 
                                    onClick={() => openDialog('create')}
                                >
                                    Add {TAB_LABELS[currentTab].slice(0, -1)}
                                </Button>
                            </Box>
                        </Card>
                    </Grid>
                ) : (
                    currentContent.map((item) => (
                        <Grid item xs={12} sm={6} md={4} lg={3} key={item.id}>
                            {renderContentCard(item)}
                        </Grid>
                    ))
                )}
            </Grid>

            {currentContent.length > 0 && (
                <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
                    <TablePagination
                        rowsPerPageOptions={[8, 16, 24, 32]}
                        component="div"
                        count={currentPagination.total}
                        rowsPerPage={currentPagination.rowsPerPage}
                        page={currentPagination.page}
                        onPageChange={handleChangePage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                    />
                </Box>
            )}

            <Drawer anchor="right" open={dialog.open} onClose={closeDialog}>
                <Box sx={{ width: 450, p: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                        <Typography variant="h6">{dialog.mode === 'create' ? 'Add' : 'Edit'} {TAB_LABELS[currentTab].slice(0, -1)}</Typography>
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
