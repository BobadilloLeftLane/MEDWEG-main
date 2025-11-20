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
  Card,
  CardContent,
  Divider,
  Grid,
  useMediaQuery,
  useTheme,
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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
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
    setAnchorEl(event.currentTarget);
    setSelectedInstitution(institution);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedInstitution(null);
  };

  // Verify institution
  const handleVerifyClick = () => {
    // Don't close menu or clear selectedInstitution yet - just open the dialog
    setAnchorEl(null); // Close menu but keep selectedInstitution
    setVerifyDialogOpen(true);
  };

  const handleVerifyConfirm = async () => {
    if (!selectedInstitution) {
      return;
    }

    try {
      await institutionApi.verifyInstitution(selectedInstitution.id);
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
    setVerifyDialogOpen(false);
    setSelectedInstitution(null);
  };

  // Deactivate institution
  const handleDeactivateClick = () => {
    // Don't close menu or clear selectedInstitution yet - just open the dialog
    setAnchorEl(null); // Close menu but keep selectedInstitution
    setDeactivateDialogOpen(true);
  };

  const handleDeactivateConfirm = async () => {
    if (!selectedInstitution) {
      return;
    }

    try {
      await institutionApi.deactivateInstitution(selectedInstitution.id);
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
    setDeactivateDialogOpen(false);
    setSelectedInstitution(null);
  };

  // Reactivate institution
  const handleReactivateClick = () => {
    setAnchorEl(null);
    setReactivateDialogOpen(true);
  };

  const handleReactivateConfirm = async () => {
    if (!selectedInstitution) {
      return;
    }

    try {
      await institutionApi.reactivateInstitution(selectedInstitution.id);
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
    setReactivateDialogOpen(false);
    setSelectedInstitution(null);
  };

  // Delete institution
  const handleDeleteClick = () => {
    setAnchorEl(null);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedInstitution) {
      return;
    }

    try {
      await institutionApi.deleteInstitution(selectedInstitution.id);
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
    setDeleteDialogOpen(false);
    setSelectedInstitution(null);
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
          Kundenverwaltung
        </Typography>
      </Box>

      {/* Search */}
      <Paper sx={{ p: { xs: 1.5, sm: 2 }, mb: 3 }}>
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

      {/* Institutions - Mobile Cards / Desktop Table */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : filteredInstitutions.length === 0 ? (
        <Alert severity="info">
          {searchQuery ? 'Keine Kunden gefunden.' : 'Noch keine Kunden registriert.'}
        </Alert>
      ) : isMobile ? (
        // MOBILE: Card View
        <Box>
          {filteredInstitutions.map((institution) => {
            const patientData = getPatientData(institution.id);
            const isExpanded = expandedRows.has(institution.id);
            const hasPatients = patientData && patientData.patient_count > 0;

            return (
              <Card key={institution.id} sx={{ mb: 2 }}>
                <CardContent>
                  {/* Header with Company Name and Icon */}
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
                      <BusinessIcon color="primary" />
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        {institution.name}
                      </Typography>
                    </Box>
                    <IconButton size="small" onClick={(e) => handleMenuOpen(e, institution)}>
                      <MoreVertIcon />
                    </IconButton>
                  </Box>

                  {/* Location */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <LocationIcon fontSize="small" color="action" />
                    <Typography variant="body2" color="text.secondary">
                      {institution.address_plz} {institution.address_city}
                    </Typography>
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  {/* Details Grid */}
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">
                        Patienten
                      </Typography>
                      <Box sx={{ mt: 0.5 }}>
                        <Chip
                          icon={<PersonIcon />}
                          label={patientData?.patient_count || 0}
                          color={hasPatients ? 'primary' : 'default'}
                          size="small"
                        />
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">
                        Registriert am
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600, mt: 0.5 }}>
                        {new Date(institution.created_at).toLocaleDateString('de-DE')}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">
                        Verifiziert
                      </Typography>
                      <Box sx={{ mt: 0.5 }}>
                        <Chip
                          icon={institution.is_verified ? <CheckCircleIcon /> : undefined}
                          label={institution.is_verified ? 'Verifiziert' : 'Nicht verifiziert'}
                          color={institution.is_verified ? 'success' : 'default'}
                          size="small"
                        />
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">
                        Status
                      </Typography>
                      <Box sx={{ mt: 0.5 }}>
                        <Chip
                          label={institution.is_active ? 'Aktiv' : 'Inaktiv'}
                          color={institution.is_active ? 'success' : 'default'}
                          size="small"
                        />
                      </Box>
                    </Grid>
                  </Grid>

                  {/* Patients List (Expandable) */}
                  {hasPatients && (
                    <>
                      <Divider sx={{ my: 2 }} />
                      <Button
                        fullWidth
                        variant="outlined"
                        onClick={() => handleToggleExpand(institution.id)}
                        endIcon={isExpanded ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                      >
                        Patienten anzeigen ({patientData!.patient_count})
                      </Button>
                      <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                        <Box sx={{ mt: 2 }}>
                          <List dense>
                            {patientData!.patients.map((patient, index) => (
                              <ListItem
                                key={patient.id}
                                sx={{
                                  bgcolor: 'grey.50',
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
                    </>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </Box>
      ) : (
        // DESKTOP: Table View
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
