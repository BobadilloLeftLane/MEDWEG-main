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
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 700 }}>
            MEDWEG Worker
          </Typography>
          <Typography variant="body2" sx={{ mr: 2 }}>
            {user?.email}
          </Typography>
          <IconButton color="inherit" onClick={handleLogout} title="Abmelden">
            <LogoutIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Content */}
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Quick Order Button */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
              Verfügbare Produkte
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Wählen Sie Produkte aus und erstellen Sie eine Bestellung
            </Typography>
          </Box>
          <Button
            variant="contained"
            size="large"
            startIcon={<ShoppingCartIcon />}
            onClick={() => setCreateOrderDialogOpen(true)}
            sx={{
              background: 'linear-gradient(135deg, #10B981 0%, #2563EB 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #059669 0%, #1D4ED8 100%)',
              },
              px: 3,
              py: 1.5,
            }}
          >
            Neue Bestellung
          </Button>
        </Box>

        {/* Products Table */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress size={60} />
          </Box>
        ) : products.length === 0 ? (
          <Alert severity="info">Keine Produkte verfügbar.</Alert>
        ) : (
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
