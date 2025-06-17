import { FormControlLabel, Checkbox, Grid, Typography, IconButton, RadioGroup, Radio } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import { FormData } from '../../types';
import { usePricing } from '../../hooks/usePricing';
import { formatCurrencyValue } from '../../utils/formatCurrency';

interface StepProps {
  formData: FormData;
  setFormData: (data: FormData) => void;
}

const AdditionalsStep = ({ formData, setFormData }: StepProps) => {
  const { pricing } = usePricing();

  const handleLoyaltyChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      additionals: {
        ...formData.additionals,
        legalLoyalty: event.target.checked,
      },
    });
  };

  const handleDeliveryChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      additionals: {
        ...formData.additionals,
        delivery: event.target.value as 'none' | 'basic' | 'plus',
      },
    });
  };

  const handleTerminalsChange = (change: number) => {
    const newValue = Math.max(0, formData.additionals.selfServiceTerminals + change);
    setFormData({
      ...formData,
      additionals: {
        ...formData.additionals,
        selfServiceTerminals: newValue,
      },
    });
  };

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <FormControlLabel
          control={
            <Checkbox
              checked={formData.additionals.legalLoyalty}
              onChange={handleLoyaltyChange}
            />
          }
          label={`${pricing.additionals.legalLoyalty.name} (R$ ${formatCurrencyValue(pricing.additionals.legalLoyalty.price)})`}
        />
      </Grid>
      
      <Grid item xs={12}>
        <Typography variant="subtitle1" gutterBottom>
          Delivery Legal
        </Typography>
        <RadioGroup
          value={formData.additionals.delivery}
          onChange={handleDeliveryChange}
        >
          <FormControlLabel
            value="none"
            control={<Radio />}
            label="Nenhum"
          />
          <FormControlLabel
            value="basic"
            control={<Radio />}
            label={`${pricing.additionals.deliveryBasic.name} (R$ ${formatCurrencyValue(pricing.additionals.deliveryBasic.price)})`}
          />
          <FormControlLabel
            value="plus"
            control={<Radio />}
            label={`${pricing.additionals.deliveryPlus.name} (R$ ${formatCurrencyValue(pricing.additionals.deliveryPlus.price)})`}
          />
        </RadioGroup>
      </Grid>

      <Grid item xs={12}>
        <Grid container alignItems="center" spacing={2}>
          <Grid item>
            <Typography variant="subtitle1">
              {pricing.additionals.selfServiceTerminal.name} (R$ {formatCurrencyValue(pricing.additionals.selfServiceTerminal.price)} cada)
            </Typography>
          </Grid>
          <Grid item>
            <IconButton 
              onClick={() => handleTerminalsChange(-1)}
              disabled={formData.additionals.selfServiceTerminals === 0}
              size="small"
            >
              <RemoveIcon />
            </IconButton>
          </Grid>
          <Grid item>
            <Typography variant="body1">{formData.additionals.selfServiceTerminals}</Typography>
          </Grid>
          <Grid item>
            <IconButton 
              onClick={() => handleTerminalsChange(1)}
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

export default AdditionalsStep;