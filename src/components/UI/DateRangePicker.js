import React, { useState } from 'react';
import {
    Box,
    Button,
    Popover,
    Typography,
    IconButton,
    Grid,
    ButtonGroup,
    Divider,
    alpha,
} from '@mui/material';
import {
    CalendarMonth as CalendarIcon,
    KeyboardArrowDown as ArrowDownIcon,
} from '@mui/icons-material';

const presets = [
    { label: 'Today', value: 'day', days: 1 },
    { label: 'Yesterday', value: 'yesterday', days: 1 },
    { label: 'Last 7 Days', value: 'week', days: 7 },
    { label: 'Last 30 Days', value: 'month', days: 30 },
    { label: 'This Month', value: 'thisMonth', days: null },
    { label: 'Last Month', value: 'lastMonth', days: null },
    { label: 'This Year', value: 'year', days: 365 },
    { label: 'Last Year', value: 'lastYear', days: 365 },
];

const DateRangePicker = ({ value, onChange, buttonProps }) => {
    const [anchorEl, setAnchorEl] = useState(null);
    const [selectedPreset, setSelectedPreset] = useState(value || 'month');

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleSelect = (preset) => {
        setSelectedPreset(preset.value);
        onChange(preset.value);
        handleClose();
    };

    const open = Boolean(anchorEl);
    const currentPreset = presets.find(p => p.value === selectedPreset) || presets[2];

    const getDateRange = () => {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        
        switch (selectedPreset) {
            case 'today':
                return { start: today, end: today };
            case 'yesterday':
                const yesterday = new Date(today);
                yesterday.setDate(yesterday.getDate() - 1);
                return { start: yesterday, end: yesterday };
            case 'week':
                const weekStart = new Date(today);
                weekStart.setDate(weekStart.getDate() - 6);
                return { start: weekStart, end: today };
            case 'month':
                const monthStart = new Date(today);
                monthStart.setDate(monthStart.getDate() - 29);
                return { start: monthStart, end: today };
            case 'thisMonth':
                const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
                return { start: thisMonthStart, end: today };
            case 'lastMonth':
                const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
                const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);
                return { start: lastMonthStart, end: lastMonthEnd };
            case 'year':
                const yearStart = new Date(today.getFullYear(), 0, 1);
                return { start: yearStart, end: today };
            case 'lastYear':
                const lastYearStart = new Date(today.getFullYear() - 1, 0, 1);
                const lastYearEnd = new Date(today.getFullYear() - 1, 11, 31);
                return { start: lastYearStart, end: lastYearEnd };
            default:
                const defaultStart = new Date(today);
                defaultStart.setDate(defaultStart.getDate() - 29);
                return { start: defaultStart, end: today };
        }
    };

    const formatDate = (date) => {
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const dateRange = getDateRange();

    return (
        <>
            <Button
                variant="outlined"
                startIcon={<CalendarIcon />}
                endIcon={<ArrowDownIcon sx={{ fontSize: 16 }} />}
                onClick={handleClick}
                sx={{
                    bgcolor: 'background.paper',
                    borderColor: 'divider',
                    '&:hover': { borderColor: 'primary.main', bgcolor: alpha('#6366f1', 0.04) },
                    ...buttonProps?.sx,
                }}
                {...buttonProps}
            >
                <Box sx={{ textAlign: 'left' }}>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', lineHeight: 1.2 }}>
                        {currentPreset.label}
                    </Typography>
                    <Typography variant="body2" fontWeight={500}>
                        {formatDate(dateRange.start)} - {formatDate(dateRange.end)}
                    </Typography>
                </Box>
            </Button>

            <Popover
                open={open}
                anchorEl={anchorEl}
                onClose={handleClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                transformOrigin={{ vertical: 'top', horizontal: 'left' }}
                PaperProps={{
                    sx: { mt: 1, p: 2, minWidth: 280 }
                }}
            >
                <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 2 }}>
                    Select Date Range
                </Typography>
                
                <Grid container spacing={1}>
                    {presets.map((preset) => (
                        <Grid item xs={6} key={preset.value}>
                            <Button
                                fullWidth
                                variant={selectedPreset === preset.value ? 'contained' : 'text'}
                                size="small"
                                onClick={() => handleSelect(preset)}
                                sx={{
                                    justifyContent: 'flex-start',
                                    textTransform: 'none',
                                    bgcolor: selectedPreset === preset.value ? 'primary.main' : 'transparent',
                                    '&:hover': {
                                        bgcolor: selectedPreset === preset.value ? 'primary.dark' : 'action.hover',
                                    },
                                }}
                            >
                                {preset.label}
                            </Button>
                        </Grid>
                    ))}
                </Grid>

                <Divider sx={{ my: 2 }} />

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="caption" color="text.secondary">
                        Selected: {currentPreset.label}
                    </Typography>
                    <Button size="small" onClick={handleClose}>
                        Done
                    </Button>
                </Box>
            </Popover>
        </>
    );
};

export default DateRangePicker;
