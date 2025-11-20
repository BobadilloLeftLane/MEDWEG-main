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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Autocomplete,
  Switch,
  FormControlLabel,
  Alert,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Divider,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Refresh,
  CheckCircle,
  Cancel,
  CalendarToday,
  Loop,
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import * as recurringOrderApi from '../../api/recurringOrderApi';
import * as productApi from '../../api/productApi';
import * as patientApi from '../../api/patientApi';

/**
 * Recurring Orders Page
 * Manage automatic monthly order templates
 */

interface OrderItemInput {
  product: productApi.Product | null;
  quantity: number;
}

const RecurringOrdersPage = () => {
  const [templates, setTemplates] = useState<recurringOrderApi.RecurringOrderTemplate[]>([]);
  const [products, setProducts] = useState<productApi.Product[]>([]);
  const [patients, setPatients] = useState<patientApi.Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<recurringOrderApi.RecurringOrderTemplate | null>(null);

  // Form state
  const [templateName, setTemplateName] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<patientApi.Patient | null>(null);
  const [applyToAllPatients, setApplyToAllPatients] = useState(true);
  const [executionDay, setExecutionDay] = useState(5);
  const [deliveryDay, setDeliveryDay] = useState(20);
  const [notificationDays, setNotificationDays] = useState(5);
  const [orderItems, setOrderItems] = useState<OrderItemInput[]>([
    { product: null, quantity: 1 },
  ]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      // Load products and patients first (these always work)
      const [productsData, patientsData] = await Promise.all([
        productApi.getProducts(),
        patientApi.getPatients(),
      ]);

      setProducts(productsData);
      setPatients(patientsData);

      // Load templates separately (might fail if migration not run)
      try {
        const templatesData = await recurringOrderApi.getTemplates();
        setTemplates(templatesData);
      } catch (templatesError: any) {
        // This is OK - templates API might not exist yet
        setTemplates([]);
      }
    } catch (error: any) {
      console.error('❌ Error loading data:', error);
      toast.error('Fehler beim Laden der Daten: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
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

  const handleEdit = (template: recurringOrderApi.RecurringOrderTemplate) => {
    setSelectedTemplate(template);
    setTemplateName(template.name);
    setExecutionDay(template.execution_day_of_month);
    setDeliveryDay(template.delivery_day_of_month);
    setNotificationDays(template.notification_days_before);

    // Set patient selection
    if (template.patient_id) {
      setApplyToAllPatients(false);
      const patient = patients.find(p => p.id === template.patient_id);
      setSelectedPatient(patient || null);
    } else {
      setApplyToAllPatients(true);
      setSelectedPatient(null);
    }

    // Map template items to order items with products
    const mappedItems = template.items.map(item => {
      const product = products.find(p => p.id === item.product_id);
      return {
        product: product || null,
        quantity: item.quantity,
      };
    });
    setOrderItems(mappedItems.length > 0 ? mappedItems : [{ product: null, quantity: 1 }]);

    setOpenDialog(true);
  };

  const handleOpenDialog = () => {
    setSelectedTemplate(null);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedTemplate(null);
    setTemplateName('');
    setSelectedPatient(null);
    setApplyToAllPatients(true);
    setExecutionDay(5);
    setDeliveryDay(20);
    setNotificationDays(5);
    setOrderItems([{ product: null, quantity: 1 }]);
  };

  const handleSubmit = async () => {
    // Validation
    if (!templateName.trim()) {
      toast.error('Bitte geben Sie einen Namen ein');
      return;
    }

    if (!applyToAllPatients && !selectedPatient) {
      toast.error('Bitte wählen Sie einen Patienten aus');
      return;
    }

    if (orderItems.some((item) => !item.product)) {
      toast.error('Bitte wählen Sie für alle Positionen ein Produkt aus');
      return;
    }

    if (executionDay >= deliveryDay) {
      toast.error('Lieferdatum muss nach dem Ausführungsdatum sein');
      return;
    }

    try {
      const data: recurringOrderApi.CreateTemplateRequest = {
        name: templateName,
        patient_id: applyToAllPatients ? null : selectedPatient!.id,
        execution_day_of_month: executionDay,
        delivery_day_of_month: deliveryDay,
        notification_days_before: notificationDays,
        items: orderItems.map((item) => ({
          product_id: item.product!.id,
          quantity: item.quantity,
        })),
      };

      if (selectedTemplate) {
        // Edit mode: Delete old and create new
        await recurringOrderApi.deleteTemplate(selectedTemplate.id);
        await recurringOrderApi.createTemplate(data);
        toast.success('Template erfolgreich aktualisiert!');
      } else {
        // Create mode
        await recurringOrderApi.createTemplate(data);
        toast.success('Automatische Bestellung erfolgreich erstellt!');
      }

      handleCloseDialog();
      loadData();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Fehler beim Speichern');
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      await recurringOrderApi.toggleTemplateActive(id, !currentStatus);
      toast.success(currentStatus ? 'Template deaktiviert' : 'Template aktiviert');
      loadData();
    } catch (error: any) {
      toast.error('Fehler beim Aktualisieren');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Möchten Sie "${name}" wirklich löschen?`)) {
      try {
        await recurringOrderApi.deleteTemplate(id);
        toast.success('Template erfolgreich gelöscht');
        loadData();
      } catch (error: any) {
        toast.error('Fehler beim Löschen');
      }
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
            Automatische Bestellungen
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Monatliche Bestellungen automatisch erstellen
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleOpenDialog}
          sx={{
            background: 'linear-gradient(135deg, #2563EB 0%, #10B981 100%)',
            '&:hover': {
              background: 'linear-gradient(135deg, #1E40AF 0%, #059669 100%)',
            },
          }}
        >
          Neue Automatische Bestellung
        </Button>
      </Box>

      {/* Info Alert */}
      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2">
          <strong>Wie funktioniert es?</strong> Erstellen Sie Templates für wiederkehrende Bestellungen.
          Am {executionDay}. Tag des Monats werden die Bestellungen automatisch erstellt, mit Lieferung am{' '}
          {deliveryDay}. Tag. Sie erhalten {notificationDays} Tage vorher eine Benachrichtigung zur Überprüfung.
        </Typography>
      </Alert>

      {/* Templates Table */}
      {templates.length === 0 ? (
        <Paper sx={{ p: 8, textAlign: 'center' }}>
          <Loop sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Keine automatischen Bestellungen
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Erstellen Sie Ihr erstes Template für wiederkehrende Bestellungen
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleOpenDialog}
            sx={{
              background: 'linear-gradient(135deg, #2563EB 0%, #10B981 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #1E40AF 0%, #059669 100%)',
              },
            }}
          >
            Template erstellen
          </Button>
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Patienten</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Produkte</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Zeitplan</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 600 }} align="right">
                  Aktionen
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {templates.map((template) => (
                <TableRow key={template.id}>
                  <TableCell>
                    <Typography variant="body2" fontWeight={600}>
                      {template.name}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {template.patient_id ? (
                      <Chip label={template.patient_name} size="small" color="primary" />
                    ) : (
                      <Chip
                        label={`Alle Patienten (${template.patient_count})`}
                        size="small"
                        color="secondary"
                      />
                    )}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{template.items.length} Produkte</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption" display="block">
                      Ausführung: {template.execution_day_of_month}. Tag
                    </Typography>
                    <Typography variant="caption" display="block">
                      Lieferung: {template.delivery_day_of_month}. Tag
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {template.is_active ? (
                      <Chip label="Aktiv" size="small" color="success" icon={<CheckCircle />} />
                    ) : (
                      <Chip label="Inaktiv" size="small" color="default" icon={<Cancel />} />
                    )}
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      onClick={() => handleEdit(template)}
                      color="primary"
                      title="Bearbeiten"
                    >
                      <Edit fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleToggleActive(template.id, template.is_active)}
                      color={template.is_active ? 'warning' : 'success'}
                      title={template.is_active ? 'Deaktivieren' : 'Aktivieren'}
                    >
                      <Refresh fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDelete(template.id, template.name)}
                      color="error"
                      title="Löschen"
                    >
                      <Delete fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Create Template Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>
          {selectedTemplate ? 'Automatische Bestellung bearbeiten' : 'Automatische Bestellung erstellen'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Template Name */}
            <TextField
              label="Template-Name"
              fullWidth
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              placeholder="z.B. Monatliche Rukavice-Bestellung"
            />

            {/* Patient Selection */}
            <Box>
              <FormControlLabel
                control={
                  <Switch
                    checked={applyToAllPatients}
                    onChange={(e) => setApplyToAllPatients(e.target.checked)}
                  />
                }
                label="Für alle Patienten"
              />
              {!applyToAllPatients && (
                <Autocomplete
                  options={patients}
                  value={selectedPatient}
                  onChange={(_, newValue) => setSelectedPatient(newValue)}
                  getOptionLabel={(option) =>
                    `${option.firstName} ${option.lastName} - ${option.uniqueCode}`
                  }
                  renderInput={(params) => (
                    <TextField {...params} label="Patient auswählen" sx={{ mt: 2 }} />
                  )}
                />
              )}
            </Box>

            {/* Schedule */}
            <Grid container spacing={2}>
              <Grid item xs={4}>
                <TextField
                  label="Ausführungstag"
                  type="number"
                  fullWidth
                  value={executionDay}
                  onChange={(e) => setExecutionDay(parseInt(e.target.value))}
                  inputProps={{ min: 1, max: 28 }}
                  helperText="Tag im Monat (1-28)"
                />
              </Grid>
              <Grid item xs={4}>
                <TextField
                  label="Liefertag"
                  type="number"
                  fullWidth
                  value={deliveryDay}
                  onChange={(e) => setDeliveryDay(parseInt(e.target.value))}
                  inputProps={{ min: 1, max: 28 }}
                  helperText="Tag im Monat (1-28)"
                />
              </Grid>
              <Grid item xs={4}>
                <TextField
                  label="Benachrichtigung"
                  type="number"
                  fullWidth
                  value={notificationDays}
                  onChange={(e) => setNotificationDays(parseInt(e.target.value))}
                  inputProps={{ min: 1, max: 27 }}
                  helperText="Tage vorher"
                />
              </Grid>
            </Grid>

            {/* Products */}
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  Produkte
                </Typography>
                <Button startIcon={<Add />} onClick={handleAddItem} size="small">
                  Produkt hinzufügen
                </Button>
              </Box>
              <List>
                {orderItems.map((item, index) => (
                  <ListItem key={index} sx={{ gap: 2, px: 0 }}>
                    <Autocomplete
                      options={products}
                      value={item.product}
                      onChange={(_, newValue) => handleProductChange(index, newValue)}
                      getOptionLabel={(option) => `${option.name_de} (${option.size})`}
                      sx={{ flex: 1 }}
                      renderInput={(params) => (
                        <TextField {...params} label="Produkt" size="small" />
                      )}
                    />
                    <TextField
                      type="number"
                      label="Menge"
                      value={item.quantity}
                      onChange={(e) => handleQuantityChange(index, parseInt(e.target.value))}
                      size="small"
                      sx={{ width: 100 }}
                      inputProps={{ min: 1 }}
                    />
                    <IconButton
                      onClick={() => handleRemoveItem(index)}
                      disabled={orderItems.length === 1}
                      color="error"
                    >
                      <Delete />
                    </IconButton>
                  </ListItem>
                ))}
              </List>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={handleCloseDialog}>Abbrechen</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            sx={{
              background: 'linear-gradient(135deg, #10B981 0%, #2563EB 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #059669 0%, #1D4ED8 100%)',
              },
            }}
          >
            {selectedTemplate ? 'Aktualisieren' : 'Template erstellen'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default RecurringOrdersPage;
