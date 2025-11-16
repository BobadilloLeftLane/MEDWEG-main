import React, { useState, useEffect } from 'react';
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
  Collapse,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import {
  Business as BusinessIcon,
  Search as SearchIcon,
  MoreVert as MoreVertIcon,
  CheckCircle as CheckCircleIcon,
  Block as BlockIcon,
  LocationOn as LocationIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon,
  KeyboardArrowUp as KeyboardArrowUpIcon,
  Person as PersonIcon,
  Refresh as RefreshIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import * as institutionApi from '../../api/institutionApi';
import * as adminApi from '../../api/adminApi';

/**
 * Customers Page Component
 * Display and manage institutions with patient information - admin_application only
 */
const CustomersPage = () => {
  const [institutions, setInstitutions] = useState<institutionApi.Institution[]>([]);
  const [patientsData, setPatientsData] = useState<adminApi.PatientsByInstitution[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  // Menu
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedInstitution, setSelectedInstitution] =
    useState<institutionApi.Institution | null>(null);

  // Dialogs
  const [verifyDialogOpen, setVerifyDialogOpen] = useState(false);
  const [deactivateDialogOpen, setDeactivateDialogOpen] = useState(false);
  const [reactivateDialogOpen, setReactivateDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Load institutions and patients
  const loadData = async () => {
    try {
      setLoading(true);
      const [institutionsData, patients] = await Promise.all([
        institutionApi.getInstitutions(),
        adminApi.getPatientsByInstitution(),
      ]);
      setInstitutions(institutionsData);
      setPatientsData(patients);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Fehler beim Laden der Daten');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filter institutions by search
  const filteredInstitutions = institutions.filter((inst) =>
    inst.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get patient data for institution
  const getPatientData = (institutionId: string) => {
    return patientsData.find((pd) => pd.institution_id === institutionId);
  };

  // Toggle row expansion
  const handleToggleExpand = (institutionId: string) => {
    setExpandedRows((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(institutionId)) {
        newSet.delete(institutionId);
      } else {
        newSet.add(institutionId);
      }
      return newSet;
    });
  };

  // Menu handlers
  const handleMenuOpen = (
    event: React.MouseEvent<HTMLElement>,
    institution: institutionApi.Institution
  ) => {
    console.log('Menu opened for institution:', institution);
    setAnchorEl(event.currentTarget);
    setSelectedInstitution(institution);
  };

  const handleMenuClose = () => {
    console.log('Menu closed');
    setAnchorEl(null);
    setSelectedInstitution(null);
  };

  // Verify institution
  const handleVerifyClick = () => {
    console.log('Verify clicked, selectedInstitution:', selectedInstitution);
    // Don't close menu or clear selectedInstitution yet - just open the dialog
    setAnchorEl(null); // Close menu but keep selectedInstitution
    setVerifyDialogOpen(true);
  };

  const handleVerifyConfirm = async () => {
    console.log('Verify confirm clicked, selectedInstitution:', selectedInstitution);
    if (!selectedInstitution) {
      console.log('No selected institution, returning');
      return;
    }

    try {
      console.log('Calling verifyInstitution API for ID:', selectedInstitution.id);
      await institutionApi.verifyInstitution(selectedInstitution.id);
      console.log('Verification successful');
      toast.success('Kunde erfolgreich verifiziert');
      setVerifyDialogOpen(false);
      setSelectedInstitution(null);
      await loadData();
    } catch (error: any) {
      console.error('Verification error:', error);
      toast.error(error.response?.data?.error || 'Fehler beim Verifizieren');
    }
  };

  const handleVerifyCancel = () => {
    console.log('Verify cancelled');
    setVerifyDialogOpen(false);
    setSelectedInstitution(null);
  };

  // Deactivate institution
  const handleDeactivateClick = () => {
    console.log('Deactivate clicked, selectedInstitution:', selectedInstitution);
    // Don't close menu or clear selectedInstitution yet - just open the dialog
    setAnchorEl(null); // Close menu but keep selectedInstitution
    setDeactivateDialogOpen(true);
  };

  const handleDeactivateConfirm = async () => {
    console.log('Deactivate confirm clicked, selectedInstitution:', selectedInstitution);
    if (!selectedInstitution) {
      console.log('No selected institution, returning');
      return;
    }

    try {
      console.log('Calling deactivateInstitution API for ID:', selectedInstitution.id);
      await institutionApi.deactivateInstitution(selectedInstitution.id);
      console.log('Deactivation successful');
      toast.success('Kunde erfolgreich deaktiviert');
      setDeactivateDialogOpen(false);
      setSelectedInstitution(null);
      await loadData();
    } catch (error: any) {
      console.error('Deactivation error:', error);
      toast.error(error.response?.data?.error || 'Fehler beim Deaktivieren');
    }
  };

  const handleDeactivateCancel = () => {
    console.log('Deactivate cancelled');
    setDeactivateDialogOpen(false);
    setSelectedInstitution(null);
  };

  // Reactivate institution
  const handleReactivateClick = () => {
    console.log('Reactivate clicked, selectedInstitution:', selectedInstitution);
    setAnchorEl(null);
    setReactivateDialogOpen(true);
  };

  const handleReactivateConfirm = async () => {
    console.log('Reactivate confirm clicked, selectedInstitution:', selectedInstitution);
    if (!selectedInstitution) {
      console.log('No selected institution, returning');
      return;
    }

    try {
      console.log('Calling reactivateInstitution API for ID:', selectedInstitution.id);
      await institutionApi.reactivateInstitution(selectedInstitution.id);
      console.log('Reactivation successful');
      toast.success('Kunde erfolgreich reaktiviert');
      setReactivateDialogOpen(false);
      setSelectedInstitution(null);
      await loadData();
    } catch (error: any) {
      console.error('Reactivation error:', error);
      toast.error(error.response?.data?.error || 'Fehler beim Reaktivieren');
    }
  };

  const handleReactivateCancel = () => {
    console.log('Reactivate cancelled');
    setReactivateDialogOpen(false);
    setSelectedInstitution(null);
  };

  // Delete institution
  const handleDeleteClick = () => {
    console.log('Delete clicked, selectedInstitution:', selectedInstitution);
    setAnchorEl(null);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    console.log('Delete confirm clicked, selectedInstitution:', selectedInstitution);
    if (!selectedInstitution) {
      console.log('No selected institution, returning');
      return;
    }

    try {
      console.log('Calling deleteInstitution API for ID:', selectedInstitution.id);
      await institutionApi.deleteInstitution(selectedInstitution.id);
      console.log('Deletion successful');
      toast.success('Kunde erfolgreich gelöscht');
      setDeleteDialogOpen(false);
      setSelectedInstitution(null);
      await loadData();
    } catch (error: any) {
      console.error('Deletion error:', error);
      toast.error(error.response?.data?.error || 'Fehler beim Löschen');
    }
  };

  const handleDeleteCancel = () => {
    console.log('Delete cancelled');
    setDeleteDialogOpen(false);
    setSelectedInstitution(null);
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
                <TableCell width={50} />
                <TableCell><strong>Firmenname</strong></TableCell>
                <TableCell><strong>Standort</strong></TableCell>
                <TableCell align="center"><strong>Patienten</strong></TableCell>
                <TableCell><strong>Registriert am</strong></TableCell>
                <TableCell><strong>Verifiziert</strong></TableCell>
                <TableCell><strong>Status</strong></TableCell>
                <TableCell align="right"><strong>Aktionen</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredInstitutions.map((institution) => {
                const patientData = getPatientData(institution.id);
                const isExpanded = expandedRows.has(institution.id);
                const hasPatients = patientData && patientData.patient_count > 0;

                return (
                  <React.Fragment key={institution.id}>
                    <TableRow hover>
                      <TableCell>
                        {hasPatients && (
                          <IconButton
                            size="small"
                            onClick={() => handleToggleExpand(institution.id)}
                          >
                            {isExpanded ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                          </IconButton>
                        )}
                      </TableCell>
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
                      <TableCell align="center">
                        <Chip
                          icon={<PersonIcon />}
                          label={patientData?.patient_count || 0}
                          color={hasPatients ? 'primary' : 'default'}
                          size="small"
                        />
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
                        <IconButton size="small" onClick={(e) => handleMenuOpen(e, institution)}>
                          <MoreVertIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>

                    {/* Expanded Row - Patient List */}
                    {hasPatients && (
                      <TableRow>
                        <TableCell
                          colSpan={8}
                          sx={{ py: 0, borderBottom: isExpanded ? undefined : 'none' }}
                        >
                          <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                            <Box sx={{ p: 3, bgcolor: 'grey.50' }}>
                              <Typography
                                variant="subtitle2"
                                sx={{ mb: 2, fontWeight: 700, color: 'primary.main' }}
                              >
                                Patienten ({patientData!.patient_count})
                              </Typography>
                              <List dense>
                                {patientData!.patients.map((patient, index) => (
                                  <ListItem
                                    key={patient.id}
                                    sx={{
                                      bgcolor: 'white',
                                      mb: 1,
                                      borderRadius: 1,
                                      border: '1px solid',
                                      borderColor: 'divider',
                                    }}
                                  >
                                    <ListItemText
                                      primary={
                                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                          {index + 1}. {patient.first_name} {patient.last_name}
                                        </Typography>
                                      }
                                      secondary={
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                                          <LocationIcon fontSize="small" sx={{ fontSize: 16 }} />
                                          <Typography variant="caption" color="text.secondary">
                                            {patient.address || 'Keine Adresse hinterlegt'}
                                          </Typography>
                                        </Box>
                                      }
                                    />
                                  </ListItem>
                                ))}
                              </List>
                            </Box>
                          </Collapse>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                );
              })}
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
          <MenuItem onClick={handleDeactivateClick} sx={{ color: 'warning.main' }}>
            <BlockIcon fontSize="small" sx={{ mr: 1 }} />
            Deaktivieren
          </MenuItem>
        )}
        {selectedInstitution && !selectedInstitution.is_active && (
          <MenuItem onClick={handleReactivateClick} sx={{ color: 'success.main' }}>
            <RefreshIcon fontSize="small" sx={{ mr: 1 }} />
            Reaktivieren
          </MenuItem>
        )}
        {selectedInstitution && !selectedInstitution.is_active && (
          <MenuItem onClick={handleDeleteClick} sx={{ color: 'error.main' }}>
            <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
            Löschen
          </MenuItem>
        )}
      </Menu>

      {/* Verify Dialog */}
      <Dialog open={verifyDialogOpen} onClose={handleVerifyCancel}>
        <DialogTitle>Kunde verifizieren?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Möchten Sie den Kunden "{selectedInstitution?.name}" verifizieren? Der Kunde kann dann
            Bestellungen aufgeben.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleVerifyCancel}>Abbrechen</Button>
          <Button onClick={handleVerifyConfirm} color="primary" variant="contained">
            Verifizieren
          </Button>
        </DialogActions>
      </Dialog>

      {/* Deactivate Dialog */}
      <Dialog open={deactivateDialogOpen} onClose={handleDeactivateCancel}>
        <DialogTitle>Kunde deaktivieren?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Möchten Sie den Kunden "{selectedInstitution?.name}" wirklich deaktivieren? Der Kunde
            kann dann keine Bestellungen mehr aufgeben.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeactivateCancel}>Abbrechen</Button>
          <Button onClick={handleDeactivateConfirm} color="warning" variant="contained">
            Deaktivieren
          </Button>
        </DialogActions>
      </Dialog>

      {/* Reactivate Dialog */}
      <Dialog open={reactivateDialogOpen} onClose={handleReactivateCancel}>
        <DialogTitle>Kunde reaktivieren?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Möchten Sie den Kunden "{selectedInstitution?.name}" reaktivieren? Der Kunde kann dann
            wieder Bestellungen aufgeben.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleReactivateCancel}>Abbrechen</Button>
          <Button onClick={handleReactivateConfirm} color="success" variant="contained">
            Reaktivieren
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onClose={handleDeleteCancel}>
        <DialogTitle>Kunde permanent löschen?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            <strong>WARNUNG:</strong> Möchten Sie den Kunden "{selectedInstitution?.name}" wirklich
            permanent löschen? Diese Aktion kann <strong>NICHT</strong> rückgängig gemacht werden.
            Alle zugehörigen Daten (Patienten, Bestellungen, etc.) werden ebenfalls gelöscht.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>Abbrechen</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Permanent Löschen
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CustomersPage;
