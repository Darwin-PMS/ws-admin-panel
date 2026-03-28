import React, { useState } from 'react';
import {
    Button,
    Menu,
    MenuItem,
    ListItemIcon,
    ListItemText,
    CircularProgress,
    Typography,
    Divider,
} from '@mui/material';
import {
    Download as DownloadIcon,
    FileDownload as FileCsvIcon,
    PictureAsPdf as PdfIcon,
    TableChart as ExcelIcon,
    KeyboardArrowDown as ArrowDownIcon,
} from '@mui/icons-material';

const ExportButton = ({ data, filename = 'export', includeTimestamp = true, buttonProps }) => {
    const [anchorEl, setAnchorEl] = useState(null);
    const [exporting, setExporting] = useState(false);

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const getTimestamp = () => {
        const now = new Date();
        return now.toISOString().split('T')[0];
    };

    const getFilename = (ext) => {
        const base = filename || 'export';
        return includeTimestamp ? `${base}_${getTimestamp()}.${ext}` : `${base}.${ext}`;
    };

    const exportToCSV = () => {
        setExporting(true);
        
        setTimeout(() => {
            try {
                if (!data || data.length === 0) {
                    alert('No data to export');
                    setExporting(false);
                    handleClose();
                    return;
                }

                const headers = Object.keys(data[0]);
                const csvContent = [
                    headers.join(','),
                    ...data.map(row => 
                        headers.map(header => {
                            let cell = row[header];
                            if (cell === null || cell === undefined) cell = '';
                            if (typeof cell === 'string' && (cell.includes(',') || cell.includes('"') || cell.includes('\n'))) {
                                cell = `"${cell.replace(/"/g, '""')}"`;
                            }
                            return cell;
                        }).join(',')
                    )
                ].join('\n');

                const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                const link = document.createElement('a');
                link.href = URL.createObjectURL(blob);
                link.download = getFilename('csv');
                link.click();
                URL.revokeObjectURL(link.href);
            } catch (error) {
                console.error('Export error:', error);
            } finally {
                setExporting(false);
                handleClose();
            }
        }, 500);
    };

    const exportToJSON = () => {
        setExporting(true);
        
        setTimeout(() => {
            try {
                const jsonContent = JSON.stringify(data, null, 2);
                const blob = new Blob([jsonContent], { type: 'application/json' });
                const link = document.createElement('a');
                link.href = URL.createObjectURL(blob);
                link.download = getFilename('json');
                link.click();
                URL.revokeObjectURL(link.href);
            } catch (error) {
                console.error('Export error:', error);
            } finally {
                setExporting(false);
                handleClose();
            }
        }, 500);
    };

    const exportToPDF = () => {
        setExporting(true);
        
        setTimeout(() => {
            try {
                const printContent = `
                    <html>
                    <head><title>${filename}</title>
                    <style>
                        body { font-family: Arial, sans-serif; padding: 20px; }
                        table { border-collapse: collapse; width: 100%; margin-top: 20px; }
                        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                        th { background-color: #6366f1; color: white; }
                        tr:nth-child(even) { background-color: #f2f2f2; }
                    </style>
                    </head>
                    <body>
                    <h1>${filename.replace(/_/g, ' ')}</h1>
                    <p>Exported on: ${new Date().toLocaleString()}</p>
                    <table>
                        <thead>
                            <tr>${data && data.length > 0 ? Object.keys(data[0]).map(key => `<th>${key}</th>`).join('') : ''}</tr>
                        </thead>
                        <tbody>
                            ${data ? data.map(row => `<tr>${Object.values(row).map(val => `<td>${val || ''}</td>`).join('')}</tr>`).join('') : ''}
                        </tbody>
                    </table>
                    </body>
                    </html>
                `;
                
                const printWindow = window.open('', '_blank');
                printWindow.document.write(printContent);
                printWindow.document.close();
                printWindow.print();
            } catch (error) {
                console.error('Export error:', error);
            } finally {
                setExporting(false);
                handleClose();
            }
        }, 500);
    };

    return (
        <>
            <Button
                variant="outlined"
                startIcon={exporting ? <CircularProgress size={18} /> : <DownloadIcon />}
                endIcon={<ArrowDownIcon sx={{ fontSize: 16 }} />}
                onClick={handleClick}
                disabled={exporting || !data}
                sx={{ bgcolor: 'background.paper' }}
                {...buttonProps}
            >
                Export
            </Button>

            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleClose}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                PaperProps={{ sx: { mt: 1, minWidth: 180 } }}
            >
                <MenuItem onClick={exportToCSV} disabled={exporting}>
                    <ListItemIcon>
                        <FileCsvIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>Export as CSV</ListItemText>
                </MenuItem>
                <MenuItem onClick={exportToJSON} disabled={exporting}>
                    <ListItemIcon>
                        <FileCsvIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>Export as JSON</ListItemText>
                </MenuItem>
                <MenuItem onClick={exportToPDF} disabled={exporting}>
                    <ListItemIcon>
                        <PdfIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>Export as PDF</ListItemText>
                </MenuItem>
            </Menu>
        </>
    );
};

export default ExportButton;
