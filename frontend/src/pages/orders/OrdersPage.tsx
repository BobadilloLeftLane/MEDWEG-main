import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Card,
  CardContent,
  CardActions,
  Grid,
  Chip,
  Button,
  CircularProgress,
  Alert,
  TextField,
  InputAdornment,
  MenuItem,
  Divider,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Search as SearchIcon,
  Business as BusinessIcon,
  Person as PersonIcon,
  CalendarToday as CalendarIcon,
  CheckCircle as CheckCircleIcon,
  LocalShipping as ShippingIcon,
  Refresh as RefreshIcon,
  LocationOn as LocationIcon,
  Event as EventIcon,
  PanTool as PanToolIcon,
  Sanitizer as SanitizerIcon,
  CleaningServices as CleaningServicesIcon,
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import * as orderApi from '../../api/orderApi';
import * as productApi from '../../api/productApi';
import { useAuthStore, UserRole } from '../../store/authStore';

/**
 * Orders Page Component
 * Display orders as cards with products, status controls
 * For admin_application: Shows all orders from all institutions + confirm button
 * For admin_institution: Shows only their institution's orders (read-only)
 */
const OrdersPage = () => {
  const { user } = useAuthStore();
  const isAdminApp = user?.role === UserRole.ADMIN_APPLICATION;
  const [orders, setOrders] = useState<orderApi.OrderWithDetails[]>([]);
  const [products, setProducts] = useState<Map<string, productApi.Product>>(new Map());
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<orderApi.OrderStatus | ''>('');

  // Load orders
  const loadOrders = async () => {
    try {
      setLoading(true);

      // Load orders based on user role
      const filters = statusFilter ? { status: statusFilter as orderApi.OrderStatus } : undefined;

      let ordersData: orderApi.OrderWithDetails[];
      if (user?.role === 'admin_application') {
        ordersData = await orderApi.getAllOrders(filters);
      } else {
        ordersData = await orderApi.getOrders(filters) as any;
      }

      setOrders(ordersData);

      // Load all products to display names
      const productsData = await productApi.getProducts();
      const productsMap = new Map(productsData.map((p) => [p.id, p]));
      setProducts(productsMap);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Fehler beim Laden der Bestellungen');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [statusFilter]);

  // Filter orders by search
  const filteredOrders = orders.filter((order) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      order.institution_name?.toLowerCase().includes(searchLower) ||
      order.patient_name?.toLowerCase().includes(searchLower) ||
      order.id.toLowerCase().includes(searchLower)
    );
  });

  // Mark order as confirmed (empfangen/zaprimljeno) - Only for admin_application
  const handleConfirmOrder = async (orderId: string) => {
    try {
      // Optimistic update - update UI immediately
      setOrders(prevOrders =>
        prevOrders.map(order =>
          order.id === orderId
            ? { ...order, is_confirmed: true, status: 'confirmed' as orderApi.OrderStatus }
            : order
        )
      );

      // Make API call
      await orderApi.confirmOrder(orderId);

      toast.success('Bestellung wurde erfolgreich empfangen!');

      // Trigger event to update badge immediately
      window.dispatchEvent(new Event('orderConfirmed'));

      // Reload in background to sync with server
      setTimeout(() => loadOrders(), 500);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Fehler beim Bestätigen');
      // Revert optimistic update on error
      loadOrders();
    }
  };

  // Mark order as shipped (gesendet) - Only for admin_application
  const handleShipOrder = async (orderId: string) => {
    try {
      // Optimistic update
      setOrders(prevOrders =>
        prevOrders.map(order =>
          order.id === orderId
            ? { ...order, status: 'shipped' as orderApi.OrderStatus }
            : order
        )
      );

      // Use admin-specific endpoint
      await orderApi.updateOrderStatusAdmin(orderId, 'shipped');

      toast.success('Bestellung wurde gesendet!');

      // Reload in background
      setTimeout(() => loadOrders(), 500);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Fehler beim Aktualisieren');
      loadOrders();
    }
  };

  // Get status label and color
  const getStatusChip = (order: orderApi.OrderWithDetails) => {
    // Different labels for admin_application vs institution
    const isAdminApp = user?.role === 'admin_application';

    const statusMap: Record<orderApi.OrderStatus, { label: string; color: any }> = {
      pending: {
        label: isAdminApp ? 'Neu' : 'Gesendet',
        color: isAdminApp ? 'success' : 'warning'
      },
      confirmed: { label: 'Empfangen', color: 'info' },
      shipped: { label: 'Versandt', color: 'primary' },
      delivered: { label: 'Geliefert', color: 'success' },
      cancelled: { label: 'Storniert', color: 'error' },
    };

    const status = statusMap[order.status];
    return (
      <Chip
        label={status.label}
        color={status.color}
        size="small"
        sx={{ fontWeight: 600 }}
      />
    );
  };

  // Get product icon and color based on type
  const getProductIcon = (product: productApi.Product) => {
    switch (product.type) {
      case 'gloves':
        return { Icon: PanToolIcon, color: '#2563EB' }; // Blue
      case 'disinfectant_liquid':
        return { Icon: SanitizerIcon, color: '#10B981' }; // Green
      case 'disinfectant_wipes':
        return { Icon: CleaningServicesIcon, color: '#F59E0B' }; // Orange
      default:
        return { Icon: BusinessIcon, color: '#6B7280' }; // Gray
    }
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          Bestellungen
        </Typography>
        <Tooltip title="Aktualisieren">
          <IconButton onClick={loadOrders} color="primary">
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={8}>
            <TextField
              placeholder="Suche nach Firma, Patient oder Bestellungs-ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              size="small"
              fullWidth
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              select
              label="Status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              size="small"
              fullWidth
            >
              <MenuItem value="">Alle</MenuItem>
              <MenuItem value="pending">Gesendet</MenuItem>
              <MenuItem value="confirmed">Empfangen</MenuItem>
              <MenuItem value="shipped">Versandt</MenuItem>
              <MenuItem value="delivered">Geliefert</MenuItem>
              <MenuItem value="cancelled">Storniert</MenuItem>
            </TextField>
          </Grid>
        </Grid>
      </Paper>

      {/* Orders Cards */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : filteredOrders.length === 0 ? (
        <Alert severity="info">
          {searchQuery || statusFilter
            ? 'Keine Bestellungen gefunden.'
            : 'Noch keine Bestellungen vorhanden.'}
        </Alert>
      ) : (
        <Grid container spacing={3}>
          {filteredOrders.map((order) => (
            <Grid item xs={12} md={6} lg={4} key={order.id}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 6,
                  },
                }}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  {/* Status and Date */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    {getStatusChip(order)}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <CalendarIcon fontSize="small" color="action" />
                      <Typography variant="caption" color="text.secondary">
                        {new Date(order.created_at).toLocaleDateString('de-DE')}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Institution Name */}
                  {user?.role === 'admin_application' && order.institution_name && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <BusinessIcon fontSize="small" color="primary" />
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {order.institution_name}
                      </Typography>
                    </Box>
                  )}

                  {/* Patient Name */}
                  {order.patient_name && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <PersonIcon fontSize="small" color="action" />
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {order.patient_name}
                      </Typography>
                    </Box>
                  )}

                  {/* Patient Address */}
                  {order.patient_address && (
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 1 }}>
                      <LocationIcon fontSize="small" color="error" />
                      <Typography variant="body2" sx={{ fontWeight: 500, color: 'error.main' }}>
                        {order.patient_address}
                      </Typography>
                    </Box>
                  )}

                  {/* Scheduled Delivery Date */}
                  {order.scheduled_date ? (
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        mb: 2,
                        p: 1.5,
                        bgcolor: '#FFF4E6',
                        borderRadius: 1,
                        border: '2px solid #FF9800'
                      }}
                    >
                      <EventIcon fontSize="medium" sx={{ color: '#F57C00' }} />
                      <Box>
                        <Typography variant="caption" sx={{ color: '#F57C00', fontWeight: 600 }}>
                          LIEFERDATUM:
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 700, color: '#E65100' }}>
                          {new Date(order.scheduled_date).toLocaleDateString('de-DE', {
                            weekday: 'short',
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </Typography>
                      </Box>
                    </Box>
                  ) : (
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        mb: 2,
                        p: 1.5,
                        bgcolor: '#F5F5F5',
                        borderRadius: 1,
                        border: '1px dashed #9E9E9E'
                      }}
                    >
                      <EventIcon fontSize="small" sx={{ color: '#757575' }} />
                      <Typography variant="caption" sx={{ color: '#757575' }}>
                        Kein Lieferdatum angegeben
                      </Typography>
                    </Box>
                  )}

                  {/* Created By */}
                  {(order.created_by_user_email || order.created_by_worker_username) && (
                    <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 2 }}>
                      Erstellt von:{' '}
                      {order.created_by_user_email || order.created_by_worker_username}
                    </Typography>
                  )}

                  <Divider sx={{ my: 2 }} />

                  {/* Products List */}
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                    Produkte:
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    {order.items.map((item) => {
                      const product = products.get(item.product_id);
                      if (!product) {
                        return (
                          <Box
                            key={item.id}
                            sx={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              py: 0.5,
                            }}
                          >
                            <Typography variant="body2">
                              Unbekanntes Produkt x {item.quantity}
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              €{Number(item.subtotal).toFixed(2)}
                            </Typography>
                          </Box>
                        );
                      }

                      const { Icon, color } = getProductIcon(product);

                      return (
                        <Box
                          key={item.id}
                          sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            py: 0.5,
                            px: 1,
                            borderRadius: 1,
                            '&:hover': {
                              bgcolor: 'grey.50',
                            },
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
                            <Box
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: 32,
                                height: 32,
                                borderRadius: 1,
                                bgcolor: `${color}15`,
                              }}
                            >
                              <Icon sx={{ color, fontSize: 18 }} />
                            </Box>
                            <Box sx={{ flex: 1 }}>
                              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                {product.name_de}
                              </Typography>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Typography variant="caption" color="text.secondary">
                                  {item.quantity} Stück
                                </Typography>
                                {product.size && (
                                  <Chip
                                    label={product.size}
                                    size="small"
                                    sx={{
                                      height: 18,
                                      fontSize: '0.65rem',
                                      fontWeight: 700,
                                      bgcolor: `${color}20`,
                                      color: color,
                                    }}
                                  />
                                )}
                              </Box>
                            </Box>
                          </Box>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: 'primary.main' }}>
                            €{Number(item.subtotal).toFixed(2)}
                          </Typography>
                        </Box>
                      );
                    })}
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  {/* Total Amount */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                      Gesamt:
                    </Typography>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                      €{Number(order.total_amount).toFixed(2)}
                    </Typography>
                  </Box>
                </CardContent>

                <CardActions sx={{ p: 2, pt: 0 }}>
                  <Grid container spacing={1}>
                    {/* Admin Application: Buttons */}
                    {isAdminApp && (
                      <>
                        {/* Step 1: Empfangen button - when pending and not confirmed */}
                        {!order.is_confirmed && order.status === 'pending' && (
                          <Grid item xs={12}>
                            <Button
                              fullWidth
                              variant="contained"
                              color="success"
                              size="small"
                              startIcon={<CheckCircleIcon />}
                              onClick={() => handleConfirmOrder(order.id)}
                            >
                              Empfangen
                            </Button>
                          </Grid>
                        )}

                        {/* Step 2: Gesendet button - when confirmed but not shipped */}
                        {order.is_confirmed && order.status === 'confirmed' && (
                          <Grid item xs={12}>
                            <Button
                              fullWidth
                              variant="contained"
                              color="primary"
                              size="small"
                              startIcon={<ShippingIcon />}
                              onClick={() => handleShipOrder(order.id)}
                            >
                              Gesendet
                            </Button>
                          </Grid>
                        )}
                      </>
                    )}

                    {/* Status badges - Show for everyone when order is processed */}
                    {order.is_confirmed && (
                      <Grid item xs={12}>
                        <Chip
                          icon={<CheckCircleIcon />}
                          label="Empfangen"
                          color="success"
                          size="small"
                          sx={{ width: '100%' }}
                        />
                      </Grid>
                    )}

                    {order.status === 'shipped' && (
                      <Grid item xs={12}>
                        <Chip
                          icon={<ShippingIcon />}
                          label="Gesendet"
                          color="primary"
                          size="small"
                          sx={{ width: '100%' }}
                        />
                      </Grid>
                    )}
                  </Grid>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default OrdersPage;
