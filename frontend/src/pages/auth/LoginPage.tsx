import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Link,
  InputAdornment,
  IconButton,
  Alert,
  ToggleButtonGroup,
  ToggleButton,
} from '@mui/material';
import { Visibility, VisibilityOff, Login as LoginIcon, Person, Work, ArrowBack } from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'react-toastify';
import { useAuthStore, UserRole } from '../../store/authStore';
import { login, workerLogin, verifyEmail, resendVerificationCode } from '../../api/authApi';
import VerificationModal from '../../components/auth/VerificationModal';

/**
 * Login Form Validation Schemas
 */
const adminLoginSchema = z.object({
  email: z
    .string()
    .min(1, 'E-Mail ist erforderlich')
    .email('Ungültige E-Mail-Adresse'),
  password: z
    .string()
    .min(6, 'Passwort muss mindestens 6 Zeichen lang sein'),
});

const workerLoginSchema = z.object({
  username: z
    .string()
    .min(3, 'Benutzername ist erforderlich'),
  password: z
    .string()
    .min(6, 'Passwort muss mindestens 6 Zeichen lang sein'),
});

type AdminLoginFormData = z.infer<typeof adminLoginSchema>;
type WorkerLoginFormData = z.infer<typeof workerLoginSchema>;

/**
 * Login Page Component
 * Clean, modern design with white background, blue accents, and green details
 */
const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const setAuth = useAuthStore((state) => state.setAuth);
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const [loginType, setLoginType] = useState<'admin' | 'worker'>('admin');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState('');
  const [savedPassword, setSavedPassword] = useState(''); // Store password for re-login after verification

  // Get the page user was trying to access before being redirected to login
  const from = (location.state as any)?.from?.pathname || null;

  // Automatic localStorage cleanup on mount to clear old/invalid tokens
  useEffect(() => {
    try {
      // Clear auth state to remove any stale tokens
      clearAuth();
    } catch (error) {
      console.error('Error clearing auth:', error);
    }
  }, [clearAuth]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AdminLoginFormData | WorkerLoginFormData>({
    resolver: zodResolver(loginType === 'admin' ? adminLoginSchema : workerLoginSchema),
  });

  // Reset form when switching login type
  useEffect(() => {
    reset();
    setErrorMessage('');
  }, [loginType, reset]);

  const handleVerifyEmail = async (code: string) => {
    // 1. Verify email with code
    await verifyEmail({ email: verificationEmail, code });

    // 2. After successful verification, automatically login
    if (loginType === 'admin') {
      const response = await login({ email: verificationEmail, password: savedPassword });

      if (response.user) {
        setAuth(response.user);
        setShowVerificationModal(false);
        toast.success('Email verifiziert! Erfolgreich angemeldet!');

        // Navigate to appropriate dashboard
        let destination = '/institution/dashboard';
        if (response.user.role === UserRole.ADMIN_APPLICATION) {
          destination = '/admin/dashboard';
        } else if (response.user.role === UserRole.WORKER) {
          destination = '/worker/dashboard';
        }

        navigate(destination, { replace: true });
      }
    }
  };

  const handleResendCode = async () => {
    await resendVerificationCode({ email: verificationEmail });
  };

  const onSubmit = async (data: AdminLoginFormData | WorkerLoginFormData) => {
    setIsLoading(true);
    setErrorMessage('');

    try {
      let response;

      if (loginType === 'admin') {
        const adminData = data as AdminLoginFormData;

        // Save password for re-login after verification
        setSavedPassword(adminData.password);

        response = await login({
          email: adminData.email,
          password: adminData.password,
        });
      } else {
        const workerData = data as WorkerLoginFormData;
        response = await workerLogin({
          username: workerData.username,
          password: workerData.password,
        });
      }

      // Check if email verification is required
      if (response.requiresEmailVerification && response.email) {
        setVerificationEmail(response.email);
        setShowVerificationModal(true);
        setIsLoading(false); // Stop loading since we're showing modal
        return; // ВАЖНО: Ne pokazuj success toast, samo prikaži modal!
      }

      // Set auth state (tokens are in HTTP-Only cookies)
      if (response.user) {
        setAuth(response.user);
        toast.success('Erfolgreich angemeldet!');
      }

      // Navigate to the page user was trying to access, or to their default dashboard
      if (response.user) {
        let destination: string;

        if (from) {
          // User was trying to access a specific page before being redirected to login
          destination = from;
        } else {
          // Default navigation based on role
          if (response.user.role === UserRole.ADMIN_APPLICATION) {
            destination = '/admin/dashboard';
          } else if (response.user.role === UserRole.ADMIN_INSTITUTION) {
            destination = '/institution/dashboard';
          } else if (response.user.role === UserRole.WORKER) {
            destination = '/worker/dashboard';
          } else {
            destination = '/dashboard';
          }
        }

        navigate(destination, { replace: true });
      }
    } catch (error: any) {
      console.error('Login error:', error);
      const message = error?.response?.data?.error || error?.message || 'Anmeldung fehlgeschlagen. Bitte versuchen Sie es erneut.';
      setErrorMessage(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #F8FAFC 0%, #E0F2FE 100%)',
        py: 4,
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={3}
          sx={{
            p: { xs: 3, sm: 5 },
            borderRadius: 3,
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
          }}
        >
          {/* Back to Landing Page */}
          <Button
            component={RouterLink}
            to="/"
            startIcon={<ArrowBack />}
            sx={{
              mb: 3,
              color: 'text.secondary',
              textTransform: 'none',
              '&:hover': {
                color: 'primary.main',
                bgcolor: 'transparent',
              },
            }}
          >
            Zurück zur Startseite
          </Button>

          {/* Logo & Title */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Box
              sx={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #2563EB 0%, #10B981 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 2,
                boxShadow: '0 4px 20px rgba(37, 99, 235, 0.3)',
              }}
            >
              <LoginIcon sx={{ fontSize: 40, color: 'white' }} />
            </Box>
            <Typography
              variant="h4"
              component="h1"
              gutterBottom
              sx={{
                fontWeight: 700,
                background: 'linear-gradient(135deg, #2563EB 0%, #10B981 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              MEDWEG
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Willkommen zurück! Bitte melden Sie sich an.
            </Typography>
          </Box>

          {/* Login Type Toggle */}
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
            <ToggleButtonGroup
              value={loginType}
              exclusive
              onChange={(_, newType) => newType && setLoginType(newType)}
              aria-label="Login-Typ"
              sx={{
                '& .MuiToggleButton-root': {
                  px: 3,
                  py: 1,
                  fontWeight: 600,
                },
              }}
            >
              <ToggleButton value="admin" aria-label="Admin Login">
                <Person sx={{ mr: 1 }} />
                Admin
              </ToggleButton>
              <ToggleButton value="worker" aria-label="Worker Login">
                <Work sx={{ mr: 1 }} />
                Mitarbeiter
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>

          {/* Error Alert */}
          {errorMessage && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {errorMessage}
            </Alert>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            {loginType === 'admin' ? (
              <TextField
                {...register('email')}
                label="E-Mail"
                type="email"
                fullWidth
                margin="normal"
                error={!!(errors as any).email}
                helperText={(errors as any).email?.message}
                autoComplete="email"
                autoFocus
                sx={{ mb: 2 }}
              />
            ) : (
              <TextField
                {...register('username')}
                label="Benutzername"
                type="text"
                fullWidth
                margin="normal"
                error={!!(errors as any).username}
                helperText={(errors as any).username?.message}
                autoComplete="username"
                autoFocus
                sx={{ mb: 2 }}
              />
            )}

            <TextField
              {...register('password')}
              label="Passwort"
              type={showPassword ? 'text' : 'password'}
              fullWidth
              margin="normal"
              error={!!errors.password}
              helperText={errors.password?.message}
              autoComplete="current-password"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      aria-label="toggle password visibility"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 3 }}
            />

            <Button
              type="submit"
              variant="contained"
              fullWidth
              size="large"
              disabled={isLoading}
              sx={{
                py: 1.5,
                background: 'linear-gradient(135deg, #2563EB 0%, #10B981 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #1E40AF 0%, #059669 100%)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 6px 20px rgba(37, 99, 235, 0.4)',
                },
                transition: 'all 0.3s ease',
              }}
            >
              {isLoading ? 'Anmeldung läuft...' : 'Anmelden'}
            </Button>
          </form>

          {/* Register Link */}
          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Noch kein Konto?{' '}
              <Link
                component={RouterLink}
                to="/register"
                sx={{
                  color: 'primary.main',
                  fontWeight: 600,
                  textDecoration: 'none',
                  '&:hover': {
                    textDecoration: 'underline',
                  },
                }}
              >
                Jetzt registrieren
              </Link>
            </Typography>
          </Box>
        </Paper>

        {/* Footer */}
        <Typography
          variant="caption"
          sx={{
            display: 'block',
            textAlign: 'center',
            mt: 3,
            color: 'text.secondary',
          }}
        >
          © 2024 MEDWEG - Medizinischer Großhandel
        </Typography>
      </Container>

      {/* Email Verification Modal */}
      <VerificationModal
        open={showVerificationModal}
        email={verificationEmail}
        onVerify={handleVerifyEmail}
        onResend={handleResendCode}
        onClose={() => setShowVerificationModal(false)}
      />
    </Box>
  );
};

export default LoginPage;
