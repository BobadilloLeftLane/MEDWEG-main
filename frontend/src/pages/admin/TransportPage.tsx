import { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Collapse,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
} from '@mui/material';
import {
  LocalShipping as TruckIcon,
  ExpandMore as ExpandMoreIcon,
} from '@mui/icons-material';

/**
 * Transport Page (Transportdienst)
 * Shipping carriers and price comparison
 */

interface PackagePrice {
  name: string;
  price: string;
  maxWeight: string;
  maxDimensions: string;
  conditions: string;
}

interface Carrier {
  id: string;
  name: string;
  color: string;
  packages: PackagePrice[];
}

const carriers: Carrier[] = [
  {
    id: 'dhl',
    name: 'DHL Paket',
    color: '#FFCC00',
    packages: [
      {
        name: 'Päckchen XS',
        price: '€4,19',
        maxWeight: '2 kg',
        maxDimensions: '35x25x5 cm',
        conditions: 'Online oder Filiale',
      },
      {
        name: 'Päckchen S',
        price: '€4,79',
        maxWeight: '2 kg',
        maxDimensions: '60x30x15 cm',
        conditions: 'Online oder Filiale',
      },
      {
        name: 'Päckchen M',
        price: '€5,49',
        maxWeight: '2 kg',
        maxDimensions: '60x30x15 cm',
        conditions: 'Online oder Filiale',
      },
      {
        name: 'Paket 2 kg',
        price: '€6,99',
        maxWeight: '2 kg',
        maxDimensions: '120x60x60 cm',
        conditions: 'Online',
      },
      {
        name: 'Paket 5 kg',
        price: '€8,49',
        maxWeight: '5 kg',
        maxDimensions: '120x60x60 cm',
        conditions: 'Online',
      },
      {
        name: 'Paket 10 kg',
        price: '€10,49',
        maxWeight: '10 kg',
        maxDimensions: '120x60x60 cm',
        conditions: 'Online',
      },
      {
        name: 'Paket 31,5 kg',
        price: '€17,99',
        maxWeight: '31,5 kg',
        maxDimensions: '120x60x60 cm',
        conditions: 'Online',
      },
    ],
  },
  {
    id: 'dpd',
    name: 'DPD',
    color: '#DC0032',
    packages: [
      {
        name: 'Paket XS',
        price: '€4,74',
        maxWeight: '3 kg',
        maxDimensions: '50x37x26 cm',
        conditions: 'Online',
      },
      {
        name: 'Paket S',
        price: '€5,95',
        maxWeight: '5 kg',
        maxDimensions: 'L + kürzeste Seite ≤ 90 cm',
        conditions: 'Online',
      },
      {
        name: 'Paket M',
        price: '€7,45',
        maxWeight: '10 kg',
        maxDimensions: 'L + kürzeste Seite ≤ 140 cm',
        conditions: 'Online',
      },
      {
        name: 'Paket L',
        price: '€10,95',
        maxWeight: '20 kg',
        maxDimensions: 'L + kürzeste Seite ≤ 200 cm',
        conditions: 'Online',
      },
      {
        name: 'Paket XL',
        price: '€18,95',
        maxWeight: '31,5 kg',
        maxDimensions: 'L + kürzeste Seite ≤ 300 cm',
        conditions: 'Online',
      },
    ],
  },
  {
    id: 'gls',
    name: 'GLS',
    color: '#002E6D',
    packages: [
      {
        name: 'Paket XS',
        price: '€4,89',
        maxWeight: '5 kg',
        maxDimensions: '35x25x10 cm',
        conditions: 'Online',
      },
      {
        name: 'Paket S',
        price: '€5,75',
        maxWeight: '10 kg',
        maxDimensions: '40x35x20 cm',
        conditions: 'Online',
      },
      {
        name: 'Paket M',
        price: '€7,15',
        maxWeight: '20 kg',
        maxDimensions: '60x50x40 cm',
        conditions: 'Online',
      },
      {
        name: 'Paket L',
        price: '€9,90',
        maxWeight: '30 kg',
        maxDimensions: '80x60x50 cm',
        conditions: 'Online',
      },
      {
        name: 'Paket XL',
        price: '€15,90',
        maxWeight: '40 kg',
        maxDimensions: '120x80x60 cm',
        conditions: 'Online',
      },
    ],
  },
  {
    id: 'hermes',
    name: 'Hermes',
    color: '#003D7A',
    packages: [
      {
        name: 'Paket S',
        price: '€4,25',
        maxWeight: '5 kg',
        maxDimensions: 'L + kürzeste Seite ≤ 50 cm',
        conditions: 'PaketShop',
      },
      {
        name: 'Paket M',
        price: '€5,25',
        maxWeight: '10 kg',
        maxDimensions: 'L + kürzeste Seite ≤ 80 cm',
        conditions: 'PaketShop',
      },
      {
        name: 'Paket L',
        price: '€6,89',
        maxWeight: '25 kg',
        maxDimensions: 'L + kürzeste Seite ≤ 120 cm',
        conditions: 'PaketShop',
      },
      {
        name: 'Paket XL',
        price: '€12,99',
        maxWeight: '32 kg',
        maxDimensions: 'L + kürzeste Seite ≤ 200 cm',
        conditions: 'PaketShop',
      },
    ],
  },
  {
    id: 'ups',
    name: 'UPS',
    color: '#351C15',
    packages: [
      {
        name: 'UPS Express Saver',
        price: '€15,90',
        maxWeight: '20 kg',
        maxDimensions: '120x80x80 cm',
        conditions: 'Online',
      },
      {
        name: 'UPS Express',
        price: '€18,90',
        maxWeight: '20 kg',
        maxDimensions: '120x80x80 cm',
        conditions: 'Online',
      },
      {
        name: 'UPS Express Plus',
        price: '€24,90',
        maxWeight: '20 kg',
        maxDimensions: '120x80x80 cm',
        conditions: 'Online',
      },
      {
        name: 'UPS Standard',
        price: '€12,90',
        maxWeight: '31,5 kg',
        maxDimensions: '274 cm (L+2×(W+H))',
        conditions: 'Online',
      },
    ],
  },
];

const TransportPage = () => {
  const [expandedCarrier, setExpandedCarrier] = useState<string | null>(null);

  const handleExpandClick = (carrierId: string) => {
    setExpandedCarrier(expandedCarrier === carrierId ? null : carrierId);
  };

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
          Transportdienst
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Paketpreise und Versandoptionen im Vergleich
        </Typography>
      </Box>

      {/* Carriers Grid */}
      <Grid container spacing={3}>
        {carriers.map((carrier) => {
          const isExpanded = expandedCarrier === carrier.id;

          return (
            <Grid item xs={12} key={carrier.id}>
              <Card
                sx={{
                  border: isExpanded ? '2px solid' : '1px solid',
                  borderColor: isExpanded ? carrier.color : 'divider',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    boxShadow: 6,
                  },
                }}
              >
                {/* Carrier Header */}
                <CardContent
                  onClick={() => handleExpandClick(carrier.id)}
                  sx={{
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    bgcolor: isExpanded ? `${carrier.color}10` : 'transparent',
                    '&:hover': {
                      bgcolor: `${carrier.color}15`,
                    },
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box
                      sx={{
                        width: 56,
                        height: 56,
                        borderRadius: 2,
                        bgcolor: `${carrier.color}20`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <TruckIcon sx={{ fontSize: 32, color: carrier.color }} />
                    </Box>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: carrier.color }}>
                        {carrier.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {carrier.packages.length} Paketoptionen verfügbar
                      </Typography>
                    </Box>
                  </Box>

                  <IconButton
                    sx={{
                      transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform 0.3s ease',
                      color: carrier.color,
                    }}
                  >
                    <ExpandMoreIcon />
                  </IconButton>
                </CardContent>

                {/* Price Table */}
                <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                  <Box sx={{ p: 3, bgcolor: 'grey.50' }}>
                    <TableContainer component={Paper} elevation={0}>
                      <Table>
                        <TableHead>
                          <TableRow sx={{ bgcolor: `${carrier.color}15` }}>
                            <TableCell sx={{ fontWeight: 700 }}>Paketname</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Preis</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Max. Gewicht</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Max. Maße</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Bedingungen</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {carrier.packages.map((pkg, index) => (
                            <TableRow
                              key={index}
                              sx={{
                                '&:hover': {
                                  bgcolor: `${carrier.color}08`,
                                },
                              }}
                            >
                              <TableCell>
                                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                  {pkg.name}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Chip
                                  label={pkg.price}
                                  size="small"
                                  sx={{
                                    bgcolor: `${carrier.color}20`,
                                    color: carrier.color,
                                    fontWeight: 700,
                                  }}
                                />
                              </TableCell>
                              <TableCell>{pkg.maxWeight}</TableCell>
                              <TableCell>{pkg.maxDimensions}</TableCell>
                              <TableCell>
                                <Typography variant="caption" color="text.secondary">
                                  {pkg.conditions}
                                </Typography>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Box>
                </Collapse>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
};

export default TransportPage;
