import { AppBar, Toolbar, Button, Container, Box, IconButton, Drawer, List, ListItem, ListItemButton, ListItemText, Divider, Select, MenuItem } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import LanguageIcon from '@mui/icons-material/Language';
import { useLanguage } from '../contexts/LanguageContext';

const LandingHeader = () => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { language, setLanguage, t } = useLanguage();

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    setMobileMenuOpen(false); // Close menu after clicking
  };

  const navLinks = [
    { label: t.header.whyMedweg, id: 'warum-medweg' },
    { label: t.header.howItWorks, id: 'wie-funktioniert' },
    { label: t.header.about, id: 'ueber-uns' },
    { label: t.header.contact, id: 'kontakt' },
    { label: t.header.location, id: 'standort' },
  ];

  const handleLoginClick = () => {
    navigate('/login');
    setMobileMenuOpen(false);
  };

  return (
    <>
      <AppBar
        position="sticky"
        sx={{
          background: 'linear-gradient(135deg, #00897B 0%, #00BCD4 100%)',
          boxShadow: 2,
        }}
      >
        <Container maxWidth="lg">
          <Toolbar disableGutters sx={{ py: { xs: 0.5, md: 1 }, px: { xs: 2, sm: 0 } }}>
            {/* Logo */}
            <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: { xs: 1, md: 0 }, mr: { xs: 0, md: 4 } }}>
              <Box
                component="img"
                src="/medwegbavaria_logo.jpg"
                alt="MedWeg Bavaria Logo"
                sx={{
                  height: { xs: 45, sm: 50, md: 60 },
                  cursor: 'pointer',
                  objectFit: 'contain',
                  borderRadius: 3,
                }}
                onClick={() => navigate('/')}
              />
            </Box>

            {/* Desktop Navigation Links */}
            <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 3, flexGrow: 1 }}>
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

            {/* Language Switcher - Desktop */}
            <Select
              value={language}
              onChange={(e) => setLanguage(e.target.value as 'de' | 'en')}
              startAdornment={<LanguageIcon sx={{ mr: 0.5, fontSize: '1.1rem' }} />}
              sx={{
                display: { xs: 'none', md: 'flex' },
                mr: 2,
                color: 'white',
                height: 38,
                minWidth: 90,
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(255, 255, 255, 0.3)',
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(255, 255, 255, 0.5)',
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'white',
                },
                '& .MuiSvgIcon-root': {
                  color: 'white',
                },
              }}
            >
              <MenuItem value="de">DE</MenuItem>
              <MenuItem value="en">EN</MenuItem>
            </Select>

            {/* Desktop Contact Button */}
            <Button
              variant="contained"
              onClick={() => {
                const element = document.getElementById('kontakt');
                if (element) {
                  element.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              sx={{
                display: { xs: 'none', md: 'flex' },
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
              {t.header.contact}
            </Button>

            {/* Language Switcher - Mobile */}
            <Select
              value={language}
              onChange={(e) => setLanguage(e.target.value as 'de' | 'en')}
              sx={{
                display: { xs: 'flex', md: 'none' },
                mr: 1,
                color: 'white',
                height: 32,
                minWidth: 70,
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(255, 255, 255, 0.3)',
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(255, 255, 255, 0.5)',
                },
                '& .MuiSvgIcon-root': {
                  color: 'white',
                },
                '& .MuiSelect-select': {
                  py: 0.5,
                  fontSize: '0.85rem',
                },
              }}
            >
              <MenuItem value="de">DE</MenuItem>
              <MenuItem value="en">EN</MenuItem>
            </Select>

            {/* Mobile Contact Button */}
            <Button
              variant="contained"
              onClick={() => {
                const element = document.getElementById('kontakt');
                if (element) {
                  element.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              sx={{
                display: { xs: 'flex', md: 'none' },
                px: { xs: 1.5, sm: 2 },
                py: 0.75,
                fontWeight: 600,
                borderRadius: 2,
                textTransform: 'none',
                fontSize: { xs: '0.75rem', sm: '0.85rem' },
                bgcolor: 'white',
                color: '#00BCD4',
                mr: 1,
                minWidth: 'auto',
                whiteSpace: 'nowrap',
                '&:hover': {
                  bgcolor: 'rgba(255, 255, 255, 0.9)',
                },
              }}
            >
              {t.header.contact}
            </Button>

            {/* Mobile Menu Icon */}
            <IconButton
              sx={{
                display: { xs: 'flex', md: 'none' },
                color: 'white',
              }}
              onClick={() => setMobileMenuOpen(true)}
            >
              <MenuIcon />
            </IconButton>
          </Toolbar>
        </Container>
      </AppBar>

      {/* Mobile Drawer Menu */}
      <Drawer
        anchor="right"
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        sx={{
          display: { xs: 'block', md: 'none' },
        }}
      >
        <Box
          sx={{
            width: 280,
            height: '100%',
            background: 'linear-gradient(135deg, #00897B 0%, #00BCD4 100%)',
          }}
        >
          {/* Close Button */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 2 }}>
            <IconButton
              onClick={() => setMobileMenuOpen(false)}
              sx={{ color: 'white' }}
            >
              <CloseIcon />
            </IconButton>
          </Box>

          <Divider sx={{ bgcolor: 'rgba(255, 255, 255, 0.2)' }} />

          {/* Navigation Links */}
          <List>
            {navLinks.map((link) => (
              <ListItem key={link.id} disablePadding>
                <ListItemButton
                  onClick={() => scrollToSection(link.id)}
                  sx={{
                    py: 2,
                    '&:hover': {
                      bgcolor: 'rgba(255, 255, 255, 0.1)',
                    },
                  }}
                >
                  <ListItemText
                    primary={link.label}
                    sx={{
                      '& .MuiListItemText-primary': {
                        color: 'white',
                        fontWeight: 500,
                        fontSize: '1.1rem',
                      },
                    }}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>
    </>
  );
};

export default LandingHeader;