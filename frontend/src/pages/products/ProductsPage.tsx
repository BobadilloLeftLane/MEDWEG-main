import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  TextField,
  InputAdornment,
  CircularProgress,
  Alert,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  MoreVert as MoreVertIcon,
  FilterList as FilterIcon,
  ShoppingCart as ShoppingCartIcon,
  Inventory as InventoryIcon,
  Sanitizer as SanitizerIcon,
  PanTool as PanToolIcon,
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import * as productApi from '../../api/productApi';
import CreateProductDialog from './CreateProductDialog';
import EditProductDialog from './EditProductDialog';
import CreateOrderDialog from '../orders/CreateOrderDialog';
import { getProductImageUrl } from '../../utils/productImages';
import { useAuthStore, UserRole } from '../../store/authStore';

/**
 * Products Page Component
 * - ADMIN_APPLICATION: Product management (create, edit, delete)
 * - ADMIN_INSTITUTION: View products and create orders
 */
const ProductsPage = () => {
  const { user } = useAuthStore();
  const isAdminApp = user?.role === UserRole.ADMIN_APPLICATION;
  const isInstitution = user?.role === UserRole.ADMIN_INSTITUTION;
  const [products, setProducts] = useState<productApi.Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('');

  // Dialogs
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [createOrderDialogOpen, setCreateOrderDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<productApi.Product | null>(null);

  // Menu
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [menuProduct, setMenuProduct] = useState<productApi.Product | null>(null);

  // Load products
  const loadProducts = async () => {
    try {
      setLoading(true);
      const filters: productApi.ProductFilters = {
        search: searchQuery || undefined,
        type: typeFilter || undefined,
      };
      const data = await productApi.getProducts(filters);
      setProducts(data);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Fehler beim Laden der Produkte');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, [searchQuery, typeFilter]);

  // Menu handlers
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, product: productApi.Product) => {
    setAnchorEl(event.currentTarget);
    setMenuProduct(product);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setMenuProduct(null);
  };

  // Edit product
  const handleEditClick = () => {
    if (menuProduct) {
      setSelectedProduct(menuProduct);
      setEditDialogOpen(true);
    }
    handleMenuClose();
  };

  // Delete product
  const handleDeleteClick = () => {
    if (menuProduct) {
      setSelectedProduct(menuProduct);
      setDeleteDialogOpen(true);
    }
    handleMenuClose();
  };

  const handleDeleteConfirm = async () => {
    if (!selectedProduct) return;

    try {
      await productApi.deleteProduct(selectedProduct.id);
      toast.success('Produkt erfolgreich gelöscht');
      loadProducts();
      setDeleteDialogOpen(false);
      setSelectedProduct(null);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Fehler beim Löschen');
    }
  };

  // Toggle availability
  const handleToggleAvailability = async (product: productApi.Product) => {
    try {
      await productApi.setProductAvailability(product.id, !product.is_available);
      toast.success(
        product.is_available
          ? 'Produkt deaktiviert'
          : 'Produkt aktiviert'
      );
      loadProducts();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Fehler beim Aktualisieren');
    }
    handleMenuClose();
  };

  // Get product type icon with size badge
  const getProductIcon = (product: productApi.Product) => {
    let IconComponent;
    let color: string;

    switch (product.type) {
      case 'gloves':
        IconComponent = PanToolIcon;
        color = '#2563EB'; // Blue
        break;
      case 'disinfectant_liquid':
        IconComponent = SanitizerIcon;
        color = '#10B981'; // Green
        break;
      case 'disinfectant_wipes':
        IconComponent = InventoryIcon;
        color = '#F59E0B'; // Orange
        break;
      default:
        IconComponent = ShoppingCartIcon;
        color = '#6B7280'; // Gray
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
          <Chip
            label={product.size}
            size="small"
            sx={{
              fontWeight: 700,
              bgcolor: `${color}20`,
              color: color,
              border: `1px solid ${color}`,
            }}
          />
        )}
      </Box>
    );
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          {isAdminApp ? 'Produktverwaltung' : 'Verfügbare Produkte'}
        </Typography>
        {isAdminApp && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setCreateDialogOpen(true)}
          >
            Neues Produkt
          </Button>
        )}
        {isInstitution && (
          <Button
            variant="contained"
            startIcon={<ShoppingCartIcon />}
            onClick={() => setCreateOrderDialogOpen(true)}
            sx={{
              background: 'linear-gradient(135deg, #10B981 0%, #2563EB 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #059669 0%, #1D4ED8 100%)',
              },
            }}
          >
            Neue Bestellung
          </Button>
        )}
      </Box>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField
            placeholder="Suche nach Name oder Beschreibung..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            size="small"
            sx={{ flex: 1 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
          <TextField
            select
            label="Produkttyp"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            size="small"
            sx={{ minWidth: 200 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <FilterIcon />
                </InputAdornment>
              ),
            }}
          >
            <MenuItem value="">Alle</MenuItem>
            <MenuItem value="gloves">Handschuhe</MenuItem>
            <MenuItem value="disinfectant_liquid">Desinfektionsmittel (Flüssig)</MenuItem>
            <MenuItem value="disinfectant_wipes">Desinfektionstücher</MenuItem>
          </TextField>
        </Box>
      </Paper>

      {/* Products Table */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : products.length === 0 ? (
        <Alert severity="info">
          Keine Produkte gefunden. Erstellen Sie ein neues Produkt.
        </Alert>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><strong>Bild</strong></TableCell>
                <TableCell><strong>Name</strong></TableCell>
                <TableCell><strong>Typ & Größe</strong></TableCell>
                <TableCell><strong>Menge/Box</strong></TableCell>
                <TableCell><strong>Preis/Einheit</strong></TableCell>
                <TableCell><strong>Min. Bestellung</strong></TableCell>
                <TableCell><strong>Status</strong></TableCell>
                {isAdminApp && <TableCell align="right"><strong>Aktionen</strong></TableCell>}
              </TableRow>
            </TableHead>
            <TableBody>
              {products.map((product) => (
                <TableRow key={product.id} hover>
                  <TableCell>
                    <Box
                      component="img"
                      src={getProductImageUrl(product.type, product.image_url)}
                      alt={product.name_de}
                      sx={{
                        width: 60,
                        height: 60,
                        objectFit: 'contain',
                        borderRadius: 1,
                        bgcolor: 'grey.100',
                        p: 0.5,
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {product.name_de}
                      </Typography>
                      {product.description_de && (
                        <Typography variant="caption" color="text.secondary">
                          {product.description_de.substring(0, 60)}
                          {product.description_de.length > 60 ? '...' : ''}
                        </Typography>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>{getProductIcon(product)}</TableCell>
                  <TableCell>
                    {product.quantity_per_box} {product.unit}
                  </TableCell>
                  <TableCell>€{Number(product.price_per_unit).toFixed(2)}</TableCell>
                  <TableCell>{product.min_order_quantity}</TableCell>
                  <TableCell>
                    <Chip
                      label={product.is_available ? 'Verfügbar' : 'Nicht verfügbar'}
                      color={product.is_available ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  {isAdminApp && (
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        onClick={(e) => handleMenuOpen(e, product)}
                      >
                        <MoreVertIcon />
                      </IconButton>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Action Menu - Only for Admin */}
      {isAdminApp && (
        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
          <MenuItem onClick={handleEditClick}>
            <EditIcon fontSize="small" sx={{ mr: 1 }} />
            Bearbeiten
          </MenuItem>
          <MenuItem onClick={() => menuProduct && handleToggleAvailability(menuProduct)}>
            {menuProduct?.is_available ? 'Deaktivieren' : 'Aktivieren'}
          </MenuItem>
          <MenuItem onClick={handleDeleteClick} sx={{ color: 'error.main' }}>
            <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
            Löschen
          </MenuItem>
        </Menu>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Produkt löschen?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Möchten Sie das Produkt "{selectedProduct?.name_de}" wirklich dauerhaft löschen?
            Diese Aktion kann nicht rückgängig gemacht werden.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Abbrechen</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Löschen
          </Button>
        </DialogActions>
      </Dialog>

      {/* Create Product Dialog - Only for Admin */}
      {isAdminApp && (
        <CreateProductDialog
          open={createDialogOpen}
          onClose={() => setCreateDialogOpen(false)}
          onSuccess={() => {
            setCreateDialogOpen(false);
            loadProducts();
          }}
        />
      )}

      {/* Create Order Dialog - Only for Institution */}
      {isInstitution && (
        <CreateOrderDialog
          open={createOrderDialogOpen}
          onClose={() => setCreateOrderDialogOpen(false)}
          onSuccess={() => {
            setCreateOrderDialogOpen(false);
            toast.success('Bestellung erfolgreich erstellt!');
          }}
        />
      )}

      {/* Edit Product Dialog - Only for Admin */}
      {isAdminApp && selectedProduct && (
        <EditProductDialog
          open={editDialogOpen}
          product={selectedProduct}
          onClose={() => {
            setEditDialogOpen(false);
            setSelectedProduct(null);
          }}
          onSuccess={() => {
            setEditDialogOpen(false);
            setSelectedProduct(null);
            loadProducts();
          }}
        />
      )}
    </Box>
  );
};

export default ProductsPage;
