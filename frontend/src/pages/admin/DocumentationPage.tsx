import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  CircularProgress,
  Tooltip,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
} from '@mui/material';
import {
  Description as DocumentIcon,
  Download as DownloadIcon,
  PictureAsPdf as PdfIcon,
  Assessment as ReportIcon,
  CalendarToday as CalendarIcon,
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import * as orderApi from '../../api/orderApi';

/**
 * Documentation Page (Dokumentation)
 * Shows shipped/delivered orders with invoice download links
 */
const DocumentationPage = () => {
  const [orders, setOrders] = useState<orderApi.OrderWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [generatingReport, setGeneratingReport] = useState(false);

  // Date filter (month/year)
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState<number | ''>(currentDate.getMonth() + 1); // 1-12 or '' for all
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      // Get all orders
      const result = await orderApi.getAllOrders({ limit: 9999 });

      // Filter only shipped and delivered orders
      const completedOrders = result.orders.filter(
        order => order.status === 'shipped' || order.status === 'delivered'
      );

      // Sort by most recent first
      completedOrders.sort((a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      setOrders(completedOrders);
    } catch (error: any) {
      toast.error('Fehler beim Laden der Bestellungen');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadInvoice = async (orderId: string, orderNumber: number) => {
    try {
      setDownloadingId(orderId);
      await orderApi.downloadInvoicePDF(orderId, orderNumber);
      toast.success('Rechnung heruntergeladen!');
    } catch (error) {
      console.error('PDF download error:', error);
      toast.error('Fehler beim Herunterladen der Rechnung');
    } finally {
      setDownloadingId(null);
    }
  };

  const handleGenerateMonthlyReport = async () => {
    if (selectedMonth === '') {
      toast.warning('Bitte wählen Sie einen Monat für den Bericht aus');
      return;
    }

    try {
      setGeneratingReport(true);
      await orderApi.downloadMonthlyReport(selectedMonth as number, selectedYear);
      toast.success('Monatsbericht heruntergeladen!');
    } catch (error) {
      console.error('Monthly report error:', error);
      toast.error('Fehler beim Erstellen des Monatsberichts');
    } finally {
      setGeneratingReport(false);
    }
  };

  // Filter orders by selected month/year
  const filteredOrders = orders.filter(order => {
    const orderDate = new Date(order.created_at);
    const matchesMonth = selectedMonth === '' || orderDate.getMonth() + 1 === selectedMonth;
    const matchesYear = orderDate.getFullYear() === selectedYear;
    return matchesMonth && matchesYear;
  });

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
          Dokumentation
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Rechnungen und Versanddokumente
        </Typography>
      </Box>

      {/* Date Filter & Monthly Report */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item>
            <CalendarIcon sx={{ color: 'primary.main', fontSize: 28 }} />
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
          <Grid item xs={12} sm={6} md={2}>
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
          <Grid item xs={12} md={4}>
            <Button
              variant="contained"
              color="success"
              startIcon={generatingReport ? <CircularProgress size={20} color="inherit" /> : <ReportIcon />}
              onClick={handleGenerateMonthlyReport}
              disabled={generatingReport || selectedMonth === ''}
              fullWidth
              sx={{ height: 40 }}
            >
              {generatingReport ? 'Erstelle Bericht...' : 'Monatsbericht herunterladen'}
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress size={60} />
        </Box>
      ) : filteredOrders.length === 0 ? (
        <Paper sx={{ p: 6, textAlign: 'center' }}>
          <Box
            sx={{
              display: 'inline-flex',
              p: 3,
              borderRadius: '50%',
              bgcolor: 'info.light',
              color: 'info.main',
              mb: 3,
            }}
          >
            <DocumentIcon sx={{ fontSize: 60 }} />
          </Box>

          <Typography variant="h5" gutterBottom fontWeight={600} color="text.primary">
            Keine Dokumente verfügbar
          </Typography>

          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Versendete Bestellungen erscheinen hier mit herunterladbaren Rechnungen.
          </Typography>

          <Alert severity="info" sx={{ maxWidth: 600, mx: 'auto' }}>
            Markieren Sie eine Bestellung als "Gesendet" um eine Rechnung zu erstellen.
          </Alert>
        </Paper>
      ) : (
        <Paper sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
            <PdfIcon sx={{ fontSize: 40, color: 'error.main' }} />
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Rechnungen
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {filteredOrders.length} {filteredOrders.length === 1 ? 'Rechnung' : 'Rechnungen'} verfügbar
              </Typography>
            </Box>
          </Box>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Bestellung #</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Datum</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Institution</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Patient</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Betrag</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 700 }} align="center">Rechnung</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredOrders.map((order) => (
                  <TableRow key={order.id} hover>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        #{order.order_number}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        ID: {order.id.slice(0, 8)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {new Date(order.created_at).toLocaleDateString('de-DE')}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {order.institution_name || 'Unbekannt'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {order.patient_name || 'Keine Angabe'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: 'success.main' }}>
                        €{Number(order.total_amount).toFixed(2)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={order.status === 'shipped' ? 'Versandt' : 'Geliefert'}
                        color={order.status === 'shipped' ? 'primary' : 'success'}
                        size="small"
                        sx={{ fontWeight: 600 }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="Rechnung herunterladen">
                        <IconButton
                          color="error"
                          onClick={() => handleDownloadInvoice(order.id, order.order_number)}
                          disabled={downloadingId === order.id}
                          sx={{
                            bgcolor: 'error.50',
                            '&:hover': {
                              bgcolor: 'error.100',
                            }
                          }}
                        >
                          {downloadingId === order.id ? (
                            <CircularProgress size={24} />
                          ) : (
                            <DownloadIcon />
                          )}
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}
    </Box>
  );
};

export default DocumentationPage;
