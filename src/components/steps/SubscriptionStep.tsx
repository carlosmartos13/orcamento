import { FormControlLabel, Checkbox, Grid, Typography, IconButton } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import { FormData } from '../../types';

interface StepProps {
  formData: FormData;
  setFormData: (data: FormData) => void;
}

const SubscriptionStep = ({ formData, setFormData }: StepProps) => {
  const handleCheckboxChange = (field: keyof FormData['subscription']) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      subscription: {
        ...formData.subscription,
        [field]: event.target.checked,
      },
    });
  };

  const handlePdvCountChange = (change: number) => {
    const newValue = Math.max(1, formData.subscription.pdvCount + change);
    setFormData({
      ...formData,
      subscription: {
        ...formData.subscription,
        pdvCount: newValue,
      },
    });
  };

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <FormControlLabel
          control={
            <Checkbox
              checked={formData.subscription.cloud}
              onChange={handleCheckboxChange('cloud')}
              disabled
            />
          }
          label="Cloud (R$ 64,10) - Obrigatório"
        />
      </Grid>
      <Grid item xs={12}>
        <FormControlLabel
          control={
            <Checkbox
              checked={formData.subscription.fiscal}
              onChange={handleCheckboxChange('fiscal')}
            />
          }
          label="Fiscal (R$ 73,00)"
        />
      </Grid>
      <Grid item xs={12}>
        <FormControlLabel
          control={
            <Checkbox
              checked={formData.subscription.inventory}
              onChange={handleCheckboxChange('inventory')}
            />
          }
          label="Estoque (R$ 73,00)"
        />
      </Grid>
      <Grid item xs={12}>
        <FormControlLabel
          control={
            <Checkbox
              checked={formData.subscription.financial}
              onChange={handleCheckboxChange('financial')}
            />
          }
          label="Financeiro (R$ 73,00)"
        />
      </Grid>
      <Grid item xs={12}>
        <Grid container alignItems="center" spacing={2}>
          <Grid item>
            <Typography variant="subtitle1">PDV (R$ 15,00 cada)</Typography>
          </Grid>
          <Grid item>
            <IconButton 
              onClick={() => handlePdvCountChange(-1)}
              disabled={formData.subscription.pdvCount <= 1}
              size="small"
            >
              <RemoveIcon />
            </IconButton>
          </Grid>
          <Grid item>
            <Typography variant="body1">{formData.subscription.pdvCount}</Typography>
          </Grid>
          <Grid item>
            <IconButton 
              onClick={() => handlePdvCountChange(1)}
              size="small"
            >
              <AddIcon />
            </IconButton>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
};

export default SubscriptionStep;