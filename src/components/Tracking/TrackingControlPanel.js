import React, { useState } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Chip,
    Button,
    FormControl,
    FormControlLabel,
    Checkbox,
    FormGroup,
    Divider,
    IconButton,
    Tooltip,
    Collapse,
    List,
    ListItem,
    ListItemText,
    ListItemAvatar,
    Avatar,
    Badge,
} from '@mui/material';
import {
    FilterList as FilterIcon,
    ExpandLess as ExpandLessIcon,
    ExpandMore as ExpandMoreIcon,
    MyLocation as LocationIcon,
    FamilyRestroom as FamilyIcon,
    People as PeopleIcon,
    EmergencyShare as EmergencyIcon,
    CheckCircle as CheckCircleIcon,
    Warning as WarningIcon,
} from '@mui/icons-material';

const TrackingControlPanel = ({
    users,
    families,
    trackingMode,
    selectedUser,
    selectedFamily,
    selectedUsers,
    filters,
    onModeChange,
    onUserToggle,
    onFiltersChange,
}) => {
    const [expanded, setExpanded] = useState(true);
    const [activePanel, setActivePanel] = useState(null); // 'individual', 'family', 'selected'

    const toggleExpanded = () => setExpanded(!expanded);

    const handleModeSelect = (mode, data = null) => {
        setActivePanel(activePanel === mode ? null : mode);
        onModeChange(mode, data);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'sos':
                return 'error';
            case 'danger':
                return 'warning';
            case 'safe':
                return 'success';
            default:
                return 'default';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'sos':
                return <EmergencyIcon />;
            case 'danger':
                return <WarningIcon />;
            case 'safe':
                return <CheckCircleIcon />;
            default:
                return <LocationIcon />;
        }
    };

    return (
        <Card
            sx={{
                position: 'absolute',
                top: 100,
                left: 16,
                zIndex: 1000,
                width: 320,
                maxHeight: 'calc(100vh - 140px)',
                overflow: 'auto',
                boxShadow: 3,
            }}
        >
            <CardContent sx={{ p: 0 }}>
                {/* Header */}
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        p: 2,
                        bgcolor: 'background.paper',
                        borderBottom: 1,
                        borderColor: 'divider',
                    }}
                >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <FilterIcon fontSize="small" color="action" />
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                            Tracking Controls
                        </Typography>
                    </Box>
                    <IconButton onClick={toggleExpanded} size="small">
                        {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                    </IconButton>
                </Box>

                <Collapse in={expanded}>
                    <Box sx={{ p: 2 }}>
                        {/* Status Filters */}
                        <Typography variant="caption" sx={{ fontWeight: 600, mb: 1, display: 'block' }}>
                            Show on Map
                        </Typography>
                        <FormGroup row sx={{ mb: 2 }}>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={filters.showSafe}
                                        onChange={(e) => onFiltersChange({ showSafe: e.target.checked })}
                                        size="small"
                                        color="success"
                                    />
                                }
                                label={
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                        <CheckCircleIcon fontSize="small" sx={{ color: '#10b981' }} />
                                        <Typography variant="caption">Safe</Typography>
                                    </Box>
                                }
                            />
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={filters.showDanger}
                                        onChange={(e) => onFiltersChange({ showDanger: e.target.checked })}
                                        size="small"
                                        color="warning"
                                    />
                                }
                                label={
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                        <WarningIcon fontSize="small" sx={{ color: '#f59e0b' }} />
                                        <Typography variant="caption">Danger</Typography>
                                    </Box>
                                }
                            />
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={filters.showSOS}
                                        onChange={(e) => onFiltersChange({ showSOS: e.target.checked })}
                                        size="small"
                                        color="error"
                                    />
                                }
                                label={
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                        <EmergencyIcon fontSize="small" sx={{ color: '#ef4444' }} />
                                        <Typography variant="caption">SOS</Typography>
                                    </Box>
                                }
                            />
                        </FormGroup>

                        <Divider sx={{ my: 2 }} />

                        {/* Tracking Mode Selection */}
                        <Typography variant="caption" sx={{ fontWeight: 600, mb: 1, display: 'block' }}>
                            Tracking Mode
                        </Typography>

                        {/* All Users */}
                        <Button
                            fullWidth
                            variant={trackingMode === 'all' ? 'contained' : 'outlined'}
                            startIcon={<PeopleIcon />}
                            onClick={() => handleModeSelect('all')}
                            sx={{ mb: 1 }}
                            size="small"
                        >
                            All Users
                        </Button>

                        {/* Individual User Tracking */}
                        <Box sx={{ mb: 1 }}>
                            <Button
                                fullWidth
                                variant={trackingMode === 'individual' ? 'contained' : 'outlined'}
                                startIcon={<LocationIcon />}
                                onClick={() => handleModeSelect('individual')}
                                size="small"
                                endIcon={activePanel === 'individual' ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                            >
                                Individual
                            </Button>
                            <Collapse in={activePanel === 'individual'}>
                                <List dense sx={{ mt: 0.5, maxHeight: 200, overflow: 'auto' }}>
                                    {users.map((user) => (
                                        <ListItem
                                            key={user.id}
                                            button
                                            selected={selectedUser?.user_id === user.id}
                                            onClick={() => handleModeSelect('individual', { user_id: user.id })}
                                            sx={{ borderRadius: 1, mb: 0.5 }}
                                        >
                                            <ListItemAvatar>
                                                <Badge
                                                    overlap="circular"
                                                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                                                    variant="dot"
                                                    color={getStatusColor(user.status || 'safe')}
                                                >
                                                    <Avatar sx={{ width: 32, height: 32 }}>
                                                        {user.first_name?.charAt(0) || user.email?.charAt(0)}
                                                    </Avatar>
                                                </Badge>
                                            </ListItemAvatar>
                                            <ListItemText
                                                primary={`${user.first_name || ''} ${user.last_name || ''}`}
                                                secondary={user.email}
                                                primaryTypographyProps={{ variant: 'caption', fontWeight: 500 }}
                                                secondaryTypographyProps={{ variant: 'caption' }}
                                            />
                                            {user.status && (
                                                <Chip
                                                    label={user.status.toUpperCase()}
                                                    size="small"
                                                    color={getStatusColor(user.status)}
                                                    sx={{ minWidth: 60 }}
                                                />
                                            )}
                                        </ListItem>
                                    ))}
                                </List>
                            </Collapse>
                        </Box>

                        {/* Family-wise Tracking */}
                        <Box sx={{ mb: 1 }}>
                            <Button
                                fullWidth
                                variant={trackingMode === 'family' ? 'contained' : 'outlined'}
                                startIcon={<FamilyIcon />}
                                onClick={() => handleModeSelect('family')}
                                size="small"
                                endIcon={activePanel === 'family' ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                            >
                                Family
                            </Button>
                            <Collapse in={activePanel === 'family'}>
                                <List dense sx={{ mt: 0.5, maxHeight: 200, overflow: 'auto' }}>
                                    {families.map((family) => (
                                        <ListItem
                                            key={family.id}
                                            button
                                            selected={selectedFamily?.id === family.id}
                                            onClick={() => handleModeSelect('family', family)}
                                            sx={{ borderRadius: 1, mb: 0.5 }}
                                        >
                                            <ListItemAvatar>
                                                <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                                                    <FamilyIcon fontSize="small" />
                                                </Avatar>
                                            </ListItemAvatar>
                                            <ListItemText
                                                primary={family.name}
                                                secondary={`${family.members || 0} members`}
                                                primaryTypographyProps={{ variant: 'caption', fontWeight: 500 }}
                                                secondaryTypographyProps={{ variant: 'caption' }}
                                            />
                                        </ListItem>
                                    ))}
                                </List>
                            </Collapse>
                        </Box>

                        {/* Selected Users Tracking */}
                        <Box>
                            <Button
                                fullWidth
                                variant={trackingMode === 'selected' ? 'contained' : 'outlined'}
                                startIcon={<PeopleIcon />}
                                onClick={() => handleModeSelect('selected')}
                                size="small"
                                endIcon={activePanel === 'selected' ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                            >
                                Selected ({selectedUsers.length})
                            </Button>
                            <Collapse in={activePanel === 'selected'}>
                                <List dense sx={{ mt: 0.5, maxHeight: 200, overflow: 'auto' }}>
                                    {users.map((user) => (
                                        <ListItem
                                            key={user.id}
                                            button
                                            selected={selectedUsers.includes(user.id)}
                                            onClick={() => onUserToggle(user.id)}
                                            sx={{ borderRadius: 1, mb: 0.5 }}
                                        >
                                            <ListItemAvatar>
                                                <Badge
                                                    overlap="circular"
                                                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                                                    variant="dot"
                                                    color={selectedUsers.includes(user.id) ? 'primary' : getStatusColor(user.status || 'safe')}
                                                >
                                                    <Avatar sx={{ width: 32, height: 32 }}>
                                                        {user.first_name?.charAt(0) || user.email?.charAt(0)}
                                                    </Avatar>
                                                </Badge>
                                            </ListItemAvatar>
                                            <ListItemText
                                                primary={`${user.first_name || ''} ${user.last_name || ''}`}
                                                secondary={user.email}
                                                primaryTypographyProps={{ variant: 'caption', fontWeight: 500 }}
                                                secondaryTypographyProps={{ variant: 'caption' }}
                                            />
                                        </ListItem>
                                    ))}
                                </List>
                            </Collapse>
                        </Box>
                    </Box>
                </Collapse>
            </CardContent>
        </Card>
    );
};

export default TrackingControlPanel;
