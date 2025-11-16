import { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  CircularProgress,
  Card,
  CardContent,
  Divider,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  Add,
  Search,
  Edit,
  Delete,
  Person,
  PersonAdd,
  CheckCircle,
  Refresh,
  Visibility,
  VisibilityOff,
} from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'react-toastify';
import * as patientApi from '../../api/patientApi';
import * as workerApi from '../../api/workerApi';

/**
 * Patient and Worker Types
 */
type Patient = patientApi.Patient;
type Worker = workerApi.Worker;

/**
 * Patient Form Validation Schema
 */
const patientSchema = z.object({
  firstName: z.string().min(2, 'Vorname ist erforderlich'),
  lastName: z.string().min(2, 'Nachname ist erforderlich'),
  dateOfBirth: z.string().min(1, 'Geburtsdatum ist erforderlich'),
  address: z.string().min(5, 'Adresse ist erforderlich'),
});

type PatientFormData = z.infer<typeof patientSchema>;

/**
 * Patients Page Component
 * Patient management with CRUD operations using real API
 */
const PatientsPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [openCredentialsDialog, setOpenCredentialsDialog] = useState(false);
  const [workerCredentials, setWorkerCredentials] = useState<{ username: string; password: string } | null>(null);
  const [workersMap, setWorkersMap] = useState<Map<string, Worker>>(new Map());
  const [loadingWorkers, setLoadingWorkers] = useState(true);
  const [newCredentialsMap, setNewCredentialsMap] = useState<Map<string, { username: string; password: string }>>(new Map());
  const [visiblePasswordMap, setVisiblePasswordMap] = useState<Map<string, string>>(new Map()); // patientId -> password

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PatientFormData>({
    resolver: zodResolver(patientSchema),
  });

  /**
   * Fetch patients from API
   */
  const fetchPatients = async () => {
    try {
      setLoading(true);
      const data = await patientApi.getPatients();
      setPatients(data);
    } catch (error: any) {
      console.error('Error fetching patients:', error);
      toast.error('Fehler beim Laden der Patienten');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Fetch workers for all patients
   */
  const fetchWorkers = async () => {
    try {
      setLoadingWorkers(true);
      const workers = await workerApi.getWorkers();
      const newWorkersMap = new Map<string, Worker>();
      workers.forEach((worker) => {
        newWorkersMap.set(worker.patientId, worker);
      });
      setWorkersMap(newWorkersMap);
    } catch (error: any) {
      console.error('Error fetching workers:', error);
    } finally {
      setLoadingWorkers(false);
    }
  };

  // Fetch patients and workers on component mount
  useEffect(() => {
    fetchPatients();
    fetchWorkers();
  }, []);

  const handleOpenDialog = (patient?: Patient) => {
    if (patient) {
      setSelectedPatient(patient);
      reset({
        firstName: patient.firstName,
        lastName: patient.lastName,
        dateOfBirth: patient.dateOfBirth,
        address: patient.address || '',
      });
    } else {
      setSelectedPatient(null);
      reset({
        firstName: '',
        lastName: '',
        dateOfBirth: '',
        address: '',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedPatient(null);
    reset();
  };

  const onSubmit = async (data: PatientFormData) => {
    try {
      if (selectedPatient) {
        // Update existing patient
        await patientApi.updatePatient(selectedPatient.id, data);
        toast.success('Patient erfolgreich aktualisiert');
      } else {
        // Create new patient
        await patientApi.createPatient(data);
        toast.success('Patient erfolgreich erstellt');
      }

      handleCloseDialog();
      // Refresh patients list
      await fetchPatients();
    } catch (error: any) {
      console.error('Error saving patient:', error);
      const errorMessage = error.response?.data?.message || 'Fehler beim Speichern des Patienten';
      toast.error(errorMessage);
    }
  };

  const handleDelete = async (patientId: string) => {
    if (window.confirm('Möchten Sie diesen Patienten wirklich löschen?')) {
      try {
        await patientApi.deactivatePatient(patientId);
        toast.success('Patient erfolgreich deaktiviert');
        // Refresh patients list
        await fetchPatients();
      } catch (error: any) {
        console.error('Error deleting patient:', error);
        const errorMessage = error.response?.data?.message || 'Fehler beim Löschen des Patienten';
        toast.error(errorMessage);
      }
    }
  };

  const handleGenerateWorker = async (patientId: string, patientName: string) => {
    if (
      window.confirm(
        `Möchten Sie Worker-Zugangsdaten für ${patientName} generieren?\n\n` +
          'WICHTIG: Die Zugangsdaten werden direkt in der Tabelle angezeigt!'
      )
    ) {
      try {
        // Real API call to generate worker credentials
        const credentials = await workerApi.generateWorkerForPatient(patientId);

        // Store credentials in map to display in table
        setNewCredentialsMap((prev) => new Map(prev).set(patientId, {
          username: credentials.username,
          password: credentials.password,
        }));

        toast.success('Worker-Zugangsdaten erfolgreich generiert', {
          autoClose: 5000,
        });

        // Fetch updated worker data
        const worker = await workerApi.getWorkerByPatientId(patientId);
        if (worker) {
          setWorkersMap((prev) => new Map(prev).set(patientId, worker));
        }
      } catch (error: any) {
        console.error('Error generating worker credentials:', error);
        const errorMessage = error.response?.data?.error || error.response?.data?.message || 'Fehler beim Generieren der Zugangsdaten';
        toast.error(errorMessage);
      }
    }
  };

  const handleRegenerateWorker = async (workerId: string, patientId: string, patientName: string) => {
    if (
      window.confirm(
        `Möchten Sie die Worker-Zugangsdaten für ${patientName} neu generieren?\n\n` +
          'WICHTIG: Die alten Zugangsdaten werden ungültig!'
      )
    ) {
      try {
        // Reset worker password
        const result = await workerApi.resetWorkerPassword(workerId);

        // Get the worker to retrieve username
        const worker = workersMap.get(patientId);
        if (worker) {
          // Store new credentials in map to display in table
          setNewCredentialsMap((prev) => new Map(prev).set(patientId, {
            username: worker.username,
            password: result.newPassword,
          }));

          toast.success('Worker-Zugangsdaten erfolgreich neu generiert', {
            autoClose: 5000,
          });

          // Fetch updated worker data
          const updatedWorker = await workerApi.getWorkerByPatientId(patientId);
          if (updatedWorker) {
            setWorkersMap((prev) => new Map(prev).set(patientId, updatedWorker));
          }
        }
      } catch (error: any) {
        console.error('Error regenerating worker credentials:', error);
        const errorMessage = error.response?.data?.error || error.response?.data?.message || 'Fehler beim Neu-Generieren der Zugangsdaten';
        toast.error(errorMessage);
      }
    }
  };

  const handleTogglePasswordVisibility = async (workerId: string, patientId: string) => {
    // If password is already visible, hide it
    if (visiblePasswordMap.has(patientId)) {
      setVisiblePasswordMap((prev) => {
        const newMap = new Map(prev);
        newMap.delete(patientId);
        return newMap;
      });
      return;
    }

    // Otherwise, reset password and show it
    try {
      const result = await workerApi.resetWorkerPassword(workerId);
      setVisiblePasswordMap((prev) => new Map(prev).set(patientId, result.newPassword));
      toast.info('Neues Passwort generiert und angezeigt', { autoClose: 3000 });
    } catch (error: any) {
      console.error('Error resetting password:', error);
      toast.error('Fehler beim Zurücksetzen des Passworts');
    }
  };

  const handleCloseCredentialsDialog = () => {
    setOpenCredentialsDialog(false);
    setWorkerCredentials(null);
  };

  const filteredPatients = patients.filter((patient) =>
    `${patient.firstName} ${patient.lastName} ${patient.uniqueCode}`
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, mb: 3, gap: { xs: 2, sm: 0 } }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5, fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
            Patienten
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.85rem', sm: '0.875rem' } }}>
            {loading ? 'Laden...' : `${filteredPatients.length} Patienten insgesamt`}
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpenDialog()}
          fullWidth={{ xs: true, sm: false }}
          sx={{
            background: 'linear-gradient(135deg, #2563EB 0%, #10B981 100%)',
            '&:hover': {
              background: 'linear-gradient(135deg, #1E40AF 0%, #059669 100%)',
            },
          }}
        >
          Neuer Patient
        </Button>
      </Box>

      {/* Search Bar */}
      <Paper sx={{ p: { xs: 1.5, sm: 2 }, mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Patienten suchen..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
        />
      </Paper>

      {/* Loading State */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
          <CircularProgress size={60} />
        </Box>
      ) : filteredPatients.length === 0 ? (
        /* Empty State */
        <Paper sx={{ p: 8, textAlign: 'center' }}>
          <Person sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Keine Patienten gefunden
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            {searchQuery
              ? 'Versuchen Sie einen anderen Suchbegriff'
              : 'Fügen Sie Ihren ersten Patienten hinzu'}
          </Typography>
          {!searchQuery && (
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => handleOpenDialog()}
              sx={{
                background: 'linear-gradient(135deg, #2563EB 0%, #10B981 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #1E40AF 0%, #059669 100%)',
                },
              }}
            >
              Neuer Patient
            </Button>
          )}
        </Paper>
      ) : isMobile ? (
        /* Mobile Card View */
        <Box>
          {filteredPatients
            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
            .map((patient) => (
              <Card key={patient.id} sx={{ mb: 2 }}>
                <CardContent>
                  {/* Header with ID and Actions */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Chip
                      label={patient.uniqueCode}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                    <Box>
                      <IconButton
                        size="small"
                        onClick={() => handleOpenDialog(patient)}
                        color="primary"
                      >
                        <Edit fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(patient.id)}
                        color="error"
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>

                  {/* Patient Name */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <Person color="action" />
                    <Typography variant="h6" sx={{ fontSize: '1.1rem', fontWeight: 600 }}>
                      {patient.firstName} {patient.lastName}
                    </Typography>
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  {/* Details */}
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">
                        Geburtsdatum
                      </Typography>
                      <Typography variant="body2" fontWeight={500}>
                        {new Date(patient.dateOfBirth).toLocaleDateString('de-DE')}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">
                        Adresse
                      </Typography>
                      <Typography variant="body2" fontWeight={500}>
                        {patient.address || '-'}
                      </Typography>
                    </Grid>
                  </Grid>

                  <Divider sx={{ my: 2 }} />

                  {/* Worker Section */}
                  <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                    Worker Zugangsdaten
                  </Typography>
                  {loadingWorkers ? (
                    <CircularProgress size={20} />
                  ) : newCredentialsMap.has(patient.id) ? (
                    <Box sx={{ bgcolor: 'success.light', p: 2, borderRadius: 1, border: '2px solid', borderColor: 'success.main' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                        <CheckCircle sx={{ fontSize: 18, color: 'success.dark' }} />
                        <Typography variant="caption" fontWeight={700} color="success.dark">
                          NEUE ZUGANGSDATEN
                        </Typography>
                      </Box>
                      <Box sx={{ mb: 1 }}>
                        <Typography variant="caption" color="text.secondary">
                          Benutzername:
                        </Typography>
                        <Typography variant="body2" fontWeight={700} sx={{ fontFamily: 'monospace' }}>
                          {newCredentialsMap.get(patient.id)?.username}
                        </Typography>
                      </Box>
                      <Box sx={{ mb: 1 }}>
                        <Typography variant="caption" color="text.secondary">
                          Passwort:
                        </Typography>
                        <Typography variant="body2" fontWeight={700} sx={{ fontFamily: 'monospace', color: 'error.main' }}>
                          {newCredentialsMap.get(patient.id)?.password}
                        </Typography>
                      </Box>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<Refresh fontSize="small" />}
                        onClick={() =>
                          handleRegenerateWorker(
                            workersMap.get(patient.id)!.id,
                            patient.id,
                            `${patient.firstName} ${patient.lastName}`
                          )
                        }
                        fullWidth
                      >
                        Neu generieren
                      </Button>
                    </Box>
                  ) : workersMap.has(patient.id) ? (
                    <Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <CheckCircle sx={{ fontSize: 18, color: 'success.main' }} />
                        <Typography variant="body2" fontWeight={600}>
                          {workersMap.get(patient.id)?.username}
                        </Typography>
                        <IconButton
                          size="small"
                          onClick={() =>
                            handleTogglePasswordVisibility(
                              workersMap.get(patient.id)!.id,
                              patient.id
                            )
                          }
                        >
                          {visiblePasswordMap.has(patient.id) ? (
                            <VisibilityOff fontSize="small" />
                          ) : (
                            <Visibility fontSize="small" />
                          )}
                        </IconButton>
                      </Box>
                      {visiblePasswordMap.has(patient.id) && (
                        <Typography variant="caption" sx={{ fontFamily: 'monospace', color: 'error.main', fontWeight: 700, display: 'block', mb: 1 }}>
                          {visiblePasswordMap.get(patient.id)}
                        </Typography>
                      )}
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<Refresh fontSize="small" />}
                        onClick={() =>
                          handleRegenerateWorker(
                            workersMap.get(patient.id)!.id,
                            patient.id,
                            `${patient.firstName} ${patient.lastName}`
                          )
                        }
                        fullWidth
                      >
                        Neu generieren
                      </Button>
                    </Box>
                  ) : (
                    <Button
                      size="small"
                      variant="contained"
                      color="success"
                      startIcon={<PersonAdd fontSize="small" />}
                      onClick={() => handleGenerateWorker(patient.id, `${patient.firstName} ${patient.lastName}`)}
                      fullWidth
                    >
                      Zugangsdaten erstellen
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            <TablePagination
              component="div"
              count={filteredPatients.length}
              page={page}
              onPageChange={(_, newPage) => setPage(newPage)}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={(e) => {
                setRowsPerPage(parseInt(e.target.value, 10));
                setPage(0);
              }}
              labelRowsPerPage="Zeilen:"
            />
          </Box>
        </Box>
      ) : (
        /* Desktop Table View */
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600, fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>Patient ID</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>Name</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>Geburtsdatum</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>Adresse</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>Worker</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: { xs: '0.8rem', sm: '0.875rem' } }} align="right">
                  Aktionen
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredPatients
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((patient) => (
                  <TableRow
                    key={patient.id}
                    sx={{
                      '&:hover': {
                        backgroundColor: 'action.hover',
                      },
                    }}
                  >
                    <TableCell sx={{ py: { xs: 1.5, md: 2 } }}>
                      <Chip
                        label={patient.uniqueCode}
                        size="small"
                        color="primary"
                        variant="outlined"
                        sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
                      />
                    </TableCell>
                    <TableCell sx={{ py: { xs: 1.5, md: 2 } }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Person color="action" sx={{ fontSize: { xs: 18, sm: 20, md: 24 } }} />
                        <Typography variant="body2" fontWeight={500} sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
                          {patient.firstName} {patient.lastName}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ py: { xs: 1.5, md: 2 }, fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>{new Date(patient.dateOfBirth).toLocaleDateString('de-DE')}</TableCell>
                    <TableCell sx={{ py: { xs: 1.5, md: 2 } }}>
                      <Typography variant="body2" sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>{patient.address || '-'}</Typography>
                    </TableCell>
                    <TableCell>
                      {loadingWorkers ? (
                        <CircularProgress size={20} />
                      ) : newCredentialsMap.has(patient.id) ? (
                        // Show new credentials directly in table
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, bgcolor: 'success.light', p: 1.5, borderRadius: 1, border: '2px solid', borderColor: 'success.main' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                            <CheckCircle sx={{ fontSize: 20, color: 'success.dark' }} />
                            <Typography variant="caption" fontWeight={700} color="success.dark">
                              NEUE ZUGANGSDATEN
                            </Typography>
                          </Box>
                          <Box>
                            <Typography variant="caption" color="text.secondary" fontWeight={600}>
                              Benutzername:
                            </Typography>
                            <Typography variant="body2" fontWeight={700} sx={{ fontFamily: 'monospace' }}>
                              {newCredentialsMap.get(patient.id)?.username}
                            </Typography>
                          </Box>
                          <Box>
                            <Typography variant="caption" color="text.secondary" fontWeight={600}>
                              Passwort:
                            </Typography>
                            <Typography variant="body2" fontWeight={700} sx={{ fontFamily: 'monospace', color: 'error.main' }}>
                              {newCredentialsMap.get(patient.id)?.password}
                            </Typography>
                          </Box>
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<Refresh fontSize="small" />}
                            onClick={() =>
                              handleRegenerateWorker(
                                workersMap.get(patient.id)!.id,
                                patient.id,
                                `${patient.firstName} ${patient.lastName}`
                              )
                            }
                            sx={{ minWidth: 'auto', fontSize: '0.7rem', py: 0.5, px: 1.5, mt: 0.5 }}
                          >
                            Neu generieren
                          </Button>
                        </Box>
                      ) : workersMap.has(patient.id) ? (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <CheckCircle sx={{ fontSize: 18, color: 'success.main' }} />
                            <Box sx={{ flex: 1 }}>
                              <Typography variant="body2" fontWeight={600}>
                                {workersMap.get(patient.id)?.username}
                              </Typography>
                              {visiblePasswordMap.has(patient.id) ? (
                                <Typography variant="caption" sx={{ fontFamily: 'monospace', color: 'error.main', fontWeight: 700 }}>
                                  {visiblePasswordMap.get(patient.id)}
                                </Typography>
                              ) : (
                                <Typography variant="caption" color="text.secondary">
                                  Passwort nicht sichtbar
                                </Typography>
                              )}
                            </Box>
                            <IconButton
                              size="small"
                              onClick={() =>
                                handleTogglePasswordVisibility(
                                  workersMap.get(patient.id)!.id,
                                  patient.id
                                )
                              }
                              sx={{ ml: 1 }}
                            >
                              {visiblePasswordMap.has(patient.id) ? (
                                <VisibilityOff fontSize="small" />
                              ) : (
                                <Visibility fontSize="small" />
                              )}
                            </IconButton>
                          </Box>
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<Refresh fontSize="small" />}
                            onClick={() =>
                              handleRegenerateWorker(
                                workersMap.get(patient.id)!.id,
                                patient.id,
                                `${patient.firstName} ${patient.lastName}`
                              )
                            }
                            sx={{ minWidth: 'auto', fontSize: '0.75rem', py: 0.5, px: 1.5 }}
                          >
                            Neu generieren
                          </Button>
                        </Box>
                      ) : (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                          <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                            Noch nicht erstellt
                          </Typography>
                          <Button
                            size="small"
                            variant="contained"
                            color="success"
                            startIcon={<PersonAdd fontSize="small" />}
                            onClick={() => handleGenerateWorker(patient.id, `${patient.firstName} ${patient.lastName}`)}
                            sx={{ fontSize: '0.75rem', py: 0.5, px: 1.5 }}
                          >
                            Zugangsdaten erstellen
                          </Button>
                        </Box>
                      )}
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        onClick={() => handleOpenDialog(patient)}
                        color="primary"
                        title="Patient bearbeiten"
                      >
                        <Edit fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(patient.id)}
                        color="error"
                        title="Patient löschen"
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
          <TablePagination
            component="div"
            count={filteredPatients.length}
            page={page}
            onPageChange={(_, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
            labelRowsPerPage="Zeilen pro Seite:"
          />
        </TableContainer>
      )}

      {/* Worker Credentials Dialog */}
      <Dialog
        open={openCredentialsDialog}
        onClose={handleCloseCredentialsDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <PersonAdd color="success" />
            <Typography variant="h6">Worker-Zugangsdaten</Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="body1" color="error" sx={{ mb: 3, fontWeight: 600 }}>
              WICHTIG: Diese Zugangsdaten werden nur einmal angezeigt!
            </Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
              Bitte speichern Sie diese Zugangsdaten sicher und geben Sie sie an den Worker weiter:
            </Typography>

            <Paper sx={{ p: 3, bgcolor: 'grey.50', mb: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="caption" color="text.secondary">
                    Benutzername
                  </Typography>
                  <Typography variant="h6" sx={{ fontFamily: 'monospace', color: 'primary.main' }}>
                    {workerCredentials?.username}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="caption" color="text.secondary">
                    Passwort
                  </Typography>
                  <Typography variant="h6" sx={{ fontFamily: 'monospace', color: 'primary.main' }}>
                    {workerCredentials?.password}
                  </Typography>
                </Grid>
              </Grid>
            </Paper>

            <Typography variant="body2" color="text.secondary">
              Der Worker kann sich mit diesen Zugangsdaten im System anmelden.
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={handleCloseCredentialsDialog}
            variant="contained"
            sx={{
              background: 'linear-gradient(135deg, #2563EB 0%, #10B981 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #1E40AF 0%, #059669 100%)',
              },
            }}
          >
            Verstanden
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add/Edit Patient Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedPatient ? 'Patient bearbeiten' : 'Neuer Patient'}
        </DialogTitle>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  {...register('firstName')}
                  label="Vorname"
                  fullWidth
                  error={!!errors.firstName}
                  helperText={errors.firstName?.message}
                  margin="dense"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  {...register('lastName')}
                  label="Nachname"
                  fullWidth
                  error={!!errors.lastName}
                  helperText={errors.lastName?.message}
                  margin="dense"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  {...register('dateOfBirth')}
                  label="Geburtsdatum"
                  type="date"
                  fullWidth
                  error={!!errors.dateOfBirth}
                  helperText={errors.dateOfBirth?.message}
                  margin="dense"
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  {...register('address')}
                  label="Adresse Nr. PLZ Ort"
                  fullWidth
                  error={!!errors.address}
                  helperText={errors.address?.message}
                  margin="dense"
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={handleCloseDialog}>Abbrechen</Button>
            <Button
              type="submit"
              variant="contained"
              sx={{
                background: 'linear-gradient(135deg, #2563EB 0%, #10B981 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #1E40AF 0%, #059669 100%)',
                },
              }}
            >
              {selectedPatient ? 'Aktualisieren' : 'Erstellen'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default PatientsPage;
