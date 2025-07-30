import { Container, Stack, TextField, Button, Typography, CircularProgress, Alert } from "@mui/material";
import LogoImg from '../../assets/logo.png';
import ImageEl from "../../components/utils/Image.El.jsx";
import { useState, useCallback, useEffect } from "react";
import { auth } from "../../firebase";
import { login, register } from "../../services/auth";
import { useNavigate } from "react-router-dom";

const initForm = { email: '', password: '' };

const AuthScreen = () => {
  const navigate = useNavigate(); // ✅ Move this above useEffect

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        navigate('/dashboard');
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState(initForm);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const authText = isLogin ? "Don't have an account?" : "Already have an account?";

  const validateForm = () => {
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
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm(prevForm => ({ ...prevForm, [name]: value }));
    if (errors[name]) {
      setErrors(prevErrors => ({ ...prevErrors, [name]: '' }));
    }
  };

  const handleSubmit = useCallback(async (e) => {
    e?.preventDefault();
    if (!validateForm()) return;

    try {
      setIsLoading(true);
      setErrors({});

      if (isLogin) {
        await login(form.email, form.password);
      } else {
        await register(form.email, form.password);
      }
    } catch (error) {
      console.error('Authentication error:', error);
      let errorMessage = error.message || 'Authentication failed. Please try again.';

      // If the error comes from our auth service, use its message directly
      // Otherwise, handle Firebase error codes
      if (!error.code) {
        // This is likely an error from our auth service with a custom message
        errorMessage = error.message;
      } else {
        switch (error.code) {
          case 'auth/invalid-credential':
          case 'auth/user-not-found':
          case 'auth/wrong-password':
            errorMessage = 'Invalid email or password. Please check your credentials and try again.';
            break;
          case 'auth/email-already-in-use':
            errorMessage = 'This email is already registered.';
            break;
          case 'auth/weak-password':
            errorMessage = 'Password should be at least 6 characters.';
            break;
          case 'auth/invalid-email':
            errorMessage = 'Please enter a valid email address.';
            break;
          case 'auth/network-request-failed':
            errorMessage = 'Network error. Please check your connection.';
            break;
          case 'auth/too-many-requests':
            errorMessage = 'Too many attempts. Please try again later.';
            break;
          default:
            errorMessage = error.message || errorMessage;
            break;
        }
      }

      setErrors(prev => ({
        ...prev,
        submit: errorMessage
      }));
    } finally {
      setIsLoading(false);
    }
  }, [form, validateForm, isLogin]);

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
      <Typography
        variant="body2"
        sx={{
          cursor: "pointer",
          mt: 3,
          textAlign: "center",
          color: "primary.main",
          '&:hover': {
            textDecoration: "underline"
          }
        }}
        onClick={() => setIsLogin(prev => !prev)}
      >
        {authText}
      </Typography>
    </Container>
  );
};

export default AuthScreen;
