import { Container, Stack, TextField, Button, Typography, CircularProgress, Alert, Box, Paper, useTheme } from "@mui/material";
import LogoImg from '../../assets/logo.png';
import ImageEl from "../../components/utils/Image.El.jsx";
import { useState, useCallback, useEffect } from "react";
import { auth } from "../../firebase";
import { login, register } from "../../services/auth";
import { useNavigate } from "react-router-dom";
import useStore from "../../store";
import { motion } from "framer-motion";

const initForm = { email: '', password: '' };

const AuthScreen = () => {
  const navigate = useNavigate();
  const { setToastrMsg } = useStore();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        navigate('/boards');
      }
    });
    return () => unsubscribe();
  }, [navigate, auth]);

  const theme = useTheme();
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState(initForm);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const authText = isLogin ? "Don't have an account?" : "Already have an account?";

  const validateForm = useCallback(() => {
    const newErrors = {};
    if (!form.email) newErrors.email = 'Email is required';
    if (!form.password) newErrors.password = 'Password is required';
    if (form.email && !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(form.email)) {
      newErrors.email = 'Invalid email address';
    }
    if (form.password && form.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [form]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm(prevForm => ({ ...prevForm, [name]: value }));
    if (errors[name]) {
      setErrors(prevErrors => ({ ...prevErrors, [name]: '', submit: '' }));
    }
  };

  const handleSubmit = useCallback(async (e) => {
    e?.preventDefault();
    
    // Clear previous errors
    setErrors({});
    
    // Client-side validation
    if (!form.email.trim()) {
      setErrors(prev => ({ ...prev, email: 'Email is required' }));
      return;
    }
    
    if (!form.password.trim()) {
      setErrors(prev => ({ ...prev, password: 'Password is required' }));
      return;
    }
    
    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      setErrors(prev => ({ ...prev, email: 'Please enter a valid email address' }));
      return;
    }
    
    // Password length validation
    if (form.password.length < 6) {
      setErrors(prev => ({ ...prev, password: 'Password must be at least 6 characters' }));
      return;
    }

    try {
      setIsLoading(true);
      
      if (isLogin) {
        await login(form.email, form.password);
      } else {
        await register(form.email, form.password);
      }
      
      // Reset form on successful authentication
      setForm(initForm);
      setErrors({});
      
    } catch (error) {
      console.error('Authentication error:', error);
      
      // Handle specific error cases
      let errorMessage = error.message || 'Authentication failed. Please try again.';
      
      // Update the error state
      setErrors(prev => ({
        ...prev,
        submit: errorMessage,
        // Add field-specific errors if available
        ...(error.field === 'email' && { email: errorMessage }),
        ...(error.field === 'password' && { password: errorMessage })
      }));
      
      // Scroll to top to show error message
      window.scrollTo({ top: 0, behavior: 'smooth' });
      
    } finally {
      setIsLoading(false);
    }
  }, [form, isLogin]);

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      handleSubmit();
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.palette.background.default,
        p: 2
      }}
    >
      <Container maxWidth="sm" component="main">
        <Paper
          elevation={3}
          sx={{
            p: { xs: 3, sm: 4 },
            borderRadius: 2,
            backgroundColor: 'background.paper',
            boxShadow: theme.shadows[3]
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Stack spacing={4} alignItems="center" sx={{ textAlign: 'center' }}>
              {/* Logo */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <ImageEl 
                  src={LogoImg} 
                  alt="TP Board" 
                  style={{
                    width: '120px',
                    height: '120px',
                    borderRadius: '50%',
                    border: `3px solid ${theme.palette.divider}`,
                    boxShadow: theme.shadows[2]
                  }}
                />
              </motion.div>

              {/* Toggle Auth Mode Button */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <Button
                  onClick={() => {
                    setIsLogin(!isLogin);
                    setForm(initForm);
                    setErrors({});
                  }}
                  variant="text"
                  color="primary"
                  size="small"
                  sx={{
                    textTransform: 'none',
                    color: 'text.primary',
                    '&:hover': {
                      backgroundColor: 'action.hover',
                    }
                  }}
                >
                  {authText}{' '}
                  <Box component="span" sx={{ 
                    color: 'primary.main', 
                    ml: 0.5,
                    fontWeight: 600 
                  }}>
                    {isLogin ? 'Sign Up' : 'Sign In'}
                  </Box>
                </Button>
              </motion.div>

              {/* App Title */}
              <Typography
                variant="h4"
                sx={{
                  color: 'primary.main',
                  fontWeight: 'bold',
                  letterSpacing: '0.5px',
                  textTransform: 'uppercase',
                  position: 'relative',
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    bottom: -8,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '40px',
                    height: '3px',
                    backgroundColor: 'primary.main',
                    borderRadius: '2px'
                  }
                }}
              >
                TP Board
              </Typography>

              {/* Welcome Message */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 'bold',
                    mt: 2,
                    textAlign: 'center',
                    background: 'linear-gradient(45deg, #00b4db 0%, #0083b0 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    position: 'relative',
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      bottom: -10,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      width: '60px',
                      height: '3px',
                      background: 'linear-gradient(90deg, #00b4db 0%, #0083b0 100%)',
                      borderRadius: '3px'
                    }
                  }}
                >
                  {isLogin ? 'Welcome Back!' : 'Create Account'}
                </Typography>
              </motion.div>

              {/* Form Section */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
                style={{ width: '100%' }}
              >
                <Typography 
                  align="center"
                  variant="subtitle1" 
                  sx={{ 
                    fontWeight: '300', 
                    maxWidth: '600px',
                    lineHeight: '1.7',
                    color: 'text.secondary',
                    mb: 2
                  }}
                >
                  {isLogin 
                    ? 'Sign in to access your projects and tasks.'
                    : 'Join us to start organizing your work efficiently.'}
                </Typography>

                {/* Auth Form */}
                <Box
                  component="form"
                  onSubmit={handleSubmit}
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2,
                    mt: 2
                  }}
                >
                  <TextField
                    value={form.email}
                    onChange={handleChange}
                    name="email"
                    label="Email"
                    variant="outlined"
                    fullWidth
                    error={Boolean(errors.email)}
                    helperText={errors.email}
                    onKeyPress={handleKeyPress}
                    autoComplete="email"
                    autoFocus
                  />

                  <TextField
                    value={form.password}
                    onChange={handleChange}
                    name="password"
                    label="Password"
                    type="password"
                    variant="outlined"
                    fullWidth
                    error={Boolean(errors.password)}
                    helperText={errors.password}
                    onKeyPress={handleKeyPress}
                    autoComplete={isLogin ? "current-password" : "new-password"}
                  />

                  {errors.submit && (
                    <Alert severity="error" sx={{ width: '100%' }}>
                      {errors.submit}
                    </Alert>
                  )}

                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    style={{ width: '100%' }}
                  >
                    <Button
                      fullWidth
                      type="submit"
                      variant="contained"
                      size="large"
                      disabled={isLoading}
                      sx={{
                        mt: 2,
                        mb: 1,
                        py: 1.5,
                        borderRadius: 1,
                        fontSize: '0.95rem',
                        fontWeight: 600,
                        textTransform: 'none',
                      }}
                      startIcon={isLoading ? <CircularProgress size={22} color="inherit" /> : null}
                    >
                      {isLoading ? (
                        <CircularProgress size={24} color="inherit" />
                      ) : isLogin ? (
                        'Sign In'
                      ) : (
                        'Create Account'
                      )}
                    </Button>
                  </motion.div>

                  <Button
                    onClick={() => {
                      setIsLogin(!isLogin);
                      setForm(initForm);
                      setErrors({});
                    }}
                    color="primary"
                    variant="text"
                    size="small"
                    sx={{
                      mt: 1,
                      textTransform: 'none',
                      fontWeight: 500,
                    }}
                  >
                    <Typography variant="body2">
                      {authText}
                    </Typography>
                  </Button>
                </Box>
              </motion.div>
            </Stack>
          </motion.div>
        </Paper>
      </Container>
    </Box>
  );
};

export default AuthScreen;