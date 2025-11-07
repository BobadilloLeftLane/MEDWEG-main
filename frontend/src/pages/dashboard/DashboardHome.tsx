import { Box, Grid, Card, CardContent, Typography, Paper } from '@mui/material';
import {
  People,
  Inventory,
  ShoppingCart,
  TrendingUp,
} from '@mui/icons-material';

interface StatCard {
  title: string;
  value: string | number;
  icon: JSX.Element;
  color: string;
  bgColor: string;
  change?: string;
}

/**
 * Dashboard Home Page
 * Overview with statistics and quick access
 */
const DashboardHome = () => {
  // TODO: Fetch real data from API
  const stats: StatCard[] = [
    {
      title: 'Patienten',
      value: 247,
      icon: <People sx={{ fontSize: 40 }} />,
      color: '#2563EB',
      bgColor: 'rgba(37, 99, 235, 0.1)',
      change: '+12 diese Woche',
    },
    {
      title: 'Produkte',
      value: 1523,
      icon: <Inventory sx={{ fontSize: 40 }} />,
      color: '#10B981',
      bgColor: 'rgba(16, 185, 129, 0.1)',
      change: '+45 neue',
    },
    {
      title: 'Bestellungen',
      value: 89,
      icon: <ShoppingCart sx={{ fontSize: 40 }} />,
      color: '#F59E0B',
      bgColor: 'rgba(245, 158, 11, 0.1)',
      change: '23 ausstehend',
    },
    {
      title: 'Umsatz (Monat)',
      value: '€45,230',
      icon: <TrendingUp sx={{ fontSize: 40 }} />,
      color: '#06B6D4',
      bgColor: 'rgba(6, 182, 212, 0.1)',
      change: '+15% vs. letzter Monat',
    },
  ];

  return (
    <Box>
      {/* Welcome Header */}
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            mb: 1,
            background: 'linear-gradient(135deg, #2563EB 0%, #10B981 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Willkommen zurück!
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Hier ist eine Übersicht Ihrer Aktivitäten
        </Typography>
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} lg={3} key={index}>
            <Card
              sx={{
                height: '100%',
                position: 'relative',
                overflow: 'visible',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 12px 24px rgba(0, 0, 0, 0.15)',
                },
                transition: 'all 0.3s ease',
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                  }}
                >
                  <Box sx={{ flex: 1 }}>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 1, fontWeight: 500 }}
                    >
                      {stat.title}
                    </Typography>
                    <Typography
                      variant="h4"
                      sx={{
                        fontWeight: 700,
                        mb: 0.5,
                        color: stat.color,
                      }}
                    >
                      {stat.value}
                    </Typography>
                    {stat.change && (
                      <Typography
                        variant="caption"
                        sx={{
                          color: 'text.secondary',
                          display: 'block',
                        }}
                      >
                        {stat.change}
                      </Typography>
                    )}
                  </Box>
                  <Box
                    sx={{
                      width: 64,
                      height: 64,
                      borderRadius: 3,
                      backgroundColor: stat.bgColor,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: stat.color,
                    }}
                  >
                    {stat.icon}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Quick Actions & Recent Activity */}
      <Grid container spacing={3}>
        {/* Quick Actions */}
        <Grid item xs={12} md={6}>
          <Paper
            sx={{
              p: 3,
              height: '100%',
              borderRadius: 3,
            }}
          >
            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                mb: 3,
                display: 'flex',
                alignItems: 'center',
                gap: 1,
              }}
            >
              Schnellzugriff
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Card
                sx={{
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    transform: 'translateX(8px)',
                    boxShadow: '0 4px 12px rgba(37, 99, 235, 0.2)',
                  },
                }}
              >
                <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: 2,
                      background: 'linear-gradient(135deg, #2563EB 0%, #10B981 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                    }}
                  >
                    <People />
                  </Box>
                  <Box>
                    <Typography variant="body1" fontWeight={600}>
                      Neuer Patient
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Patienten hinzufügen
                    </Typography>
                  </Box>
                </CardContent>
              </Card>

              <Card
                sx={{
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    transform: 'translateX(8px)',
                    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)',
                  },
                }}
              >
                <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: 2,
                      background: 'linear-gradient(135deg, #10B981 0%, #06B6D4 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                    }}
                  >
                    <ShoppingCart />
                  </Box>
                  <Box>
                    <Typography variant="body1" fontWeight={600}>
                      Neue Bestellung
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Bestellung erstellen
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Box>
          </Paper>
        </Grid>

        {/* Recent Activity */}
        <Grid item xs={12} md={6}>
          <Paper
            sx={{
              p: 3,
              height: '100%',
              borderRadius: 3,
            }}
          >
            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                mb: 3,
              }}
            >
              Letzte Aktivitäten
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {[
                { action: 'Neue Bestellung', detail: '#ORD-1234 erstellt', time: 'vor 2 Stunden' },
                { action: 'Patient hinzugefügt', detail: 'Max Mustermann', time: 'vor 5 Stunden' },
                { action: 'Produkt aktualisiert', detail: 'Medikament XYZ', time: 'vor 1 Tag' },
              ].map((activity, index) => (
                <Box
                  key={index}
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    backgroundColor: 'background.default',
                    border: '1px solid',
                    borderColor: 'divider',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      borderColor: 'primary.main',
                      backgroundColor: 'rgba(37, 99, 235, 0.02)',
                    },
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="body2" fontWeight={600}>
                      {activity.action}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {activity.time}
                    </Typography>
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    {activity.detail}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardHome;
