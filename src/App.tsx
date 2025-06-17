import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { useState } from 'react';
import { theme } from './theme';
import { FormData } from './types';
import Wizard from './components/Wizard';

const initialFormData: FormData = {
  clientInfo: {
    name: '',
    companyName: '',
    cnpj: '',
    phone: '',
    email: '',
  },
  subscription: {
    cloud: true,
    fiscal: false,
    inventory: false,
    financial: false,
    fiscal2: false,
    pdvCount: 1,
  },
  additionals: {
    legalLoyalty: false,
    delivery: 'none',
    selfServiceTerminals: 0,
  },
  equipment: {
    androidPdvGertec: 0,
    androidPdvSunmi: 0,
    selfServiceTotemGertec: 0,
    networkKit: 0,
    raspberryServer: 0,
    elginM10Pro: 0,
    elgini9: 0,
    tancaTp650: 0,
    impressoraFiscal: 0,
    leitorCodigoBarras: 0,
    gaveta: 0,
  },
};

function App() {
  const [formData, setFormData] = useState<FormData>(initialFormData);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Wizard formData={formData} setFormData={setFormData} />
    </ThemeProvider>
  );
}

export default App;