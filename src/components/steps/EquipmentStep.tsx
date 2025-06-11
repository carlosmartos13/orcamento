import { Grid, Typography, IconButton, TextField } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import { FormData } from '../../types';
import { usePricing } from '../../hooks/usePricing';
import { formatCurrencyValue } from '../../utils/formatCurrency';

interface StepProps {
  formData: FormData;
  setFormData: (data: FormData) => void;
}

const EquipmentStep = ({ formData, setFormData }: StepProps) => {
  const { pricing } = usePricing();

  const handleEquipmentChange = (field: keyof FormData['equipment']) => (value: number) => {
    setFormData({
      ...formData,
      equipment: {
        ...formData.equipment,
        [field]: Math.max(0, value),
      },
    });
  };

  const EquipmentCounter = ({ 
    field,
    value
  }: { 
    field: keyof FormData['equipment']; 
    value: number; 
  }) => {
    const equipmentItem = pricing.equipment[field];
    
    if (!equipmentItem) return null;

    return (
      <Grid container alignItems="center" spacing={2}>
        <Grid item xs={12} sm={6}>
          <Typography>{equipmentItem.name}</Typography>
          <Typography variant="body2" color="text.secondary">
            R$ {formatCurrencyValue(equipmentItem.price)}
          </Typography>
        </Grid>
        <Grid item xs={12} sm={6} container alignItems="center" spacing={1}>
          <Grid item>
            <IconButton 
              onClick={() => handleEquipmentChange(field)(value - 1)}
              disabled={value === 0}
            >
              <RemoveIcon />
            </IconButton>
          </Grid>
          <Grid item>
            <TextField
              value={String(value)}
              onChange={(e) => handleEquipmentChange(field)(parseInt(e.target.value) || 0)}
              type="number"
              inputProps={{ min: 0, style: { textAlign: 'center', width: '60px' } }}
            />
          </Grid>
          <Grid item>
            <IconButton 
              onClick={() => handleEquipmentChange(field)(value + 1)}
            >
              <AddIcon />
            </IconButton>
          </Grid>
        </Grid>
      </Grid>
    );
  };

  return (
    <Grid container spacing={3}>
      {Object.keys(pricing.equipment).map((equipmentKey) => (
        <Grid item xs={12} key={equipmentKey}>
          <EquipmentCounter
            field={equipmentKey as keyof FormData['equipment']}
            value={formData.equipment[equipmentKey as keyof FormData['equipment']]}
          />
        </Grid>
      ))}
    </Grid>
  );
};

export default EquipmentStep;