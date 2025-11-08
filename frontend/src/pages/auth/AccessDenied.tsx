import { Box, Container, Typography, Button, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Block as BlockIcon } from '@mui/icons-material';
import { useAuthStore, UserRole } from '../../store/authStore';

/**
 * AccessDenied Page
 *
 * Prikazuje se kada autentifikovani korisnik pokuša da pristupi
 * stranici za koju nema odgovarajuću rolu.
 */
const AccessDenied = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const handleGoToDashboard = () => {
    if (!user) {
      navigate('/login');
      return;
    }

    // Redirect to appropriate dashboard based on role
    switch (user.role) {
      case UserRole.ADMIN_APPLICATION:
        navigate('/admin/dashboard');
        break;
      case UserRole.ADMIN_INSTITUTION:
        navigate('/institution/dashboard');
        break;
      case UserRole.WORKER:
        navigate('/worker/dashboard');
        break;
      default:
        navigate('/login');
    }
  };

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: 6,
            textAlign: 'center',
            borderRadius: 4,
          }}
        >
          {/* Icon */}
          <Box
            sx={{
              display: 'inline-flex',
              p: 3,
              borderRadius: '50%',
              bgcolor: 'error.light',
              color: 'error.main',
              mb: 3,
            }}
          >
            <BlockIcon sx={{ fontSize: 60 }} />
          </Box>

          {/* Title */}
          <Typography variant="h4" gutterBottom fontWeight={700} color="text.primary">
            Zugriff verweigert
          </Typography>

          {/* Message */}
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            Sie haben keine Berechtigung, um auf diese Seite zuzugreifen.
            <br />
            Bitte wenden Sie sich an Ihren Administrator, wenn Sie glauben, dass dies ein Fehler
            ist.
          </Typography>

          {/* User info */}
          {user && (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
              Angemeldet als: <strong>{user.email}</strong>
              <br />
              Rolle: <strong>{getRoleDisplayName(user.role)}</strong>
            </Typography>
          )}

          {/* Actions */}
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
            <Button variant="outlined" onClick={() => navigate(-1)}>
              Zurück
            </Button>
            <Button variant="contained" onClick={handleGoToDashboard}>
              Zum Dashboard
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

/**
 * Helper: Get German display name for role
 */
const getRoleDisplayName = (role: UserRole): string => {
  switch (role) {
    case UserRole.ADMIN_APPLICATION:
      return 'Administrator (Anwendung)';
    case UserRole.ADMIN_INSTITUTION:
      return 'Administrator (Einrichtung)';
    case UserRole.WORKER:
      return 'Mitarbeiter';
    default:
      return 'Unbekannt';
  }
};

export default AccessDenied;
