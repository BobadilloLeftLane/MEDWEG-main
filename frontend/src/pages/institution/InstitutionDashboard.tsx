import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Paper,
  Chip,
  CircularProgress,
  Alert,
  Divider,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import {
  People,
  Inventory,
  ShoppingCart,
  TrendingUp,
  LocalShipping,
  HourglassEmpty,
  CalendarMonth,
  Assessment,
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import * as orderApi from '../../api/orderApi';
import * as patientApi from '../../api/patientApi';

/**
 * Institution Dashboard
 * Real-time data for Pflegedienst
 */
const InstitutionDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<orderApi.OrderWithDetails[]>([]);
  const [patients, setPatients] = useState<patientApi.Patient[]>([]);

  // Statistics
  const [monthlySpending, setMonthlySpending] = useState(0);
  const [pendingOrders, setPendingOrders] = useState<orderApi.OrderWithDetails[]>([]);
  const [shippedOrders, setShippedOrders] = useState<orderApi.OrderWithDetails[]>([]);
  const [avgMaterialPerPatient, setAvgMaterialPerPatient] = useState(0);
  const [totalMaterialUnits, setTotalMaterialUnits] = useState(0);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Load all orders and patients
      const [allOrders, allPatients] = await Promise.all([
        orderApi.getOrders(),
        patientApi.getPatients(),
      ]);

      setOrders(allOrders);
      setPatients(allPatients);

      // Calculate monthly spending (current month, confirmed/shipped/delivered)
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth();
      const currentYear = currentDate.getFullYear();

      const monthlyOrders = allOrders.filter((order) => {
        const orderDate = new Date(order.created_at);
        return (
          orderDate.getMonth() === currentMonth &&
          orderDate.getFullYear() === currentYear &&
          (order.status === 'confirmed' || order.status === 'shipped' || order.status === 'delivered')
        );
      });

      const spending = monthlyOrders.reduce((sum, order) => sum + Number(order.total_amount), 0);
      setMonthlySpending(spending);

      // Calculate total material units for this month
      const totalUnits = monthlyOrders.reduce((sum, order) => {
        const orderUnits = order.items?.reduce((itemSum, item) => itemSum + item.quantity, 0) || 0;
        return sum + orderUnits;
      }, 0);
      setTotalMaterialUnits(totalUnits);

      // Pending orders (not confirmed yet)
      const pending = allOrders.filter(
        (order) => order.status === 'pending' && !order.is_confirmed
      );
      setPendingOrders(pending);

      // Shipped orders (last 10)
      const shipped = allOrders
        .filter((order) => order.status === 'shipped' || order.status === 'delivered')
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 10);
      setShippedOrders(shipped);

      // Calculate average material units per patient (for this month)
      if (allPatients.length > 0 && totalUnits > 0) {
        setAvgMaterialPerPatient(totalUnits / allPatients.length);
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.error || 'Fehler beim Laden der Dashboard-Daten');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  const currentMonth = new Date().toLocaleDateString('de-DE', { month: 'long', year: 'numeric' });

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
            background: 'linear-gradient(135deg, #10B981 0%, #2563EB 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Pflegedienst Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ fontSize: { xs: '0.9rem', md: '1rem' } }}>
          Übersicht für {currentMonth}
        </Typography>
      </Box>

      <Grid container spacing={{ xs: 2, sm: 2.5, md: 3 }}>
        {/* Stats Cards */}
        <Grid item xs={12} sm={6} lg={3}>
          <Card>
            <CardContent sx={{ p: { xs: 2, sm: 2.5, md: 3 } }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
                    Meine Patienten
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: '#2563EB', fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2.125rem' } }}>
                    {patients.length}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                    Aktive Patienten
                  </Typography>
                </Box>
                <Box
                  sx={{
                    p: { xs: 1, sm: 1.25, md: 1.5 },
                    borderRadius: 2,
                    bgcolor: 'rgba(37, 99, 235, 0.1)',
                    color: '#2563EB',
                  }}
                >
                  <People sx={{ fontSize: { xs: 24, sm: 28, md: 32 } }} />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} lg={3}>
          <Card>
            <CardContent sx={{ p: { xs: 2, sm: 2.5, md: 3 } }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
                    Monatliche Ausgaben
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: '#EF4444', fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2.125rem' } }}>
                    €{monthlySpending.toFixed(2)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                    {currentMonth}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    p: { xs: 1, sm: 1.25, md: 1.5 },
                    borderRadius: 2,
                    bgcolor: 'rgba(239, 68, 68, 0.1)',
                    color: '#EF4444',
                  }}
                >
                  <TrendingUp sx={{ fontSize: { xs: 24, sm: 28, md: 32 } }} />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} lg={3}>
          <Card>
            <CardContent sx={{ p: { xs: 2, sm: 2.5, md: 3 } }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
                    In Bearbeitung
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: '#F59E0B', fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2.125rem' } }}>
                    {pendingOrders.length}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                    Nicht bestätigt
                  </Typography>
                </Box>
                <Box
                  sx={{
                    p: { xs: 1, sm: 1.25, md: 1.5 },
                    borderRadius: 2,
                    bgcolor: 'rgba(245, 158, 11, 0.1)',
                    color: '#F59E0B',
                  }}
                >
                  <HourglassEmpty sx={{ fontSize: { xs: 24, sm: 28, md: 32 } }} />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} lg={3}>
          <Card>
            <CardContent sx={{ p: { xs: 2, sm: 2.5, md: 3 } }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
                    ⌀ Material/Patient
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: '#10B981', fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2.125rem' } }}>
                    {Math.round(avgMaterialPerPatient)} Stück
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                    Pro Monat
                  </Typography>
                </Box>
                <Box
                  sx={{
                    p: { xs: 1, sm: 1.25, md: 1.5 },
                    borderRadius: 2,
                    bgcolor: 'rgba(16, 185, 129, 0.1)',
                    color: '#10B981',
                  }}
                >
                  <Inventory sx={{ fontSize: { xs: 24, sm: 28, md: 32 } }} />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Pending Orders List */}
        <Grid item xs={12} lg={6}>
          <Paper sx={{ p: { xs: 2, sm: 2.5, md: 3 }, height: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <HourglassEmpty sx={{ mr: 1, color: '#F59E0B', fontSize: { xs: 20, md: 24 } }} />
              <Typography variant="h6" sx={{ fontWeight: 600, fontSize: { xs: '1.1rem', sm: '1.15rem', md: '1.25rem' } }}>
                Bestellungen in Bearbeitung
              </Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />
            {pendingOrders.length === 0 ? (
              <Alert severity="info">Keine Bestellungen in Bearbeitung</Alert>
            ) : (
              <List sx={{ maxHeight: 400, overflow: 'auto' }}>
                {pendingOrders.map((order) => (
                  <ListItem
                    key={order.id}
                    sx={{
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 1,
                      mb: 1,
                      bgcolor: 'rgba(245, 158, 11, 0.05)',
                    }}
                  >
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                            Bestellung #{order.order_number}
                          </Typography>
                          <Chip label="Gesendet" size="small" color="warning" />
                        </Box>
                      }
                      secondary={
                        <Box sx={{ mt: 1 }}>
                          <Typography variant="body2" color="text.secondary">
                            Patient: {order.patient_name || 'Unbekannt'}
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: '#F59E0B', mt: 0.5 }}>
                            €{Number(order.total_amount).toFixed(2)} • {order.items?.reduce((sum, item) => sum + item.quantity, 0) || 0} Stück
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Erstellt: {new Date(order.created_at).toLocaleDateString('de-DE')}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </Paper>
        </Grid>

        {/* Shipped Orders List */}
        <Grid item xs={12} lg={6}>
          <Paper sx={{ p: { xs: 2, sm: 2.5, md: 3 }, height: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <LocalShipping sx={{ mr: 1, color: '#2563EB', fontSize: { xs: 20, md: 24 } }} />
              <Typography variant="h6" sx={{ fontWeight: 600, fontSize: { xs: '1.1rem', sm: '1.15rem', md: '1.25rem' } }}>
                Versendete Bestellungen
              </Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />
            {shippedOrders.length === 0 ? (
              <Alert severity="info">Keine versendeten Bestellungen</Alert>
            ) : (
              <List sx={{ maxHeight: 400, overflow: 'auto' }}>
                {shippedOrders.map((order) => (
                  <ListItem
                    key={order.id}
                    sx={{
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 1,
                      mb: 1,
                      bgcolor: 'rgba(37, 99, 235, 0.05)',
                    }}
                  >
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                            Bestellung #{order.order_number}
                          </Typography>
                          <Chip
                            label={order.status === 'delivered' ? 'Geliefert' : 'Versandt'}
                            size="small"
                            color={order.status === 'delivered' ? 'success' : 'primary'}
                          />
                        </Box>
                      }
                      secondary={
                        <Box sx={{ mt: 1 }}>
                          <Typography variant="body2" color="text.secondary">
                            Patient: {order.patient_name || 'Unbekannt'}
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: '#2563EB', mt: 0.5 }}>
                            €{Number(order.total_amount).toFixed(2)} • {order.items?.reduce((sum, item) => sum + item.quantity, 0) || 0} Stück
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Versendet: {new Date(order.created_at).toLocaleDateString('de-DE')}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </Paper>
        </Grid>

        {/* Material Statistics */}
        <Grid item xs={12}>
          <Paper sx={{ p: { xs: 2, sm: 2.5, md: 3 } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Inventory sx={{ mr: 1, color: '#10B981', fontSize: { xs: 20, md: 24 } }} />
              <Typography variant="h6" sx={{ fontWeight: 600, fontSize: { xs: '1.1rem', sm: '1.15rem', md: '1.25rem' } }}>
                Materialverbrauch pro Patient (Monatlich)
              </Typography>
            </Box>
            <Divider sx={{ mb: { xs: 2, md: 3 } }} />
            <Grid container spacing={{ xs: 2, sm: 2.5, md: 3 }}>
              <Grid item xs={12} md={4}>
                <Card sx={{ bgcolor: 'rgba(16, 185, 129, 0.05)' }}>
                  <CardContent sx={{ p: { xs: 2, sm: 2.5, md: 3 } }}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
                      Durchschnitt/Patient
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: '#10B981', fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2.125rem' } }}>
                      {Math.round(avgMaterialPerPatient)} Stück
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                      Basierend auf {patients.length} Patienten
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={4}>
                <Card sx={{ bgcolor: 'rgba(239, 68, 68, 0.05)' }}>
                  <CardContent sx={{ p: { xs: 2, sm: 2.5, md: 3 } }}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
                      Gesamtmaterial
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: '#EF4444', fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2.125rem' } }}>
                      {totalMaterialUnits} Stück
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                      {currentMonth}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={4}>
                <Card sx={{ bgcolor: 'rgba(37, 99, 235, 0.05)' }}>
                  <CardContent sx={{ p: { xs: 2, sm: 2.5, md: 3 } }}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
                      Gesamtkosten
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: '#2563EB', fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2.125rem' } }}>
                      €{monthlySpending.toFixed(2)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                      {currentMonth}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {patients.length > 0 && totalMaterialUnits > 0 && (
              <Alert severity="info" sx={{ mt: { xs: 2, md: 3 } }}>
                <Typography variant="body2" sx={{ fontSize: { xs: '0.85rem', sm: '0.875rem' } }}>
                  <strong>Materialverbrauch:</strong> Bei {patients.length} Patienten wurden insgesamt{' '}
                  <strong>{totalMaterialUnits} Stück</strong> Material bestellt, das entspricht durchschnittlich{' '}
                  <strong>{Math.round(avgMaterialPerPatient)} Stück pro Patient</strong> für {currentMonth}.
                  Gesamtkosten: <strong>€{monthlySpending.toFixed(2)}</strong>.
                </Typography>
              </Alert>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default InstitutionDashboard;