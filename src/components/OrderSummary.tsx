import { Card, Typography, Box, Divider } from '@mui/material';
import { FormData } from '../types';
import { usePricing } from '../hooks/usePricing';
import { calculateMonthlyTotal, calculateEquipmentTotal } from '../utils/calculations';

interface OrderSummaryProps {
  formData: FormData;
}

const OrderSummary = ({ formData }: OrderSummaryProps) => {
  const { pricing } = usePricing();
  
  const monthlyTotal = calculateMonthlyTotal(formData, pricing);
  const equipmentTotal = calculateEquipmentTotal(formData, pricing);

  return (
    <Card sx={{ p: 3, position: 'sticky', top: 20 }}>
      <Typography variant="h6" gutterBottom>
        Resumo do Pedido
      </Typography>
      
      <Box sx={{ mt: 2 }}>
        <Typography variant="subtitle1">Mensalidade</Typography>
        <Typography variant="body2">
          {pricing.modules.cloud.name}: R$ {pricing.modules.cloud.price.toFixed(2)}
        </Typography>
        {formData.subscription.fiscal && (
          <Typography variant="body2">
            {pricing.modules.fiscal.name}: R$ {pricing.modules.fiscal.price.toFixed(2)}
          </Typography>
        )}
        {formData.subscription.inventory && (
          <Typography variant="body2">
            {pricing.modules.inventory.name}: R$ {pricing.modules.inventory.price.toFixed(2)}
          </Typography>
        )}
        {formData.subscription.financial && (
          <Typography variant="body2">
            {pricing.modules.financial.name}: R$ {pricing.modules.financial.price.toFixed(2)}
          </Typography>
        )}
        <Typography variant="body2">
          PDVs: {formData.subscription.pdvCount} x R$ {pricing.modules.pdv.price.toFixed(2)} = R$ {(formData.subscription.pdvCount * pricing.modules.pdv.price).toFixed(2)}
        </Typography>
      </Box>

      <Box sx={{ mt: 2 }}>
        <Typography variant="subtitle1">Adicionais</Typography>
        {formData.additionals.legalLoyalty && (
          <Typography variant="body2">
            {pricing.additionals.legalLoyalty.name}: R$ {pricing.additionals.legalLoyalty.price.toFixed(2)}
          </Typography>
        )}
        {formData.additionals.delivery === 'basic' && (
          <Typography variant="body2">
            {pricing.additionals.deliveryBasic.name}: R$ {pricing.additionals.deliveryBasic.price.toFixed(2)}
          </Typography>
        )}
        {formData.additionals.delivery === 'plus' && (
          <Typography variant="body2">
            {pricing.additionals.deliveryPlus.name}: R$ {pricing.additionals.deliveryPlus.price.toFixed(2)}
          </Typography>
        )}
        {formData.additionals.selfServiceTerminals > 0 && (
          <Typography variant="body2">
            Terminais: {formData.additionals.selfServiceTerminals} x R$ {pricing.additionals.selfServiceTerminal.price.toFixed(2)} = R$ {(formData.additionals.selfServiceTerminals * pricing.additionals.selfServiceTerminal.price).toFixed(2)}
          </Typography>
        )}
      </Box>

      <Divider sx={{ my: 2 }} />

      <Typography variant="subtitle1" sx={{ mb: 1 }}>
        Total Mensal: R$ {monthlyTotal.toFixed(2)}
      </Typography>

      {equipmentTotal > 0 && (
        <>
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle1">Equipamentos</Typography>
            {Object.entries(formData.equipment).map(([key, quantity]) => {
              if (quantity > 0) {
                const equipmentItem = pricing.equipment[key as keyof typeof pricing.equipment];
                if (equipmentItem) {
                  return (
                    <Typography key={key} variant="body2">
                      {equipmentItem.name}: {quantity} x R$ {equipmentItem.price.toFixed(2)} = R$ {(quantity * equipmentItem.price).toFixed(2)}
                    </Typography>
                  );
                }
              }
              return null;
            })}
          </Box>

          <Divider sx={{ my: 2 }} />

          <Typography variant="subtitle1">
            Total Equipamentos: R$ {equipmentTotal.toFixed(2)}
          </Typography>
        </>
      )}
    </Card>
  );
};

export default OrderSummary;