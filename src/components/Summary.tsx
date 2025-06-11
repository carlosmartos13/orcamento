import { Box, Button, Grid, Typography } from '@mui/material';
import { FormData } from '../types';
import { usePDF } from 'react-to-pdf';
import { usePricing } from '../hooks/usePricing';
import { calculateMonthlyTotal, calculateEquipmentTotal, generateWhatsAppMessage } from '../utils/calculations';

interface SummaryProps {
  formData: FormData;
  onEditStep: (step: number) => void;
}

const Summary = ({ formData }: SummaryProps) => {
  const { toPDF, targetRef } = usePDF({ filename: 'orcamento-seatec.pdf' });
  const { pricing } = usePricing();
  
  const monthlyTotal = calculateMonthlyTotal(formData, pricing);
  const equipmentTotal = calculateEquipmentTotal(formData, pricing);

  const handleWhatsApp = () => {
    const message = generateWhatsAppMessage(formData, pricing, monthlyTotal, equipmentTotal);
    const fullMessage = encodeURIComponent(message);
    window.open(`https://api.whatsapp.com/send?&text=${fullMessage}`, '_blank');
  };

  return (
    <>
      {/* CONTEÚDO DO PDF */}
      <Box
        ref={targetRef}
        sx={{ backgroundColor: '#fff', padding: 6, fontFamily: 'Arial, sans-serif', fontSize: '18px', lineHeight: 2, color: '#000', display: 'flex', justifyContent: 'center' }}
      >
        <Box sx={{ maxWidth: '900px', width: '100%' }}>
          <Box sx={{ mb: 1, textAlign: 'center' }}>
            <img src="/logo.png" alt="Logo SEATEC" style={{ height: 100 }} />
          </Box>

          <Grid container spacing={4}>
            {/* Cliente */}
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ color: '#061349', fontWeight: 'bold', mb: 1 }}>
                Informações do Cliente
              </Typography>
              <Typography>Nome: {formData.clientInfo.name}</Typography>
              <Typography>Empresa: {formData.clientInfo.companyName}</Typography>
              <Typography>CNPJ: {formData.clientInfo.cnpj}</Typography>
              <Typography>Telefone: {formData.clientInfo.phone}</Typography>
              <Typography>Email: {formData.clientInfo.email}</Typography>
            </Grid>

            {/* Mensalidade */}
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ color: '#061349', fontWeight: 'bold', mb: 1 }}>Mensalidade</Typography>
              <Typography>{pricing.modules.cloud.name}: R$ {pricing.modules.cloud.price.toFixed(2)}</Typography>
              {formData.subscription.fiscal && <Typography>{pricing.modules.fiscal.name}: R$ {pricing.modules.fiscal.price.toFixed(2)}</Typography>}
              {formData.subscription.inventory && <Typography>{pricing.modules.inventory.name}: R$ {pricing.modules.inventory.price.toFixed(2)}</Typography>}
              {formData.subscription.financial && <Typography>{pricing.modules.financial.name}: R$ {pricing.modules.financial.price.toFixed(2)}</Typography>}
              <Typography>PDVs: {formData.subscription.pdvCount} x R$ {pricing.modules.pdv.price.toFixed(2)} = R$ {(formData.subscription.pdvCount * pricing.modules.pdv.price).toFixed(2)}</Typography>
              <Typography sx={{ fontWeight: 'bold', mt: 1 }}>Total: R$ {monthlyTotal.toFixed(2)}</Typography>
            </Grid>

            {/* Adicionais */}
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ color: '#061349', fontWeight: 'bold', mb: 1 }}>Adicionais</Typography>
              {formData.additionals.legalLoyalty && <Typography>{pricing.additionals.legalLoyalty.name}: R$ {pricing.additionals.legalLoyalty.price.toFixed(2)}</Typography>}
              {formData.additionals.delivery === 'basic' && <Typography>{pricing.additionals.deliveryBasic.name}: R$ {pricing.additionals.deliveryBasic.price.toFixed(2)}</Typography>}
              {formData.additionals.delivery === 'plus' && <Typography>{pricing.additionals.deliveryPlus.name}: R$ {pricing.additionals.deliveryPlus.price.toFixed(2)}</Typography>}
              {formData.additionals.selfServiceTerminals > 0 && (
                <Typography>{pricing.additionals.selfServiceTerminal.name}: {formData.additionals.selfServiceTerminals} x R$ {pricing.additionals.selfServiceTerminal.price.toFixed(2)} = R$ {(formData.additionals.selfServiceTerminals * pricing.additionals.selfServiceTerminal.price).toFixed(2)}</Typography>
              )}
            </Grid>

            {/* Equipamentos */}
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ color: '#061349', fontWeight: 'bold', mb: 1 }}>Equipamentos</Typography>
              {Object.entries(formData.equipment).map(([key, quantity]) => {
                if (quantity > 0) {
                  const equipmentItem = pricing.equipment[key as keyof typeof pricing.equipment];
                  if (equipmentItem) {
                    return (
                      <Typography key={key}>
                        {equipmentItem.name}: {quantity} x R$ {equipmentItem.price.toFixed(2)} = R$ {(quantity * equipmentItem.price).toFixed(2)}
                      </Typography>
                    );
                  }
                }
                return null;
              })}

              {/* Imagens dos equipamentos */}
              <Box
                component="ul"
                sx={{
                  listStyle: 'none',
                  padding: 0,
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 2,
                  mt: 2,
                }}
              >
                {Object.entries(formData.equipment).map(([key, quantity]) => {
                  if (quantity > 0) {
                    const equipmentItem = pricing.equipment[key as keyof typeof pricing.equipment];
                    if (equipmentItem && equipmentItem.image) {
                      return (
                        <Box key={key} component="li" sx={{ textAlign: 'center' }}>
                          <img src={equipmentItem.image} alt={equipmentItem.name} style={{ width: 150 }} />
                          <Typography variant="body2">{equipmentItem.name}</Typography>
                        </Box>
                      );
                    }
                  }
                  return null;
                })}
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Box>

      {/* BOTÕES FORA DO PDF */}
      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 4 }}>
        <Button variant="contained" onClick={handleWhatsApp} sx={{ background: 'linear-gradient(to right, #0a1957, #1f2f91)', color: '#fff' }}>
          Enviar Orçamento no WhatsApp
        </Button>
        <Button variant="contained" onClick={() => toPDF()} sx={{ background: 'linear-gradient(to right, #0a1957, #1f2f91)', color: '#fff' }}>
          Baixar PDF
        </Button>
      </Box>
    </>
  );
};

export default Summary;