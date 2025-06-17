import { FormControlLabel, Checkbox, Grid, Typography, IconButton } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import { FormData } from '../../types';
import { usePricing } from '../../hooks/usePricing';
import { formatCurrencyValue } from '../../utils/formatCurrency';

interface StepProps {
  formData: FormData;
  setFormData: (data: FormData) => void;
}

const SubscriptionStep = ({ formData, setFormData }: StepProps) => {
  const { pricing } = usePricing();

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
              disabled={pricing.modules.cloud.required}
            />
          }
          label={`${pricing.modules.cloud.name} (R$ ${formatCurrencyValue(pricing.modules.cloud.price)}) - Obrigatório`}
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
          label={`${pricing.modules.fiscal.name} (R$ ${formatCurrencyValue(pricing.modules.fiscal.price)})`}
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
          label={`${pricing.modules.inventory.name} (R$ ${formatCurrencyValue(pricing.modules.inventory.price)})`}
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
          label={`${pricing.modules.financial.name} (R$ ${formatCurrencyValue(pricing.modules.financial.price)})`}
        />
      </Grid>
      <Grid item xs={12}>
        <Grid container alignItems="center" spacing={2}>
          <Grid item>
            <Typography variant="subtitle1">
              {pricing.modules.pdv.name} (R$ {formatCurrencyValue(pricing.modules.pdv.price)} cada)
            </Typography>
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