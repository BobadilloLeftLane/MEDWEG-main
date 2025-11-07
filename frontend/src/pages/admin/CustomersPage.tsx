import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Alert,
  TextField,
  InputAdornment,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from '@mui/material';
import {
  Business as BusinessIcon,
  Search as SearchIcon,
  MoreVert as MoreVertIcon,
  CheckCircle as CheckCircleIcon,
  Block as BlockIcon,
  LocationOn as LocationIcon,
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import * as institutionApi from '../../api/institutionApi';

/**
 * Customers Page Component
 * Display and manage institutions (Kunden/Firmen) - admin_application only
 */
const CustomersPage = () => {
  const [institutions, setInstitutions] = useState<institutionApi.Institution[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Menu
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedInstitution, setSelectedInstitution] =
    useState<institutionApi.Institution | null>(null);

  // Dialogs
  const [verifyDialogOpen, setVerifyDialogOpen] = useState(false);
  const [deactivateDialogOpen, setDeactivateDialogOpen] = useState(false);

  // Load institutions
  const loadInstitutions = async () => {
    try {
      setLoading(true);
      const data = await institutionApi.getInstitutions();
      setInstitutions(data);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Fehler beim Laden der Kunden');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInstitutions();
  }, []);

  // Filter institutions by search
  const filteredInstitutions = institutions.filter((inst) =>
    inst.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Menu handlers
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, institution: institutionApi.Institution) => {
    setAnchorEl(event.currentTarget);
    setSelectedInstitution(institution);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedInstitution(null);
  };

  // Verify institution
  const handleVerifyClick = () => {
    setVerifyDialogOpen(true);
    handleMenuClose();
  };

  const handleVerifyConfirm = async () => {
    if (!selectedInstitution) return;

    try {
      await institutionApi.verifyInstitution(selectedInstitution.id);
      toast.success('Kunde erfolgreich verifiziert');
      loadInstitutions();
      setVerifyDialogOpen(false);
      setSelectedInstitution(null);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Fehler beim Verifizieren');
    }
  };

  // Deactivate institution
  const handleDeactivateClick = () => {
    setDeactivateDialogOpen(true);
    handleMenuClose();
  };

  const handleDeactivateConfirm = async () => {
    if (!selectedInstitution) return;

    try {
      await institutionApi.deactivateInstitution(selectedInstitution.id);
      toast.success('Kunde erfolgreich deaktiviert');
      loadInstitutions();
      setDeactivateDialogOpen(false);
      setSelectedInstitution(null);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Fehler beim Deaktivieren');
    }
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          Kundenverwaltung
        </Typography>
      </Box>

      {/* Search */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <TextField
          placeholder="Suche nach Firmenname..."
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
      </Paper>

      {/* Institutions Table */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : filteredInstitutions.length === 0 ? (
        <Alert severity="info">
          {searchQuery ? 'Keine Kunden gefunden.' : 'Noch keine Kunden registriert.'}
        </Alert>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><strong>Firmenname</strong></TableCell>
                <TableCell><strong>Standort</strong></TableCell>
                <TableCell><strong>Registriert am</strong></TableCell>
                <TableCell><strong>Verifiziert</strong></TableCell>
                <TableCell><strong>Status</strong></TableCell>
                <TableCell align="right"><strong>Aktionen</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredInstitutions.map((institution) => (
                <TableRow key={institution.id} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <BusinessIcon color="primary" />
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {institution.name}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <LocationIcon fontSize="small" color="action" />
                      <Typography variant="body2">
                        {institution.address_plz} {institution.address_city}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    {new Date(institution.created_at).toLocaleDateString('de-DE')}
                  </TableCell>
                  <TableCell>
                    <Chip
                      icon={institution.is_verified ? <CheckCircleIcon /> : undefined}
                      label={institution.is_verified ? 'Verifiziert' : 'Nicht verifiziert'}
                      color={institution.is_verified ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={institution.is_active ? 'Aktiv' : 'Inaktiv'}
                      color={institution.is_active ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      onClick={(e) => handleMenuOpen(e, institution)}
                    >
                      <MoreVertIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Action Menu */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        {selectedInstitution && !selectedInstitution.is_verified && (
          <MenuItem onClick={handleVerifyClick}>
            <CheckCircleIcon fontSize="small" sx={{ mr: 1 }} />
            Verifizieren
          </MenuItem>
        )}
        {selectedInstitution && selectedInstitution.is_active && (
          <MenuItem onClick={handleDeactivateClick} sx={{ color: 'error.main' }}>
            <BlockIcon fontSize="small" sx={{ mr: 1 }} />
            Deaktivieren
          </MenuItem>
        )}
      </Menu>

      {/* Verify Dialog */}
      <Dialog open={verifyDialogOpen} onClose={() => setVerifyDialogOpen(false)}>
        <DialogTitle>Kunde verifizieren?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Möchten Sie den Kunden "{selectedInstitution?.name}" verifizieren?
            Der Kunde kann dann Bestellungen aufgeben.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setVerifyDialogOpen(false)}>Abbrechen</Button>
          <Button onClick={handleVerifyConfirm} color="primary" variant="contained">
            Verifizieren
          </Button>
        </DialogActions>
      </Dialog>

      {/* Deactivate Dialog */}
      <Dialog open={deactivateDialogOpen} onClose={() => setDeactivateDialogOpen(false)}>
        <DialogTitle>Kunde deaktivieren?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Möchten Sie den Kunden "{selectedInstitution?.name}" wirklich deaktivieren?
            Der Kunde kann dann keine Bestellungen mehr aufgeben.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeactivateDialogOpen(false)}>Abbrechen</Button>
          <Button onClick={handleDeactivateConfirm} color="error" variant="contained">
            Deaktivieren
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CustomersPage;
