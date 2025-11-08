import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Autocomplete,
  Alert,
  Chip,
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { de } from 'date-fns/locale';
import { toast } from 'react-toastify';
import * as orderApi from '../../api/orderApi';
import * as productApi from '../../api/productApi';
import * as patientApi from '../../api/patientApi';

/**
 * Create Order Dialog Component
 * For institutions to create new orders
 */

interface OrderItemInput {
  product: productApi.Product | null;
  quantity: number;
}

interface CreateOrderDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  fixedPatientId?: string; // If provided, patient selection is readonly
}

const CreateOrderDialog = ({ open, onClose, onSuccess, fixedPatientId }: CreateOrderDialogProps) => {
  const [products, setProducts] = useState<productApi.Product[]>([]);
  const [patients, setPatients] = useState<patientApi.Patient[]>([]);
  const [loading, setLoading] = useState(false);

  // Form state
  const [selectedPatient, setSelectedPatient] = useState<patientApi.Patient | null>(null);
  const [scheduledDate, setScheduledDate] = useState<Date | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItemInput[]>([
    { product: null, quantity: 1 },
  ]);

  // Load products and patients on mount
  useEffect(() => {
    if (open) {
      loadData();
    }
  }, [open]);

  const loadData = async () => {
    try {
      const [productsData, patientsData] = await Promise.all([
        productApi.getProducts(),
        patientApi.getPatients(),
      ]);
      setProducts(productsData);
      setPatients(patientsData);

      // If fixedPatientId is provided, auto-select that patient
      if (fixedPatientId) {
        const patient = patientsData.find(p => p.id === fixedPatientId);
        if (patient) {
          setSelectedPatient(patient);
        }
      }
    } catch (error: any) {
      toast.error('Fehler beim Laden der Daten');
    }
  };

  const handleAddItem = () => {
    setOrderItems([...orderItems, { product: null, quantity: 1 }]);
  };

  const handleRemoveItem = (index: number) => {
    if (orderItems.length > 1) {
      setOrderItems(orderItems.filter((_, i) => i !== index));
    }
  };

  const handleProductChange = (index: number, product: productApi.Product | null) => {
    const newItems = [...orderItems];
    newItems[index].product = product;
    // Set min order quantity if product is selected
    if (product && newItems[index].quantity < product.min_order_quantity) {
      newItems[index].quantity = product.min_order_quantity;
    }
    setOrderItems(newItems);
  };

  const handleQuantityChange = (index: number, quantity: number) => {
    const newItems = [...orderItems];
    newItems[index].quantity = Math.max(1, quantity);
    setOrderItems(newItems);
  };

  const calculateTotal = () => {
    return orderItems.reduce((sum, item) => {
      if (item.product) {
        return sum + Number(item.product.price_per_unit) * item.quantity;
      }
      return sum;
    }, 0);
  };

  const handleSubmit = async () => {
    // Validation
    if (!selectedPatient) {
      toast.error('Bitte wählen Sie einen Patienten aus');
      return;
    }

    if (orderItems.some((item) => !item.product)) {
      toast.error('Bitte wählen Sie für alle Positionen ein Produkt aus');
      return;
    }

    // Check min order quantities
    for (const item of orderItems) {
      if (item.product && item.quantity < item.product.min_order_quantity) {
        toast.error(
          `Mindestbestellmenge für "${item.product.name_de}" ist ${item.product.min_order_quantity}`
        );
        return;
      }
    }

    try {
      setLoading(true);

      const orderData: orderApi.CreateOrderDto = {
        patient_id: selectedPatient.id,
        items: orderItems.map((item) => ({
          product_id: item.product!.id,
          quantity: item.quantity,
        })),
        scheduled_date: scheduledDate ? scheduledDate.toISOString() : undefined,
        is_recurring: false,
      };

      await orderApi.createOrder(orderData);
      toast.success('Bestellung erfolgreich erstellt!');
      onSuccess();
      handleClose();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Fehler beim Erstellen der Bestellung');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedPatient(null);
    setScheduledDate(null);
    setOrderItems([{ product: null, quantity: 1 }]);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Neue Bestellung erstellen
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Patient Selection */}
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
              Patient auswählen *
            </Typography>
            {fixedPatientId ? (
              // Read-only patient display for workers
              <TextField
                value={selectedPatient ? `${selectedPatient.firstName} ${selectedPatient.lastName} - ${selectedPatient.uniqueCode}` : ''}
                fullWidth
                disabled
                sx={{
                  '& .MuiInputBase-root': {
                    bgcolor: 'grey.100',
                  },
                }}
              />
            ) : (
              // Editable patient selection for admins
              <Autocomplete
                options={patients}
                value={selectedPatient}
                onChange={(_, newValue) => setSelectedPatient(newValue)}
                getOptionLabel={(option) =>
                  `${option.firstName} ${option.lastName} - ${option.uniqueCode}`
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    placeholder="Patient auswählen..."
                    error={!selectedPatient}
                    helperText={!selectedPatient ? 'Bitte wählen Sie einen Patienten aus' : ''}
                  />
                )}
              />
            )}
            {/* Display patient address */}
            {selectedPatient && (
              <Alert severity="info" sx={{ mt: 2 }}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  Lieferadresse:
                </Typography>
                <Typography variant="body2">
                  {selectedPatient.address}
                </Typography>
              </Alert>
            )}
          </Box>

          {/* Scheduled Date */}
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
              Lieferdatum (optional)
            </Typography>
            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={de}>
              <DatePicker
                value={scheduledDate}
                onChange={(newValue) => setScheduledDate(newValue)}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    placeholder: 'Datum auswählen...',
                  },
                }}
              />
            </LocalizationProvider>
          </Box>

          {/* Order Items */}
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                Produkte
              </Typography>
              <Button
                startIcon={<AddIcon />}
                onClick={handleAddItem}
                size="small"
                variant="outlined"
              >
                Produkt hinzufügen
              </Button>
            </Box>

            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Produkt</strong></TableCell>
                    <TableCell width="120"><strong>Menge</strong></TableCell>
                    <TableCell width="120"><strong>Preis/Einheit</strong></TableCell>
                    <TableCell width="120"><strong>Gesamt</strong></TableCell>
                    <TableCell width="80" align="center"><strong>Aktion</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {orderItems.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Autocomplete
                          options={products}
                          value={item.product}
                          onChange={(_, newValue) => handleProductChange(index, newValue)}
                          getOptionLabel={(option) => option.name_de}
                          renderOption={(props, option) => {
                            const { key, ...otherProps } = props;
                            return (
                              <Box component="li" key={key} {...otherProps}>
                                <Box>
                                  <Typography variant="body2">{option.name_de}</Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    {option.size} - Min: {option.min_order_quantity}
                                  </Typography>
                                </Box>
                              </Box>
                            );
                          }}
                          renderInput={(params) => (
                            <TextField {...params} placeholder="Produkt wählen..." size="small" />
                          )}
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          type="number"
                          value={item.quantity}
                          onChange={(e) => handleQuantityChange(index, parseInt(e.target.value) || 1)}
                          size="small"
                          inputProps={{ min: 1 }}
                          helperText={
                            item.product && item.quantity < item.product.min_order_quantity
                              ? `Min: ${item.product.min_order_quantity}`
                              : ''
                          }
                          error={!!(item.product && item.quantity < item.product.min_order_quantity)}
                        />
                      </TableCell>
                      <TableCell>
                        {item.product ? `€${Number(item.product.price_per_unit).toFixed(2)}` : '-'}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={
                            item.product
                              ? `€${(Number(item.product.price_per_unit) * item.quantity).toFixed(2)}`
                              : '-'
                          }
                          color="primary"
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <IconButton
                          size="small"
                          onClick={() => handleRemoveItem(index)}
                          disabled={orderItems.length === 1}
                          color="error"
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>

          {/* Total */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, alignItems: 'center' }}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Gesamtbetrag:
            </Typography>
            <Chip
              label={`€${calculateTotal().toFixed(2)}`}
              color="success"
              sx={{ fontSize: '1.1rem', fontWeight: 700, px: 2, py: 3 }}
            />
          </Box>

          {/* Info Alert */}
          <Alert severity="info">
            Nach dem Erstellen wird Ihre Bestellung an die Admin-Anwendung gesendet und muss dort
            bestätigt werden.
          </Alert>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={handleClose} disabled={loading}>
          Abbrechen
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading || orderItems.length === 0}
          sx={{
            background: 'linear-gradient(135deg, #10B981 0%, #2563EB 100%)',
            '&:hover': {
              background: 'linear-gradient(135deg, #059669 0%, #1D4ED8 100%)',
            },
          }}
        >
          {loading ? 'Wird erstellt...' : 'Bestellung erstellen'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateOrderDialog;
