import { Card, Typography, Box, Divider } from '@mui/material';
import { FormData } from '../types';

interface OrderSummaryProps {
  formData: FormData;
}

const OrderSummary = ({ formData }: OrderSummaryProps) => {
  const calculateMonthlyTotal = () => {
    let total = 64.10; // Cloud (obrigatório)
    if (formData.subscription.fiscal) total += 73.00;
    if (formData.subscription.inventory) total += 73.00;
    if (formData.subscription.financial) total += 73.00;
    total += formData.subscription.pdvCount * 15.00;
    
    if (formData.additionals.legalLoyalty) total += 230.00;
    if (formData.additionals.delivery === 'basic') total += 199.00;
    if (formData.additionals.delivery === 'plus') total += 299.90;
    total += formData.additionals.selfServiceTerminals * 150.00;
    
    return total;
  };

  const calculateEquipmentTotal = () => {
    return (
      formData.equipment.androidPdvGertec * 2400.00 +
      formData.equipment.androidPdvSunmi * 2350.00 +
      formData.equipment.selfServiceTotemGertec * 3890.00 +
      formData.equipment.networkKit * 550.00 +
      formData.equipment.raspberryServer * 1390.00
    );
  };

  return (
    <Card sx={{ p: 3, position: 'sticky', top: 20 }}>
      <Typography variant="h6" gutterBottom>
        Resumo do Pedido
      </Typography>
      
      <Box sx={{ mt: 2 }}>
        <Typography variant="subtitle1">Mensalidade</Typography>
        <Typography variant="body2">Cloud: R$ 64,10</Typography>
        {formData.subscription.fiscal && (
          <Typography variant="body2">Fiscal: R$ 73,00</Typography>
        )}
        {formData.subscription.inventory && (
          <Typography variant="body2">Estoque: R$ 73,00</Typography>
        )}
        {formData.subscription.financial && (
          <Typography variant="body2">Financeiro: R$ 73,00</Typography>
        )}
        <Typography variant="body2">
          PDVs: {formData.subscription.pdvCount} x R$ 15,00 = R$ {(formData.subscription.pdvCount * 15).toFixed(2)}
        </Typography>
      </Box>

      <Box sx={{ mt: 2 }}>
        <Typography variant="subtitle1">Adicionais</Typography>
        {formData.additionals.legalLoyalty && (
          <Typography variant="body2">Fidelidade Legal: R$ 230,00</Typography>
        )}
        {formData.additionals.delivery === 'basic' && (
          <Typography variant="body2">Delivery Legal (até 25k): R$ 199,00</Typography>
        )}
        {formData.additionals.delivery === 'plus' && (
          <Typography variant="body2">Delivery Legal Plus: R$ 299,90</Typography>
        )}
        {formData.additionals.selfServiceTerminals > 0 && (
          <Typography variant="body2">
            Terminais: {formData.additionals.selfServiceTerminals} x R$ 150,00 = R$ {(formData.additionals.selfServiceTerminals * 150).toFixed(2)}
          </Typography>
        )}
      </Box>

      <Divider sx={{ my: 2 }} />

      <Typography variant="subtitle1" sx={{ mb: 1 }}>
        Total Mensal: R$ {calculateMonthlyTotal().toFixed(2)}
      </Typography>

      {calculateEquipmentTotal() > 0 && (
        <>
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle1">Equipamentos</Typography>
            {formData.equipment.androidPdvGertec > 0 && (
              <Typography variant="body2">
                PDV Gertec: {formData.equipment.androidPdvGertec} x R$ 2.400,00 = R$ {(formData.equipment.androidPdvGertec * 2400).toFixed(2)}
              </Typography>
            )}
            {formData.equipment.androidPdvSunmi > 0 && (
              <Typography variant="body2">
                PDV Sunmi: {formData.equipment.androidPdvSunmi} x R$ 2.350,00 = R$ {(formData.equipment.androidPdvSunmi * 2350).toFixed(2)}
              </Typography>
            )}
            {formData.equipment.selfServiceTotemGertec > 0 && (
              <Typography variant="body2">
                Totem: {formData.equipment.selfServiceTotemGertec} x R$ 3.890,00 = R$ {(formData.equipment.selfServiceTotemGertec * 3890).toFixed(2)}
              </Typography>
            )}
            {formData.equipment.networkKit > 0 && (
              <Typography variant="body2">
                Kit Rede: {formData.equipment.networkKit} x R$ 550,00 = R$ {(formData.equipment.networkKit * 550).toFixed(2)}
              </Typography>
            )}
            {formData.equipment.raspberryServer > 0 && (
              <Typography variant="body2">
                Servidor: {formData.equipment.raspberryServer} x R$ 1.390,00 = R$ {(formData.equipment.raspberryServer * 1390).toFixed(2)}
              </Typography>
            )}
          </Box>

          <Divider sx={{ my: 2 }} />

          <Typography variant="subtitle1">
            Total Equipamentos: R$ {calculateEquipmentTotal().toFixed(2)}
          </Typography>
        </>
      )}
    </Card>
  );
};

export default OrderSummary;