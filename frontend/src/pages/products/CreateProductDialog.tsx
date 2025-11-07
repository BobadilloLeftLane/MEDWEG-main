import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Grid,
  Box,
  Typography,
} from '@mui/material';
import { toast } from 'react-toastify';
import * as productApi from '../../api/productApi';
import { getProductImagePath } from '../../utils/productImages';

interface CreateProductDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const CreateProductDialog = ({ open, onClose, onSuccess }: CreateProductDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<productApi.CreateProductDto>({
    name_de: '',
    description_de: '',
    type: 'gloves',
    size: undefined,
    quantity_per_box: 100,
    unit: 'Stück',
    price_per_unit: 0,
    min_order_quantity: 1,
    image_url: '',
  });

  const handleChange = (field: keyof productApi.CreateProductDto, value: any) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value };

      // Automatically set image_url when product type changes (if no custom URL)
      if (field === 'type' && !prev.image_url) {
        updated.image_url = getProductImagePath(value);
      }

      return updated;
    });
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.name_de.trim()) {
      toast.error('Produktname ist erforderlich');
      return;
    }

    if (formData.price_per_unit < 0) {
      toast.error('Preis muss mindestens 0 sein');
      return;
    }

    if (formData.quantity_per_box < 1) {
      toast.error('Menge pro Box muss mindestens 1 sein');
      return;
    }

    if (formData.min_order_quantity < 1) {
      toast.error('Mindestbestellmenge muss mindestens 1 sein');
      return;
    }

    try {
      setLoading(true);

      // Clean up data
      const dataToSend = {
        ...formData,
        description_de: formData.description_de?.trim() || undefined,
        image_url: formData.image_url?.trim() || getProductImagePath(formData.type),
        size: formData.type === 'gloves' ? formData.size : undefined,
      };

      await productApi.createProduct(dataToSend);
      toast.success('Produkt erfolgreich erstellt');
      onSuccess();

      // Reset form
      setFormData({
        name_de: '',
        description_de: '',
        type: 'gloves',
        size: undefined,
        quantity_per_box: 100,
        unit: 'Stück',
        price_per_unit: 0,
        min_order_quantity: 1,
        image_url: '',
      });
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Fehler beim Erstellen');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Neues Produkt erstellen</DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 2 }}>
          <Grid container spacing={2}>
            {/* Produktname */}
            <Grid item xs={12}>
              <TextField
                label="Produktname (Deutsch)"
                value={formData.name_de}
                onChange={(e) => handleChange('name_de', e.target.value)}
                fullWidth
                required
              />
            </Grid>

            {/* Beschreibung */}
            <Grid item xs={12}>
              <TextField
                label="Beschreibung (Deutsch)"
                value={formData.description_de}
                onChange={(e) => handleChange('description_de', e.target.value)}
                fullWidth
                multiline
                rows={3}
              />
            </Grid>

            {/* Produkttyp */}
            <Grid item xs={12} sm={6}>
              <TextField
                select
                label="Produkttyp"
                value={formData.type}
                onChange={(e) => handleChange('type', e.target.value)}
                fullWidth
                required
              >
                <MenuItem value="gloves">Handschuhe</MenuItem>
                <MenuItem value="disinfectant_liquid">Desinfektionsmittel (Flüssig)</MenuItem>
                <MenuItem value="disinfectant_wipes">Desinfektionstücher</MenuItem>
              </TextField>
            </Grid>

            {/* Größe (nur für Handschuhe) */}
            {formData.type === 'gloves' && (
              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  label="Größe"
                  value={formData.size || ''}
                  onChange={(e) => handleChange('size', e.target.value as any)}
                  fullWidth
                  required
                >
                  <MenuItem value="S">S</MenuItem>
                  <MenuItem value="M">M</MenuItem>
                  <MenuItem value="L">L</MenuItem>
                  <MenuItem value="XL">XL</MenuItem>
                </TextField>
              </Grid>
            )}

            {/* Menge pro Box */}
            <Grid item xs={12} sm={6}>
              <TextField
                label="Menge pro Box"
                type="number"
                value={formData.quantity_per_box}
                onChange={(e) => handleChange('quantity_per_box', parseInt(e.target.value))}
                fullWidth
                required
                inputProps={{ min: 1 }}
              />
            </Grid>

            {/* Einheit */}
            <Grid item xs={12} sm={6}>
              <TextField
                label="Einheit"
                value={formData.unit}
                onChange={(e) => handleChange('unit', e.target.value)}
                fullWidth
                required
                placeholder="z.B. Stück, ml, Liter"
              />
            </Grid>

            {/* Preis pro Einheit */}
            <Grid item xs={12} sm={6}>
              <TextField
                label="Preis pro Einheit (€)"
                type="number"
                value={formData.price_per_unit}
                onChange={(e) => handleChange('price_per_unit', parseFloat(e.target.value))}
                fullWidth
                required
                inputProps={{ min: 0, step: 0.01 }}
              />
            </Grid>

            {/* Mindestbestellmenge */}
            <Grid item xs={12} sm={6}>
              <TextField
                label="Mindestbestellmenge"
                type="number"
                value={formData.min_order_quantity}
                onChange={(e) => handleChange('min_order_quantity', parseInt(e.target.value))}
                fullWidth
                required
                inputProps={{ min: 1 }}
              />
            </Grid>

            {/* Bild URL */}
            <Grid item xs={12}>
              <TextField
                label="Bild-URL (optional)"
                value={formData.image_url}
                onChange={(e) => handleChange('image_url', e.target.value)}
                fullWidth
                placeholder="https://..."
                helperText="Leer lassen für automatisches Standardbild"
              />
            </Grid>

            {/* Image Preview */}
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box
                  component="img"
                  src={formData.image_url || getProductImagePath(formData.type)}
                  alt="Produktvorschau"
                  onError={(e: any) => {
                    console.error('Image load error:', e.target.src);
                    e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23f0f0f0" width="100" height="100"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" fill="%23999"%3EKein Bild%3C/text%3E%3C/svg%3E';
                  }}
                  sx={{
                    width: 100,
                    height: 100,
                    objectFit: 'contain',
                    borderRadius: 1,
                    bgcolor: 'grey.100',
                    p: 1,
                    border: '1px solid',
                    borderColor: 'grey.300',
                  }}
                />
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Bildvorschau
                  </Typography>
                  <Typography variant="caption" display="block" color="text.disabled">
                    {formData.image_url || getProductImagePath(formData.type)}
                  </Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Abbrechen
        </Button>
        <Button onClick={handleSubmit} variant="contained" disabled={loading}>
          {loading ? 'Erstellen...' : 'Erstellen'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateProductDialog;
