import { Box, Container, Typography, Grid, Link, Divider } from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';

const LandingFooter = () => {
  return (
    <Box
      component="footer"
      sx={{
        bgcolor: 'grey.900',
        color: 'white',
        py: 6,
        mt: 8,
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          {/* Company Info */}
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Box
                component="img"
                src="/medwegbavaria_logo.jpg"
                alt="MedWeg Bavaria Logo"
                sx={{
                  height: 80,
                  objectFit: 'contain',
                  mr: 2,
                  borderRadius: 3,
                }}
              />
            </Box>
            <Typography variant="body2" sx={{ color: 'grey.400', lineHeight: 1.8 }}>
              Ihr zuverlässiger Partner für medizinische Versorgung in Augsburg und Umgebung.
            </Typography>
          </Grid>

          {/* Contact Info */}
          <Grid item xs={12} md={4}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Kontakt
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <LocationOnIcon sx={{ fontSize: 20, color: 'grey.400' }} />
                <Typography variant="body2" sx={{ color: 'grey.400' }}>
                  Augsburg, Deutschland
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <EmailIcon sx={{ fontSize: 20, color: 'grey.400' }} />
                <Link
                  href="mailto:medwegbavaria@gmail.com"
                  sx={{ color: 'grey.400', textDecoration: 'none', '&:hover': { color: 'primary.main' } }}
                >
                  medwegbavaria@gmail.com
                </Link>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PhoneIcon sx={{ fontSize: 20, color: 'grey.400' }} />
                <Link
                  href="tel:+4915238941718"
                  sx={{ color: 'grey.400', textDecoration: 'none', '&:hover': { color: 'primary.main' } }}
                >
                  +4915238941718
                </Link>
              </Box>
            </Box>
          </Grid>

          {/* Products */}
          <Grid item xs={12} md={4}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Unsere Produkte
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Typography variant="body2" sx={{ color: 'grey.400' }}>
                • Einweghandschuhe
              </Typography>
              <Typography variant="body2" sx={{ color: 'grey.400' }}>
                • Desinfektionsmittel (flüssig)
              </Typography>
              <Typography variant="body2" sx={{ color: 'grey.400' }}>
                • Desinfektionstücher
              </Typography>
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ my: 4, bgcolor: 'grey.700' }} />

        {/* Copyright */}
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="body2" sx={{ color: 'grey.500' }}>
            © {new Date().getFullYear()} MedWeg Bavaria. Alle Rechte vorbehalten.
          </Typography>
        </Box>

        {/* Developer Credit */}
        <Box
          sx={{
            textAlign: 'center',
            mt: 3,
            pt: 3,
            borderTop: '1px solid',
            borderColor: 'grey.800',
          }}
        >
          <Link
            href="https://www.novastudiosolutions.com/"
            target="_blank"
            rel="noopener noreferrer"
            sx={{
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 1.5,
              flexWrap: 'wrap',
              transition: 'transform 0.2s ease-in-out',
              '&:hover': {
                transform: 'translateY(-2px)',
              },
            }}
          >
            <Typography
              variant="body2"
              sx={{
                color: 'grey.400',
                fontSize: '0.875rem',
              }}
            >
              Developed by
            </Typography>
            <Box
              component="img"
              src="/nova-studio-logo.png"
              alt="Nova Studio Solutions"
              sx={{
                height: 35,
                objectFit: 'contain',
                borderRadius: 2,
              }}
            />
            <Typography
              variant="body2"
              sx={{
                color: 'white',
                fontWeight: 600,
                fontSize: '0.875rem',
                letterSpacing: '0.5px',
              }}
            >
              Nova Studio Solutions
            </Typography>
          </Link>
        </Box>
      </Container>
    </Box>
  );
};

export default LandingFooter;
