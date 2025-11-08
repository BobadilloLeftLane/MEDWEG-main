import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  IconButton,
  InputAdornment,
  MenuItem,
} from '@mui/material';
import {
  Warehouse as WarehouseIcon,
  Edit as EditIcon,
  Add as AddIcon,
  Settings as SettingsIcon,
  CheckCircle as CheckIcon,
  PanTool as GlovesIcon,
  Sanitizer as SanitizerIcon,
  CleaningServices as SprayIcon,
  Inventory as WipesIcon,
  Checkroom as ClothingIcon,
  Healing as BandageIcon,
  Medication as MedicationIcon,
  MedicalServices as InstrumentsIcon,
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import * as warehouseApi from '../../api/warehouseApi';
import { keyframes } from '@mui/system';

/**
 * Warehouse Page (Lager)
 * Real-time stock management with low stock alerts
 */

// Pulsing animation for low stock
const pulse = keyframes`
  0% {
    box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7);
    border-color: #EF4444;
  }
  50% {
    box-shadow: 0 0 0 10px rgba(239, 68, 68, 0);
    border-color: #DC2626;
  }
  100% {
    box-shadow: 0 0 0 0 rgba(239, 68, 68, 0);
    border-color: #EF4444;
  }
`;

// Get product type chip with icon and color
const getProductTypeChip = (type: string, size?: string) => {
  let IconComponent;
  let color: string;
  let typeLabel: string;

  switch (type) {
    case 'gloves':
      IconComponent = GlovesIcon;
      color = '#2563EB'; // Blue
      typeLabel = 'Handschuhe';
      break;
    case 'disinfectant_liquid':
      IconComponent = SanitizerIcon;
      color = '#10B981'; // Green
      typeLabel = 'Desinfektion';
      break;
    case 'disinfectant_spray':
      IconComponent = SprayIcon;
      color = '#F59E0B'; // Orange
      typeLabel = 'Spray';
      break;
    case 'disinfectant_wipes':
      IconComponent = WipesIcon;
      color = '#F59E0B'; // Orange
      typeLabel = 'Tücher';
      break;
    case 'protective_clothing':
      IconComponent = ClothingIcon;
      color = '#8B5CF6'; // Purple
      typeLabel = 'Schutzkleidung';
      break;
    case 'bandages':
      IconComponent = BandageIcon;
      color = '#EF4444'; // Red
      typeLabel = 'Verbände';
      break;
    case 'medication':
      IconComponent = MedicationIcon;
      color = '#06B6D4'; // Cyan
      typeLabel = 'Medikamente';
      break;
    case 'medical_instruments':
      IconComponent = InstrumentsIcon;
      color = '#EC4899'; // Pink
      typeLabel = 'Instrumente';
      break;
    default:
      IconComponent = WarehouseIcon;
      color = '#6B7280'; // Gray
      typeLabel = type;
  }

  // Combine type and size if size exists
  const label = size ? `${typeLabel} - ${size}` : typeLabel;

  return (
    <Chip
      icon={<IconComponent sx={{ fontSize: 20 }} />}
      label={label}
      size="small"
      sx={{
        fontWeight: 600,
        bgcolor: `${color}15`,
        color: color,
        border: `1px solid ${color}`,
        '& .MuiChip-icon': {
          color: color,
        },
      }}
    />
  );
};

const WarehousePage = () => {
  const [products, setProducts] = useState<warehouseApi.ProductStock[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Edit dialogs
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [thresholdDialogOpen, setThresholdDialogOpen] = useState(false);
  const [increaseDialogOpen, setIncreaseDialogOpen] = useState(false);
  const [priceDialogOpen, setPriceDialogOpen] = useState(false);
  const [weightDialogOpen, setWeightDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<warehouseApi.ProductStock | null>(null);
  const [newQuantity, setNewQuantity] = useState(0);
  const [newThreshold, setNewThreshold] = useState(20);
  const [increaseAmount, setIncreaseAmount] = useState(0);
  const [newPurchasePrice, setNewPurchasePrice] = useState(0);
  const [newWeight, setNewWeight] = useState(0);
  const [newWeightUnit, setNewWeightUnit] = useState('kg');

  // Load stock data
  const loadStock = async () => {
    try {
      setLoading(true);
      setError('');
      const stock = await warehouseApi.getAllProductStock();
      setProducts(stock);
    } catch (err: any) {
      const errorMessage = err?.response?.data?.error || 'Fehler beim Laden der Lagerdaten';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStock();
  }, []);

  // Open edit stock dialog
  const handleEditStock = (product: warehouseApi.ProductStock) => {
    setSelectedProduct(product);
    setNewQuantity(product.stock_quantity);
    setEditDialogOpen(true);
  };

  // Open threshold dialog
  const handleEditThreshold = (product: warehouseApi.ProductStock) => {
    setSelectedProduct(product);
    setNewThreshold(product.low_stock_threshold);
    setThresholdDialogOpen(true);
  };

  // Open increase dialog
  const handleIncreaseStock = (product: warehouseApi.ProductStock) => {
    setSelectedProduct(product);
    setIncreaseAmount(0);
    setIncreaseDialogOpen(true);
  };

  // Open price dialog
  const handleEditPrice = (product: warehouseApi.ProductStock) => {
    setSelectedProduct(product);
    setNewPurchasePrice(product.purchase_price);
    setPriceDialogOpen(true);
  };

  // Open weight dialog
  const handleEditWeight = (product: warehouseApi.ProductStock) => {
    setSelectedProduct(product);
    setNewWeight(product.weight);
    setNewWeightUnit(product.weight_unit);
    setWeightDialogOpen(true);
  };

  // Save stock quantity
  const handleSaveStock = async () => {
    if (!selectedProduct) return;

    try {
      await warehouseApi.updateStockQuantity(selectedProduct.id, newQuantity);
      toast.success('Lagerbestand aktualisiert');
      loadStock();
      setEditDialogOpen(false);
    } catch (error: any) {
      toast.error(error?.response?.data?.error || 'Fehler beim Aktualisieren');
    }
  };

  // Save threshold
  const handleSaveThreshold = async () => {
    if (!selectedProduct) return;

    try {
      await warehouseApi.updateLowStockThreshold(selectedProduct.id, newThreshold);
      toast.success('Mindestschwelle aktualisiert');
      loadStock();
      setThresholdDialogOpen(false);
    } catch (error: any) {
      toast.error(error?.response?.data?.error || 'Fehler beim Aktualisieren');
    }
  };

  // Increase stock
  const handleSaveIncrease = async () => {
    if (!selectedProduct || increaseAmount <= 0) return;

    try {
      await warehouseApi.increaseStock(selectedProduct.id, increaseAmount);
      toast.success(`${increaseAmount} ${selectedProduct.unit} hinzugefügt`);
      loadStock();
      setIncreaseDialogOpen(false);
    } catch (error: any) {
      toast.error(error?.response?.data?.error || 'Fehler beim Hinzufügen');
    }
  };

  // Save purchase price
  const handleSavePrice = async () => {
    if (!selectedProduct) return;

    try {
      await warehouseApi.updatePurchasePrice(selectedProduct.id, newPurchasePrice);
      toast.success('Einkaufspreis aktualisiert');
      loadStock();
      setPriceDialogOpen(false);
    } catch (error: any) {
      toast.error(error?.response?.data?.error || 'Fehler beim Aktualisieren');
    }
  };

  // Save weight
  const handleSaveWeight = async () => {
    if (!selectedProduct) return;

    try {
      await warehouseApi.updateWeight(selectedProduct.id, newWeight, newWeightUnit);
      toast.success('Gewicht aktualisiert');
      loadStock();
      setWeightDialogOpen(false);
    } catch (error: any) {
      toast.error(error?.response?.data?.error || 'Fehler beim Aktualisieren');
    }
  };

  // Acknowledge low stock alert
  const handleAcknowledge = async (product: warehouseApi.ProductStock) => {
    try {
      await warehouseApi.acknowledgeLowStockAlert(product.id);
      toast.success('Warnung bestätigt');
      loadStock();
    } catch (error: any) {
      toast.error(error?.response?.data?.error || 'Fehler');
    }
  };

  // Check if product has low stock
  const isLowStock = (product: warehouseApi.ProductStock) => {
    return product.stock_quantity < product.low_stock_threshold;
  };

  // Check if alert is unacknowledged
  const isUnacknowledged = (product: warehouseApi.ProductStock) => {
    return isLowStock(product) && !product.low_stock_alert_acknowledged;
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <Box>
      {/* Header */}
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
          Lager
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Lagerverwaltung und Bestandsübersicht
        </Typography>
      </Box>

      {/* Products Grid */}
      <Grid container spacing={3}>
        {products.map((product) => {
          const lowStock = isLowStock(product);
          const unacknowledged = isUnacknowledged(product);

          return (
            <Grid item xs={12} sm={6} md={4} lg={3} key={product.id}>
              <Card
                sx={{
                  height: '100%',
                  border: unacknowledged ? '3px solid' : '1px solid',
                  borderColor: unacknowledged ? '#EF4444' : 'divider',
                  animation: unacknowledged ? `${pulse} 2s infinite` : 'none',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: unacknowledged
                      ? '0 12px 24px rgba(239, 68, 68, 0.3)'
                      : '0 12px 24px rgba(0, 0, 0, 0.15)',
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                <CardContent>
                  {/* Product Name */}
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 700,
                      mb: 1,
                      fontSize: '1rem',
                      color: unacknowledged ? 'error.main' : 'text.primary',
                    }}
                  >
                    {product.name_de}
                  </Typography>

                  {/* Type */}
                  <Box sx={{ mb: 2 }}>
                    {getProductTypeChip(product.type, product.size)}
                  </Box>

                  {/* Stock Quantity */}
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="caption" color="text.secondary">
                      Zustand:
                    </Typography>
                    <Typography
                      variant="h4"
                      sx={{
                        fontWeight: 700,
                        color: lowStock ? 'error.main' : 'success.main',
                      }}
                    >
                      {product.stock_quantity}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {product.unit}
                    </Typography>
                  </Box>

                  {/* Purchase Price */}
                  <Box sx={{ mb: 2, p: 1.5, bgcolor: 'primary.50', borderRadius: 1, border: '1px solid', borderColor: 'primary.100', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                        Einkaufspreis:
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main' }}>
                        €{Number(product.purchase_price).toFixed(2)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        pro Einheit ({product.quantity_per_box} {product.unit}/Box)
                      </Typography>
                    </Box>
                    <IconButton
                      size="small"
                      onClick={() => handleEditPrice(product)}
                      sx={{
                        bgcolor: 'primary.main',
                        color: 'white',
                        '&:hover': {
                          bgcolor: 'primary.dark',
                        }
                      }}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Box>

                  {/* Weight */}
                  <Box sx={{ mb: 2, p: 1.5, bgcolor: 'success.50', borderRadius: 1, border: '1px solid', borderColor: 'success.100', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                        Gewicht:
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: 'success.main' }}>
                        {Number(product.weight).toFixed(2)} {product.weight_unit}
                      </Typography>
                    </Box>
                    <IconButton
                      size="small"
                      onClick={() => handleEditWeight(product)}
                      sx={{
                        bgcolor: 'success.main',
                        color: 'white',
                        '&:hover': {
                          bgcolor: 'success.dark',
                        }
                      }}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Box>

                  {/* Threshold */}
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
                    Minimum: {product.low_stock_threshold} {product.unit}
                  </Typography>

                  {/* Low Stock Warning */}
                  {lowStock && (
                    <Alert
                      severity="error"
                      sx={{ mb: 2, py: 0 }}
                      action={
                        !product.low_stock_alert_acknowledged && (
                          <IconButton
                            size="small"
                            color="inherit"
                            onClick={() => handleAcknowledge(product)}
                          >
                            <CheckIcon fontSize="small" />
                          </IconButton>
                        )
                      }
                    >
                      <Typography variant="caption">
                        Niedriger Bestand!
                        {!product.low_stock_alert_acknowledged && ' (Neu)'}
                      </Typography>
                    </Alert>
                  )}

                  {/* Actions */}
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<EditIcon />}
                      onClick={() => handleEditStock(product)}
                    >
                      Zustand
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<AddIcon />}
                      onClick={() => handleIncreaseStock(product)}
                      color="success"
                    >
                      Hinzufügen
                    </Button>
                    <IconButton size="small" onClick={() => handleEditThreshold(product)}>
                      <SettingsIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* Edit Stock Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)}>
        <DialogTitle>Lagerbestand bearbeiten</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {selectedProduct?.name_de}
          </Typography>
          <TextField
            autoFocus
            label="Neuer Bestand"
            type="number"
            fullWidth
            value={newQuantity}
            onChange={(e) => {
              const val = parseInt(e.target.value);
              setNewQuantity(isNaN(val) ? 0 : val);
            }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">{selectedProduct?.unit}</InputAdornment>
              ),
            }}
            helperText="Negative Werte sind erlaubt (für Schulden)"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Abbrechen</Button>
          <Button onClick={handleSaveStock} variant="contained">
            Speichern
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Threshold Dialog */}
      <Dialog open={thresholdDialogOpen} onClose={() => setThresholdDialogOpen(false)}>
        <DialogTitle>Mindestschwelle bearbeiten</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {selectedProduct?.name_de}
          </Typography>
          <TextField
            autoFocus
            label="Minimumgrenze"
            type="number"
            fullWidth
            value={newThreshold}
            onChange={(e) => setNewThreshold(parseInt(e.target.value) || 0)}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">{selectedProduct?.unit}</InputAdornment>
              ),
            }}
            helperText="Warnung wenn Bestand unter diesem Wert fällt"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setThresholdDialogOpen(false)}>Abbrechen</Button>
          <Button onClick={handleSaveThreshold} variant="contained">
            Speichern
          </Button>
        </DialogActions>
      </Dialog>

      {/* Increase Stock Dialog */}
      <Dialog open={increaseDialogOpen} onClose={() => setIncreaseDialogOpen(false)}>
        <DialogTitle>Bestand erhöhen</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {selectedProduct?.name_de}
          </Typography>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Aktueller Bestand: <strong>{selectedProduct?.stock_quantity} {selectedProduct?.unit}</strong>
          </Typography>
          <TextField
            autoFocus
            label="Menge hinzufügen"
            type="number"
            fullWidth
            value={increaseAmount}
            onChange={(e) => setIncreaseAmount(parseInt(e.target.value) || 0)}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">{selectedProduct?.unit}</InputAdornment>
              ),
            }}
            helperText={`Neuer Bestand: ${(selectedProduct?.stock_quantity || 0) + increaseAmount}`}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIncreaseDialogOpen(false)}>Abbrechen</Button>
          <Button
            onClick={handleSaveIncrease}
            variant="contained"
            color="success"
            disabled={increaseAmount <= 0}
          >
            Hinzufügen
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Purchase Price Dialog */}
      <Dialog open={priceDialogOpen} onClose={() => setPriceDialogOpen(false)}>
        <DialogTitle>Einkaufspreis bearbeiten</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {selectedProduct?.name_de}
          </Typography>
          <TextField
            autoFocus
            label="Einkaufspreis"
            type="number"
            fullWidth
            value={newPurchasePrice}
            onChange={(e) => setNewPurchasePrice(parseFloat(e.target.value) || 0)}
            InputProps={{
              startAdornment: <InputAdornment position="start">€</InputAdornment>,
            }}
            inputProps={{
              step: 0.01,
              min: 0,
            }}
            helperText="Preis pro Einheit"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPriceDialogOpen(false)}>Abbrechen</Button>
          <Button onClick={handleSavePrice} variant="contained">
            Speichern
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Weight Dialog */}
      <Dialog open={weightDialogOpen} onClose={() => setWeightDialogOpen(false)}>
        <DialogTitle>Gewicht bearbeiten</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {selectedProduct?.name_de}
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              autoFocus
              label="Gewicht"
              type="number"
              fullWidth
              value={newWeight}
              onChange={(e) => setNewWeight(parseFloat(e.target.value) || 0)}
              inputProps={{
                step: 0.01,
                min: 0,
              }}
            />
            <TextField
              select
              label="Einheit"
              value={newWeightUnit}
              onChange={(e) => setNewWeightUnit(e.target.value)}
              sx={{ minWidth: 100 }}
            >
              <MenuItem value="kg">kg</MenuItem>
              <MenuItem value="g">g</MenuItem>
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setWeightDialogOpen(false)}>Abbrechen</Button>
          <Button onClick={handleSaveWeight} variant="contained" color="success">
            Speichern
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default WarehousePage;
