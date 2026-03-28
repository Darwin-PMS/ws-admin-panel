import React, { useState } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Button,
    Checkbox,
    IconButton,
    Menu,
    MenuItem,
    Tooltip,
    alpha,
    Divider,
    Chip,
} from '@mui/material';
import {
    CheckBox as CheckBoxIcon,
    IndeterminateCheckBox as IndeterminateIcon,
    CheckBoxOutlineBlank as UncheckIcon,
    ViewColumn as ColumnIcon,
    FilterList as FilterIcon,
    Save as SaveIcon,
    MoreVert as MoreIcon,
} from '@mui/icons-material';

const ColumnToggle = ({ columns, visibleColumns, onToggle, onToggleAll }) => {
    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);

    const handleClick = (event) => setAnchorEl(event.currentTarget);
    const handleClose = () => setAnchorEl(null);

    const handleToggle = (columnKey) => {
        onToggle(columnKey);
    };

    const allSelected = columns.length === visibleColumns.length;
    const someSelected = visibleColumns.length > 0 && !allSelected;

    return (
        <>
            <Tooltip title="Toggle columns">
                <IconButton size="small" onClick={handleClick}>
                    <ColumnIcon />
                </IconButton>
            </Tooltip>
            <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                PaperProps={{ sx: { minWidth: 200 } }}
            >
                <Box sx={{ px: 2, py: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Checkbox
                        checked={allSelected}
                        indeterminate={someSelected}
                        onChange={onToggleAll}
                        size="small"
                    />
                    <Typography variant="body2" fontWeight={600}>All Columns</Typography>
                </Box>
                <Divider />
                {columns.map((col) => (
                    <MenuItem key={col.key} onClick={() => handleToggle(col.key)} dense>
                        <Checkbox
                            checked={visibleColumns.includes(col.key)}
                            onChange={() => handleToggle(col.key)}
                            size="small"
                        />
                        <Typography variant="body2">{col.label}</Typography>
                    </MenuItem>
                ))}
            </Menu>
        </>
    );
};

const FilterPresets = ({ currentFilters, onApply, onSave }) => {
    const [anchorEl, setAnchorEl] = useState(null);
    const [savedFilters, setSavedFilters] = useState([
        { name: 'Women Only', filters: { role: 'woman' } },
        { name: 'Unverified', filters: { verified: false } },
        { name: 'Active Admins', filters: { role: 'admin', isActive: true } },
    ]);
    const open = Boolean(anchorEl);

    const handleClick = (event) => setAnchorEl(event.currentTarget);
    const handleClose = () => setAnchorEl(null);

    return (
        <>
            <Tooltip title="Filter presets">
                <IconButton size="small" onClick={handleClick}>
                    <SaveIcon />
                </IconButton>
            </Tooltip>
            <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                PaperProps={{ sx: { minWidth: 200 } }}
            >
                <Box sx={{ px: 2, py: 1 }}>
                    <Typography variant="caption" color="text.secondary">SAVED PRESETS</Typography>
                </Box>
                {savedFilters.map((preset, index) => (
                    <MenuItem key={index} onClick={() => { onApply(preset.filters); handleClose(); }}>
                        <Chip label={preset.name} size="small" sx={{ mr: 1 }} />
                    </MenuItem>
                ))}
                <Divider />
                <MenuItem onClick={() => { onSave && onSave(); handleClose(); }}>
                    <SaveIcon sx={{ mr: 1, fontSize: 18 }} />
                    Save Current Filters
                </MenuItem>
            </Menu>
        </>
    );
};

const BulkActionsToolbar = ({ selectedCount, onBulkAction, onClear }) => {
    if (selectedCount === 0) return null;

    return (
        <Box
            sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                p: 1.5,
                mb: 2,
                borderRadius: 2,
                bgcolor: alpha('#6366f1', 0.08),
                animation: 'slideIn 0.2s ease-out',
                '@keyframes slideIn': {
                    from: { opacity: 0, transform: 'translateY(-10px)' },
                    to: { opacity: 1, transform: 'translateY(0)' },
                },
            }}
        >
            <Chip
                label={`${selectedCount} selected`}
                color="primary"
                size="small"
                onDelete={onClear}
            />
            <Divider orientation="vertical" flexItem />
            <Button size="small" startIcon={<CheckBoxIcon />} onClick={() => onBulkAction('activate')}>
                Activate
            </Button>
            <Button size="small" startIcon={<UncheckIcon />} onClick={() => onBulkAction('deactivate')}>
                Deactivate
            </Button>
            <Button size="small" color="error" startIcon={<FilterIcon />} onClick={() => onBulkAction('delete')}>
                Delete
            </Button>
        </Box>
    );
};

const InlineStatusToggle = ({ isActive, onToggle, loading }) => {
    return (
        <Tooltip title={isActive ? 'Click to deactivate' : 'Click to activate'}>
            <Box
                onClick={() => !loading && onToggle(!isActive)}
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    cursor: 'pointer',
                    '&:hover': { opacity: 0.8 },
                }}
            >
                <Box
                    sx={{
                        width: 40,
                        height: 22,
                        borderRadius: 11,
                        bgcolor: isActive ? '#10b981' : '#64748b',
                        position: 'relative',
                        transition: 'all 0.2s ease',
                    }}
                >
                    <Box
                        sx={{
                            width: 18,
                            height: 18,
                            borderRadius: '50%',
                            bgcolor: 'white',
                            position: 'absolute',
                            top: 2,
                            left: isActive ? 20 : 2,
                            transition: 'left 0.2s ease',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
                        }}
                    />
                </Box>
            </Box>
        </Tooltip>
    );
};

export { ColumnToggle, FilterPresets, BulkActionsToolbar, InlineStatusToggle };
