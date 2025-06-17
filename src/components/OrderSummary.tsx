import { Card, Typography, Box, Divider } from '@mui/material';
import { FormData } from '../types';
import { usePricing } from '../hooks/usePricing';
import { calculateMonthlyTotal, calculateEquipmentTotal } from '../utils/calculations';
import { formatCurrencyValue } from '../utils/formatCurrency';

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
          {pricing.modules.cloud.name}: R$ {formatCurrencyValue(pricing.modules.cloud.price)}
        </Typography>
        {formData.subscription.fiscal && (
          <Typography variant="body2">
            {pricing.modules.fiscal.name}: R$ {formatCurrencyValue(pricing.modules.fiscal.price)}
          </Typography>
        )}
        {formData.subscription.inventory && (
          <Typography variant="body2">
            {pricing.modules.inventory.name}: R$ {formatCurrencyValue(pricing.modules.inventory.price)}
          </Typography>
        )}
        {formData.subscription.financial && (
          <Typography variant="body2">
            {pricing.modules.financial.name}: R$ {formatCurrencyValue(pricing.modules.financial.price)}
          </Typography>
        )}
        <Typography variant="body2">
          PDVs: {formData.subscription.pdvCount} x R$ {formatCurrencyValue(pricing.modules.pdv.price)} = R$ {formatCurrencyValue(formData.subscription.pdvCount * pricing.modules.pdv.price)}
        </Typography>
      </Box>

      <Box sx={{ mt: 2 }}>
        <Typography variant="subtitle1">Adicionais</Typography>
        {formData.additionals.legalLoyalty && (
          <Typography variant="body2">
            {pricing.additionals.legalLoyalty.name}: R$ {formatCurrencyValue(pricing.additionals.legalLoyalty.price)}
          </Typography>
        )}
        {formData.additionals.delivery === 'basic' && (
          <Typography variant="body2">
            {pricing.additionals.deliveryBasic.name}: R$ {formatCurrencyValue(pricing.additionals.deliveryBasic.price)}
          </Typography>
        )}
        {formData.additionals.delivery === 'plus' && (
          <Typography variant="body2">
            {pricing.additionals.deliveryPlus.name}: R$ {formatCurrencyValue(pricing.additionals.deliveryPlus.price)}
          </Typography>
        )}
        {formData.additionals.selfServiceTerminals > 0 && (
          <Typography variant="body2">
            Terminais: {formData.additionals.selfServiceTerminals} x R$ {formatCurrencyValue(pricing.additionals.selfServiceTerminal.price)} = R$ {formatCurrencyValue(formData.additionals.selfServiceTerminals * pricing.additionals.selfServiceTerminal.price)}
          </Typography>
        )}
      </Box>

      <Divider sx={{ my: 2 }} />

      <Typography variant="subtitle1" sx={{ mb: 1 }}>
        Total Mensal: R$ {formatCurrencyValue(monthlyTotal)}
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
                      {equipmentItem.name}: {quantity} x R$ {formatCurrencyValue(equipmentItem.price)} = R$ {formatCurrencyValue(quantity * equipmentItem.price)}
                    </Typography>
                  );
                }
              }
              return null;
            })}
          </Box>

          <Divider sx={{ my: 2 }} />

          <Typography variant="subtitle1">
            Total Equipamentos: R$ {formatCurrencyValue(equipmentTotal)}
          </Typography>
        </>
      )}
    </Card>
  );
};

export default OrderSummary;