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
  FormControl,
  InputLabel,
  Select,
  Pagination,
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
  FilterList as FilterIcon,
  Loop as LoopIcon,
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import * as orderApi from '../../api/orderApi';
import * as productApi from '../../api/productApi';
import * as recurringOrderApi from '../../api/recurringOrderApi';
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
  const isAdminInstitution = user?.role === UserRole.ADMIN_INSTITUTION;
  const [orders, setOrders] = useState<orderApi.OrderWithDetails[]>([]);
  const [products, setProducts] = useState<Map<string, productApi.Product>>(new Map());
  const [recurringTemplates, setRecurringTemplates] = useState<recurringOrderApi.RecurringOrderTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<orderApi.OrderStatus | ''>('');

  // Pagination state
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  const ordersPerPage = 20;

  // Date filter (month/year)
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState<number | ''>(currentDate.getMonth() + 1); // 1-12 or '' for all
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());

  // Load orders
  const loadOrders = async () => {
    try {
      setLoading(true);

      // Load orders based on user role
      if (user?.role === 'admin_application') {
        const filters = {
          status: statusFilter ? (statusFilter as orderApi.OrderStatus) : undefined,
          page,
          limit: ordersPerPage,
        };
        const result = await orderApi.getAllOrders(filters);
        setOrders(result.orders);
        setTotalPages(result.totalPages);
        setTotalOrders(result.total);
      } else {
        const filters = statusFilter ? { status: statusFilter as orderApi.OrderStatus } : undefined;
        const ordersData = await orderApi.getOrders(filters) as any;
        setOrders(ordersData);
      }

      // Load all products to display names
      const productsData = await productApi.getProducts();
      const productsMap = new Map(productsData.map((p) => [p.id, p]));
      setProducts(productsMap);

      // Load recurring templates for admin_institution
      if (isAdminInstitution) {
        try {
          const templates = await recurringOrderApi.getTemplates();
          setRecurringTemplates(templates);
        } catch (error) {
          console.log('Recurring templates not available yet');
          setRecurringTemplates([]);
        }
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Fehler beim Laden der Bestellungen');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [statusFilter, page]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [statusFilter]);

  // Filter orders by search and date
  const filteredOrders = orders
    .filter((order) => {
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch = (
        order.institution_name?.toLowerCase().includes(searchLower) ||
        order.patient_name?.toLowerCase().includes(searchLower) ||
        order.id.toLowerCase().includes(searchLower) ||
        order.order_number?.toString().includes(searchQuery)
      );

      // Date filter
      const orderDate = new Date(order.created_at);
      const matchesMonth = selectedMonth === '' || orderDate.getMonth() + 1 === selectedMonth;
      const matchesYear = orderDate.getFullYear() === selectedYear;

      return matchesSearch && matchesMonth && matchesYear;
    })
    .sort((a, b) => {
      // Priority order: confirmed > pending > shipped > delivered > cancelled
      const statusPriority: Record<orderApi.OrderStatus, number> = {
        confirmed: 1,
        pending: 2,
        shipped: 3,
        delivered: 4,
        cancelled: 5,
      };
      return statusPriority[a.status] - statusPriority[b.status];
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
  const handleShipOrder = async (orderId: string, orderNumber: number) => {
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

      // Download PDF invoice
      try {
        await orderApi.downloadInvoicePDF(orderId, orderNumber);
        toast.success('Rechnung wurde heruntergeladen!');
      } catch (pdfError) {
        console.error('PDF download error:', pdfError);
        toast.warning('Bestellung gesendet, aber Rechnung konnte nicht heruntergeladen werden');
      }

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
          <Grid item xs={12} md={6}>
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
          <Grid item xs={12} md={6} sm={6}>
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
          <Grid item xs={12} sm={6} md={3}>
            <FormControl size="small" fullWidth>
              <InputLabel>Monat</InputLabel>
              <Select
                value={selectedMonth}
                label="Monat"
                onChange={(e) => setSelectedMonth(e.target.value as any)}
              >
                <MenuItem value="">Alle Monate</MenuItem>
                <MenuItem value={1}>Januar</MenuItem>
                <MenuItem value={2}>Februar</MenuItem>
                <MenuItem value={3}>März</MenuItem>
                <MenuItem value={4}>April</MenuItem>
                <MenuItem value={5}>Mai</MenuItem>
                <MenuItem value={6}>Juni</MenuItem>
                <MenuItem value={7}>Juli</MenuItem>
                <MenuItem value={8}>August</MenuItem>
                <MenuItem value={9}>September</MenuItem>
                <MenuItem value={10}>Oktober</MenuItem>
                <MenuItem value={11}>November</MenuItem>
                <MenuItem value={12}>Dezember</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl size="small" fullWidth>
              <InputLabel>Jahr</InputLabel>
              <Select
                value={selectedYear}
                label="Jahr"
                onChange={(e) => setSelectedYear(Number(e.target.value))}
              >
                {[2024, 2025, 2026, 2027, 2028].map(year => (
                  <MenuItem key={year} value={year}>{year}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {/* Recurring Order Templates Section (Admin Institution only) */}
      {isAdminInstitution && recurringTemplates.length > 0 && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#2563EB' }}>
            📅 Automatische Bestellungen
          </Typography>
          <Grid container spacing={2}>
            {recurringTemplates.filter(t => t.is_active).map((template) => (
              <Grid item xs={12} md={6} lg={4} key={template.id}>
                <Card
                  sx={{
                    background: 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)',
                    border: '2px solid #3B82F6',
                    boxShadow: '0 4px 12px rgba(59, 130, 246, 0.15)',
                  }}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: '#1E40AF' }}>
                        {template.name}
                      </Typography>
                      <Chip
                        label="Aktiv"
                        size="small"
                        sx={{
                          bgcolor: '#10B981',
                          color: 'white',
                          fontWeight: 600,
                        }}
                      />
                    </Box>

                    {/* Patient Info */}
                    <Box sx={{ mb: 2 }}>
                      {template.patient_id ? (
                        <Chip
                          icon={<PersonIcon />}
                          label={template.patient_name}
                          size="small"
                          sx={{ bgcolor: 'white', color: '#2563EB', fontWeight: 500 }}
                        />
                      ) : (
                        <Chip
                          icon={<BusinessIcon />}
                          label={`Alle Patienten (${template.patient_count})`}
                          size="small"
                          sx={{ bgcolor: 'white', color: '#2563EB', fontWeight: 500 }}
                        />
                      )}
                    </Box>

                    {/* Schedule Info */}
                    <Box sx={{ mb: 2, bgcolor: 'white', p: 1.5, borderRadius: 1 }}>
                      <Typography variant="caption" color="text.secondary" display="block">
                        📦 Bestellung erstellen: <strong>{template.execution_day_of_month}. Tag des Monats</strong>
                      </Typography>
                      <Typography variant="caption" color="text.secondary" display="block">
                        🚚 Lieferdatum: <strong>{template.delivery_day_of_month}. Tag des Monats</strong>
                      </Typography>
                      <Typography variant="caption" color="text.secondary" display="block">
                        🔔 Benachrichtigung: <strong>{template.notification_days_before} Tage vorher</strong>
                      </Typography>
                    </Box>

                    <Divider sx={{ my: 2 }} />

                    {/* Products List */}
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: '#1E40AF' }}>
                      Produkte ({template.items.length})
                    </Typography>
                    <Box sx={{ maxHeight: 150, overflowY: 'auto' }}>
                      {template.items.map((item, idx) => (
                        <Box
                          key={idx}
                          sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            py: 0.5,
                            px: 1,
                            bgcolor: 'white',
                            borderRadius: 0.5,
                            mb: 0.5,
                          }}
                        >
                          <Typography variant="caption" sx={{ flex: 1 }}>
                            {item.name_de} ({item.size})
                          </Typography>
                          <Chip
                            label={`${item.quantity}x`}
                            size="small"
                            sx={{
                              bgcolor: '#DBEAFE',
                              color: '#1E40AF',
                              fontWeight: 600,
                              height: 20,
                              fontSize: '0.7rem',
                            }}
                          />
                        </Box>
                      ))}
                    </Box>
                  </CardContent>
                  <CardActions sx={{ bgcolor: 'rgba(255, 255, 255, 0.6)', justifyContent: 'center' }}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                      Nächste Bestellung: {template.execution_day_of_month}. {new Date().toLocaleDateString('de-DE', { month: 'long' })}
                    </Typography>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

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
        <>
          <Grid container spacing={3}>
            {filteredOrders.map((order) => (
            <Grid item xs={12} md={6} lg={4} key={order.id}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  // Svetlo plava pozadina i rub za automatske narudžbine
                  ...(order.is_recurring ? {
                    background: 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)',
                    border: '2px solid #3B82F6',
                    boxShadow: '0 4px 12px rgba(59, 130, 246, 0.15)',
                  } : {
                    // Zeleni rub za empfangen narudžbine (non-recurring)
                    border: order.status === 'confirmed' ? '3px solid #10B981' : 'none',
                    // Siva pozadina za završene narudžbine (non-recurring)
                    bgcolor: (order.status === 'shipped' || order.status === 'delivered') ? 'grey.100' : 'white',
                  }),
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 6,
                  },
                }}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  {/* Order Number with Automation Icon */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                      Bestellung #{order.order_number}
                    </Typography>
                    {order.is_recurring && (
                      <Tooltip title="Automatische Bestellung">
                        <LoopIcon sx={{ color: '#2563EB', fontSize: 24 }} />
                      </Tooltip>
                    )}
                  </Box>

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
                              onClick={() => handleShipOrder(order.id, order.order_number)}
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

          {/* Pagination */}
          {!loading && isAdminApp && totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mt: 4, gap: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Seite {page} von {totalPages} ({totalOrders} Bestellungen insgesamt)
              </Typography>
              <Pagination
                count={totalPages}
                page={page}
                onChange={(_, value) => setPage(value)}
                color="primary"
                size="large"
                showFirstButton
                showLastButton
              />
            </Box>
          )}
        </>
      )}
    </Box>
  );
};

export default OrdersPage;
