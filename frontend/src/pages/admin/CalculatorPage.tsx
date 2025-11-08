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
  LinearProgress,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  InputAdornment,
  Divider,
  Button,
  IconButton,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from '@mui/material';
import {
  Calculate as CalculateIcon,
  TrendingUp as ProfitIcon,
  LocalShipping as ShippingIcon,
  Warehouse as WarehouseIcon,
  Refresh as RefreshIcon,
  RadioButtonUnchecked as RadioUncheckedIcon,
  RadioButtonChecked as RadioCheckedIcon,
  CalendarToday as CalendarIcon,
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import * as orderApi from '../../api/orderApi';
import * as warehouseApi from '../../api/warehouseApi';

/**
 * Calculator Page (Kalkulator)
 * Profit calculation with shipping cost optimization
 */

interface ShippingOption {
  carrier: string;
  packageName: string;
  price: number;
  maxWeight: string;
}

const shippingRates: ShippingOption[] = [
  // DHL
  { carrier: 'DHL', packageName: 'Paket 2 kg', price: 6.99, maxWeight: '2' },
  { carrier: 'DHL', packageName: 'Paket 5 kg', price: 8.49, maxWeight: '5' },
  { carrier: 'DHL', packageName: 'Paket 10 kg', price: 10.49, maxWeight: '10' },
  { carrier: 'DHL', packageName: 'Paket 31,5 kg', price: 17.99, maxWeight: '31.5' },
  // DPD
  { carrier: 'DPD', packageName: 'Paket XS', price: 4.74, maxWeight: '3' },
  { carrier: 'DPD', packageName: 'Paket S', price: 5.95, maxWeight: '5' },
  { carrier: 'DPD', packageName: 'Paket M', price: 7.45, maxWeight: '10' },
  { carrier: 'DPD', packageName: 'Paket L', price: 10.95, maxWeight: '20' },
  { carrier: 'DPD', packageName: 'Paket XL', price: 18.95, maxWeight: '31.5' },
  // GLS
  { carrier: 'GLS', packageName: 'Paket XS', price: 4.89, maxWeight: '5' },
  { carrier: 'GLS', packageName: 'Paket S', price: 5.75, maxWeight: '10' },
  { carrier: 'GLS', packageName: 'Paket M', price: 7.15, maxWeight: '20' },
  { carrier: 'GLS', packageName: 'Paket L', price: 9.90, maxWeight: '30' },
  { carrier: 'GLS', packageName: 'Paket XL', price: 15.90, maxWeight: '40' },
  // Hermes
  { carrier: 'Hermes', packageName: 'Paket S', price: 4.25, maxWeight: '5' },
  { carrier: 'Hermes', packageName: 'Paket M', price: 5.25, maxWeight: '10' },
  { carrier: 'Hermes', packageName: 'Paket L', price: 6.89, maxWeight: '25' },
  { carrier: 'Hermes', packageName: 'Paket XL', price: 12.99, maxWeight: '32' },
];

interface OrderCalculation {
  orderId: string;
  orderNumber: string;
  totalWeight: number;
  purchaseCost: number;
  revenue: number;
  shippingCost: number;
  bestShipping: ShippingOption[];
  profit: number;
  items: Array<{
    productName: string;
    quantity: number;
    weight: number;
    totalWeight: number;
    purchasePrice: number;
    salePrice: number;
  }>;
}

const CalculatorPage = () => {
  const [orders, setOrders] = useState<orderApi.Order[]>([]);
  const [calculations, setCalculations] = useState<OrderCalculation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Date filter (month/year)
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1); // 1-12
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());

  // Fixed costs (saved in localStorage)
  const [warehouseCosts, setWarehouseCosts] = useState(() => {
    const saved = localStorage.getItem('warehouseCosts');
    return saved ? parseFloat(saved) : 0;
  });

  // Handle warehouse costs change with number conversion
  const handleWarehouseCostsChange = (value: string) => {
    const numValue = parseFloat(value) || 0;
    setWarehouseCosts(numValue);
  };

  // Incoming shipping costs (to warehouse) - saved in localStorage
  const [incomingShippingCosts, setIncomingShippingCosts] = useState(() => {
    const saved = localStorage.getItem('incomingShippingCosts');
    return saved ? parseFloat(saved) : 0;
  });

  // Handle incoming shipping costs change with number conversion
  const handleIncomingShippingChange = (value: string) => {
    const numValue = parseFloat(value) || 0;
    setIncomingShippingCosts(numValue);
  };

  // Save incoming shipping costs to localStorage
  const saveIncomingShippingCosts = () => {
    localStorage.setItem('incomingShippingCosts', incomingShippingCosts.toString());
    toast.success('Lieferkosten gespeichert');
  };

  // Totals
  const [totalOutgoingShippingCost, setTotalOutgoingShippingCost] = useState(0);
  const [totalProfit, setTotalProfit] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);

  // Save warehouse costs to localStorage
  const saveWarehouseCosts = () => {
    localStorage.setItem('warehouseCosts', warehouseCosts.toString());
    toast.success('Lagerkosten gespeichert');
  };

  // Load orders and calculate
  useEffect(() => {
    loadOrdersAndCalculate();
  }, [selectedMonth, selectedYear]);

  const loadOrdersAndCalculate = async () => {
    try {
      setLoading(true);
      setError('');

      // Get all completed orders for monthly calculation
      // Include: confirmed, shipped, delivered (exclude only pending and cancelled)
      const result = await orderApi.getAllOrders({ limit: 9999 });

      // Filter: confirmed + shipped + delivered (exclude only pending and cancelled)
      let activeOrders = result.orders.filter(
        order => order.status === 'confirmed' || order.status === 'shipped' || order.status === 'delivered'
      );

      // Filter by selected month/year
      activeOrders = activeOrders.filter(order => {
        const orderDate = new Date(order.created_at);
        return orderDate.getMonth() + 1 === selectedMonth && orderDate.getFullYear() === selectedYear;
      });

      setOrders(activeOrders);

      // Load warehouse data ONCE for all products
      const stockData = await warehouseApi.getAllProductStock();
      const productMap = new Map(stockData.map(p => [p.id, p]));

      // Calculate for each order
      const calcs: OrderCalculation[] = [];
      let totalOutgoingShipping = 0;
      let totalProfitSum = 0;
      let totalRevenueSum = 0;

      for (const order of activeOrders) {
        const calculation = await calculateOrder(order, productMap);
        calcs.push(calculation);
        totalOutgoingShipping += Number(calculation.shippingCost || 0);
        totalProfitSum += Number(calculation.profit || 0);
        totalRevenueSum += Number(calculation.revenue || 0);
      }

      setCalculations(calcs);
      setTotalOutgoingShippingCost(totalOutgoingShipping);
      setTotalProfit(totalProfitSum);
      setTotalRevenue(totalRevenueSum);
    } catch (err: any) {
      console.error('Calculator error:', err);
      console.error('Error response:', err?.response?.data);
      const errorMessage = err?.response?.data?.error || 'Fehler beim Laden der Bestellungen';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const calculateOrder = async (
    order: orderApi.Order,
    productMap: Map<string, warehouseApi.ProductStock>
  ): Promise<OrderCalculation> => {
    let totalWeight = 0;
    let purchaseCost = 0;
    let revenue = 0;

    const items = [];

    // Get product details for each item
    for (const item of order.items || []) {
      try {
        // Get product from pre-loaded map (no API call!)
        const product = productMap.get(item.product_id);

        if (product) {
          // Convert weight to kg if needed
          let weightInKg = product.weight;
          if (product.weight_unit === 'g') {
            weightInKg = product.weight / 1000;
          }

          const itemTotalWeight = weightInKg * item.quantity;
          totalWeight += itemTotalWeight;

          const itemPurchaseCost = product.purchase_price * item.quantity;
          purchaseCost += itemPurchaseCost;

          const itemRevenue = item.price_per_unit * item.quantity;
          revenue += itemRevenue;

          items.push({
            productName: product.name_de,
            quantity: item.quantity,
            weight: weightInKg,
            totalWeight: itemTotalWeight,
            purchasePrice: product.purchase_price,
            salePrice: item.price_per_unit,
          });
        }
      } catch (err) {
        console.error(`Error fetching product ${item.product_id}:`, err);
      }
    }

    // Find 2 cheapest shipping options
    const bestShipping = findCheapestShipping(totalWeight);

    // Use selected shipping if available, otherwise use cheapest
    let shippingCost = 0;
    if (order.selected_shipping_carrier && order.selected_shipping_price) {
      shippingCost = Number(order.selected_shipping_price);
    } else if (bestShipping.length > 0) {
      shippingCost = Number(bestShipping[0].price);
    }

    // Calculate profit
    const profit = revenue - purchaseCost - shippingCost;

    return {
      orderId: order.id,
      orderNumber: order.order_number,
      totalWeight,
      purchaseCost,
      revenue,
      shippingCost,
      bestShipping,
      profit,
      items,
    };
  };

  const findCheapestShipping = (weightKg: number): ShippingOption[] => {
    // Filter options that can handle the weight
    const validOptions = shippingRates.filter(option => {
      const maxWeight = parseFloat(option.maxWeight);
      return weightKg <= maxWeight;
    });

    if (validOptions.length === 0) return [];

    // Sort by price and return top 2
    const sorted = [...validOptions].sort((a, b) => a.price - b.price);
    return sorted.slice(0, 2);
  };

  // Handle shipping selection
  const handleSelectShipping = async (orderId: string, option: ShippingOption) => {
    try {
      // Check if order is already shipped or delivered - don't allow changes
      const order = orders.find(o => o.id === orderId);
      if (order?.status === 'shipped' || order?.status === 'delivered') {
        toast.warning('Diese Bestellung ist bereits abgeschlossen. Versand kann nicht geändert werden.');
        return;
      }

      // Update backend
      await orderApi.updateSelectedShipping(orderId, option.carrier, option.price);

      // Update local state immediately for responsive UI
      setOrders(prevOrders =>
        prevOrders.map(order =>
          order.id === orderId
            ? { ...order, selected_shipping_carrier: option.carrier, selected_shipping_price: option.price }
            : order
        )
      );

      // Recalculate for this specific order
      const updatedCalculations = calculations.map(calc => {
        if (calc.orderId === orderId) {
          // Update shipping cost and profit
          const newShippingCost = option.price;
          const newProfit = calc.revenue - calc.purchaseCost - newShippingCost;
          return {
            ...calc,
            shippingCost: newShippingCost,
            profit: newProfit
          };
        }
        return calc;
      });

      setCalculations(updatedCalculations);

      // Recalculate total outgoing shipping cost
      const newTotalOutgoing = updatedCalculations.reduce((sum, calc) => sum + Number(calc.shippingCost || 0), 0);
      setTotalOutgoingShippingCost(newTotalOutgoing);

      // Recalculate total profit
      const newTotalProfit = updatedCalculations.reduce((sum, calc) => sum + Number(calc.profit || 0), 0);
      setTotalProfit(newTotalProfit);

      toast.success(`${option.carrier} - ${option.packageName} ausgewählt (€${option.price.toFixed(2)})`);
    } catch (err: any) {
      const errorMessage = err?.response?.data?.error || 'Fehler beim Speichern der Auswahl';
      toast.error(errorMessage);
    }
  };

  // Calculate progress bar values
  const getProgressValues = () => {
    // Total shipping costs = incoming (to warehouse) + outgoing (to customers)
    const totalShippingCosts = Number(incomingShippingCosts || 0) + Number(totalOutgoingShippingCost || 0);
    const warehouseCost = Number(warehouseCosts || 0);
    const totalCosts = warehouseCost + totalShippingCosts;

    let shippingProgress = 0;
    let warehouseProgress = 0;
    let shippingFilled = 0;
    let warehouseFilled = 0;
    let remaining = Number(totalProfit || 0);
    let profit = 0;

    // Debug logging
    console.log('📊 Progress Calculation:', {
      totalProfit,
      warehouseCost,
      incomingShippingCosts,
      totalOutgoingShippingCost,
      totalShippingCosts,
      totalCosts,
      remaining
    });

    if (totalCosts === 0) {
      // Nema troškova - sav profit je Gewinn
      profit = remaining;
    } else if (remaining > 0) {
      // Popuni oba bara proporcionalno zajedno
      // fillRatio pokazuje koliki procenat troškova možemo da pokrijemo
      const fillRatio = Math.min(remaining / totalCosts, 1);

      // Popuni warehouse bar proporcionalno
      if (warehouseCost > 0) {
        warehouseFilled = warehouseCost * fillRatio;
        warehouseProgress = fillRatio * 100;
      }

      // Popuni shipping bar proporcionalno
      if (totalShippingCosts > 0) {
        shippingFilled = totalShippingCosts * fillRatio;
        shippingProgress = fillRatio * 100;
      }

      // Oduzmi popunjeno od profita
      const totalFilled = warehouseFilled + shippingFilled;
      remaining -= totalFilled;

      // Ako je remaining > 0, to je Gewinn (svi troškovi su pokriveni 100%)
      if (remaining > 0) {
        profit = remaining;
      }
    }

    return {
      shipping: Math.min(shippingProgress, 100),
      warehouse: Math.min(warehouseProgress, 100),
      profit,
      totalShippingCosts,
      shippingFilled,
      warehouseFilled,
    };
  };

  const progress = getProgressValues();

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
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box>
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
              Kalkulator
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Monatliche Gewinnberechnung mit Versandkostenoptimierung
            </Typography>
          </Box>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={loadOrdersAndCalculate}
            disabled={loading}
          >
            Aktualisieren
          </Button>
        </Box>

        {/* Date Filter */}
        <Paper sx={{ p: 2, display: 'flex', gap: 2, alignItems: 'center' }}>
          <CalendarIcon sx={{ color: 'primary.main', fontSize: 28 }} />
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Monat</InputLabel>
            <Select
              value={selectedMonth}
              label="Monat"
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
            >
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
          <FormControl size="small" sx={{ minWidth: 120 }}>
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
          <Typography variant="body2" color="text.secondary" sx={{ ml: 2 }}>
            {orders.length} {orders.length === 1 ? 'Bestellung' : 'Bestellungen'}
          </Typography>
        </Paper>
      </Box>

      <Grid container spacing={3}>
        {/* Main Content */}
        <Grid item xs={12} md={8}>
          {/* Orders Table */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
              Bestellungen Kalkulation
            </Typography>

            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>Bestellung</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Gewicht</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Einkauf</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Verkauf</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Versand</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Gewinn</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {calculations.map((calc) => {
                    const order = orders.find(o => o.id === calc.orderId);
                    const isShipped = order?.status === 'shipped';
                    const isDelivered = order?.status === 'delivered';

                    return (
                      <TableRow
                        key={calc.orderId}
                        hover
                        sx={{
                          bgcolor: isDelivered ? 'grey.200' : (isShipped ? 'grey.100' : 'transparent'),
                          opacity: (isShipped || isDelivered) ? 0.75 : 1,
                        }}
                      >
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            #{calc.orderNumber}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            ID: {calc.orderId.slice(0, 8)}
                          </Typography>
                          {isShipped && (
                            <Chip
                              label="Gesendet"
                              size="small"
                              color="primary"
                              sx={{ mt: 0.5, fontSize: '0.65rem' }}
                            />
                          )}
                          {isDelivered && (
                            <Chip
                              label="Geliefert"
                              size="small"
                              color="success"
                              sx={{ mt: 0.5, fontSize: '0.65rem' }}
                            />
                          )}
                        </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {Number(calc.totalWeight || 0).toFixed(2)} kg
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          €{Number(calc.purchaseCost || 0).toFixed(2)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ color: 'success.main', fontWeight: 600 }}>
                          €{Number(calc.revenue || 0).toFixed(2)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                            €{Number(calc.shippingCost || 0).toFixed(2)}
                          </Typography>

                          {/* If shipped or delivered - show only selected shipping (locked) */}
                          {(isShipped || isDelivered) && order?.selected_shipping_carrier ? (
                            <Chip
                              icon={<RadioCheckedIcon />}
                              label={`${order.selected_shipping_carrier} (€${Number(order.selected_shipping_price || 0).toFixed(2)})`}
                              size="small"
                              color="success"
                              sx={{ fontSize: '0.7rem', fontWeight: 600 }}
                            />
                          ) : (
                            /* Not shipped/delivered - show options to select */
                            calc.bestShipping.length > 0 && (
                              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                {calc.bestShipping.map((option, idx) => {
                                  const isSelected = order?.selected_shipping_carrier === option.carrier &&
                                                     order?.selected_shipping_price === option.price;

                                  return (
                                    <Box
                                      key={idx}
                                      sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 0.5,
                                        cursor: 'pointer',
                                        '&:hover': {
                                          opacity: 0.8,
                                        }
                                      }}
                                      onClick={() => handleSelectShipping(calc.orderId, option)}
                                    >
                                      {isSelected ? (
                                        <RadioCheckedIcon sx={{ fontSize: 16, color: 'success.main' }} />
                                      ) : (
                                        <RadioUncheckedIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                                      )}
                                      <Chip
                                        label={`${option.carrier} - ${option.packageName} (€${option.price.toFixed(2)})`}
                                        size="small"
                                        color={isSelected ? 'success' : (idx === 0 ? 'default' : 'default')}
                                        sx={{ fontSize: '0.7rem' }}
                                      />
                                    </Box>
                                  );
                                })}
                              </Box>
                            )
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={`${Number(calc.profit || 0) >= 0 ? '+' : ''}€${Number(calc.profit || 0).toFixed(2)}`}
                          color={Number(calc.profit || 0) > 0 ? 'success' : 'error'}
                          size="small"
                          sx={{ fontWeight: 700 }}
                        />
                      </TableCell>
                    </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>

            {calculations.length === 0 && (
              <Alert severity="info" sx={{ mt: 2 }}>
                Keine Bestellungen gefunden. Markieren Sie Bestellungen als "Empfangen", "Gesendet" oder "Geliefert", um sie hier anzuzeigen.
              </Alert>
            )}
          </Paper>

          {/* Summary */}
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="caption" color="text.secondary">
                    Versand zu Kunden
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: 'warning.main' }}>
                    €{Number(totalOutgoingShippingCost || 0).toFixed(2)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="caption" color="text.secondary">
                    Gesamte Umsatz
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: 'primary.main' }}>
                    €{Number(totalRevenue || 0).toFixed(2)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="caption" color="text.secondary">
                    Gesamt Gewinn
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: 'success.main' }}>
                    {totalProfit >= 0 ? '+' : ''}€{Number(totalProfit || 0).toFixed(2)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>

        {/* Progress Bars Sidebar */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, position: 'sticky', top: 16 }}>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 700 }}>
              Kostenverteilung
            </Typography>

            {/* Warehouse Costs (Fixed, Saved) */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" sx={{ mb: 1, fontWeight: 600 }}>
                Lagerkosten (fix)
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField
                  type="number"
                  fullWidth
                  size="small"
                  value={warehouseCosts}
                  onChange={(e) => handleWarehouseCostsChange(e.target.value)}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">€</InputAdornment>,
                  }}
                />
                <Button variant="contained" onClick={saveWarehouseCosts} size="small">
                  Speichern
                </Button>
              </Box>
            </Box>

            <Divider sx={{ mb: 3 }} />

            {/* Incoming Shipping Costs */}
            <Typography variant="body2" sx={{ mb: 2, fontWeight: 600 }}>
              Lieferkosten
            </Typography>

            <Box sx={{ mb: 2 }}>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                Eingehend (zum Lager)
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mb: 0.5 }}>
                <TextField
                  type="number"
                  fullWidth
                  size="small"
                  value={incomingShippingCosts}
                  onChange={(e) => handleIncomingShippingChange(e.target.value)}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">€</InputAdornment>,
                  }}
                />
                <Button variant="contained" onClick={saveIncomingShippingCosts} size="small">
                  Speichern
                </Button>
              </Box>
              <Typography variant="caption" color="text.secondary">
                Kosten für Warenlieferung ins Lager
              </Typography>
            </Box>

            <Box sx={{ mb: 3, p: 2, bgcolor: 'warning.50', borderRadius: 1 }}>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                Ausgehend (zu Kunden) - Automatisch
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 700, color: 'warning.main' }}>
                €{Number(totalOutgoingShippingCost || 0).toFixed(2)}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Berechnet aus Transportdienst
              </Typography>
            </Box>

            <Box sx={{ mb: 3, p: 2, bgcolor: 'info.50', borderRadius: 1 }}>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                Gesamt Lieferkosten
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 700, color: 'info.main' }}>
                €{Number(progress.totalShippingCosts || 0).toFixed(2)}
              </Typography>
            </Box>

            <Divider sx={{ mb: 3 }} />

            {/* Shipping Progress */}
            <Box sx={{ mb: 4 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <ShippingIcon sx={{ color: 'warning.main', fontSize: 20 }} />
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    Lieferkosten
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                  €{Number(progress.shippingFilled || 0).toFixed(2)} / €{Number(progress.totalShippingCosts || 0).toFixed(2)}
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={Number(progress.shipping || 0)}
                sx={{
                  height: 12,
                  borderRadius: 1,
                  backgroundColor: 'warning.100',
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: 'warning.main',
                  },
                }}
              />
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                {Number(progress.shipping || 0).toFixed(0)}% gedeckt
              </Typography>
            </Box>

            {/* Warehouse Progress */}
            <Box sx={{ mb: 4 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <WarehouseIcon sx={{ color: 'info.main', fontSize: 20 }} />
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    Lagerkosten
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                  €{Number(progress.warehouseFilled || 0).toFixed(2)} / €{Number(warehouseCosts || 0).toFixed(2)}
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={Number(progress.warehouse || 0)}
                sx={{
                  height: 12,
                  borderRadius: 1,
                  backgroundColor: 'info.100',
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: 'info.main',
                  },
                }}
              />
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                {Number(progress.warehouse || 0).toFixed(0)}% gedeckt
              </Typography>
            </Box>

            {/* Profit Progress */}
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <ProfitIcon sx={{ color: 'success.main', fontSize: 20 }} />
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    Gewinn
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                  €{Number(progress.profit || 0).toFixed(2)}
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={Number(progress.profit || 0) > 0 ? 100 : 0}
                sx={{
                  height: 12,
                  borderRadius: 1,
                  backgroundColor: 'success.100',
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: 'success.main',
                  },
                }}
              />
              {Number(progress.profit || 0) > 0 ? (
                <Alert severity="success" sx={{ mt: 2 }}>
                  Alle Kosten gedeckt! Reingewinn: €{Number(progress.profit || 0).toFixed(2)}
                </Alert>
              ) : (
                <Alert severity="warning" sx={{ mt: 2 }}>
                  Kosten noch nicht vollständig gedeckt
                </Alert>
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default CalculatorPage;
