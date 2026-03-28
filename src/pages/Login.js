import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Card,
    CardContent,
    TextField,
    Button,
    Typography,
    Alert,
    InputAdornment,
    IconButton,
    CircularProgress,
    Checkbox,
    FormControlLabel,
    Link,
    alpha,
    keyframes,
} from '@mui/material';
import {
    Visibility,
    VisibilityOff,
    Email as EmailIcon,
    Lock as LockIcon,
    Shield as ShieldIcon,
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser, clearError } from '../store/slices/authSlice';

const floatAnimation = keyframes`
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-10px); }
`;

const pulseGlow = keyframes`
    0%, 100% { box-shadow: 0 0 20px rgba(99, 102, 241, 0.3); }
    50% { box-shadow: 0 0 40px rgba(99, 102, 241, 0.6); }
`;

const shimmer = keyframes`
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
`;

const Login = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { loading, error: reduxError } = useSelector((state) => state.auth);

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [localLoading, setLocalLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [rememberMe, setRememberMe] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const validateForm = () => {
        const newErrors = {};

        if (!email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(email)) {
            newErrors.email = 'Please enter a valid email address';
        }

        if (!password) {
            newErrors.password = 'Password is required';
        } else if (password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        } else if (password.length > 50) {
            newErrors.password = 'Password must be less than 50 characters';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!validateForm()) {
            return;
        }

        setLocalLoading(true);

        try {
            const result = await dispatch(loginUser({ email, password })).unwrap();

            if (result) {
                navigate('/dashboard');
            }
        } catch (err) {
            const errorMessage = typeof err === 'string' ? err : err?.message || 'Login failed. Please check your credentials and try again.';
            setError(errorMessage);
        } finally {
            setLocalLoading(false);
        }
    };

    const handleChange = (field) => (e) => {
        const value = e.target.value;

        if (field === 'email') {
            setEmail(value);
            if (errors.email) setErrors({ ...errors, email: '' });
        } else if (field === 'password') {
            setPassword(value);
            if (errors.password) setErrors({ ...errors, password: '' });
        }

        if (error) setError('');
    };

    useEffect(() => {
        if (reduxError) {
            setError(reduxError);
            dispatch(clearError());
        }
    }, [reduxError, dispatch]);

    const isLoading = loading || localLoading;

    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)',
                p: 2,
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: '-50%',
                    left: '-50%',
                    width: '200%',
                    height: '200%',
                    background: 'radial-gradient(circle, rgba(99, 102, 241, 0.1) 0%, transparent 50%)',
                    animation: `${shimmer} 20s linear infinite`,
                },
            }}
        >
            <Box
                sx={{
                    position: 'absolute',
                    top: '10%',
                    left: '5%',
                    width: 300,
                    height: 300,
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(139, 92, 246, 0.15) 0%, transparent 70%)',
                    filter: 'blur(60px)',
                }}
            />
            <Box
                sx={{
                    position: 'absolute',
                    bottom: '10%',
                    right: '5%',
                    width: 400,
                    height: 400,
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(99, 102, 241, 0.1) 0%, transparent 70%)',
                    filter: 'blur(80px)',
                }}
            />

            <Card
                sx={{
                    maxWidth: 460,
                    width: '100%',
                    background: 'rgba(15, 23, 42, 0.85)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(99, 102, 241, 0.2)',
                    borderRadius: 3,
                    opacity: mounted ? 1 : 0,
                    transform: mounted ? 'translateY(0)' : 'translateY(20px)',
                    transition: 'all 0.6s ease-out',
                    position: 'relative',
                    zIndex: 1,
                    overflow: 'visible',
                }}
            >
                <CardContent sx={{ p: 4 }}>
                    <Box sx={{ textAlign: 'center', mb: 4 }}>
                        <Box
                            sx={{
                                width: 80,
                                height: 80,
                                borderRadius: '20px',
                                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                mx: 'auto',
                                mb: 3,
                                animation: `${floatAnimation} 3s ease-in-out infinite, ${pulseGlow} 2s ease-in-out infinite`,
                            }}
                        >
                            <ShieldIcon sx={{ fontSize: 40, color: 'white' }} />
                        </Box>
                        <Typography 
                            variant="h4" 
                            sx={{ 
                                fontWeight: 800, 
                                mb: 1,
                                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                backgroundClip: 'text',
                            }}
                        >
                            Nirbhaya Admin
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            Safety & Security Management Portal
                        </Typography>
                        <Box 
                            sx={{ 
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 0.5,
                                px: 1.5,
                                py: 0.5,
                                borderRadius: 2,
                                bgcolor: alpha('#10b981', 0.1),
                                border: '1px solid',
                                borderColor: alpha('#10b981', 0.3),
                            }}
                        >
                            <Box 
                                sx={{ 
                                    width: 6, 
                                    height: 6, 
                                    borderRadius: '50%', 
                                    bgcolor: '#10b981',
                                    animation: 'pulse 2s infinite',
                                }} 
                            />
                            <Typography variant="caption" sx={{ color: '#10b981', fontWeight: 600 }}>
                                Secure Connection
                            </Typography>
                        </Box>
                    </Box>

                    {error && (
                        <Alert 
                            severity="error" 
                            sx={{ 
                                mb: 3,
                                borderRadius: 2,
                                bgcolor: alpha('#ef4444', 0.1),
                                border: '1px solid',
                                borderColor: alpha('#ef4444', 0.3),
                                '& .MuiAlert-icon': { color: '#ef4444' }
                            }}
                        >
                            {error}
                        </Alert>
                    )}

                    <form onSubmit={handleSubmit}>
                        <TextField
                            fullWidth
                            label="Email Address"
                            type="email"
                            value={email}
                            onChange={handleChange('email')}
                            error={!!errors.email}
                            helperText={errors.email}
                            required
                            sx={{ 
                                mb: 2.5,
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: 2,
                                    '&:hover fieldset': {
                                        borderColor: 'primary.main',
                                    },
                                }
                            }}
                            disabled={isLoading}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <EmailIcon color="action" />
                                    </InputAdornment>
                                ),
                            }}
                        />

                        <TextField
                            fullWidth
                            label="Password"
                            type={showPassword ? 'text' : 'password'}
                            value={password}
                            onChange={handleChange('password')}
                            error={!!errors.password}
                            helperText={errors.password}
                            required
                            sx={{ 
                                mb: 2,
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: 2,
                                    '&:hover fieldset': {
                                        borderColor: 'primary.main',
                                    },
                                }
                            }}
                            disabled={isLoading}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <LockIcon color="action" />
                                    </InputAdornment>
                                ),
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            onClick={() => setShowPassword(!showPassword)}
                                            edge="end"
                                            disabled={isLoading}
                                            sx={{ color: 'text.secondary' }}
                                        >
                                            {showPassword ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                        />

                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={rememberMe}
                                        onChange={(e) => setRememberMe(e.target.checked)}
                                        size="small"
                                        sx={{ color: 'text.secondary' }}
                                    />
                                }
                                label={
                                    <Typography variant="body2" color="text.secondary">
                                        Remember me
                                    </Typography>
                                }
                            />
                            <Link
                                href="#"
                                variant="body2"
                                sx={{
                                    color: 'primary.main',
                                    textDecoration: 'none',
                                    '&:hover': { textDecoration: 'underline' },
                                }}
                            >
                                Forgot password?
                            </Link>
                        </Box>

                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            size="large"
                            disabled={isLoading}
                            sx={{
                                py: 1.75,
                                borderRadius: 2,
                                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                                fontSize: '1rem',
                                fontWeight: 700,
                                textTransform: 'none',
                                boxShadow: '0 4px 14px rgba(99, 102, 241, 0.4)',
                                '&:hover': {
                                    background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                                    boxShadow: '0 6px 20px rgba(99, 102, 241, 0.5)',
                                },
                                '&:disabled': {
                                    background: 'rgba(99, 102, 241, 0.5)',
                                    boxShadow: 'none',
                                },
                            }}
                        >
                            {isLoading ? (
                                <CircularProgress size={24} color="inherit" />
                            ) : (
                                'Sign In to Dashboard'
                            )}
                        </Button>
                    </form>

                    <Box 
                        sx={{ 
                            mt: 4,
                            pt: 3,
                            borderTop: '1px solid',
                            borderColor: 'divider',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            gap: 1,
                        }}
                    >
                        <ShieldIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                        <Typography variant="caption" color="text.secondary">
                            Protected by Nirbhaya Security Protocol
                        </Typography>
                    </Box>
                </CardContent>
            </Card>
        </Box>
    );
};

export default Login;
