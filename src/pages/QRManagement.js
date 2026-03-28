import React, { useEffect, useState, useCallback, useRef } from 'react';
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
    Paper,
    alpha,
    Grid,
    Skeleton,
    InputAdornment,
    Avatar,
    Divider,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    Tabs,
    Tab,
    Fab,
    ToggleButton,
    ToggleButtonGroup,
    Checkbox,
} from '@mui/material';
import {
    QrCode as QrCodeIcon,
    Delete as DeleteIcon,
    Visibility as VisibilityIcon,
    Refresh as RefreshIcon,
    Add as AddIcon,
    History as HistoryIcon,
    Search as SearchIcon,
    Person as PersonIcon,
    LockOpen as GrantIcon,
    AccessTime as TimeIcon,
    CheckCircle as CheckCircleIcon,
    Cancel as CancelIcon,
    Close as CloseIcon,
    Warning as WarningIcon,
    Print as PrintIcon,
    Download as DownloadIcon,
    Share as ShareIcon,
    CreditCard as CardIcon,
    PhoneAndroid as AppIcon,
    Email as EmailIcon,
    WhatsApp as WhatsAppIcon,
    VpnKey as KeyIcon,
    Style as LargeIcon,
} from '@mui/icons-material';
import { adminApi } from '../services/api';

let QRCodeSVG = null;
let jsPDFLib = null;

const loadLibraries = async () => {
    if (!QRCodeSVG) {
        const qrModule = await import('qrcode.react');
        QRCodeSVG = qrModule.QRCodeSVG;
    }
    if (!jsPDFLib) {
        const pdfModule = await import('jspdf');
        jsPDFLib = pdfModule.jsPDF;
    }
    return { QRCodeSVG, jsPDFLib };
};

const QRLazyWrapper = ({ selectedToken, children }) => {
    const [LoadedQR, setLoadedQR] = useState(null);
    
    useEffect(() => {
        loadLibraries().then(({ QRCodeSVG: QR }) => {
            setLoadedQR(() => QR);
        });
    }, []);
    
    if (!LoadedQR) {
        return <Box sx={{ p: 2, textAlign: 'center' }}><CircularProgress size={24} /></Box>;
    }
    
    return children(LoadedQR);
};

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

const CARD_SIZES = {
    SMALL: { 
        name: 'Key Ring', 
        width: 200, 
        height: 300, 
        qrSize: 100, 
        fontScale: 0.7,
        showBack: false,
        showPermissions: false,
        showFeatures: false,
        compact: true
    },
    NORMAL: { 
        name: 'ID Card', 
        width: 320, 
        height: 480, 
        qrSize: 140, 
        fontScale: 1,
        showBack: true,
        showPermissions: true,
        showFeatures: false,
        compact: false
    },
    LARGE: { 
        name: 'Large', 
        width: 380, 
        height: 580, 
        qrSize: 180, 
        fontScale: 1.2,
        showBack: true,
        showPermissions: true,
        showFeatures: true,
        compact: false
    },
};

const QRManagement = () => {
    const [tokens, setTokens] = useState([]);
    const [accessLogs, setAccessLogs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [logsLoading, setLogsLoading] = useState(false);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(25);
    const [totalCount, setTotalCount] = useState(0);
    const [filter, setFilter] = useState({ search: '', activeOnly: false, type: 'all' });
    const [grantDialogOpen, setGrantDialogOpen] = useState(false);
    const [logsDialogOpen, setLogsDialogOpen] = useState(false);
    const [viewDialogOpen, setViewDialogOpen] = useState(false);
    const [qrPreviewOpen, setQrPreviewOpen] = useState(false);
    const [selectedToken, setSelectedToken] = useState(null);
    const [selectedCardSize, setSelectedCardSize] = useState('NORMAL');
    const [selectedTokens, setSelectedTokens] = useState([]);
    const [bulkPrintDialogOpen, setBulkPrintDialogOpen] = useState(false);
    const [grantForm, setGrantForm] = useState({ targetUserId: '', permissionType: '', reason: '' });
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    const qrCardRef = useRef(null);

    const fetchTokens = useCallback(async () => {
        setLoading(true);
        try {
            const params = { page: page + 1, limit: rowsPerPage };
            if (filter.search) params.search = filter.search;
            if (filter.activeOnly) params.activeOnly = 'true';
            if (filter.type !== 'all') params.type = filter.type;
            
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
        setLogsLoading(true);
        try {
            const response = await adminApi.qr.accessLogs({ page: 1, limit: 100 });
            if (response.data.success) {
                setAccessLogs(response.data.data);
            }
        } catch (error) {
            showSnackbar('Failed to fetch access logs', 'error');
        } finally {
            setLogsLoading(false);
        }
    };

    useEffect(() => {
        fetchTokens();
    }, [fetchTokens]);

    useEffect(() => {
        loadLibraries().then(lib => {
            QRCodeSVG = lib.QRCodeSVG;
            jsPDFLib = lib.jsPDF;
        }).catch(err => console.error('Failed to load QR libraries:', err));
    }, []);

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

    const handleSelectToken = (tokenId) => {
        setSelectedTokens(prev => 
            prev.includes(tokenId) 
                ? prev.filter(id => id !== tokenId)
                : [...prev, tokenId]
        );
    };

    const handleSelectAll = () => {
        if (selectedTokens.length === tokens.length) {
            setSelectedTokens([]);
        } else {
            setSelectedTokens(tokens.map(t => t.id));
        }
    };

    const handleBulkPrint = () => {
        if (selectedTokens.length === 0) {
            showSnackbar('Please select at least one QR code', 'warning');
            return;
        }
        setBulkPrintDialogOpen(true);
    };

    const handleBulkPrintAction = async (cardSize) => {
        const selectedItems = tokens.filter(t => selectedTokens.includes(t.id));
        if (selectedItems.length === 0) {
            showSnackbar('No QR codes selected', 'error');
            return;
        }

        const size = CARD_SIZES[cardSize] || CARD_SIZES.NORMAL;
        const printWindow = window.open('', '_blank');
        if (!printWindow) {
            showSnackbar('Please allow popups for printing', 'error');
            return;
        }

        const cardHeight = size.width * 1.5;
        
        // Generate QR codes as data URLs
        const qrCodes = {};
        for (const token of selectedItems) {
            const qrValue = generateQRValue(token);
            const canvas = document.createElement('canvas');
            const qrSize = size.qrSize || 140;
            canvas.width = qrSize;
            canvas.height = qrSize;
            const ctx = canvas.getContext('2d');
            
            // Draw QR placeholder - in real scenario would use a QR library
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, qrSize, qrSize);
            ctx.fillStyle = '#000000';
            
            // Simple QR-like pattern (placeholder)
            const moduleSize = qrSize / 21;
            for (let i = 0; i < 21; i++) {
                for (let j = 0; j < 21; j++) {
                    // Position patterns (corners)
                    if ((i < 7 && j < 7) || (i < 7 && j > 13) || (i > 13 && j < 7)) {
                        if ((i === 0 || i === 6 || j === 0 || j === 6) ||
                            (i === 2 && j === 2) || (i === 2 && j === 4) || (i === 4 && j === 2) || (i === 4 && j === 4)) {
                            ctx.fillRect(i * moduleSize, j * moduleSize, moduleSize, moduleSize);
                        }
                    } else {
                        // Data pattern based on token id
                        const hash = (token.id?.charCodeAt(i % 10) || 0) + (token.id?.charCodeAt(j % 10) || 0);
                        if (hash % 3 === 0) {
                            ctx.fillRect(i * moduleSize, j * moduleSize, moduleSize, moduleSize);
                        }
                    }
                }
            }
            qrCodes[token.id] = canvas.toDataURL('image/png');
        }
        
        let cardsHTML = '';
        
        for (const token of selectedItems) {
            const qrValue = generateQRValue(token);
            const qrImage = qrCodes[token.id] || '';
            
            // Front Card
            cardsHTML += `
                <div class="card card-front" style="break-after: always;">
                    <div class="card-header">
                        <div class="logo">NIRBHAYA</div>
                        <div class="tagline">Your Safety Companion</div>
                        <div class="user-badge">QR Access Card</div>
                    </div>
                    <div class="qr-container">
                        <img src="${qrImage}" alt="QR Code" style="width: ${size.qrSize || 140}px; height: ${size.qrSize || 140}px;" />
                    </div>
                    <div class="user-details">
                        <h3>${token.user?.name || 'User'}</h3>
                        <p class="email">${token.user?.email || 'No email'}</p>
                        <span class="status" style="background: ${token.isActive ? '#d1fae5' : '#fee2e2'}; color: ${token.isActive ? '#065f46' : '#991b1b'};">
                            ${token.isActive ? 'Active' : 'Revoked'}
                        </span>
                    </div>
                    ${size.showPermissions ? `
                    <div class="permissions">
                        <strong>Permissions:</strong><br/>
                        ${token.permissions?.map(p => `<span>${formatPermission(p)}</span>`).join('') || 'None'}
                    </div>
                    ` : ''}
                </div>
            `;
            
            // Back Card
            if (size.showBack) {
                cardsHTML += `
                    <div class="card">
                        <div class="back-card">
                            <div class="back-header">
                                <h2>NIRBHAYA</h2>
                                <p>Empowering Women's Safety</p>
                            </div>
                            <div class="back-content">
                                ${size.showFeatures ? `
                                <div class="app-info">
                                    <h4>KEY FEATURES</h4>
                                    <div class="app-features">
                                        <span>🚨 SOS</span>
                                        <span>📍 Location</span>
                                        <span>👨‍👩 Family</span>
                                        <span>🤖 AI</span>
                                        <span>🛡️ Safe Zones</span>
                                    </div>
                                </div>
                                ` : ''}
                                <div class="app-download">
                                    <div class="title">Download Nirbhaya</div>
                                    <div class="links">Play Store & App Store</div>
                                </div>
                                <div class="emergency-box">
                                    <h5>🚨 Emergency Helplines</h5>
                                    <p>Women: <strong>181</strong> | Police: <strong>100</strong></p>
                                    ${!size.compact ? `<p>Ambulance: <strong>108</strong> | Emergency: <strong>112</strong></p>` : ''}
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            }
        }
        
        const content = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Bulk QR Cards - Nirbhaya</title>
                <style>
                    * { margin: 0; padding: 0; box-sizing: border-box; }
                    @page { margin: 10mm; }
                    body { font-family: 'Segoe UI', Arial, sans-serif; padding: 15px; background: #e5e7eb; }
                    .print-page {
                        display: flex;
                        gap: 15px;
                        justify-content: center;
                        flex-wrap: wrap;
                        padding: 10px;
                        border: 2px dashed #94a3b8;
                        border-radius: 8px;
                        min-height: 95vh;
                        background: #f8fafc;
                    }
                    .card { 
                        width: ${size.width}px; 
                        height: ${cardHeight}px;
                        border-radius: ${12 * size.fontScale}px; 
                        overflow: hidden;
                        box-shadow: 0 2px 8px rgba(0,0,0,0.15);
                        background: white;
                        border: 1px solid #e2e8f0;
                    }
                    .card-front { background: linear-gradient(180deg, #f0f9ff 0%, #ffffff 30%); }
                    .card-header {
                        background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
                        color: white;
                        padding: ${18 * size.fontScale}px ${15 * size.fontScale}px;
                        text-align: center;
                    }
                    .card-header .logo { font-size: ${22 * size.fontScale}px; font-weight: 700; }
                    .card-header .tagline { font-size: ${10 * size.fontScale}px; opacity: 0.9; }
                    .card-header .user-badge { background: rgba(255,255,255,0.2); padding: 4px 12px; border-radius: 20px; font-size: ${10 * size.fontScale}px; }
                    .qr-container { padding: ${20 * size.fontScale}px; text-align: center; background: white; }
                    .qr-placeholder { padding: 40px; font-size: 14px; color: #666; }
                    .user-details { padding: ${12 * size.fontScale}px ${15 * size.fontScale}px; background: #fff; border-top: 1px solid #e2e8f0; text-align: center; }
                    .user-details h3 { margin: 0; color: #1e293b; font-size: ${15 * size.fontScale}px; }
                    .user-details .email { margin: 3px 0 0; color: #64748b; font-size: ${11 * size.fontScale}px; }
                    .permissions { padding: ${10 * size.fontScale}px ${15 * size.fontScale}px; background: #f8fafc; border-top: 1px solid #e2e8f0; font-size: ${9 * size.fontScale}px; color: #64748b; text-align: center; }
                    .back-card { background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); color: white; height: 100%; padding: 20px; }
                    .back-header { text-align: center; padding: 15px; border-bottom: 1px solid rgba(255,255,255,0.1); }
                    .back-header h2 { font-size: 18px; }
                    .back-content { padding: 15px; }
                    .app-download { background: linear-gradient(135deg, #6366f1, #8b5cf6); padding: 15px; border-radius: 8px; text-align: center; margin-bottom: 15px; }
                    .app-download .title { font-size: 12px; font-weight: 600; }
                    .app-download .links { font-size: 10px; opacity: 0.9; }
                    .emergency-box { background: rgba(239,68,68,0.2); padding: 10px; border-radius: 8px; }
                    .emergency-box h5 { color: #fca5a5; font-size: 11px; margin: 0 0 5px; }
                    .emergency-box p { font-size: 10px; margin: 2px 0; }
                    @media print {
                        body { padding: 0; background: white; }
                        .print-page { border: none; padding: 5px; }
                    }
                </style>
            </head>
            <body>
                <div class="print-page">
                    ${cardsHTML}
                </div>
                <script>
                    window.onload = function() {
                        setTimeout(function() { window.print(); window.close(); }, 500);
                    }
                </script>
            </body>
            </html>
        `;
        
        printWindow.document.write(content);
        printWindow.document.close();
        setBulkPrintDialogOpen(false);
        setSelectedTokens([]);
        showSnackbar(`Printing ${selectedItems.length} QR cards`);
    };

    const generateQRValue = (token) => {
        return JSON.stringify({
            id: token?.id,
            type: token?.type,
            userId: token?.user?.id,
            permissions: token?.permissions,
            expires: token?.expiresAt
        });
    };

    const handleDownloadPDF = async (cardSize = selectedCardSize) => {
        if (!selectedToken) return;
        
        try {
            const size = CARD_SIZES[cardSize] || CARD_SIZES.NORMAL;
            const { jsPDF: jsPDFModule } = await loadLibraries();
            
            if (!jsPDFModule) {
                showSnackbar('PDF library not loaded. Please try again.', 'error');
                return;
            }
            
            const doc = new jsPDFModule({
                orientation: 'landscape',
                unit: 'mm',
                format: [size.width * 0.5, size.width * 0.75]
            });

            const cardHeight = size.width * 0.75;
            
            // Front Page - with light background
            doc.setFillColor(240, 249, 255); // Light blue background
            doc.rect(0, 0, size.width * 0.5, cardHeight, 'F');
            
            // Header
            doc.setFillColor(99, 102, 241);
            doc.rect(0, 0, size.width * 0.5, 15 * size.fontScale, 'F');
            
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(14 * size.fontScale);
            doc.text('NIRBHAYA', size.width * 0.25, 10, { align: 'center' });
            
            doc.setFontSize(8 * size.fontScale);
            doc.text('Your Safety Companion', size.width * 0.25, 16, { align: 'center' });
            
            // QR Code placeholder area
            doc.setFillColor(255, 255, 255);
            doc.roundedRect(size.width * 0.1, 20 * size.fontScale, size.width * 0.3, size.width * 0.3, 2, 2, 'F');
            
            // Try to get QR code from DOM
            const qrCodeSVG = document.querySelector('#qr-code-preview svg');
            if (qrCodeSVG) {
                try {
                    const canvas = document.createElement('canvas');
                    const qrSize = 200;
                    canvas.width = qrSize;
                    canvas.height = qrSize;
                    const ctx = canvas.getContext('2d');
                    
                    const svgData = new XMLSerializer().serializeToString(qrCodeSVG);
                    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
                    const url = URL.createObjectURL(svgBlob);
                    
                    const img = new Image();
                    img.src = url;
                    
                    await new Promise((resolve) => {
                        img.onload = () => {
                            ctx.fillStyle = 'white';
                            ctx.fillRect(0, 0, qrSize, qrSize);
                            ctx.drawImage(img, 0, 0, qrSize, qrSize);
                            resolve();
                        };
                        img.onerror = resolve;
                    });
                    
                    const imgData = canvas.toDataURL('image/png');
                    doc.addImage(imgData, 'PNG', size.width * 0.12, 22 * size.fontScale, size.width * 0.26, size.width * 0.26);
                    URL.revokeObjectURL(url);
                } catch (e) {
                    console.error('QR code image error:', e);
                }
            }
            
            // User info
            doc.setTextColor(30, 41, 59);
            doc.setFontSize(12 * size.fontScale);
            doc.text(selectedToken.user?.name || 'User', size.width * 0.25, (45 + size.width * 0.3) * size.fontScale, { align: 'center' });
            
            doc.setTextColor(100, 116, 139);
            doc.setFontSize(8 * size.fontScale);
            doc.text(selectedToken.user?.email || '', size.width * 0.25, (50 + size.width * 0.3) * size.fontScale, { align: 'center' });
            
            // Status
            const statusColor = selectedToken.isActive ? [16, 185, 129] : [239, 68, 68];
            doc.setFillColor(statusColor[0], statusColor[1], statusColor[2]);
            doc.roundedRect(size.width * 0.15, (55 + size.width * 0.3) * size.fontScale, size.width * 0.2, 5, 1, 1, 'F');
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(7 * size.fontScale);
            doc.text(selectedToken.isActive ? 'Active' : 'Revoked', size.width * 0.25, (58 + size.width * 0.3) * size.fontScale, { align: 'center' });
            
            // Permissions
            if (size.showPermissions && selectedToken.permissions?.length > 0) {
                doc.setTextColor(100, 116, 139);
                doc.setFontSize(6 * size.fontScale);
                doc.text('Permissions: ' + selectedToken.permissions.map(p => formatPermission(p)).join(', '), size.width * 0.25, cardHeight - 5, { align: 'center' });
            }
            
            // Back Page - if enabled
            if (size.showBack) {
                doc.addPage([size.width * 0.5, cardHeight], 'landscape');
                
                // Dark background
                doc.setFillColor(30, 41, 59);
                doc.rect(0, 0, size.width * 0.5, cardHeight, 'F');
                
                // Header
                doc.setFillColor(255, 255, 255, 0.1);
                doc.rect(0, 0, size.width * 0.5, 12 * size.fontScale, 'F');
                
                doc.setTextColor(255, 255, 255);
                doc.setFontSize(12 * size.fontScale);
                doc.text('NIRBHAYA', size.width * 0.25, 8, { align: 'center' });
                
                // App info
                doc.setTextColor(165, 180, 252);
                doc.setFontSize(8 * size.fontScale);
                doc.text('KEY FEATURES', 5, 18 * size.fontScale);
                
                doc.setTextColor(255, 255, 255, 0.9);
                doc.setFontSize(6 * size.fontScale);
                const features = '🚨 SOS  📍 Location  👨‍👩 Family  🤖 AI  🛡️ Safe Zones';
                doc.text(features, 5, 24 * size.fontScale);
                
                // Download
                doc.setFillColor(99, 102, 241);
                doc.roundedRect(5, 30 * size.fontScale, size.width * 0.4, 12 * size.fontScale, 1, 1, 'F');
                doc.setTextColor(255, 255, 255);
                doc.setFontSize(8 * size.fontScale);
                doc.text('Download Nirbhaya App', size.width * 0.25, 37 * size.fontScale, { align: 'center' });
                doc.setFontSize(5 * size.fontScale);
                doc.text('Play Store & App Store', size.width * 0.25, 41 * size.fontScale, { align: 'center' });
                
                // Emergency
                doc.setFillColor(239, 68, 68, 0.2);
                doc.setDrawColor(239, 68, 68, 0.5);
                doc.roundedRect(5, 48 * size.fontScale, size.width * 0.4, 15 * size.fontScale, 1, 1, 'FD');
                
                doc.setTextColor(252, 165, 165);
                doc.setFontSize(7 * size.fontScale);
                doc.text('Emergency Helplines', 5, 53 * size.fontScale);
                
                doc.setFontSize(5 * size.fontScale);
                doc.text('Women: 181 | Police: 100', 5, 58 * size.fontScale);
                if (!size.compact) {
                    doc.text('Ambulance: 108 | Emergency: 112', 5, 62 * size.fontScale);
                }
            }

            const fileName = `nirbhaya-qr-${(selectedToken.user?.name || 'user').replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().split('T')[0]}.pdf`;
            doc.save(fileName);
            showSnackbar('PDF downloaded successfully!');
        } catch (error) {
            console.error('PDF generation error:', error);
            showSnackbar('Failed to generate PDF: ' + error.message, 'error');
        }
    };

    const handlePrint = (cardSize = selectedCardSize) => {
        const size = CARD_SIZES[cardSize] || CARD_SIZES.NORMAL;
        const printWindow = window.open('', '_blank');
        if (!printWindow) {
            showSnackbar('Please allow popups for printing', 'error');
            return;
        }

        const qrValue = generateQRValue(selectedToken);
        const cardHeight = size.width * 1.5;
        
        const content = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Nirbhaya QR Card - ${selectedToken.user?.name || 'User'}</title>
                <style>
                    * { margin: 0; padding: 0; box-sizing: border-box; }
                    @page { margin: 10mm; }
                    body { 
                        font-family: 'Segoe UI', Arial, sans-serif; 
                        padding: 15px; 
                        background: #e5e7eb;
                    }
                    .print-page {
                        display: flex;
                        gap: 15px;
                        justify-content: center;
                        flex-wrap: wrap;
                        padding: 10px;
                        border: 2px dashed #94a3b8;
                        border-radius: 8px;
                        min-height: 95vh;
                        background: #f8fafc;
                    }
                    .card { 
                        width: ${size.width}px; 
                        height: ${cardHeight}px;
                        border-radius: ${12 * size.fontScale}px; 
                        overflow: hidden;
                        box-shadow: 0 2px 8px rgba(0,0,0,0.15);
                        page-break-after: always;
                        background: white;
                        border: 1px solid #e2e8f0;
                    }
                    .card-front {
                        background: linear-gradient(180deg, #f0f9ff 0%, #ffffff 30%);
                    }
                    .card-header {
                        background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
                        color: white;
                        padding: ${18 * size.fontScale}px ${15 * size.fontScale}px;
                        text-align: center;
                    }
                    .card-header .logo { font-size: ${22 * size.fontScale}px; font-weight: 700; letter-spacing: 1px; }
                    .card-header .tagline { font-size: ${10 * size.fontScale}px; opacity: 0.9; margin-top: 3px; }
                    .card-header .user-badge {
                        background: rgba(255,255,255,0.2);
                        padding: ${4 * size.fontScale}px ${12 * size.fontScale}px;
                        border-radius: 20px;
                        font-size: ${10 * size.fontScale}px;
                        margin-top: ${8 * size.fontScale}px;
                        display: inline-block;
                    }
                    .qr-container {
                        padding: ${20 * size.fontScale}px;
                        text-align: center;
                        background: white;
                    }
                    .qr-container svg { width: ${size.qrSize}px; height: ${size.qrSize}px; }
                    .user-details { 
                        padding: ${12 * size.fontScale}px ${15 * size.fontScale}px; 
                        background: #ffffff;
                        border-top: 1px solid #e2e8f0;
                    }
                    .user-details h3 { margin: 0; color: #1e293b; font-size: ${15 * size.fontScale}px; }
                    .user-details .email { margin: ${3 * size.fontScale}px 0 0; color: #64748b; font-size: ${11 * size.fontScale}px; }
                    .user-details .status {
                        margin-top: ${6 * size.fontScale}px;
                        display: inline-block;
                        padding: ${2 * size.fontScale}px ${10 * size.fontScale}px;
                        border-radius: 12px;
                        font-size: ${10 * size.fontScale}px;
                        font-weight: 600;
                    }
                    .permissions {
                        padding: ${10 * size.fontScale}px ${15 * size.fontScale}px;
                        background: #f8fafc;
                        border-top: 1px solid #e2e8f0;
                        font-size: ${9 * size.fontScale}px;
                        color: #64748b;
                    }
                    .permissions span { 
                        display: inline-block;
                        background: #f1f5f9;
                        padding: ${2 * size.fontScale}px ${8 * size.fontScale}px;
                        border-radius: 4px;
                        margin: 2px;
                    }
                    .back-card { 
                        background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); 
                        padding: 0;
                        color: white;
                        height: 100%;
                    }
                    .back-header {
                        background: rgba(255,255,255,0.1);
                        padding: ${15 * size.fontScale}px;
                        text-align: center;
                    }
                    .back-header h2 { font-size: ${18 * size.fontScale}px; margin: 0; }
                    .back-header p { font-size: ${10 * size.fontScale}px; opacity: 0.8; margin: ${5 * size.fontScale}px 0 0; }
                    .back-content { padding: ${15 * size.fontScale}px; }
                    .app-info { margin-bottom: ${15 * size.fontScale}px; }
                    .app-info h4 { 
                        color: #a5b4fc; 
                        font-size: ${12 * size.fontScale}px; 
                        margin-bottom: ${8 * size.fontScale}px; 
                        border-bottom: 1px solid rgba(255,255,255,0.1);
                        padding-bottom: ${5 * size.fontScale}px;
                    }
                    .app-info p { font-size: ${10 * size.fontScale}px; line-height: 1.6; opacity: 0.9; margin-bottom: ${8 * size.fontScale}px; }
                    .app-features { 
                        display: flex; 
                        flex-wrap: wrap; 
                        gap: ${6 * size.fontScale}px; 
                        margin: ${10 * size.fontScale}px 0;
                    }
                    .app-features .feature {
                        background: rgba(255,255,255,0.1);
                        padding: ${4 * size.fontScale}px ${10 * size.fontScale}px;
                        border-radius: 15px;
                        font-size: ${9 * size.fontScale}px;
                    }
                    .app-download { 
                        background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
                        padding: ${12 * size.fontScale}px;
                        border-radius: ${8 * size.fontScale}px;
                        text-align: center;
                        margin: ${15 * size.fontScale}px 0;
                    }
                    .app-download .title { font-size: ${11 * size.fontScale}px; font-weight: 600; }
                    .app-download .links { font-size: ${9 * size.fontScale}px; opacity: 0.9; margin-top: ${3 * size.fontScale}px; }
                    .emergency-box { 
                        background: rgba(239, 68, 68, 0.2);
                        border: 1px solid rgba(239, 68, 68, 0.3);
                        padding: ${10 * size.fontScale}px;
                        border-radius: ${8 * size.fontScale}px;
                        margin-top: ${10 * size.fontScale}px;
                    }
                    .emergency-box h5 { 
                        color: #fca5a5; 
                        font-size: ${10 * size.fontScale}px; 
                        margin: 0 0 ${5 * size.fontScale}px; 
                    }
                    .emergency-box p { font-size: ${9 * size.fontScale}px; margin: ${2 * size.fontScale}px 0; opacity: 0.9; }
                    .footer-note {
                        text-align: center;
                        font-size: ${8 * size.fontScale}px;
                        opacity: 0.6;
                        margin-top: ${10 * size.fontScale}px;
                        padding-top: ${10 * size.fontScale}px;
                        border-top: 1px solid rgba(255,255,255,0.1);
                    }
                    @media print {
                        body { 
                            padding: 0; 
                            background: white;
                            -webkit-print-color-adjust: exact;
                            print-color-adjust: exact;
                        }
                        .print-page {
                            border: 2px dashed #94a3b8;
                            padding: 5px;
                        }
                        .card { 
                            box-shadow: none;
                            border: 1px solid #e2e8f0;
                        }
                    }
                </style>
            </head>
            <body>
                <div class="print-page">
                    <!-- Front Card -->
                    <div class="card card-front">
                        <div class="card-header">
                            <div class="logo">NIRBHAYA</div>
                            <div class="tagline">Your Safety Companion</div>
                            <div class="user-badge">QR Access Card</div>
                        </div>
                        <div class="qr-container">
                            <div id="qr-code">${document.querySelector('#qr-code-preview')?.innerHTML || '<div style="width:' + size.qrSize + 'px;height:' + size.qrSize + 'px;background:#f1f5f9;margin:0 auto;"></div>'}</div>
                        </div>
                        <div class="user-details">
                            <h3>${selectedToken.user?.name || 'User'}</h3>
                            <p class="email">${selectedToken.user?.email || 'No email'}</p>
                            <span class="status" style="background: ${selectedToken.isActive ? '#d1fae5' : '#fee2e2'}; color: ${selectedToken.isActive ? '#065f46' : '#991b1b'};">
                                ${selectedToken.isActive ? 'Active' : 'Revoked'}
                            </span>
                        </div>
                        ${size.showPermissions ? `
                        <div class="permissions">
                            <strong>Permissions:</strong><br/>
                            ${selectedToken.permissions?.map(p => `<span>${formatPermission(p)}</span>`).join('') || 'None'}
                        </div>
                        ` : ''}
                    </div>
                    
                    ${size.showBack ? `
                    <!-- Back Card - App Marketing -->
                    <div class="card">
                        <div class="back-card">
                            <div class="back-header">
                                <h2>NIRBHAYA</h2>
                                <p>Empowering Women's Safety</p>
                            </div>
                            <div class="back-content">
                                ${size.showFeatures ? `
                                <div class="app-info">
                                    <h4>KEY FEATURES</h4>
                                    <div class="app-features">
                                        <span>🚨 SOS</span>
                                        <span>📍 Location</span>
                                        <span>👨‍👩‍👧 Family</span>
                                        <span>🤖 AI</span>
                                        <span>🛡️ Safe Zones</span>
                                    </div>
                                </div>
                                ` : ''}
                                
                                <div class="app-download">
                                    <div class="title">Download Nirbhaya</div>
                                    <div class="links">Play Store & App Store</div>
                                </div>
                                
                                <div class="emergency-box">
                                    <h5>🚨 Emergency Helplines</h5>
                                    <p>Women: <strong>181</strong> | Police: <strong>100</strong></p>
                                    ${!size.compact ? `<p>Ambulance: <strong>108</strong> | Emergency: <strong>112</strong></p>` : ''}
                                </div>
                                
                                ${size.showFeatures ? `
                                <div class="footer-note">
                                    ${new Date().toLocaleDateString()} | Nirbhaya
                                </div>
                                ` : ''}
                            </div>
                        </div>
                    </div>
                    ` : ''}
                </div>
                <script>
                    window.onload = function() {
                        setTimeout(function() {
                            window.print();
                            window.close();
                        }, 500);
                    }
                </script>
            </body>
            </html>
        `;
        
        printWindow.document.write(content);
        printWindow.document.close();
    };

    const handleShare = async () => {
        const shareData = {
            title: `Nirbhaya QR Access - ${selectedToken.user?.name || 'User'}`,
            text: `QR Code access for Nirbhaya app. Permissions: ${selectedToken.permissions?.map(p => formatPermission(p)).join(', ')}.`,
            url: window.location.href
        };

        if (navigator.share) {
            try {
                await navigator.share(shareData);
                showSnackbar('Shared successfully');
            } catch (err) {
                if (err.name !== 'AbortError') {
                    showSnackbar('Failed to share', 'error');
                }
            }
        } else {
            const emailSubject = encodeURIComponent(`Nirbhaya QR Code - ${selectedToken.user?.name || 'User'}`);
            const emailBody = encodeURIComponent(
                `Hello,\n\nPlease find the QR code access for Nirbhaya app.\n\nUser: ${selectedToken.user?.name || 'N/A'}\nEmail: ${selectedToken.user?.email || 'N/A'}\nPermissions: ${selectedToken.permissions?.map(p => formatPermission(p)).join(', ')}\nStatus: ${selectedToken.isActive ? 'Active' : 'Revoked'}\n\nYou can scan this QR code using the Nirbhaya app to get access.\n\nDownload Nirbhaya: https://play.google.com/store/apps/details?id=com.nirbhaya.app\n\nThank you.`
            );
            window.location.href = `mailto:?subject=${emailSubject}&body=${emailBody}`;
        }
    };

    const handleShareOnWhatsApp = () => {
        const message = encodeURIComponent(
            `*Nirbhaya QR Code Access*\n\n` +
            `User: ${selectedToken.user?.name || 'N/A'}\n` +
            `Email: ${selectedToken.user?.email || 'N/A'}\n` +
            `Permissions: ${selectedToken.permissions?.map(p => formatPermission(p)).join(', ')}\n` +
            `Status: ${selectedToken.isActive ? 'Active' : 'Revoked'}\n\n` +
            `Download Nirbhaya app and scan this QR code to get access.`
        );
        window.open(`https://wa.me/?text=${message}`, '_blank');
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

    const stats = {
        total: totalCount,
        active: tokens.filter(t => t.isActive).length,
        expired: tokens.filter(t => !t.isActive).length,
        byType: tokens.reduce((acc, t) => {
            acc[t.type] = (acc[t.type] || 0) + 1;
            return acc;
        }, {}),
    };

    const formatPermission = (perm) => {
        return perm.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    };

    const formatTokenType = (type) => {
        return type.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    };

    const getCardConfig = () => CARD_SIZES[selectedCardSize] || CARD_SIZES.NORMAL;

    return (
        <Box sx={{ minHeight: 'calc(100vh - 120px)' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3, flexWrap: 'wrap', gap: 2 }}>
                <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 0.5 }}>
                        <Typography variant="h4" sx={{ fontWeight: 800 }}>
                            QR Permission Management
                        </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                        Manage QR codes and access permissions
                    </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                    <Button 
                        variant="outlined" 
                        startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <RefreshIcon />} 
                        onClick={fetchTokens}
                        disabled={loading}
                    >
                        Refresh
                    </Button>
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
                        sx={{ fontWeight: 600 }}
                    >
                        Force Grant
                    </Button>
                </Box>
            </Box>

            <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6} md={3}>
                    <Paper
                        elevation={0}
                        sx={{
                            p: 2.5,
                            borderRadius: 3,
                            border: '1px solid',
                            borderColor: 'divider',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 2,
                            transition: 'all 0.2s',
                            '&:hover': { borderColor: 'primary.main', boxShadow: 1 }
                        }}
                    >
                        <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: alpha('#6366f1', 0.1), color: '#6366f1' }}>
                            <QrCodeIcon />
                        </Box>
                        <Box>
                            <Typography variant="h4" sx={{ fontWeight: 700, color: '#6366f1', lineHeight: 1 }}>
                                {loading ? <Skeleton width={40} /> : stats.total}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">Total QR Codes</Typography>
                        </Box>
                    </Paper>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Paper
                        elevation={0}
                        sx={{
                            p: 2.5,
                            borderRadius: 3,
                            border: '1px solid',
                            borderColor: 'divider',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 2,
                            transition: 'all 0.2s',
                            '&:hover': { borderColor: 'success.main', boxShadow: 1 }
                        }}
                    >
                        <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: alpha('#10b981', 0.1), color: '#10b981' }}>
                            <CheckCircleIcon />
                        </Box>
                        <Box>
                            <Typography variant="h4" sx={{ fontWeight: 700, color: '#10b981', lineHeight: 1 }}>
                                {loading ? <Skeleton width={40} /> : stats.active}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">Active</Typography>
                        </Box>
                    </Paper>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Paper
                        elevation={0}
                        sx={{
                            p: 2.5,
                            borderRadius: 3,
                            border: '1px solid',
                            borderColor: 'divider',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 2,
                            transition: 'all 0.2s',
                            '&:hover': { borderColor: 'error.main', boxShadow: 1 }
                        }}
                    >
                        <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: alpha('#ef4444', 0.1), color: '#ef4444' }}>
                            <CancelIcon />
                        </Box>
                        <Box>
                            <Typography variant="h4" sx={{ fontWeight: 700, color: '#ef4444', lineHeight: 1 }}>
                                {loading ? <Skeleton width={40} /> : stats.expired}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">Revoked</Typography>
                        </Box>
                    </Paper>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Paper
                        elevation={0}
                        sx={{
                            p: 2.5,
                            borderRadius: 3,
                            border: '1px solid',
                            borderColor: 'divider',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 2,
                            transition: 'all 0.2s',
                            '&:hover': { borderColor: 'warning.main', boxShadow: 1 }
                        }}
                    >
                        <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: alpha('#f59e0b', 0.1), color: '#f59e0b' }}>
                            <TimeIcon />
                        </Box>
                        <Box>
                            <Typography variant="h4" sx={{ fontWeight: 700, color: '#f59e0b', lineHeight: 1 }}>
                                {loading ? <Skeleton width={40} /> : Object.keys(stats.byType).length}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">Types</Typography>
                        </Box>
                    </Paper>
                </Grid>
            </Grid>

            <Card sx={{ mb: 3 }}>
                <Box sx={{ p: 2, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                    <TextField
                        size="small"
                        placeholder="Search by user or email..."
                        value={filter.search}
                        onChange={(e) => setFilter({ ...filter, search: e.target.value })}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
                                </InputAdornment>
                            ),
                            endAdornment: filter.search && (
                                <InputAdornment position="end">
                                    <IconButton size="small" onClick={() => setFilter({ ...filter, search: '' })}>
                                        <CloseIcon sx={{ fontSize: 16 }} />
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }}
                        sx={{ minWidth: 250 }}
                    />

                    <Tabs 
                        value={filter.type} 
                        onChange={(_, v) => setFilter({ ...filter, type: v })}
                        sx={{ minHeight: 40, '& .MuiTab-root': { minHeight: 40 } }}
                    >
                        <Tab value="all" label="All Types" />
                        <Tab value="profile" label="Profile" />
                        <Tab value="permission" label="Permission" />
                        <Tab value="emergency" label="Emergency" />
                        <Tab value="temp_access" label="Temp Access" />
                    </Tabs>

                    <Box sx={{ flex: 1 }} />

                    <Chip
                        label={filter.activeOnly ? 'Active Only' : 'All Status'}
                        onClick={() => setFilter({ ...filter, activeOnly: !filter.activeOnly })}
                        variant={filter.activeOnly ? 'filled' : 'outlined'}
                        color={filter.activeOnly ? 'success' : 'default'}
                        icon={filter.activeOnly ? <CheckCircleIcon sx={{ fontSize: 16 }} /> : undefined}
                        sx={{ fontWeight: 500 }}
                    />

                    <Chip
                        label={`${tokens.length} results`}
                        size="small"
                        variant="outlined"
                    />
                </Box>
            </Card>

            <Card>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow sx={{ bgcolor: 'background.default' }}>
                                <TableCell padding="checkbox" sx={{ fontWeight: 600 }}>
                                    <Checkbox
                                        checked={selectedTokens.length === tokens.length && tokens.length > 0}
                                        indeterminate={selectedTokens.length > 0 && selectedTokens.length < tokens.length}
                                        onChange={handleSelectAll}
                                        size="small"
                                    />
                                </TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>User</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Permissions</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Usage</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Expires</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Created</TableCell>
                                <TableCell align="right" sx={{ fontWeight: 600 }}>
                                    {selectedTokens.length > 0 && (
                                        <Button
                                            size="small"
                                            variant="contained"
                                            startIcon={<PrintIcon />}
                                            onClick={handleBulkPrint}
                                            sx={{ ml: 1 }}
                                        >
                                            Print ({selectedTokens.length})
                                        </Button>
                                    )}
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading ? (
                                [...Array(5)].map((_, i) => (
                                    <TableRow key={i}>
                                        {[...Array(8)].map((_, j) => (
                                            <TableCell key={j}><Skeleton /></TableCell>
                                        ))}
                                    </TableRow>
                                ))
                            ) : tokens.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={8} align="center" sx={{ py: 8 }}>
                                        <Box
                                            sx={{
                                                width: 100,
                                                height: 100,
                                                borderRadius: '50%',
                                                bgcolor: alpha('#6366f1', 0.1),
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                mx: 'auto',
                                                mb: 2,
                                            }}
                                        >
                                            <QrCodeIcon sx={{ fontSize: 48, color: '#6366f1' }} />
                                        </Box>
                                        <Typography variant="h6" fontWeight={600} sx={{ mb: 0.5 }}>
                                            {filter.search ? 'No Matching QR Codes' : 'No QR Codes Yet'}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                            {filter.search 
                                                ? `No QR codes match "${filter.search}"`
                                                : 'Create your first QR code to get started'}
                                        </Typography>
                                        {filter.search && (
                                            <Button 
                                                variant="text" 
                                                onClick={() => setFilter({ ...filter, search: '' })}
                                            >
                                                Clear Search
                                            </Button>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ) : (
                                tokens.map((token) => (
                                    <TableRow 
                                        key={token.id} 
                                        hover
                                        sx={{ 
                                            cursor: 'pointer',
                                            transition: 'background-color 0.15s',
                                            bgcolor: selectedTokens.includes(token.id) ? alpha('#6366f1', 0.08) : 'transparent',
                                            '&:hover': { bgcolor: alpha('#6366f1', 0.04) }
                                        }}
                                        onClick={(e) => {
                                            if (e.target.type !== 'checkbox') {
                                                setSelectedToken(token); setViewDialogOpen(true);
                                            }
                                        }}
                                    >
                                        <TableCell padding="checkbox" onClick={(e) => e.stopPropagation()}>
                                            <Checkbox
                                                checked={selectedTokens.includes(token.id)}
                                                onChange={() => handleSelectToken(token.id)}
                                                size="small"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                <Avatar sx={{ width: 36, height: 36, bgcolor: 'primary.main', fontSize: '0.875rem' }}>
                                                    {(token.user?.name || token.user?.email || 'U').charAt(0)}
                                                </Avatar>
                                                <Box>
                                                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                                        {token.user?.name || 'Unknown User'}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        {token.user?.email || 'No email'}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={formatTokenType(token.type)}
                                                size="small"
                                                sx={{
                                                    bgcolor: alpha(getTokenTypeColor(token.type), 0.1),
                                                    color: getTokenTypeColor(token.type),
                                                    fontWeight: 600,
                                                    fontSize: '0.7rem',
                                                }}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                                                {token.permissions?.slice(0, 2).map((perm) => (
                                                    <Chip
                                                        key={perm}
                                                        label={formatPermission(perm)}
                                                        size="small"
                                                        sx={{
                                                            bgcolor: alpha(getPermissionColor(perm), 0.1),
                                                            color: getPermissionColor(perm),
                                                            fontSize: '0.65rem',
                                                            height: 22,
                                                            fontWeight: 500,
                                                        }}
                                                    />
                                                ))}
                                                {token.permissions?.length > 2 && (
                                                    <Chip
                                                        label={`+${token.permissions.length - 2}`}
                                                        size="small"
                                                        sx={{
                                                            bgcolor: 'action.hover',
                                                            fontSize: '0.65rem',
                                                            height: 22,
                                                        }}
                                                    />
                                                )}
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                                {token.useCount || 0} / {token.maxUses || '∞'}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={token.isActive ? 'Active' : 'Revoked'}
                                                size="small"
                                                sx={{
                                                    bgcolor: token.isActive ? alpha('#10b981', 0.1) : alpha('#ef4444', 0.1),
                                                    color: token.isActive ? '#10b981' : '#ef4444',
                                                    fontWeight: 600,
                                                    fontSize: '0.7rem',
                                                }}
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
                                        <TableCell align="right" onClick={(e) => e.stopPropagation()}>
                                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
                                                <Tooltip title="View Details">
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => { setSelectedToken(token); setViewDialogOpen(true); }}
                                                    >
                                                        <VisibilityIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
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
                                            </Box>
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
                    rowsPerPageOptions={[10, 25, 50, 100]}
                />
            </Card>

            <Dialog open={grantDialogOpen} onClose={() => setGrantDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box sx={{ p: 1, borderRadius: 1.5, bgcolor: alpha('#10b981', 0.1), color: '#10b981' }}>
                            <GrantIcon />
                        </Box>
                        Force Grant Permission
                    </Box>
                    <IconButton onClick={() => setGrantDialogOpen(false)}>
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent>
                    <Alert severity="info" sx={{ mt: 1, mb: 2 }}>
                        This will grant permission directly to a user without QR code verification.
                    </Alert>
                    <Box sx={{ pt: 1, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                        <TextField
                            label="Target User ID"
                            value={grantForm.targetUserId}
                            onChange={(e) => setGrantForm({ ...grantForm, targetUserId: e.target.value })}
                            fullWidth
                            required
                            size="small"
                        />
                        <FormControl fullWidth required size="small">
                            <InputLabel>Permission Type</InputLabel>
                            <Select
                                value={grantForm.permissionType}
                                onChange={(e) => setGrantForm({ ...grantForm, permissionType: e.target.value })}
                                label="Permission Type"
                            >
                                {Object.entries(PERMISSION_TYPES).map(([key, value]) => (
                                    <MenuItem key={value} value={value}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Box
                                                sx={{
                                                    width: 8,
                                                    height: 8,
                                                    borderRadius: '50%',
                                                    bgcolor: getPermissionColor(value),
                                                }}
                                            />
                                            {formatPermission(value)}
                                        </Box>
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
                            size="small"
                            placeholder="Reason for granting this permission"
                        />
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 2.5 }}>
                    <Button onClick={() => setGrantDialogOpen(false)}>Cancel</Button>
                    <Button
                        variant="contained"
                        onClick={handleForceGrant}
                        disabled={!grantForm.targetUserId || !grantForm.permissionType}
                    >
                        Grant Permission
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog open={logsDialogOpen} onClose={() => setLogsDialogOpen(false)} maxWidth="md" fullWidth>
                <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box sx={{ p: 1, borderRadius: 1.5, bgcolor: alpha('#6366f1', 0.1), color: '#6366f1' }}>
                            <HistoryIcon />
                        </Box>
                        Access Logs
                    </Box>
                    <IconButton onClick={() => setLogsDialogOpen(false)}>
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent sx={{ p: 0 }}>
                    {logsLoading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                            <CircularProgress />
                        </Box>
                    ) : accessLogs.length === 0 ? (
                        <Box sx={{ textAlign: 'center', p: 4 }}>
                            <HistoryIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                            <Typography variant="h6" color="text.secondary">
                                No Access Logs
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Access logs will appear here when QR codes are scanned
                            </Typography>
                        </Box>
                    ) : (
                        <TableContainer sx={{ maxHeight: 500 }}>
                            <Table size="small" stickyHeader>
                                <TableHead>
                                    <TableRow>
                                        <TableCell sx={{ fontWeight: 600, bgcolor: 'background.paper' }}>Owner</TableCell>
                                        <TableCell sx={{ fontWeight: 600, bgcolor: 'background.paper' }}>Accessor</TableCell>
                                        <TableCell sx={{ fontWeight: 600, bgcolor: 'background.paper' }}>Type</TableCell>
                                        <TableCell sx={{ fontWeight: 600, bgcolor: 'background.paper' }}>Result</TableCell>
                                        <TableCell sx={{ fontWeight: 600, bgcolor: 'background.paper' }}>Time</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {accessLogs.map((log) => (
                                        <TableRow key={log.id} hover>
                                            <TableCell>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <Avatar sx={{ width: 28, height: 28, fontSize: '0.75rem', bgcolor: 'primary.main' }}>
                                                        {(log.owner_first_name || 'U').charAt(0)}
                                                    </Avatar>
                                                    <Typography variant="body2">
                                                        {log.owner_first_name} {log.owner_last_name}
                                                    </Typography>
                                                </Box>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2">
                                                    {log.accessor_id 
                                                        ? `${log.first_name || ''} ${log.last_name || ''}`.trim() || 'Unknown'
                                                        : 'Anonymous'
                                                    }
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={formatTokenType(log.access_type)}
                                                    size="small"
                                                    sx={{
                                                        bgcolor: alpha(getTokenTypeColor(log.access_type), 0.1),
                                                        color: getTokenTypeColor(log.access_type),
                                                        fontSize: '0.65rem',
                                                        fontWeight: 500,
                                                    }}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={log.access_result}
                                                    size="small"
                                                    sx={{
                                                        bgcolor: log.access_result === 'granted' ? alpha('#10b981', 0.1) : alpha('#ef4444', 0.1),
                                                        color: log.access_result === 'granted' ? '#10b981' : '#ef4444',
                                                        fontWeight: 600,
                                                        fontSize: '0.7rem',
                                                    }}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="caption" color="text.secondary">
                                                    {new Date(log.accessed_at).toLocaleString()}
                                                </Typography>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setLogsDialogOpen(false)}>Close</Button>
                </DialogActions>
            </Dialog>

            <Dialog 
                open={viewDialogOpen} 
                onClose={() => setViewDialogOpen(false)} 
                maxWidth="sm" 
                fullWidth
            >
                {selectedToken && (
                    <>
                        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Box sx={{ p: 1, borderRadius: 1.5, bgcolor: alpha(getTokenTypeColor(selectedToken.type), 0.1), color: getTokenTypeColor(selectedToken.type) }}>
                                    <QrCodeIcon />
                                </Box>
                                QR Code Details
                            </Box>
                            <Box sx={{ display: 'flex', gap: 0.5 }}>
                                <Tooltip title="View QR Card">
                                    <IconButton 
                                        size="small"
                                        onClick={() => setQrPreviewOpen(true)}
                                        color="primary"
                                    >
                                        <CardIcon />
                                    </IconButton>
                                </Tooltip>
                                <Tooltip title="Download PDF">
                                    <IconButton 
                                        size="small"
                                        onClick={handleDownloadPDF}
                                        color="primary"
                                    >
                                        <DownloadIcon />
                                    </IconButton>
                                </Tooltip>
                                <Tooltip title="Print">
                                    <IconButton 
                                        size="small"
                                        onClick={handlePrint}
                                    >
                                        <PrintIcon />
                                    </IconButton>
                                </Tooltip>
                                <Tooltip title="Share">
                                    <IconButton 
                                        size="small"
                                        onClick={handleShare}
                                    >
                                        <ShareIcon />
                                    </IconButton>
                                </Tooltip>
                                <IconButton onClick={() => setViewDialogOpen(false)}>
                                    <CloseIcon />
                                </IconButton>
                            </Box>
                        </DialogTitle>
                        <DialogContent>
                            <Paper variant="outlined" sx={{ p: 2, mb: 2, borderRadius: 2 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                                    <Avatar sx={{ width: 48, height: 48, bgcolor: 'primary.main', fontSize: '1.25rem' }}>
                                        {(selectedToken.user?.name || selectedToken.user?.email || 'U').charAt(0)}
                                    </Avatar>
                                    <Box sx={{ flex: 1 }}>
                                        <Typography variant="h6" fontWeight={700}>
                                            {selectedToken.user?.name || 'Unknown User'}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            {selectedToken.user?.email || 'No email'}
                                        </Typography>
                                    </Box>
                                    <Chip
                                        label={selectedToken.isActive ? 'Active' : 'Revoked'}
                                        sx={{
                                            bgcolor: selectedToken.isActive ? alpha('#10b981', 0.1) : alpha('#ef4444', 0.1),
                                            color: selectedToken.isActive ? '#10b981' : '#ef4444',
                                            fontWeight: 600,
                                        }}
                                    />
                                </Box>
                                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                    <Chip
                                        label={formatTokenType(selectedToken.type)}
                                        sx={{
                                            bgcolor: alpha(getTokenTypeColor(selectedToken.type), 0.1),
                                            color: getTokenTypeColor(selectedToken.type),
                                            fontWeight: 600,
                                        }}
                                    />
                                    <Chip
                                        label={`ID: ${selectedToken.id}`}
                                        size="small"
                                        variant="outlined"
                                        sx={{ fontFamily: 'monospace' }}
                                    />
                                </Box>
                            </Paper>

                            <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ display: 'block', mb: 1 }}>
                                PERMISSIONS
                            </Typography>
                            <Paper variant="outlined" sx={{ p: 2, mb: 2, borderRadius: 2 }}>
                                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                    {selectedToken.permissions?.map((perm) => (
                                        <Chip
                                            key={perm}
                                            label={formatPermission(perm)}
                                            sx={{
                                                bgcolor: alpha(getPermissionColor(perm), 0.1),
                                                color: getPermissionColor(perm),
                                                fontWeight: 500,
                                            }}
                                        />
                                    ))}
                                </Box>
                            </Paper>

                            <Grid container spacing={2}>
                                <Grid item xs={6}>
                                    <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ display: 'block', mb: 0.5 }}>
                                        USAGE
                                    </Typography>
                                    <Typography variant="body2">
                                        {selectedToken.useCount || 0} / {selectedToken.maxUses || '∞'} uses
                                    </Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ display: 'block', mb: 0.5 }}>
                                        EXPIRES
                                    </Typography>
                                    <Typography variant="body2">
                                        {selectedToken.expiresAt ? new Date(selectedToken.expiresAt).toLocaleString() : 'Never'}
                                    </Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ display: 'block', mb: 0.5 }}>
                                        CREATED
                                    </Typography>
                                    <Typography variant="body2">
                                        {new Date(selectedToken.createdAt).toLocaleString()}
                                    </Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ display: 'block', mb: 0.5 }}>
                                        UPDATED
                                    </Typography>
                                    <Typography variant="body2">
                                        {selectedToken.updatedAt ? new Date(selectedToken.updatedAt).toLocaleString() : 'N/A'}
                                    </Typography>
                                </Grid>
                            </Grid>
                        </DialogContent>
                        <DialogActions sx={{ p: 2.5, justifyContent: 'space-between' }}>
                            <Box>
                                <Button 
                                    variant="outlined" 
                                    startIcon={<EmailIcon />}
                                    size="small"
                                    onClick={() => {
                                        const emailSubject = encodeURIComponent(`Nirbhaya QR Code - ${selectedToken.user?.name}`);
                                        const emailBody = encodeURIComponent(
                                            `Please find the QR code access for Nirbhaya app.\n\nUser: ${selectedToken.user?.name}\nEmail: ${selectedToken.user?.email}\nPermissions: ${selectedToken.permissions?.map(p => formatPermission(p)).join(', ')}\n\nDownload Nirbhaya app and scan this QR code.`
                                        );
                                        window.location.href = `mailto:?subject=${emailSubject}&body=${emailBody}`;
                                    }}
                                >
                                    Email
                                </Button>
                                <Button 
                                    variant="outlined" 
                                    startIcon={<WhatsAppIcon />}
                                    size="small"
                                    sx={{ ml: 1 }}
                                    onClick={handleShareOnWhatsApp}
                                >
                                    WhatsApp
                                </Button>
                            </Box>
                            <Box>
                                <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
                                {selectedToken.isActive && (
                                    <Button
                                        variant="contained"
                                        color="error"
                                        startIcon={<DeleteIcon />}
                                        onClick={() => {
                                            handleRevoke(selectedToken.id);
                                            setViewDialogOpen(false);
                                        }}
                                    >
                                        Revoke
                                    </Button>
                                )}
                            </Box>
                        </DialogActions>
                    </>
                )}
            </Dialog>

            {/* QR Card Preview Dialog */}
            <Dialog
                open={qrPreviewOpen}
                onClose={() => setQrPreviewOpen(false)}
                maxWidth="md"
                fullWidth
            >
                {selectedToken && (
                    <>
                        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Box sx={{ p: 1, borderRadius: 1.5, bgcolor: alpha('#6366f1', 0.1), color: '#6366f1' }}>
                                    <CardIcon />
                                </Box>
                                QR Card Preview
                            </Box>
                            <Box sx={{ display: 'flex', gap: 0.5 }}>
                                <Tooltip title="Download PDF">
                                    <IconButton size="small" onClick={handleDownloadPDF} color="primary">
                                        <DownloadIcon />
                                    </IconButton>
                                </Tooltip>
                                <Tooltip title="Print">
                                    <IconButton size="small" onClick={handlePrint}>
                                        <PrintIcon />
                                    </IconButton>
                                </Tooltip>
                                <Tooltip title="Share">
                                    <IconButton size="small" onClick={handleShare}>
                                        <ShareIcon />
                                    </IconButton>
                                </Tooltip>
                                <IconButton onClick={() => setQrPreviewOpen(false)}>
                                    <CloseIcon />
                                </IconButton>
                            </Box>
                        </DialogTitle>
                        <DialogContent sx={{ p: 3 }}>
                            {/* Card Size Selector */}
                            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3, gap: 1 }}>
                                <Typography variant="body2" color="text.secondary" sx={{ alignSelf: 'center', mr: 1 }}>Card Size:</Typography>
                                <Chip
                                    icon={<KeyIcon />}
                                    label="Key Ring"
                                    onClick={() => setSelectedCardSize('SMALL')}
                                    color={selectedCardSize === 'SMALL' ? 'primary' : 'default'}
                                    variant={selectedCardSize === 'SMALL' ? 'filled' : 'outlined'}
                                    sx={{ fontWeight: 500 }}
                                />
                                <Chip
                                    icon={<CardIcon />}
                                    label="ID Card"
                                    onClick={() => setSelectedCardSize('NORMAL')}
                                    color={selectedCardSize === 'NORMAL' ? 'primary' : 'default'}
                                    variant={selectedCardSize === 'NORMAL' ? 'filled' : 'outlined'}
                                    sx={{ fontWeight: 500 }}
                                />
                                <Chip
                                    icon={<LargeIcon />}
                                    label="Large"
                                    onClick={() => setSelectedCardSize('LARGE')}
                                    color={selectedCardSize === 'LARGE' ? 'primary' : 'default'}
                                    variant={selectedCardSize === 'LARGE' ? 'filled' : 'outlined'}
                                    sx={{ fontWeight: 500 }}
                                />
                            </Box>
                            <Box 
                                ref={qrCardRef}
                                sx={{ 
                                    display: 'flex', 
                                    gap: 3, 
                                    justifyContent: 'center',
                                    flexWrap: 'wrap'
                                }}
                            >
                                {/* Front Card */}
                                <Paper 
                                    elevation={3}
                                    sx={{ 
                                        width: getCardConfig().width || 320, 
                                        minHeight: getCardConfig().width * 1.5 || 480,
                                        height: getCardConfig().width * 1.5 || 480,
                                        borderRadius: 3, 
                                        overflow: 'hidden',
                                        transition: 'transform 0.2s',
                                        '&:hover': { transform: 'scale(1.02)' }
                                    }}
                                >
                                    {/* Header - Always show */}
                                    <Box sx={{ 
                                        bgcolor: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                                        background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                                        p: getCardConfig().compact ? 1.5 : 2.5,
                                        textAlign: 'center',
                                        color: 'white'
                                    }}>
                                        <Typography 
                                            variant={getCardConfig().compact ? 'body1' : 'h6'} 
                                            fontWeight={800} 
                                            sx={{ letterSpacing: getCardConfig().compact ? 1 : 2 }}
                                        >
                                            NIRBHAYA
                                        </Typography>
                                        {!getCardConfig().compact && (
                                            <Typography variant="caption" sx={{ opacity: 0.9, display: 'block', mt: 0.5 }}>
                                                Your Safety Companion
                                            </Typography>
                                        )}
                                        <Box sx={{ 
                                            mt: 1, 
                                            display: 'inline-block',
                                            bgcolor: 'rgba(255,255,255,0.2)', 
                                            px: getCardConfig().compact ? 1 : 2, 
                                            py: 0.5, 
                                            borderRadius: 3,
                                            fontSize: getCardConfig().compact ? 8 : 10
                                        }}>
                                            QR Access Card
                                        </Box>
                                    </Box>
                                    
                                    {/* QR Code - Always show */}
                                    <Box sx={{ p: getCardConfig().compact ? 1.5 : 3, bgcolor: 'white', textAlign: 'center' }}>
                                        <QRLazyWrapper selectedToken={selectedToken}>
                                            {(LoadedQR) => (
                                                <Box 
                                                    id="qr-code-preview"
                                                    sx={{ 
                                                        display: 'inline-block', 
                                                        p: getCardConfig().compact ? 1 : 2, 
                                                        bgcolor: 'white',
                                                        borderRadius: 2,
                                                        border: '2px solid #f3f4f6'
                                                    }}
                                                >
                                                    <LoadedQR
                                                        value={generateQRValue(selectedToken)}
                                                        size={getCardConfig().qrSize}
                                                        level="H"
                                                        includeMargin
                                                    />
                                                </Box>
                                            )}
                                        </QRLazyWrapper>
                                        
                                        {/* User Info - Show for Normal & Large */}
                                        {!getCardConfig().compact && (
                                            <Box sx={{ mt: 2 }}>
                                                <Typography variant="h6" fontWeight={700} color="text.primary">
                                                    {selectedToken.user?.name || 'Unknown User'}
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    {selectedToken.user?.email || 'No email'}
                                                </Typography>
                                                <Chip
                                                    label={selectedToken.isActive ? 'Active' : 'Revoked'}
                                                    size="small"
                                                    sx={{ 
                                                        mt: 1,
                                                        bgcolor: selectedToken.isActive ? alpha('#10b981', 0.1) : alpha('#ef4444', 0.1),
                                                        color: selectedToken.isActive ? '#10b981' : '#ef4444',
                                                        fontWeight: 600,
                                                    }}
                                                />
                                            </Box>
                                        )}
                                    </Box>
                                    
                                    {/* Footer with permissions - Show for Normal & Large */}
                                    {getCardConfig().showPermissions && (
                                        <Box sx={{ p: 2, bgcolor: '#f8fafc', borderTop: '1px solid #e2e8f0' }}>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <Typography variant="caption" color="text.secondary">
                                                    <strong>Type:</strong> {formatTokenType(selectedToken.type)}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    <strong>ID:</strong> {selectedToken.id?.slice(0, 8)}...
                                                </Typography>
                                            </Box>
                                            {selectedToken.permissions?.length > 0 && (
                                                <Box sx={{ mt: 1, display: 'flex', gap: 0.5, flexWrap: 'wrap', justifyContent: 'center' }}>
                                                    {selectedToken.permissions?.slice(0, 3).map((perm) => (
                                                        <Chip
                                                            key={perm}
                                                            label={formatPermission(perm)}
                                                            size="small"
                                                            sx={{
                                                                bgcolor: alpha(getPermissionColor(perm), 0.1),
                                                                color: getPermissionColor(perm),
                                                                fontWeight: 500,
                                                                fontSize: 9,
                                                                height: 20
                                                            }}
                                                        />
                                                    ))}
                                                </Box>
                                            )}
                                        </Box>
                                    )}
                                    
                                    {/* Compact footer for Small - just status */}
                                    {getCardConfig().compact && (
                                        <Box sx={{ p: 1, bgcolor: '#f8fafc', borderTop: '1px solid #e2e8f0', textAlign: 'center' }}>
                                            <Typography variant="caption" color={selectedToken.isActive ? 'success.main' : 'error.main'} fontWeight={600}>
                                                {selectedToken.isActive ? 'Active' : 'Revoked'}
                                            </Typography>
                                        </Box>
                                    )}
                                </Paper>

                                {/* Back Card - Only show for Normal & Large */}
                                {getCardConfig().showBack && (
                                <Paper 
                                    elevation={3}
                                    sx={{ 
                                        width: getCardConfig().width || 320, 
                                        minHeight: getCardConfig().width * 1.5 || 480,
                                        height: getCardConfig().width * 1.5 || 480,
                                        borderRadius: 3, 
                                        overflow: 'hidden',
                                        background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
                                        color: 'white',
                                        transition: 'transform 0.2s',
                                        '&:hover': { transform: 'scale(1.02)' }
                                    }}
                                >
                                    <Box sx={{ 
                                        p: getCardConfig().compact ? 1.5 : 2.5, 
                                        background: 'rgba(255,255,255,0.1)',
                                        textAlign: 'center'
                                    }}>
                                        <Typography variant={getCardConfig().compact ? 'body1' : 'h6'} fontWeight={800} sx={{ letterSpacing: 1 }}>
                                            NIRBHAYA
                                        </Typography>
                                        {!getCardConfig().compact && (
                                            <Typography variant="caption" sx={{ opacity: 0.8, display: 'block', mt: 0.5 }}>
                                                Empowering Women's Safety
                                            </Typography>
                                        )}
                                    </Box>
                                    
                                    <Box sx={{ p: getCardConfig().compact ? 1.5 : 3 }}>
                                        {/* Show Features only for Large */}
                                        {getCardConfig().showFeatures && (
                                            <>
                                                <Typography variant="subtitle2" fontWeight={600} sx={{ color: '#a5b4fc', mb: 1, fontSize: 11, borderBottom: '1px solid rgba(255,255,255,0.1)', pb: 1 }}>
                                                    KEY FEATURES
                                                </Typography>
                                                <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mb: 2 }}>
                                                    {['🚨 SOS', '📍 Location', '👨‍👩‍👧 Family', '🤖 AI', '🛡️ Safe Zones'].map((feature, i) => (
                                                        <Chip
                                                            key={i}
                                                            label={feature}
                                                            size="small"
                                                            sx={{
                                                                bgcolor: 'rgba(255,255,255,0.1)',
                                                                color: 'white',
                                                                fontSize: 8,
                                                                height: 20
                                                            }}
                                                        />
                                                    ))}
                                                </Box>
                                            </>
                                        )}
                                        
                                        {/* App Download - Always show in back */}
                                        <Box sx={{ 
                                            p: getCardConfig().compact ? 1.5 : 2, 
                                            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                                            borderRadius: 2,
                                            textAlign: 'center',
                                            mb: getCardConfig().compact ? 1 : 2
                                        }}>
                                            <Typography variant="subtitle2" fontWeight={600} sx={{ fontSize: getCardConfig().compact ? 10 : 12 }}>
                                                Download Nirbhaya
                                            </Typography>
                                            <Typography variant="caption" sx={{ opacity: 0.9, fontSize: getCardConfig().compact ? 8 : 10 }}>
                                                Play Store & App Store
                                            </Typography>
                                        </Box>
                                        
                                        {/* Emergency Helplines - Always show */}
                                        <Box sx={{ 
                                            p: getCardConfig().compact ? 1 : 1.5, 
                                            bgcolor: 'rgba(239, 68, 68, 0.2)',
                                            borderRadius: 2,
                                            border: '1px solid rgba(239, 68, 68, 0.3)'
                                        }}>
                                            <Typography variant="subtitle2" fontWeight={600} sx={{ color: '#fca5a5', fontSize: getCardConfig().compact ? 9 : 12, mb: 0.5 }}>
                                                🚨 Emergency Helplines
                                            </Typography>
                                            <Typography variant="caption" sx={{ display: 'block', lineHeight: 1.6, opacity: 0.9, fontSize: getCardConfig().compact ? 8 : 10 }}>
                                                Women: <strong>181</strong> | Police: <strong>100</strong><br/>
                                                {!getCardConfig().compact && (
                                                    <>Ambulance: <strong>108</strong> | Emergency: <strong>112</strong></>
                                                )}
                                            </Typography>
                                        </Box>
                                        
                                        {/* Footer - Only for Large */}
                                        {getCardConfig().showFeatures && (
                                            <Typography variant="caption" sx={{ display: 'block', textAlign: 'center', mt: 2, opacity: 0.6, fontSize: 8 }}>
                                                {new Date().toLocaleDateString()} | Nirbhaya
                                            </Typography>
                                        )}
                                    </Box>
                                </Paper>
                                )}
                            </Box>
                            
                            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
                                <Button
                                    variant="contained"
                                    startIcon={<DownloadIcon />}
                                    onClick={() => handleDownloadPDF()}
                                >
                                    Download {CARD_SIZES[selectedCardSize]?.name} PDF
                                </Button>
                                <Button
                                    variant="outlined"
                                    startIcon={<PrintIcon />}
                                    onClick={() => handlePrint()}
                                >
                                    Print {CARD_SIZES[selectedCardSize]?.name} Cards
                                </Button>
                                <Button
                                    variant="outlined"
                                    startIcon={<ShareIcon />}
                                    onClick={handleShare}
                                >
                                    Share
                                </Button>
                            </Box>
                        </DialogContent>
                    </>
                )}
            </Dialog>

            {/* Bulk Print Dialog */}
            <Dialog
                open={bulkPrintDialogOpen}
                onClose={() => setBulkPrintDialogOpen(false)}
                maxWidth="xs"
                fullWidth
            >
                <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PrintIcon color="primary" />
                    Bulk Print QR Cards
                </DialogTitle>
                <DialogContent>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                        Select card size for printing {selectedTokens.length} QR code(s)
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                        {Object.entries(CARD_SIZES).map(([key, size]) => (
                            <Button
                                key={key}
                                variant="outlined"
                                onClick={() => handleBulkPrintAction(key)}
                                sx={{ flex: 1 }}
                            >
                                {size.name}
                            </Button>
                        ))}
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setBulkPrintDialogOpen(false)}>Cancel</Button>
                </DialogActions>
            </Dialog>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert severity={snackbar.severity || 'info'} onClose={() => setSnackbar({ ...snackbar, open: false })}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default QRManagement;
