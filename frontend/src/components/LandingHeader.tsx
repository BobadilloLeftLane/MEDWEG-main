import { AppBar, Toolbar, Button, Container, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const LandingHeader = () => {
  const navigate = useNavigate();

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const navLinks = [
    { label: 'Warum MEDWEG', id: 'warum-medweg' },
    { label: 'Wie funktioniert es', id: 'wie-funktioniert' },
    { label: 'Über uns', id: 'ueber-uns' },
    { label: 'Kontakt', id: 'kontakt' },
    { label: 'Standort', id: 'standort' },
  ];

  return (
    <AppBar
      position="sticky"
      sx={{
        background: 'linear-gradient(135deg, #00897B 0%, #00BCD4 100%)',
        boxShadow: 2,
      }}
    >
      <Container maxWidth="lg">
        <Toolbar disableGutters sx={{ py: 1 }}>
          {/* Logo */}
          <Box sx={{ display: 'flex', alignItems: 'center', mr: 4 }}>
            <Box
              component="img"
              src="/medwegbavaria_logo.jpg"
              alt="MEDWEG Logo"
              sx={{
                height: 60,
                cursor: 'pointer',
                objectFit: 'contain',
                borderRadius: 3,
              }}
              onClick={() => navigate('/')}
            />
          </Box>

          {/* Navigation Links */}
          <Box sx={{ display: 'flex', gap: 3, flexGrow: 1 }}>
            {navLinks.map((link) => (
              <Button
                key={link.id}
                onClick={() => scrollToSection(link.id)}
                sx={{
                  color: 'white',
                  textTransform: 'none',
                  fontSize: '1rem',
                  fontWeight: 500,
                  '&:hover': {
                    bgcolor: 'rgba(255, 255, 255, 0.1)',
                  },
                }}
              >
                {link.label}
              </Button>
            ))}
          </Box>

          {/* Login/Register Button */}
          <Button
            variant="contained"
            onClick={() => navigate('/login')}
            sx={{
              px: 3,
              py: 1,
              fontWeight: 600,
              borderRadius: 2,
              textTransform: 'none',
              fontSize: '1rem',
              bgcolor: 'white',
              color: '#00BCD4',
              '&:hover': {
                bgcolor: 'rgba(255, 255, 255, 0.9)',
              },
            }}
          >
            Anmelden / Registrieren
          </Button>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default LandingHeader;
