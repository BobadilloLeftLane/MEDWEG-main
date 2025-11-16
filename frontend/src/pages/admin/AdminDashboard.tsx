import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Divider,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  Business,
  People,
  ShoppingCart,
  TrendingUp,
  TrendingDown,
  TrendingFlat,
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import * as adminApi from '../../api/adminApi';

/**
 * Admin Application Dashboard
 * Real-time statistics from backend API
 */
const AdminDashboard = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [dashboardStats, setDashboardStats] = useState<adminApi.DashboardStatistics | null>(null);
  const [institutionStats, setInstitutionStats] = useState<adminApi.InstitutionStatistics[]>([]);
  const [productStats, setProductStats] = useState<adminApi.ProductStatistics[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Load all statistics
  useEffect(() => {
    const loadStatistics = async () => {
      try {
        setLoading(true);
        setError('');

        // Fetch all statistics in parallel
        const [dashboard, institutions, products] = await Promise.all([
          adminApi.getDashboardStatistics(),
          adminApi.getInstitutionStatistics(),
          adminApi.getProductStatistics(),
        ]);

        setDashboardStats(dashboard);
        setInstitutionStats(institutions);
        setProductStats(products);
      } catch (err: any) {
        const errorMessage = err?.response?.data?.error || 'Fehler beim Laden der Statistiken';
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    loadStatistics();
  }, []);

  // Loading state
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  // Error state
  if (error || !dashboardStats) {
    return (
      <Alert severity="error" sx={{ mb: 3 }}>
        {error || 'Keine Daten verfügbar'}
      </Alert>
    );
  }

  // Revenue trend icon
  const RevenueTrendIcon = () => {
    if (dashboardStats.revenue.percent_change > 0) {
      return <TrendingUp sx={{ fontSize: 20, color: 'success.main', ml: 0.5 }} />;
    } else if (dashboardStats.revenue.percent_change < 0) {
      return <TrendingDown sx={{ fontSize: 20, color: 'error.main', ml: 0.5 }} />;
    }
    return <TrendingFlat sx={{ fontSize: 20, color: 'text.secondary', ml: 0.5 }} />;
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  };

  // Calculate active orders (pending + confirmed)
  const activeOrders = dashboardStats.orders.pending + dashboardStats.orders.confirmed;

  // Get most and least popular products
  const mostPopular = productStats.slice(0, 5);
  const leastPopular = productStats.slice(-5).reverse();

  const mainStats = [
    {
      title: 'Einrichtungen Gesamt',
      value: dashboardStats.institutions.total,
      icon: <Business sx={{ fontSize: 40 }} />,
      color: '#2563EB',
      bgColor: 'rgba(37, 99, 235, 0.1)',
      change: `+${dashboardStats.institutions.new_this_week} diese Woche`,
    },
    {
      title: 'Benutzer Gesamt',
      value: dashboardStats.users.total,
      icon: <People sx={{ fontSize: 40 }} />,
      color: '#10B981',
      bgColor: 'rgba(16, 185, 129, 0.1)',
      change: `+${dashboardStats.users.new_this_week} neue`,
    },
    {
      title: 'Bestellungen Gesamt',
      value: dashboardStats.orders.total,
      icon: <ShoppingCart sx={{ fontSize: 40 }} />,
      color: '#F59E0B',
      bgColor: 'rgba(245, 158, 11, 0.1)',
      change: `${activeOrders} aktiv`,
    },
    {
      title: 'Gesamtumsatz',
      value: formatCurrency(dashboardStats.revenue.total),
      icon: <TrendingUp sx={{ fontSize: 40 }} />,
      color: '#06B6D4',
      bgColor: 'rgba(6, 182, 212, 0.1)',
      change: `${dashboardStats.revenue.percent_change > 0 ? '+' : ''}${dashboardStats.revenue.percent_change}% vs. letzter Monat`,
    },
  ];

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: { xs: 3, md: 4 } }}>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            mb: 1,
            fontSize: { xs: '1.75rem', sm: '2rem', md: '2.125rem' },
            background: 'linear-gradient(135deg, #2563EB 0%, #10B981 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Admin Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ fontSize: { xs: '0.9rem', md: '1rem' } }}>
          Systemübersicht - alle Einrichtungen
        </Typography>
      </Box>

      {/* Main Statistics Cards */}
      <Grid container spacing={{ xs: 2, sm: 2.5, md: 3 }} sx={{ mb: { xs: 3, md: 4 } }}>
        {mainStats.map((stat, index) => (
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
              <CardContent sx={{ p: { xs: 2, sm: 2.5, md: 3 } }}>
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
                      sx={{ mb: 1, fontWeight: 500, fontSize: { xs: '0.8rem', sm: '0.85rem', md: '0.875rem' } }}
                    >
                      {stat.title}
                    </Typography>
                    <Typography
                      variant="h4"
                      sx={{
                        fontWeight: 700,
                        mb: 0.5,
                        color: stat.color,
                        fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2.125rem' },
                      }}
                    >
                      {stat.value}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                        {stat.change}
                      </Typography>
                      {stat.title === 'Gesamtumsatz' && <RevenueTrendIcon />}
                    </Box>
                  </Box>
                  <Box
                    sx={{
                      width: { xs: 48, sm: 56, md: 64 },
                      height: { xs: 48, sm: 56, md: 64 },
                      borderRadius: 3,
                      backgroundColor: stat.bgColor,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: stat.color,
                      '& svg': {
                        fontSize: { xs: 30, sm: 35, md: 40 }
                      }
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

      {/* Institution Statistics - Mobile Cards / Desktop Table */}
      <Paper sx={{ p: { xs: 2, sm: 2.5, md: 3 }, mb: { xs: 3, md: 4 } }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, fontSize: { xs: '1.1rem', sm: '1.15rem', md: '1.25rem' } }}>
          Einrichtungen - Detaillierte Statistik
        </Typography>
        <Divider sx={{ mb: 2 }} />

        {isMobile ? (
          // MOBILE: Card View
          <Box>
            {institutionStats.map((institution) => (
              <Card key={institution.institution_id} sx={{ mb: 2 }}>
                <CardContent>
                  {/* Institution Name and Status */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      {institution.institution_name}
                    </Typography>
                    <Chip
                      label={institution.confirmed_orders > 0 ? 'Aktiv' : 'Inaktiv'}
                      color={institution.confirmed_orders > 0 ? 'success' : 'default'}
                      size="small"
                      sx={{ fontSize: '0.7rem' }}
                    />
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  {/* Statistics Grid */}
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">
                        Bestellungen
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600, mt: 0.5 }}>
                        {institution.total_orders}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {institution.pending_orders} ausstehend
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">
                        Umsatz
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: 'primary.main', mt: 0.5 }}>
                        {formatCurrency(institution.total_revenue)}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">
                        Patienten
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600, mt: 0.5 }}>
                        {institution.patient_count}
                      </Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            ))}
            {institutionStats.length === 0 && (
              <Alert severity="info">
                Keine Einrichtungen vorhanden
              </Alert>
            )}
          </Box>
        ) : (
          // DESKTOP: Table View
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><strong>Einrichtung</strong></TableCell>
                  <TableCell align="right"><strong>Bestellungen</strong></TableCell>
                  <TableCell align="right"><strong>Umsatz</strong></TableCell>
                  <TableCell align="right"><strong>Patienten</strong></TableCell>
                  <TableCell align="center"><strong>Status</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {institutionStats.map((institution) => (
                  <TableRow key={institution.institution_id} hover>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {institution.institution_name}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2">
                        {institution.total_orders}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {institution.pending_orders} ausstehend
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" sx={{ fontWeight: 600, color: 'primary.main' }}>
                        {formatCurrency(institution.total_revenue)}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2">
                        {institution.patient_count}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={institution.confirmed_orders > 0 ? 'Aktiv' : 'Inaktiv'}
                        color={institution.confirmed_orders > 0 ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                  </TableRow>
                ))}
                {institutionStats.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      <Typography variant="body2" color="text.secondary">
                        Keine Einrichtungen vorhanden
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* Product Statistics */}
      <Grid container spacing={{ xs: 2, sm: 2.5, md: 3 }}>
        {/* Most Popular Products */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: { xs: 2, sm: 2.5, md: 3 } }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: 'success.main', fontSize: { xs: '1.1rem', sm: '1.15rem', md: '1.25rem' } }}>
              Beliebteste Produkte
            </Typography>
            <Divider sx={{ mb: 2 }} />
            {mostPopular.length > 0 ? (
              <TableContainer sx={{ overflowX: 'auto' }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}><strong>Produkt</strong></TableCell>
                      <TableCell align="right" sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}><strong>Bestellungen</strong></TableCell>
                      <TableCell align="right" sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}><strong>Menge</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {mostPopular.map((product, index) => (
                      <TableRow key={product.product_id}>
                        <TableCell sx={{ py: { xs: 1, md: 1.5 } }}>
                          <Typography variant="body2" sx={{ fontWeight: 500, fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
                            {index + 1}. {product.product_name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                            {product.type}
                          </Typography>
                        </TableCell>
                        <TableCell align="right" sx={{ py: { xs: 1, md: 1.5 } }}>
                          <Typography variant="body2" sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>{product.times_ordered}</Typography>
                        </TableCell>
                        <TableCell align="right" sx={{ py: { xs: 1, md: 1.5 } }}>
                          <Typography variant="body2" sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>{product.total_quantity}</Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Typography variant="body2" color="text.secondary" align="center" sx={{ fontSize: { xs: '0.85rem', sm: '0.875rem' } }}>
                Keine Daten verfügbar
              </Typography>
            )}
          </Paper>
        </Grid>

        {/* Least Popular Products */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: { xs: 2, sm: 2.5, md: 3 } }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: 'error.main', fontSize: { xs: '1.1rem', sm: '1.15rem', md: '1.25rem' } }}>
              Am wenigsten bestellte Produkte
            </Typography>
            <Divider sx={{ mb: 2 }} />
            {leastPopular.length > 0 ? (
              <TableContainer sx={{ overflowX: 'auto' }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}><strong>Produkt</strong></TableCell>
                      <TableCell align="right" sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}><strong>Bestellungen</strong></TableCell>
                      <TableCell align="right" sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}><strong>Menge</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {leastPopular.map((product, index) => (
                      <TableRow key={product.product_id}>
                        <TableCell sx={{ py: { xs: 1, md: 1.5 } }}>
                          <Typography variant="body2" sx={{ fontWeight: 500, fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
                            {index + 1}. {product.product_name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                            {product.type}
                          </Typography>
                        </TableCell>
                        <TableCell align="right" sx={{ py: { xs: 1, md: 1.5 } }}>
                          <Typography variant="body2" sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>{product.times_ordered}</Typography>
                        </TableCell>
                        <TableCell align="right" sx={{ py: { xs: 1, md: 1.5 } }}>
                          <Typography variant="body2" sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>{product.total_quantity}</Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Typography variant="body2" color="text.secondary" align="center" sx={{ fontSize: { xs: '0.85rem', sm: '0.875rem' } }}>
                Keine Daten verfügbar
              </Typography>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdminDashboard;
