import { Container, Stack, TextField, Button, Typography, CircularProgress, Alert } from "@mui/material";
import LogoImg from '../../assets/logo.png';
import ImageEl from "../../components/utils/Image.El.jsx";
import { useState, useCallback, useEffect, useMemo } from "react";
import { auth } from "../../firebase";
import { login, register } from "../../services/auth";
import { useNavigate } from "react-router-dom";
import useStore from "../../store";

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
    <Container maxWidth="sm" sx={{ mt: 8, p: 3 }} component="main">
      <Stack mb={6} spacing={4} alignItems="center" sx={{ textAlign: "center" }}>
        <Stack spacing={2} alignItems="center">
          <ImageEl src={LogoImg} alt="TP Board" />
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
        </Stack>
        <Typography color="rgba(255,255,255, .6)" variant="subtitle1" sx={{ opacity: 0.8, fontWeight: 'light', maxWidth: '600px' }}>
          Task & Performance Management System
          <br />
          Streamline Your Workflow, Enhance Your Productivity
        </Typography>
      </Stack>
      <Stack
        component="form"
        onSubmit={handleSubmit}
        spacing={3}
        sx={{ mt: 6, width: '100%', maxWidth: 360, mx: 'auto' }}
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
        <Button
          type="submit"
          variant="contained"
          size="large"
          fullWidth
          sx={{ mt: 2, position: 'relative' }}
          disabled={!form.email.trim() || !form.password.trim() || Object.keys(errors).length > 0 || isLoading}
        >
          {isLoading ? <CircularProgress size={24} sx={{ position: 'absolute' }} /> : (isLogin ? "Login" : "Register")}
        </Button>
      </Stack>
      <Button
        variant="text"
        onClick={() => setIsLogin(prev => !prev)}
        sx={{
          mt: 3,
          textAlign: "center",
          color: "primary.main",
          '&:hover': {
            textDecoration: "underline"
          }
        }}
      >
        <Typography variant="body2">
          {authText}
        </Typography>
      </Button>
    </Container>
  );
};

export default AuthScreen;