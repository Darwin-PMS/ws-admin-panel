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
} from '@mui/material';
import {
    Visibility,
    VisibilityOff,
    Email as EmailIcon,
    Lock as LockIcon,
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser, clearError } from '../store/slices/authSlice';

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

    // Validate form fields
    const validateForm = () => {
        const newErrors = {};

        // Email validation
        if (!email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(email)) {
            newErrors.email = 'Please enter a valid email address';
        }

        // Password validation
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

        // Validate form
        if (!validateForm()) {
            return;
        }

        setLocalLoading(true);

        try {
            const result = await dispatch(loginUser({ email, password })).unwrap();

            if (result) {
                // Login successful - redirect to dashboard
                navigate('/dashboard');
            }
        } catch (err) {
            // Handle login errors - use Redux error or fallback message
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

        // Clear main error when user starts typing
        if (error) setError('');
    };

    // Sync Redux error to local state
    useEffect(() => {
        if (reduxError) {
            setError(reduxError);
            dispatch(clearError());
        }
    }, [reduxError, dispatch]);

    // Combined loading state
    const isLoading = loading || localLoading;

    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
                p: 2,
            }}
        >
            <Card
                sx={{
                    maxWidth: 440,
                    width: '100%',
                    background: 'rgba(30, 41, 59, 0.8)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(99, 102, 241, 0.2)',
                }}
            >
                <CardContent sx={{ p: 4 }}>
                    {/* Logo */}
                    <Box sx={{ textAlign: 'center', mb: 4 }}>
                        <Box
                            sx={{
                                width: 64,
                                height: 64,
                                borderRadius: 3,
                                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: 700,
                                fontSize: 24,
                                mx: 'auto',
                                mb: 2,
                            }}
                        >
                            AI
                        </Box>
                        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                            Admin Panel
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Sign in to manage your AI ML Application
                        </Typography>
                    </Box>

                    {error && (
                        <Alert severity="error" sx={{ mb: 3 }}>
                            {error}
                        </Alert>
                    )}

                    <form onSubmit={handleSubmit}>
                        <TextField
                            fullWidth
                            label="Email"
                            type="email"
                            value={email}
                            onChange={handleChange('email')}
                            error={!!errors.email}
                            helperText={errors.email}
                            required
                            sx={{ mb: 2 }}
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
                            sx={{ mb: 3 }}
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
                                        >
                                            {showPassword ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                        />

                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            size="large"
                            disabled={isLoading}
                            sx={{
                                py: 1.5,
                                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                                '&:hover': {
                                    background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                                },
                                '&:disabled': {
                                    background: 'rgba(99, 102, 241, 0.5)',
                                },
                            }}
                        >
                            {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Sign In'}
                        </Button>
                    </form>

                    <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mt: 3, textAlign: 'center' }}
                    >
                        Secured Admin Portal • Use your credentials to login
                    </Typography>
                </CardContent>
            </Card>
        </Box>
    );
};

export default Login;
