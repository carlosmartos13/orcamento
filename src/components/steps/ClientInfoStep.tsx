import { TextField, Grid } from '@mui/material';
import { FormData } from '../../types';

interface StepProps {
  formData: FormData;
  setFormData: (data: FormData) => void;
}

const ClientInfoStep = ({ formData, setFormData }: StepProps) => {
  const handleChange = (field: keyof FormData['clientInfo']) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      clientInfo: {
        ...formData.clientInfo,
        [field]: event.target.value,
      },
    });
  };

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Nome"
          value={formData.clientInfo.name}
          onChange={handleChange('name')}
        />
      </Grid>
      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Nome da Empresa"
          value={formData.clientInfo.companyName}
          onChange={handleChange('companyName')}
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="CNPJ"
          value={formData.clientInfo.cnpj}
          onChange={handleChange('cnpj')}
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Telefone"
          value={formData.clientInfo.phone}
          onChange={handleChange('phone')}
        />
      </Grid>
      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Email"
          type="email"
          value={formData.clientInfo.email}
          onChange={handleChange('email')}
        />
      </Grid>
    </Grid>
  );
};

export default ClientInfoStep;