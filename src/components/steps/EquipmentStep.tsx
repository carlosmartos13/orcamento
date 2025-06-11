import { Grid, Typography, IconButton, TextField } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import { FormData } from '../../types';

interface StepProps {
  formData: FormData;
  setFormData: (data: FormData) => void;
}

const EquipmentStep = ({ formData, setFormData }: StepProps) => {
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
    label, 
    price, 
    value, 
    field 
  }: { 
    label: string; 
    price: number; 
    value: number; 
    field: keyof FormData['equipment']; 
  }) => (
    <Grid container alignItems="center" spacing={2}>
      <Grid item xs={12} sm={6}>
        <Typography>{label}</Typography>
        <Typography variant="body2" color="text.secondary">
          R$ {price.toFixed(2)}
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
            value={value}
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

  return (
    <Grid container spacing={3}>
      <EquipmentCounter
        label="PDV ANDROID GERTEC"
        price={2400.00}
        value={formData.equipment.androidPdvGertec}
        field="androidPdvGertec"
      />
      <EquipmentCounter
        label="PDV ANDROID SUNMI"
        price={2350.00}
        value={formData.equipment.androidPdvSunmi}
        field="androidPdvSunmi"
      />
      <EquipmentCounter
        label="TOTEM AUTO ATENDIMENTO GERTEC"
        price={3890.00}
        value={formData.equipment.selfServiceTotemGertec}
        field="selfServiceTotemGertec"
      />
      <EquipmentCounter
        label="KIT REDE ROTEADOR E SWITCH"
        price={550.00}
        value={formData.equipment.networkKit}
        field="networkKit"
      />
      <EquipmentCounter
        label="SERVIDOR RASPBERRY"
        price={1390.00}
        value={formData.equipment.raspberryServer}
        field="raspberryServer"
      />
    </Grid>
  );
};

export default EquipmentStep;