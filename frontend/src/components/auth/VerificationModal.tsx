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
  Alert,
  CircularProgress,
  LinearProgress,
} from '@mui/material';
import { MarkEmailRead, AccessTime } from '@mui/icons-material';
import { toast } from 'react-toastify';

/**
 * Email Verification Modal Component
 * Shows 6-digit code input for email verification during login
 */
interface VerificationModalProps {
  open: boolean;
  email: string;
  onVerify: (code: string) => Promise<void>;
  onResend: () => Promise<void>;
  onClose: () => void;
}

const VerificationModal = ({
  open,
  email,
  onVerify,
  onResend,
  onClose,
}: VerificationModalProps) => {
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Countdown timer state (10 minutes = 600 seconds)
  const [timeLeft, setTimeLeft] = useState(600);
  const [isExpired, setIsExpired] = useState(false);

  const handleVerify = async () => {
    // Validate code format
    if (code.length !== 6 || !/^\d{6}$/.test(code)) {
      setErrorMessage('Bitte geben Sie einen 6-stelligen Code ein');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      await onVerify(code);
      toast.success('E-Mail erfolgreich verifiziert!');
      onClose();
    } catch (error: any) {
      const message = error?.response?.data?.error || error?.message || 'Verifizierung fehlgeschlagen';
      setErrorMessage(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setIsResending(true);
    setErrorMessage('');

    try {
      await onResend();
      toast.success('Neuer Code wurde gesendet!');
      setCode('');
      // Reset timer to 10 minutes
      setTimeLeft(600);
      setIsExpired(false);
    } catch (error: any) {
      const message = error?.response?.data?.error || error?.message || 'Code konnte nicht gesendet werden';
      setErrorMessage(message);
      toast.error(message);
    } finally {
      setIsResending(false);
    }
  };

  // Countdown timer effect
  useEffect(() => {
    if (!open) {
      // Reset timer when modal closes
      setTimeLeft(600);
      setIsExpired(false);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setIsExpired(true);
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [open]);

  // Format time as MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Calculate progress percentage (for LinearProgress)
  const progressPercentage = ((600 - timeLeft) / 600) * 100;

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setCode(value);
    setErrorMessage('');
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)',
        },
      }}
    >
      <DialogTitle sx={{ textAlign: 'center', pt: 4 }}>
        <Box
          sx={{
            width: 80,
            height: 80,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #2563EB 0%, #10B981 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mx: 'auto',
            mb: 2,
            boxShadow: '0 4px 20px rgba(37, 99, 235, 0.3)',
          }}
        >
          <MarkEmailRead sx={{ fontSize: 40, color: 'white' }} />
        </Box>
        <Typography
          variant="h5"
          component="div"
          sx={{
            fontWeight: 700,
            background: 'linear-gradient(135deg, #2563EB 0%, #10B981 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          E-Mail verifizieren
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ px: 4, pb: 2 }}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, textAlign: 'center' }}>
          Wir haben einen 6-stelligen Verifizierungscode an <strong>{email}</strong> gesendet.
          Bitte geben Sie den Code ein, um Ihr Konto zu aktivieren.
        </Typography>

        {/* Countdown Timer */}
        <Box
          sx={{
            mb: 3,
            p: 2,
            background: isExpired
              ? 'linear-gradient(135deg, #f44336 0%, #e91e63 100%)'
              : timeLeft <= 60
              ? 'linear-gradient(135deg, #ff9800 0%, #ff5722 100%)'
              : 'linear-gradient(135deg, #2563EB 0%, #10B981 100%)',
            borderRadius: 2,
            textAlign: 'center',
            color: 'white',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
            <AccessTime sx={{ mr: 1, fontSize: 20 }} />
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {isExpired ? 'Code abgelaufen!' : 'Code gültig für:'}
            </Typography>
          </Box>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              fontFamily: 'monospace',
              letterSpacing: 2,
            }}
          >
            {formatTime(timeLeft)}
          </Typography>
          <LinearProgress
            variant="determinate"
            value={progressPercentage}
            sx={{
              mt: 1.5,
              height: 6,
              borderRadius: 3,
              backgroundColor: 'rgba(255, 255, 255, 0.3)',
              '& .MuiLinearProgress-bar': {
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                borderRadius: 3,
              },
            }}
          />
        </Box>

        {isExpired && (
          <Alert severity="error" sx={{ mb: 3 }}>
            Der Verifizierungscode ist abgelaufen. Bitte fordern Sie einen neuen Code an.
          </Alert>
        )}

        {errorMessage && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {errorMessage}
          </Alert>
        )}

        <TextField
          label="Verifizierungscode"
          value={code}
          onChange={handleCodeChange}
          fullWidth
          autoFocus
          placeholder="000000"
          inputProps={{
            maxLength: 6,
            style: {
              fontSize: '24px',
              fontWeight: 'bold',
              letterSpacing: '8px',
              textAlign: 'center',
            },
          }}
          sx={{
            mb: 2,
            '& .MuiOutlinedInput-root': {
              '&.Mui-focused fieldset': {
                borderColor: '#2563EB',
                borderWidth: 2,
              },
            },
          }}
        />

        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Code nicht erhalten?{' '}
            <Button
              onClick={handleResend}
              disabled={isResending}
              sx={{
                textTransform: 'none',
                fontWeight: 600,
                p: 0,
                minWidth: 'auto',
                '&:hover': {
                  background: 'transparent',
                  textDecoration: 'underline',
                },
              }}
            >
              {isResending ? <CircularProgress size={14} sx={{ mr: 1 }} /> : null}
              Erneut senden
            </Button>
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 4, pb: 4, pt: 2 }}>
        <Button
          onClick={onClose}
          variant="outlined"
          fullWidth
          sx={{
            mr: 1,
            py: 1.5,
            textTransform: 'none',
            fontWeight: 600,
            borderColor: '#E5E7EB',
            color: 'text.secondary',
            '&:hover': {
              borderColor: '#D1D5DB',
              background: '#F9FAFB',
            },
          }}
        >
          Abbrechen
        </Button>
        <Button
          onClick={handleVerify}
          variant="contained"
          fullWidth
          disabled={isLoading || code.length !== 6 || isExpired}
          sx={{
            py: 1.5,
            textTransform: 'none',
            fontWeight: 600,
            background: 'linear-gradient(135deg, #2563EB 0%, #10B981 100%)',
            '&:hover': {
              background: 'linear-gradient(135deg, #1E40AF 0%, #059669 100%)',
            },
            '&.Mui-disabled': {
              background: '#E5E7EB',
              color: '#9CA3AF',
            },
          }}
        >
          {isLoading ? <CircularProgress size={24} sx={{ color: 'white' }} /> : isExpired ? 'Code abgelaufen' : 'Verifizieren'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default VerificationModal;
