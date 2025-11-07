import { Box, Typography, Grid, Card, CardContent } from '@mui/material';
import { People, Inventory, ShoppingCart, TrendingUp } from '@mui/icons-material';

/**
 * Institution Dashboard
 * Za pflege.mitte@gmail.com, pflege.muenchen@gmail.com, pflege.hamburg@gmail.com
 * Vidi samo svoje pacijente, proizvode, porudžbine
 */
const InstitutionDashboard = () => {
  const stats = [
    {
      title: 'Meine Patienten',
      value: 42,
      icon: <People sx={{ fontSize: 40 }} />,
      color: '#2563EB',
      bgColor: 'rgba(37, 99, 235, 0.1)',
      change: '+5 diese Woche',
    },
    {
      title: 'Produkte',
      value: 156,
      icon: <Inventory sx={{ fontSize: 40 }} />,
      color: '#10B981',
      bgColor: 'rgba(16, 185, 129, 0.1)',
      change: 'Auf Lager',
    },
    {
      title: 'Meine Bestellungen',
      value: 23,
      icon: <ShoppingCart sx={{ fontSize: 40 }} />,
      color: '#F59E0B',
      bgColor: 'rgba(245, 158, 11, 0.1)',
      change: '8 aktiv',
    },
    {
      title: 'Monatlicher Umsatz',
      value: '€12.340',
      icon: <TrendingUp sx={{ fontSize: 40 }} />,
      color: '#06B6D4',
      bgColor: 'rgba(6, 182, 212, 0.1)',
      change: '+18% vs. letzter Monat',
    },
  ];

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            mb: 1,
            background: 'linear-gradient(135deg, #10B981 0%, #2563EB 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Pflegedienst Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Übersicht Ihrer Einrichtung
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} lg={3} key={index}>
            <Card
              sx={{
                height: '100%',
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
                    <Typography variant="caption" color="text.secondary">
                      {stat.change}
                    </Typography>
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
    </Box>
  );
};

export default InstitutionDashboard;
