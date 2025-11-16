import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  AppBar,
  Toolbar,
  IconButton,
  Card,
  CardContent,
  Divider,
  Grid,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  ShoppingCart as ShoppingCartIcon,
  Logout as LogoutIcon,
  PanTool as PanToolIcon,
  Sanitizer as SanitizerIcon,
  CleaningServices as CleaningServicesIcon,
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import * as productApi from '../../api/productApi';
import { useAuthStore } from '../../store/authStore';
import CreateOrderDialog from '../orders/CreateOrderDialog';

/**
 * Worker Dashboard
 * Simple view for workers to order products for their patient
 */
const WorkerDashboard = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { user, clearAuth } = useAuthStore();
  const [products, setProducts] = useState<productApi.Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOrderDialogOpen, setCreateOrderDialogOpen] = useState(false);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await productApi.getProducts();
      setProducts(data.filter(p => p.is_available));
    } catch (error: any) {
      toast.error('Fehler beim Laden der Produkte');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    clearAuth();
    toast.success('Erfolgreich abgemeldet');
    navigate('/login');
  };

  const getProductIcon = (product: productApi.Product) => {
    let IconComponent;
    let color: string;

    switch (product.type) {
      case 'gloves':
        IconComponent = PanToolIcon;
        color = '#2563EB';
        break;
      case 'disinfectant_liquid':
        IconComponent = SanitizerIcon;
        color = '#10B981';
        break;
      case 'disinfectant_wipes':
        IconComponent = CleaningServicesIcon;
        color = '#F59E0B';
        break;
      default:
        IconComponent = ShoppingCartIcon;
        color = '#6B7280';
    }

    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 40,
            height: 40,
            borderRadius: 2,
            bgcolor: `${color}15`,
          }}
        >
          <IconComponent sx={{ color, fontSize: 24 }} />
        </Box>
        {product.size && (
          <Box
            sx={{
              px: 1,
              py: 0.5,
              borderRadius: 1,
              fontWeight: 700,
              fontSize: '0.75rem',
              bgcolor: `${color}20`,
              color: color,
              border: `1px solid ${color}`,
            }}
          >
            {product.size}
          </Box>
        )}
      </Box>
    );
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#F8FAFC' }}>
      {/* Header */}
      <AppBar position="static" sx={{ background: 'linear-gradient(135deg, #2563EB 0%, #10B981 100%)' }}>
        <Toolbar sx={{ flexDirection: { xs: 'column', sm: 'row' }, py: { xs: 1, sm: 0 }, gap: { xs: 1, sm: 0 } }}>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 700, fontSize: { xs: '1.1rem', sm: '1.25rem' } }}>
            MEDWEG Worker
          </Typography>
          <Typography variant="body2" sx={{ mr: { sm: 2 }, fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
            {user?.email}
          </Typography>
          <IconButton color="inherit" onClick={handleLogout} title="Abmelden" size={isMobile ? 'small' : 'medium'}>
            <LogoutIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Content */}
      <Container maxWidth="lg" sx={{ py: { xs: 2, sm: 3, md: 4 } }}>
        {/* Quick Order Button */}
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, mb: 3, gap: { xs: 2, sm: 0 } }}>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5, fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
              Verfügbare Produkte
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.85rem', sm: '0.875rem' } }}>
              Wählen Sie Produkte aus und erstellen Sie eine Bestellung
            </Typography>
          </Box>
          <Button
            variant="contained"
            size={isMobile ? 'medium' : 'large'}
            startIcon={<ShoppingCartIcon />}
            onClick={() => setCreateOrderDialogOpen(true)}
            fullWidth={isMobile}
            sx={{
              background: 'linear-gradient(135deg, #10B981 0%, #2563EB 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #059669 0%, #1D4ED8 100%)',
              },
              px: { xs: 2, sm: 3 },
              py: { xs: 1.2, sm: 1.5 },
            }}
          >
            Neue Bestellung
          </Button>
        </Box>

        {/* Products - Mobile Cards / Desktop Table */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress size={60} />
          </Box>
        ) : products.length === 0 ? (
          <Alert severity="info">Keine Produkte verfügbar.</Alert>
        ) : isMobile ? (
          // MOBILE: Card View
          <Box>
            {products.map((product) => (
              <Card key={product.id} sx={{ mb: 2 }}>
                <CardContent>
                  {/* Product Name and Icon */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box sx={{ flex: 1, mr: 2 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>
                        {product.name_de}
                      </Typography>
                      {product.description_de && (
                        <Typography variant="caption" color="text.secondary">
                          {product.description_de.substring(0, 80)}
                          {product.description_de.length > 80 ? '...' : ''}
                        </Typography>
                      )}
                    </Box>
                    {getProductIcon(product)}
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  {/* Product Details Grid */}
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">
                        Menge/Box
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600, mt: 0.5 }}>
                        {product.quantity_per_box} {product.unit}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">
                        Preis/Einheit
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: 'primary.main', mt: 0.5 }}>
                        €{Number(product.price_per_unit).toFixed(2)}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">
                        Min. Bestellung
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600, mt: 0.5 }}>
                        {product.min_order_quantity}
                      </Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            ))}
          </Box>
        ) : (
          // DESKTOP: Table View
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><strong>Produkt</strong></TableCell>
                  <TableCell><strong>Typ & Größe</strong></TableCell>
                  <TableCell><strong>Menge/Box</strong></TableCell>
                  <TableCell><strong>Preis/Einheit</strong></TableCell>
                  <TableCell><strong>Min. Bestellung</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {products.map((product) => (
                  <TableRow key={product.id} hover>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {product.name_de}
                      </Typography>
                      {product.description_de && (
                        <Typography variant="caption" color="text.secondary">
                          {product.description_de.substring(0, 60)}
                          {product.description_de.length > 60 ? '...' : ''}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>{getProductIcon(product)}</TableCell>
                    <TableCell>
                      {product.quantity_per_box} {product.unit}
                    </TableCell>
                    <TableCell>€{Number(product.price_per_unit).toFixed(2)}</TableCell>
                    <TableCell>{product.min_order_quantity}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Container>

      {/* Create Order Dialog */}
      <CreateOrderDialog
        open={createOrderDialogOpen}
        onClose={() => setCreateOrderDialogOpen(false)}
        onSuccess={() => {
          setCreateOrderDialogOpen(false);
          toast.success('Bestellung erfolgreich erstellt!');
        }}
        fixedPatientId={user?.patientId}
      />
    </Box>
  );
};

export default WorkerDashboard;
