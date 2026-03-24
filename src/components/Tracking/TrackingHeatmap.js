import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, HeatmapLayer } from 'react-leaflet';
import { Card, CardContent, Typography, Box, Chip, IconButton } from '@mui/material';
import {
    Close as CloseIcon,
    Thermostat as ThermostatIcon,
    Warning as WarningIcon,
} from '@mui/icons-material';

// Heatmap component for visualizing high-density or unsafe areas
const HeatmapLayerComponent = ({ points }) => {
    // Leaflet.heat is required for HeatmapLayer
    // Install with: npm install leaflet.heat

    if (!points || points.length === 0) return null;

    return (
        <HeatmapLayer
            data={points}
            radius={0.0001}
            blur={0.00005}
            maxOpacity={0.6}
            gradient={{
                0.4: '#00ff00',
                0.6: '#ffff00',
                0.7: '#ffa500',
                0.9: '#ff0000',
            }}
        />
    );
};

const TrackingHeatmap = ({ open, onClose, data = [] }) => {
    const [heatmapPoints, setHeatmapPoints] = useState([]);

    useEffect(() => {
        if (data.length > 0) {
            // Convert data to heatmap format [lat, lng, intensity]
            const points = data.map(item => [
                item.latitude,
                item.longitude,
                item.intensity || 1
            ]);
            setHeatmapPoints(points);
        }
    }, [data]);

    if (!open) return null;

    return (
        <Card
            sx={{
                position: 'absolute',
                top: 16,
                right: 16,
                zIndex: 1000,
                width: 400,
                maxHeight: 'calc(100vh - 140px)',
                overflow: 'auto',
            }}
        >
            <CardContent sx={{ p: 0 }}>
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
                        <ThermostatIcon fontSize="small" color="action" />
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                            Safety Heatmap
                        </Typography>
                    </Box>
                    <IconButton onClick={onClose} size="small">
                        <CloseIcon />
                    </IconButton>
                </Box>

                <Box sx={{ p: 2 }}>
                    <Box sx={{ mb: 2 }}>
                        <Typography variant="caption" color="text.secondary">
                            Heatmap showing areas with high incident density
                        </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                        <Chip
                            label="Low Risk"
                            size="small"
                            sx={{ bgcolor: '#00ff00', color: '#000', fontWeight: 600 }}
                        />
                        <Chip
                            label="Medium Risk"
                            size="small"
                            sx={{ bgcolor: '#ffff00', color: '#000', fontWeight: 600 }}
                        />
                        <Chip
                            label="High Risk"
                            size="small"
                            sx={{ bgcolor: '#ffa500', color: '#000', fontWeight: 600 }}
                        />
                        <Chip
                            label="Critical"
                            size="small"
                            sx={{ bgcolor: '#ff0000', color: '#fff', fontWeight: 600 }}
                        />
                    </Box>

                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                        Hotspot Statistics
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="caption" color="text.secondary">
                                Total Incidents
                            </Typography>
                            <Typography variant="caption" sx={{ fontWeight: 600 }}>
                                {data.reduce((sum, item) => sum + (item.count || 1), 0)}
                            </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="caption" color="text.secondary">
                                High Risk Areas
                            </Typography>
                            <Typography variant="caption" sx={{ fontWeight: 600 }}>
                                {data.filter(item => (item.intensity || 1) > 0.7).length}
                            </Typography>
                        </Box>
                    </Box>
                </Box>
            </CardContent>
        </Card>
    );
};

export default TrackingHeatmap;
