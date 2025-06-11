import { useState } from 'react';
import { Box, Card, Container, Stepper, Step, StepLabel, Button, Typography, Grid } from '@mui/material';
import { FormData } from '../types';
import ClientInfoStep from './steps/ClientInfoStep';
import SubscriptionStep from './steps/SubscriptionStep';
import AdditionalsStep from './steps/AdditionalsStep';
import EquipmentStep from './steps/EquipmentStep';
import Summary from './Summary';
import OrderSummary from './OrderSummary';

interface WizardProps {
  formData: FormData;
  setFormData: (data: FormData) => void;
}

const steps = ['Informações do Cliente', 'Assinatura Mensal', 'Adicionais', 'Equipamentos'];

const Wizard = ({ formData, setFormData }: WizardProps) => {
  const [activeStep, setActiveStep] = useState(0);

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleStepClick = (step: number) => {
    setActiveStep(step);
  };

  const getStepContent = (step: number) => {
    switch (step) {
      case 0:
        return <ClientInfoStep formData={formData} setFormData={setFormData} />;
      case 1:
        return <SubscriptionStep formData={formData} setFormData={setFormData} />;
      case 2:
        return <AdditionalsStep formData={formData} setFormData={setFormData} />;
      case 3:
        return <EquipmentStep formData={formData} setFormData={setFormData} />;
      default:
        return <Summary formData={formData} onEditStep={handleStepClick} />;
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={9}>
          <Card sx={{ p: 4, mb: 4 }}>
            <Stepper activeStep={activeStep} alternativeLabel>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>
          </Card>

          <Box sx={{ mt: 4, mb: 4 }}>
            {activeStep === steps.length ? (
              <Summary formData={formData} onEditStep={handleStepClick} />
            ) : (
              <>
                <Card sx={{ p: 4, mb: 4 }}>
                  {getStepContent(activeStep)}
                </Card>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                  <Button
                    variant="contained"
                    onClick={handleBack}
                    disabled={activeStep === 0}
                  >
                    Voltar
                  </Button>
                  <Button
                    variant="contained"
                    onClick={handleNext}
                  >
                    {activeStep === steps.length - 1 ? 'Finalizar' : 'Próximo'}
                  </Button>
                </Box>
              </>
            )}
          </Box>
        </Grid>
        <Grid item xs={12} md={3}>
          <OrderSummary formData={formData} />
        </Grid>
      </Grid>
    </Container>
  );
};

export default Wizard;