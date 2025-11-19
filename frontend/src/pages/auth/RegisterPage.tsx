import { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
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
  Grid,
} from '@mui/material';
import { Visibility, VisibilityOff, PersonAdd } from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'react-toastify';
import { register } from '../../api/authApi';

/**
 * Register Form Validation Schema
 */
const registerSchema = z
  .object({
    institutionName: z
      .string()
      .min(2, 'Institutionsname muss mindestens 2 Zeichen lang sein'),
    email: z
      .string()
      .min(1, 'E-Mail ist erforderlich')
      .email('Ungültige E-Mail-Adresse'),
    password: z
      .string()
      .min(8, 'Passwort muss mindestens 8 Zeichen lang sein')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])/,
        'Passwort muss Groß- und Kleinbuchstaben, Zahlen und ein Sonderzeichen enthalten'
      ),
    confirmPassword: z.string(),
    addressStreet: z.string().min(3, 'Straße ist erforderlich'),
    addressPlz: z
      .string()
      .min(5, 'PLZ muss mindestens 5 Zeichen lang sein')
      .max(10, 'PLZ darf maximal 10 Zeichen lang sein'),
    addressCity: z.string().min(2, 'Stadt ist erforderlich'),
    phone: z.string().min(7, 'Telefonnummer ist erforderlich'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwörter stimmen nicht überein',
    path: ['confirmPassword'],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

/**
 * Register Page Component
 * Institution registration with modern, clean design
 */
const RegisterPage = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const {
    register: registerForm,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    setErrorMessage('');

    try {
      // Call real backend API
      const response = await register(data);

      toast.success(response.message || 'Registrierung erfolgreich! Bitte melden Sie sich an.');

      // Navigate to login page
      navigate('/login');
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Registrierung fehlgeschlagen. Bitte versuchen Sie es erneut.';
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
      <Container maxWidth="md">
        <Paper
          elevation={3}
          sx={{
            p: { xs: 3, sm: 5 },
            borderRadius: 3,
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
          }}
        >
          {/* Logo & Title */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Box
              sx={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #10B981 0%, #2563EB 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 2,
                boxShadow: '0 4px 20px rgba(16, 185, 129, 0.3)',
              }}
            >
              <PersonAdd sx={{ fontSize: 40, color: 'white' }} />
            </Box>
            <Typography
              variant="h4"
              component="h1"
              gutterBottom
              sx={{
                fontWeight: 700,
                background: 'linear-gradient(135deg, #10B981 0%, #2563EB 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              MEDWEG Registrierung
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Registrieren Sie Ihre Institution
            </Typography>
          </Box>

          {/* Error Alert */}
          {errorMessage && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {errorMessage}
            </Alert>
          )}

          {/* Register Form */}
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <Grid container spacing={2}>
              {/* Institution Name */}
              <Grid item xs={12}>
                <TextField
                  {...registerForm('institutionName')}
                  label="Institutionsname"
                  fullWidth
                  error={!!errors.institutionName}
                  helperText={errors.institutionName?.message}
                  autoComplete="organization"
                  autoFocus
                />
              </Grid>

              {/* Email */}
              <Grid item xs={12}>
                <TextField
                  {...registerForm('email')}
                  label="E-Mail"
                  type="email"
                  fullWidth
                  error={!!errors.email}
                  helperText={errors.email?.message}
                  autoComplete="email"
                />
              </Grid>

              {/* Password */}
              <Grid item xs={12} sm={6}>
                <TextField
                  {...registerForm('password')}
                  label="Passwort"
                  type={showPassword ? 'text' : 'password'}
                  fullWidth
                  error={!!errors.password}
                  helperText={errors.password?.message}
                  autoComplete="new-password"
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              {/* Confirm Password */}
              <Grid item xs={12} sm={6}>
                <TextField
                  {...registerForm('confirmPassword')}
                  label="Passwort bestätigen"
                  type={showConfirmPassword ? 'text' : 'password'}
                  fullWidth
                  error={!!errors.confirmPassword}
                  helperText={errors.confirmPassword?.message}
                  autoComplete="new-password"
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          edge="end"
                        >
                          {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              {/* Address Street */}
              <Grid item xs={12}>
                <TextField
                  {...registerForm('addressStreet')}
                  label="Straße und Hausnummer"
                  fullWidth
                  error={!!errors.addressStreet}
                  helperText={errors.addressStreet?.message}
                  autoComplete="street-address"
                />
              </Grid>

              {/* PLZ */}
              <Grid item xs={12} sm={4}>
                <TextField
                  {...registerForm('addressPlz')}
                  label="PLZ"
                  fullWidth
                  error={!!errors.addressPlz}
                  helperText={errors.addressPlz?.message}
                  autoComplete="postal-code"
                />
              </Grid>

              {/* City */}
              <Grid item xs={12} sm={8}>
                <TextField
                  {...registerForm('addressCity')}
                  label="Stadt"
                  fullWidth
                  error={!!errors.addressCity}
                  helperText={errors.addressCity?.message}
                  autoComplete="address-level2"
                />
              </Grid>

              {/* Phone */}
              <Grid item xs={12}>
                <TextField
                  {...registerForm('phone')}
                  label="Telefonnummer"
                  fullWidth
                  error={!!errors.phone}
                  helperText={errors.phone?.message}
                  autoComplete="tel"
                />
              </Grid>
            </Grid>

            <Button
              type="submit"
              variant="contained"
              fullWidth
              size="large"
              disabled={isLoading}
              sx={{
                mt: 3,
                py: 1.5,
                background: 'linear-gradient(135deg, #10B981 0%, #2563EB 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #059669 0%, #1E40AF 100%)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 6px 20px rgba(16, 185, 129, 0.4)',
                },
                transition: 'all 0.3s ease',
              }}
            >
              {isLoading ? 'Registrierung läuft...' : 'Registrieren'}
            </Button>
          </form>

          {/* Login Link */}
          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Bereits registriert?{' '}
              <Link
                component={RouterLink}
                to="/login"
                sx={{
                  color: 'primary.main',
                  fontWeight: 600,
                  textDecoration: 'none',
                  '&:hover': {
                    textDecoration: 'underline',
                  },
                }}
              >
                Jetzt anmelden
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
    </Box>
  );
};

export default RegisterPage;
