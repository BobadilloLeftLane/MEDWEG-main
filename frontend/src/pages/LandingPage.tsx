import { Box, Container, Typography, Grid, Card, CardContent, TextField, Button, Paper, Avatar, CircularProgress } from '@mui/material';
import { useState } from 'react';
import { toast } from 'react-toastify';
import LandingHeader from '../components/LandingHeader';
import LandingFooter from '../components/LandingFooter';
import * as contactApi from '../api/contactApi';
import GlovesIcon from '../assets/icons/GlovesIcon';
import DisinfectantIcon from '../assets/icons/DisinfectantIcon';
import WipesIcon from '../assets/icons/WipesIcon';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import LoginIcon from '@mui/icons-material/Login';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import BarChartIcon from '@mui/icons-material/BarChart';
import PeopleIcon from '@mui/icons-material/People';
import SettingsIcon from '@mui/icons-material/Settings';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

const LandingPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    telefon: '',
    nachricht: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.name || !formData.email || !formData.telefon || !formData.nachricht) {
      toast.error('Bitte füllen Sie alle Felder aus');
      return;
    }

    try {
      setIsSubmitting(true);

      // Submit contact form
      await contactApi.submitContactForm({
        name: formData.name,
        email: formData.email,
        subject: `Kontakt: ${formData.telefon}`, // Use telefon as subject or combine
        message: formData.nachricht,
      });

      toast.success('Vielen Dank! Ihre Nachricht wurde gesendet. Sie erhalten eine Bestätigungsmail.');
      setFormData({ name: '', email: '', telefon: '', nachricht: '' });
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Fehler beim Senden der Nachricht');
    } finally {
      setIsSubmitting(false);
    }
  };

  const userJourneySteps = [
    {
      label: 'Registrierung',
      description: 'Erstellen Sie Ihr Konto in wenigen Minuten',
      icon: <PersonAddIcon sx={{ fontSize: 50 }} />,
      color: '#00BCD4',
    },
    {
      label: 'Anmeldung',
      description: 'Melden Sie sich sicher an',
      icon: <LoginIcon sx={{ fontSize: 50 }} />,
      color: '#2e7d32',
    },
    {
      label: 'Produkte auswählen',
      description: 'Wählen Sie aus unserem Sortiment',
      icon: <ShoppingCartIcon sx={{ fontSize: 50 }} />,
      color: '#ed6c02',
    },
    {
      label: 'Bestellung abschließen',
      description: 'Erhalten Sie Ihre Produkte schnell und zuverlässig',
      icon: <DoneAllIcon sx={{ fontSize: 50 }} />,
      color: '#9c27b0',
    },
  ];

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #FFFFFF 0%, #E0F2F1 25%, #B2DFDB 50%, #E0F2F1 75%, #FFFFFF 100%)',
        overflowX: 'hidden',
        width: '100%',
      }}
    >
      <LandingHeader />

      {/* Hero Section */}
      <Box
        sx={{
          backgroundImage: 'url(/hero-warehouse.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          minHeight: { xs: '550px', sm: '650px', md: '850px' },
          color: 'white',
          py: { xs: 12, sm: 15, md: 20 },
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(135deg, rgba(0, 150, 136, 0.75) 0%, rgba(0, 188, 212, 0.65) 100%)',
            zIndex: 0,
          },
        }}
      >
        <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1, px: { xs: 2, sm: 3 } }}>
          <Box sx={{ mb: { xs: 3, md: 4 } }}>
            <Typography
              variant="h1"
              sx={{
                fontWeight: 900,
                fontSize: { xs: '3.5rem', sm: '5rem', md: '7rem', lg: '9rem' },
                color: 'white',
                textShadow: `
                  0 0 25px rgba(255, 255, 255, 0.9),
                  0 0 50px rgba(77, 208, 225, 0.7),
                  0 0 75px rgba(38, 198, 218, 0.5),
                  0 0 100px rgba(0, 188, 212, 0.3),
                  4px 4px 12px rgba(0, 0, 0, 0.9)
                `,
                letterSpacing: '0.08em',
                lineHeight: 1.1,
                mb: 1,
              }}
            >
              MEDWEG
            </Typography>
            <Typography
              variant="h3"
              sx={{
                fontWeight: 600,
                fontSize: { xs: '1.4rem', sm: '1.8rem', md: '2.2rem', lg: '3rem' },
                color: '#E3F2FD',
                textShadow: `
                  0 0 15px rgba(255, 255, 255, 0.6),
                  0 0 30px rgba(77, 208, 225, 0.4),
                  2px 2px 8px rgba(0, 0, 0, 0.7)
                `,
                letterSpacing: '0.15em',
                fontStyle: 'italic',
              }}
            >
              BAVARIA
            </Typography>
          </Box>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 400,
              lineHeight: 1.6,
              fontSize: { xs: '0.95rem', sm: '1.1rem', md: '1.3rem', lg: '1.5rem' },
              color: 'white',
              textShadow: `
                0 0 10px rgba(0, 0, 0, 0.8),
                2px 2px 6px rgba(0, 0, 0, 0.9)
              `,
              maxWidth: '700px',
              mx: 'auto',
              px: { xs: 2, sm: 0 },
            }}
          >
            Ihr zuverlässiger Partner für hochwertige medizinische Einwegprodukte in ganz Deutschland
          </Typography>
        </Container>
      </Box>

      {/* Warehouse Image Section - Seamless transition */}
      <Box
        sx={{
          minHeight: { xs: 'auto', md: '1400px' },
          backgroundImage: 'url(/warum-medweg-bg.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center center',
          backgroundRepeat: 'no-repeat',
          position: 'relative',
          marginTop: { xs: '-50px', md: '-100px' },
          paddingTop: { xs: '50px', md: '100px' },
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(135deg, rgba(0, 150, 136, 0.7) 0%, rgba(0, 188, 212, 0.6) 100%)',
            zIndex: 0,
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: { xs: '100px', md: '200px' },
            background: 'linear-gradient(to top, #FFFFFF 0%, rgba(255, 255, 255, 0.9) 50%, transparent 100%)',
            zIndex: 1,
          },
        }}
      >
        {/* Main Content */}
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2, py: { xs: 4, md: 8 }, px: { xs: 2, sm: 3 } }}>

        {/* 1. Warum MEDWEG Section - ERSTE SEKCIJA */}
        <Box
          id="warum-medweg"
          sx={{
            mb: { xs: 6, md: 12 },
            mt: { xs: -20, sm: -30, md: -45 },
            bgcolor: 'white',
            py: { xs: 4, sm: 6, md: 8 },
            px: { xs: 2, sm: 3, md: 5 },
            borderRadius: 4,
            boxShadow: 6,
          }}
        >
          <Typography
            variant="h3"
            sx={{ fontWeight: 700, mb: 2, textAlign: 'center', color: 'primary.main', fontSize: { xs: '1.75rem', sm: '2.5rem', md: '3rem' } }}
          >
            Warum MEDWEG wählen?
          </Typography>
          <Typography
            variant="body1"
            sx={{ textAlign: 'center', color: 'text.secondary', mb: { xs: 4, md: 6 }, fontSize: { xs: '0.95rem', sm: '1.05rem', md: '1.1rem' }, maxWidth: '800px', mx: 'auto', px: { xs: 1, sm: 0 } }}
          >
            Modernste Technologie trifft auf jahrelange Erfahrung in der Pflegebranche
          </Typography>

          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                <CheckCircleIcon sx={{ fontSize: 50, color: 'success.main', mt: 0.5, flexShrink: 0 }} />
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                    Höchste Qualität
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.8, fontSize: '0.95rem' }}>
                    Alle unsere Produkte erfüllen die strengsten medizinischen Standards und
                    Qualitätsanforderungen. Geprüft und zertifiziert nach EU-Richtlinien.
                  </Typography>
                </Box>
              </Box>
            </Grid>

            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                <LocalShippingIcon sx={{ fontSize: 50, color: 'primary.main', mt: 0.5, flexShrink: 0 }} />
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                    Schnelle Lieferung
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.8, fontSize: '0.95rem' }}>
                    Zuverlässige und pünktliche Lieferung direkt zu Ihnen. Wir arbeiten mit
                    renommierten Versandpartnern für maximale Sicherheit und Geschwindigkeit.
                  </Typography>
                </Box>
              </Box>
            </Grid>

            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                <VerifiedUserIcon sx={{ fontSize: 50, color: 'success.main', mt: 0.5, flexShrink: 0 }} />
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                    Zertifizierte Produkte
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.8, fontSize: '0.95rem' }}>
                    Alle Produkte sind nach EU-Richtlinien zertifiziert und für den medizinischen
                    Einsatz zugelassen. Qualität, der Sie vertrauen können.
                  </Typography>
                </Box>
              </Box>
            </Grid>

            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                <SupportAgentIcon sx={{ fontSize: 50, color: 'primary.main', mt: 0.5, flexShrink: 0 }} />
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                    Persönlicher Service
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.8, fontSize: '0.95rem' }}>
                    Unser kompetentes Team steht Ihnen bei Fragen jederzeit zur Verfügung.
                    Individuelle Beratung für Ihre spezifischen Bedürfnisse.
                  </Typography>
                </Box>
              </Box>
            </Grid>

            {/* NOVE FUNKCIONALNOSTI */}
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                <AutorenewIcon sx={{ fontSize: 50, color: 'info.main', mt: 0.5, flexShrink: 0 }} />
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                    Automatisierte Plattform
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.8, fontSize: '0.95rem' }}>
                    Vollständig automatisierte Bestellabwicklung für <strong>Pflegedienste, Ambulante</strong> und
                    <strong> Intensivpflege-Einrichtungen</strong>. Sparen Sie Zeit und reduzieren Sie Fehler durch intelligente Automatisierung.
                  </Typography>
                </Box>
              </Box>
            </Grid>

            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                <BarChartIcon sx={{ fontSize: 50, color: 'warning.main', mt: 0.5, flexShrink: 0 }} />
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                    Detaillierte Statistiken & Kontrolle
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.8, fontSize: '0.95rem' }}>
                    Behalten Sie den kompletten Überblick: Bestellhistorie, Ausgabenanalyse, Lagerbestände und
                    Lieferstatistiken. Dashboard mit Echtzeitdaten für optimale Kontrolle Ihres Pflegedienstes.
                  </Typography>
                </Box>
              </Box>
            </Grid>

            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                <PeopleIcon sx={{ fontSize: 50, color: 'secondary.main', mt: 0.5, flexShrink: 0 }} />
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                    Mitarbeiterverwaltung
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.8, fontSize: '0.95rem' }}>
                    Verwalten Sie Benutzer und Mitarbeiter zentral. Weisen Sie Berechtigungen zu und behalten Sie
                    die Kontrolle über alle Bestellaktivitäten in Ihrer Einrichtung.
                  </Typography>
                </Box>
              </Box>
            </Grid>

            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                <SettingsIcon sx={{ fontSize: 50, color: 'error.main', mt: 0.5, flexShrink: 0 }} />
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                    Workflow-Kontrolle
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.8, fontSize: '0.95rem' }}>
                    Komplette Transparenz und Kontrolle des Bestellprozesses: Von der Anforderung über die
                    Genehmigung bis zur Lieferung. Ideal für Intensivpflege und ambulante Dienste.
                  </Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>

          {/* Call to Action */}
          <Box sx={{ mt: 6, textAlign: 'center' }}>
            <Paper elevation={4} sx={{ p: 4, bgcolor: 'primary.50', borderRadius: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.dark', mb: 2 }}>
                Perfekt für Pflegeeinrichtungen
              </Typography>
              <Typography variant="body1" sx={{ color: 'text.secondary', mb: 2 }}>
                <strong>Pflegedienste</strong> • <strong>Ambulante Pflege</strong> • <strong>Intensivpflege</strong> • <strong>Kliniken</strong>
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
                Entwickelt von Pflegeprofis für Pflegeprofis
              </Typography>
            </Paper>
          </Box>
        </Box>
        </Container>
      </Box>

      {/* User Journey Background Section - WHITE */}
      <Box
        sx={{
          bgcolor: 'white',
          py: 8,
        }}
      >
        {/* Continue Main Content */}
        <Container maxWidth="lg" sx={{ flexGrow: 1, position: 'relative', zIndex: 2 }}>

          {/* 2. User Journey Section - DRUGA SEKCIJA */}
          <Box id="wie-funktioniert" sx={{ mb: { xs: 6, md: 12 }, bgcolor: 'white', py: { xs: 4, sm: 6, md: 8 }, px: { xs: 2, sm: 3, md: 4 }, borderRadius: 4 }}>
          <Typography
            variant="h3"
            sx={{ fontWeight: 700, mb: 2, textAlign: 'center', color: 'primary.main', fontSize: { xs: '1.75rem', sm: '2.5rem', md: '3rem' } }}
          >
            Wie funktioniert es?
          </Typography>
          <Typography
            variant="body1"
            sx={{ textAlign: 'center', color: 'text.secondary', mb: { xs: 4, md: 6 }, fontSize: { xs: '0.95rem', sm: '1.05rem', md: '1.1rem' }, px: { xs: 1, sm: 0 } }}
          >
            Einfach, schnell und benutzerfreundlich – So nutzen Sie unsere Plattform
          </Typography>

          {/* Desktop Stepper */}
          <Box sx={{ display: { xs: 'none', md: 'flex' }, mb: 6, justifyContent: 'center', alignItems: 'center', gap: 2 }}>
            {userJourneySteps.map((step, index) => (
              <Box key={step.label} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                {/* Step */}
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 200 }}>
                  {/* Step Icon */}
                  <Box
                    sx={{
                      bgcolor: step.color,
                      color: 'white',
                      borderRadius: '50%',
                      width: 80,
                      height: 80,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: 4,
                      transition: 'transform 0.3s',
                      '&:hover': {
                        transform: 'scale(1.15)',
                      }
                    }}
                  >
                    {step.icon}
                  </Box>

                  {/* Step Label */}
                  <Typography variant="h6" sx={{ fontWeight: 700, mt: 2, color: step.color, textAlign: 'center' }}>
                    {step.label}
                  </Typography>

                  {/* Step Description */}
                  <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5, textAlign: 'center' }}>
                    {step.description}
                  </Typography>
                </Box>

                {/* Arrow between steps (except after last step) */}
                {index < userJourneySteps.length - 1 && (
                  <ArrowForwardIcon
                    sx={{
                      fontSize: 50,
                      color: 'primary.main',
                      mb: 10,
                      opacity: 0.6
                    }}
                  />
                )}
              </Box>
            ))}
          </Box>

          {/* Mobile Cards */}
          <Grid container spacing={3} sx={{ display: { xs: 'flex', md: 'none' } }}>
            {userJourneySteps.map((step, index) => (
              <Grid item xs={12} key={step.label}>
                <Card sx={{ boxShadow: 3, borderLeft: `6px solid ${step.color}` }}>
                  <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 3, p: 3 }}>
                    <Box
                      sx={{
                        bgcolor: step.color,
                        color: 'white',
                        borderRadius: '50%',
                        width: 70,
                        height: 70,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      {step.icon}
                    </Box>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: step.color, mb: 0.5 }}>
                        {index + 1}. {step.label}
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        {step.description}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Detailed Steps */}
          <Grid container spacing={4} sx={{ mt: 4 }}>
            <Grid item xs={12} md={6}>
              <Paper elevation={3} sx={{ p: 4, height: '100%', bgcolor: 'primary.50' }}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: 'primary.main' }}>
                  1. Registrierung
                </Typography>
                <Typography variant="body2" sx={{ lineHeight: 1.8, color: 'text.secondary' }}>
                  • Klicken Sie auf "Anmelden / Registrieren"<br />
                  • Füllen Sie das Registrierungsformular aus<br />
                  • Bestätigen Sie Ihre E-Mail-Adresse<br />
                  • Ihr Konto ist bereit!
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper elevation={3} sx={{ p: 4, height: '100%', bgcolor: 'success.50' }}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: 'success.main' }}>
                  2. Anmeldung & Mitarbeiterverwaltung
                </Typography>
                <Typography variant="body2" sx={{ lineHeight: 1.8, color: 'text.secondary' }}>
                  • Geben Sie Ihre E-Mail und Passwort ein<br />
                  • Zugriff auf Ihr persönliches Dashboard<br />
                  • <strong>Erstellen Sie Mitarbeiterkonten</strong><br />
                  • <strong>Weisen Sie Berechtigungen zu</strong><br />
                  • Behalten Sie die Kontrolle über Ihr Profil
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper elevation={3} sx={{ p: 4, height: '100%', bgcolor: 'warning.50' }}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: 'warning.main' }}>
                  3. Produkte auswählen – Manuell oder Automatisch
                </Typography>
                <Typography variant="body2" sx={{ lineHeight: 1.8, color: 'text.secondary' }}>
                  <strong>Manuell:</strong><br />
                  • Durchsuchen Sie unser Produktsortiment<br />
                  • Bestellen Sie in nur wenigen Klicks<br />
                  <br />
                  <strong>Automatisiert:</strong><br />
                  • Richten Sie wiederkehrende Bestellungen ein<br />
                  • Automatische monatliche Lieferungen<br />
                  • Lassen Sie Mitarbeiter Bestellungen durchführen
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper elevation={3} sx={{ p: 4, height: '100%', bgcolor: 'secondary.50' }}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: 'secondary.main' }}>
                  4. Bestellung & Kontrolle
                </Typography>
                <Typography variant="body2" sx={{ lineHeight: 1.8, color: 'text.secondary' }}>
                  • Wählen Sie Lieferdatum und Versandart<br />
                  • Bestätigen Sie Ihre Bestellung<br />
                  • <strong>Verfolgen Sie den Status in Echtzeit</strong><br />
                  • <strong>Detaillierte Statistiken im Dashboard</strong><br />
                  • Kontrolle über den gesamten Workflow
                </Typography>
              </Paper>
            </Grid>
          </Grid>

          {/* Automation Highlight */}
          <Box sx={{ mt: 6 }}>
            <Paper elevation={6} sx={{ p: 4, bgcolor: 'info.50', borderRadius: 3, border: '2px solid', borderColor: 'info.main' }}>
              <Typography variant="h6" sx={{ fontWeight: 700, color: 'info.dark', mb: 2, textAlign: 'center' }}>
                Flexibilität für Ihren Pflegedienst
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'primary.main', mb: 1 }}>
                      Manuelle Bestellung
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      Schnell und einfach in wenigen Klicks
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'success.main', mb: 1 }}>
                      Automatische Bestellung
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      Wiederkehrende monatliche Lieferungen
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'warning.main', mb: 1 }}>
                      Mitarbeiter-Bestellung
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      Delegieren Sie an Ihr Team
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          </Box>
        </Box>
        </Container>
      </Box>

      {/* Über uns Background Section */}
      <Box
        sx={{
          minHeight: { xs: 'auto', md: '1800px' },
          backgroundImage: 'url(/uber-uns-bg.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center center',
          backgroundRepeat: 'no-repeat',
          position: 'relative',
          marginTop: { xs: '-50px', md: '-100px' },
          paddingTop: { xs: '50px', md: '100px' },
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(135deg, rgba(0, 140, 128, 0.75) 0%, rgba(0, 188, 212, 0.65) 100%)',
            zIndex: 1,
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: { xs: '150px', md: '250px' },
            background: 'linear-gradient(to top, #008c80 0%, rgba(0, 140, 128, 0.95) 25%, rgba(0, 140, 128, 0.8) 50%, rgba(0, 140, 128, 0.5) 75%, transparent 100%)',
            zIndex: 2,
          },
        }}
      >
        {/* Continue with rest of content */}
        <Container maxWidth="lg" sx={{ py: { xs: 4, md: 8 }, flexGrow: 1, position: 'relative', zIndex: 3, px: { xs: 2, sm: 3 } }}>

          {/* 3. Über uns Section - TREĆA SEKCIJA */}
          <Box id="ueber-uns" sx={{ mb: { xs: 6, md: 12 } }}>
          <Typography
            variant="h3"
            sx={{ fontWeight: 700, mb: { xs: 3, md: 4 }, textAlign: 'center', color: 'white', fontSize: { xs: '1.75rem', sm: '2.5rem', md: '3rem' } }}
          >
            Über uns
          </Typography>
          <Typography
            variant="body1"
            sx={{ fontSize: { xs: '0.95rem', sm: '1.05rem', md: '1.15rem' }, lineHeight: 1.9, textAlign: 'center', maxWidth: '900px', mx: 'auto', mb: { xs: 3, md: 4 }, color: 'white', px: { xs: 1, sm: 0 } }}
          >
            <strong>MEDWEG</strong> ist Ihr zuverlässiger Partner für medizinische Versorgung mit Sitz in <strong>Augsburg, Deutschland</strong>.
            Wir spezialisieren uns auf den Vertrieb hochwertiger medizinischer Produkte für <strong>Unternehmen</strong> und <strong>Privatpersonen</strong>.
          </Typography>
          <Typography
            variant="body1"
            sx={{ fontSize: { xs: '0.95rem', sm: '1.05rem', md: '1.15rem' }, lineHeight: 1.9, textAlign: 'center', maxWidth: '900px', mx: 'auto', mb: { xs: 4, md: 6 }, color: 'white', px: { xs: 1, sm: 0 } }}
          >
            Unser Sortiment umfasst Einweghandschuhe, Desinfektionsmittel und Desinfektionstücher – alles,
            was Sie für eine sichere und hygienische Arbeitsumgebung benötigen.
          </Typography>

          {/* Products Grid */}
          <Grid container spacing={{ xs: 3, md: 4 }} sx={{ mt: { xs: 1, md: 2 }, mb: { xs: 4, md: 8 } }}>
            <Grid item xs={12} md={4}>
              <Card
                sx={{
                  height: '100%',
                  textAlign: 'center',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-12px)',
                    boxShadow: 12,
                    '& .product-icon': {
                      transform: 'scale(1.1) rotate(5deg)',
                    }
                  },
                  borderTop: '4px solid',
                  borderColor: '#2563EB',
                }}
              >
                <CardContent sx={{ py: 5, px: 3 }}>
                  <Box
                    component="img"
                    src="/lnx.png"
                    alt="Einweghandschuhe"
                    className="product-icon"
                    sx={{
                      height: 120,
                      width: 'auto',
                      objectFit: 'contain',
                      mb: 3,
                      transition: 'transform 0.3s',
                    }}
                  />
                  <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
                    Einweghandschuhe
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.8, fontSize: '0.95rem' }}>
                    Hochwertige Handschuhe in verschiedenen Größen (S, M, L, XL) für maximalen Schutz
                    und Komfort in medizinischen und hygienischen Umgebungen.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card
                sx={{
                  height: '100%',
                  textAlign: 'center',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-12px)',
                    boxShadow: 12,
                    '& .product-icon': {
                      transform: 'scale(1.1) rotate(5deg)',
                    }
                  },
                  borderTop: '4px solid',
                  borderColor: '#10B981',
                }}
              >
                <CardContent sx={{ py: 5, px: 3 }}>
                  <Box
                    component="img"
                    src="/dezmittel.webp"
                    alt="Desinfektionsmittel"
                    className="product-icon"
                    sx={{
                      height: 120,
                      width: 'auto',
                      objectFit: 'contain',
                      mb: 3,
                      transition: 'transform 0.3s',
                    }}
                  />
                  <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
                    Desinfektionsmittel
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.8, fontSize: '0.95rem' }}>
                    Effektive flüssige Desinfektionsmittel zur Hände- und Flächendesinfektion.
                    Zuverlässiger Schutz gegen Bakterien und Viren.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card
                sx={{
                  height: '100%',
                  textAlign: 'center',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-12px)',
                    boxShadow: 12,
                    '& .product-icon': {
                      transform: 'scale(1.1) rotate(5deg)',
                    }
                  },
                  borderTop: '4px solid',
                  borderColor: '#F59E0B',
                }}
              >
                <CardContent sx={{ py: 5, px: 3 }}>
                  <Box
                    component="img"
                    src="/dezwip.webp"
                    alt="Desinfektionstücher"
                    className="product-icon"
                    sx={{
                      height: 120,
                      width: 'auto',
                      objectFit: 'contain',
                      mb: 3,
                      transition: 'transform 0.3s',
                    }}
                  />
                  <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
                    Desinfektionstücher
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.8, fontSize: '0.95rem' }}>
                    Praktische Einwegtücher für schnelle und effektive Desinfektion von Oberflächen.
                    Ideal für unterwegs und den täglichen Gebrauch.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Über den Geschäftsführer - PODNASLOV */}
          <Box sx={{ mt: { xs: 4, md: 8 } }}>
            <Typography
              variant="h4"
              sx={{ fontWeight: 700, mb: { xs: 3, md: 5 }, textAlign: 'center', color: 'white', fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' } }}
            >
              Über den Geschäftsführer
            </Typography>
            <Paper elevation={6} sx={{ p: { xs: 3, sm: 4, md: 5 }, borderRadius: 4, background: 'linear-gradient(135deg, #ffffff 0%, #f5f5f5 100%)' }}>
              <Grid container spacing={{ xs: 3, md: 4 }} alignItems="center">
                <Grid item xs={12} md={4} sx={{ textAlign: 'center' }}>
                  <Box
                    sx={{
                      width: { xs: 200, sm: 240, md: 280 },
                      height: { xs: 250, sm: 300, md: 350 },
                      mx: 'auto',
                      mb: 2,
                      boxShadow: 6,
                      border: '4px solid',
                      borderColor: 'primary.main',
                      borderRadius: 4,
                      overflow: 'hidden',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: 'grey.100',
                    }}
                  >
                    <Box
                      component="img"
                      src="/placeholder-owner.jpg"
                      alt="Iles Papp"
                      sx={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        display: 'none',
                      }}
                      onError={(e: any) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '100%',
                        height: '100%',
                      }}
                    >
                      <BusinessCenterIcon sx={{ fontSize: 120, color: 'primary.main' }} />
                    </Box>
                  </Box>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: 'primary.main', mb: 0.5 }}>
                    Iles Papp
                  </Typography>
                  <Typography variant="subtitle1" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                    Geschäftsführer
                  </Typography>
                </Grid>
                <Grid item xs={12} md={8}>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'primary.dark' }}>
                    Erfahrung und Expertise
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.8, fontSize: '1.05rem' }}>
                    Mit langjähriger Erfahrung in der <strong>Pflegebranche</strong> bringt Iles Papp umfassende Kenntnisse
                    und praktische Expertise in die MedWeg Bavaria ein. Als erfahrener Geschäftsführer hat er erfolgreich
                    sein eigenes Unternehmen in Deutschland geleitet:
                  </Typography>
                  <Paper elevation={2} sx={{ p: 3, mb: 2, bgcolor: 'primary.50', borderLeft: '4px solid', borderColor: 'primary.main' }}>
                    <Typography variant="body1" sx={{ fontWeight: 600, color: 'primary.dark', mb: 1 }}>
                      Intensiv- und ambulante Pflegedienst
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.7 }}>
                      Gründung und Leitung eines erfolgreichen Pflegedienstes mit Fokus auf intensive und ambulante Pflege
                    </Typography>
                  </Paper>
                  <Typography variant="body1" sx={{ lineHeight: 1.8, fontSize: '1.05rem' }}>
                    Seine tiefe Branchenkenntnis und sein Engagement für Qualität machen ihn zum idealen Ansprechpartner
                    für alle Fragen rund um medizinische Versorgungsprodukte. Bei MEDWEG steht <strong>Kundenservice,
                    Zuverlässigkeit und höchste Qualitätsstandards</strong> an erster Stelle.
                  </Typography>
                </Grid>
              </Grid>
            </Paper>
          </Box>
        </Box>
        </Container>
      </Box>

      {/* Partner Section */}
      <Box
        sx={{
          bgcolor: 'white',
          py: { xs: 6, md: 10 },
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: { xs: '60px', md: '100px' },
            background: 'linear-gradient(to bottom, #008c80 0%, rgba(0, 140, 128, 0.9) 15%, rgba(0, 140, 128, 0.75) 30%, rgba(0, 140, 128, 0.55) 50%, rgba(255, 255, 255, 0.3) 75%, transparent 100%)',
            zIndex: 1,
          },
        }}
      >
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2, px: { xs: 2, sm: 3 } }}>
          <Typography
            variant="h3"
            sx={{ fontWeight: 700, mb: { xs: 4, md: 6 }, mt: { xs: 4, md: 8 }, textAlign: 'center', color: 'primary.main', fontSize: { xs: '1.75rem', sm: '2.5rem', md: '3rem' } }}
          >
            Unsere Partner
          </Typography>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              flexWrap: { xs: 'wrap', sm: 'nowrap' },
              gap: { xs: 2, sm: 3, md: 4 },
            }}
          >
            <Box
              component="img"
              src="/partner1.png"
              alt="Partner 1"
              sx={{
                height: { xs: 50, sm: 65, md: 80 },
                maxWidth: { xs: '150px', sm: '190px', md: '230px' },
                objectFit: 'contain',
              }}
            />
            <Box
              component="img"
              src="/q.png"
              alt="Partner 2"
              sx={{
                height: { xs: 45, sm: 58, md: 72 },
                maxWidth: { xs: '130px', sm: '165px', md: '200px' },
                objectFit: 'contain',
              }}
            />
            <Box
              component="img"
              src="/qq.png"
              alt="Partner 3"
              sx={{
                height: { xs: 65, sm: 90, md: 115 },
                maxWidth: { xs: '165px', sm: '215px', md: '265px' },
                objectFit: 'contain',
              }}
            />
            <Box
              component="img"
              src="/qqq.webp"
              alt="Partner 4"
              sx={{
                height: { xs: 75, sm: 110, md: 140 },
                maxWidth: { xs: '180px', sm: '240px', md: '300px' },
                objectFit: 'contain',
              }}
            />
          </Box>
        </Container>
      </Box>

      {/* Kontakt Background Section */}
      <Box
        sx={{
          bgcolor: 'white',
          py: { xs: 6, md: 8 },
        }}
      >
        <Container maxWidth="lg" sx={{ flexGrow: 1, position: 'relative', zIndex: 2, px: { xs: 2, sm: 3 } }}>

          {/* 4. Kontakt Section - ČETVRTA SEKCIJA */}
          <Box id="kontakt" sx={{ mb: { xs: 6, md: 10 } }}>
          <Typography
            variant="h3"
            sx={{ fontWeight: 700, mb: 2, textAlign: 'center', color: 'primary.main', fontSize: { xs: '1.75rem', sm: '2.5rem', md: '3rem' } }}
          >
            Kontaktieren Sie uns
          </Typography>
          <Typography
            variant="body1"
            sx={{ textAlign: 'center', color: 'text.secondary', mb: { xs: 4, md: 6 }, fontSize: { xs: '0.95rem', sm: '1.05rem', md: '1.15rem' }, px: { xs: 1, sm: 0 } }}
          >
            Haben Sie Fragen oder möchten Sie ein Angebot erhalten? Schreiben Sie uns!
          </Typography>

          <Paper elevation={8} sx={{ maxWidth: '800px', mx: 'auto', p: { xs: 3, sm: 4, md: 5 }, borderRadius: 4, boxShadow: '0 10px 40px rgba(0,0,0,0.1)' }}>
            <form onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Name *"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="E-Mail *"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Telefon"
                    name="telefon"
                    value={formData.telefon}
                    onChange={handleInputChange}
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Ihre Nachricht *"
                    name="nachricht"
                    multiline
                    rows={6}
                    value={formData.nachricht}
                    onChange={handleInputChange}
                    required
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12}>
                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    fullWidth
                    disabled={isSubmitting}
                    sx={{
                      py: 2,
                      fontWeight: 700,
                      fontSize: '1.15rem',
                      boxShadow: 4,
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: 8,
                      },
                      '&:disabled': {
                        background: '#80CBC4',
                        color: 'white',
                      },
                      transition: 'all 0.3s'
                    }}
                  >
                    {isSubmitting ? (
                      <>
                        <CircularProgress size={20} sx={{ mr: 1, color: 'white' }} />
                        Wird gesendet...
                      </>
                    ) : (
                      'Nachricht senden'
                    )}
                  </Button>
                </Grid>
              </Grid>
            </form>
          </Paper>
        </Box>
        </Container>
      </Box>

      {/* 5. Location Section - POSLEDNJA SEKCIJA */}
      <Box
        id="standort"
        sx={{
          position: 'relative',
          width: '100%',
          left: 0,
          right: 0,
        }}
      >
        {/* DESKTOP VERSION: Map as background */}
        <Box
          sx={{
            display: { xs: 'none', md: 'block' },
            position: 'relative',
            minHeight: '100vh',
            overflow: 'hidden',
          }}
        >
          {/* Google Maps Background */}
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 0,
            }}
          >
            <iframe
              title="MEDWEG Standort Augsburg"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d42647.36896864454!2d10.868687749999999!3d48.3705437!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x479ea1d4e5fb7c15%3A0x41d8a1f0c1c0720!2sAugsburg%2C%20Deutschland!5e0!3m2!1sde!2sde!4v1234567890"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </Box>

          {/* Semi-transparent overlay */}
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0, 0, 0, 0.2)',
              zIndex: 1,
            }}
          />

          {/* Info Box - Desktop */}
          <Paper
            elevation={10}
            sx={{
              position: 'absolute',
              top: 40,
              right: 40,
              zIndex: 2,
              p: 4,
              maxWidth: '450px',
              bgcolor: 'white',
              borderRadius: 3,
            }}
          >
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 3, color: 'primary.main' }}>
              Unser Standort
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              <LocationOnIcon sx={{ fontSize: 45, color: 'error.main' }} />
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main' }}>
                  MEDWEG
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Augsburg, Deutschland
                </Typography>
              </Box>
            </Box>
            <Box sx={{ p: 3, bgcolor: 'grey.50', borderRadius: 2 }}>
              <Typography variant="body2" sx={{ lineHeight: 1.8 }}>
                <strong>Stadt:</strong> Augsburg, Bayern<br />
                <strong>E-Mail:</strong> medwegbavaria@gmail.com<br />
                <strong>Telefon:</strong> +4915238941718<br />
                <strong>Öffnungszeiten:</strong> Mo-Fr, 9:00-18:00 Uhr
              </Typography>
            </Box>
          </Paper>

          {/* Footer over map */}
          <Box
            sx={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              zIndex: 3,
            }}
          >
            <LandingFooter />
          </Box>
        </Box>

        {/* MOBILE VERSION: Stacked layout */}
        <Box
          sx={{
            display: { xs: 'block', md: 'none' },
            bgcolor: 'white',
            pb: 0,
          }}
        >
          <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3 }, pt: 4 }}>
            {/* Info Section */}
            <Paper
              elevation={4}
              sx={{
                p: 3,
                mb: 3,
                borderRadius: 3,
              }}
            >
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 2, color: 'primary.main' }}>
                Unser Standort
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <LocationOnIcon sx={{ fontSize: 35, color: 'error.main' }} />
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main' }}>
                    MEDWEG
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Augsburg, Deutschland
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
                <Typography variant="body2" sx={{ lineHeight: 1.7 }}>
                  <strong>Stadt:</strong> Augsburg, Bayern<br />
                  <strong>E-Mail:</strong> medwegbavaria@gmail.com<br />
                  <strong>Telefon:</strong> +4915238941718<br />
                  <strong>Öffnungszeiten:</strong> Mo-Fr, 9:00-18:00 Uhr
                </Typography>
              </Box>
            </Paper>

            {/* Map Section */}
            <Paper
              elevation={4}
              sx={{
                overflow: 'hidden',
                borderRadius: 3,
                mb: 3,
              }}
            >
              <Box
                sx={{
                  width: '100%',
                  height: '400px',
                  position: 'relative',
                }}
              >
                <iframe
                  title="MEDWEG Standort Augsburg Mobile"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d42647.36896864454!2d10.868687749999999!3d48.3705437!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x479ea1d4e5fb7c15%3A0x41d8a1f0c1c0720!2sAugsburg%2C%20Deutschland!5e0!3m2!1sde!2sde!4v1234567890"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </Box>
            </Paper>
          </Container>

          {/* Footer */}
          <LandingFooter />
        </Box>
      </Box>
    </Box>
  );
};

export default LandingPage;
