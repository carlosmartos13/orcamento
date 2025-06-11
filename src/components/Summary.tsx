import { Box, Button, Grid, Typography } from '@mui/material';
import { FormData } from '../types';
import { usePDF } from 'react-to-pdf';
import pdvSunmi from '../assets/d2.jpg';
import raspberry from '../assets/raspberryServer.jpeg';
import totem from '../assets/totem.png';
import rede from '../assets/rede.png';
import gs300 from '../assets/gs300.png';

interface SummaryProps {
  formData: FormData;
  onEditStep: (step: number) => void;
}

const Summary = ({ formData }: SummaryProps) => {
  const { toPDF, targetRef } = usePDF({ filename: 'orcamento-seatec.pdf' });

  const calculateMonthlyTotal = () => {
    let total = 64.10;
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

  const handleWhatsApp = () => {
    const monthlyTotal = calculateMonthlyTotal();
    const equipmentTotal = calculateEquipmentTotal();
    const totalGeral = monthlyTotal + equipmentTotal;

    const messageLines = [
      "🏠 *Orçamento SEATEC*",
      "",
      "👤 *Cliente:*",
      `Nome: ${formData.clientInfo.name}`,
      `Empresa: ${formData.clientInfo.companyName}`,
      `CNPJ: ${formData.clientInfo.cnpj}`,
      `Telefone: ${formData.clientInfo.phone}`,
      `Email: ${formData.clientInfo.email}`,
      "",
      `💰 *Mensalidade: R$ ${monthlyTotal.toFixed(2)}*`,
      "• Cloud: R$ 64,10",
      formData.subscription.fiscal ? "✅ Fiscal: R$ 73,00" : "❌ Fiscal",
      formData.subscription.inventory ? "✅ Estoque: R$ 73,00" : "❌ Estoque",
      formData.subscription.financial ? "✅ Financeiro: R$ 73,00" : "❌ Financeiro",
      `• PDVs: ${formData.subscription.pdvCount} x R$ 15,00 = R$ ${(formData.subscription.pdvCount * 15).toFixed(2)}`,
      "",
      "📦 *Adicionais:*",
      formData.additionals.legalLoyalty ? "✅ Fidelidade Legal: R$ 230,00" : "❌ Fidelidade Legal",
      formData.additionals.delivery === "none"
        ? "❌ Delivery Legal"
        : formData.additionals.delivery === "basic"
          ? "✅ Delivery Legal Básico: R$ 199,00"
          : "✅ Delivery Legal Plus: R$ 299,90",
      formData.additionals.selfServiceTerminals > 0
        ? `✅ Terminais Auto Atendimento: ${formData.additionals.selfServiceTerminals} x R$ 150,00 = R$ ${(formData.additionals.selfServiceTerminals * 150).toFixed(2)}`
        : "❌ Terminais Auto Atendimento",
      "",
      `🛠 *Equipamentos: R$ ${equipmentTotal.toFixed(2)}*`,
    ];

    if (formData.equipment.androidPdvGertec > 0)
      messageLines.push(`• PDV Android Gertec: ${formData.equipment.androidPdvGertec} x R$ 2.400,00 = R$ ${(formData.equipment.androidPdvGertec * 2400).toFixed(2)}`);
    if (formData.equipment.androidPdvSunmi > 0)
      messageLines.push(`• PDV Android Sunmi: ${formData.equipment.androidPdvSunmi} x R$ 2.350,00 = R$ ${(formData.equipment.androidPdvSunmi * 2350).toFixed(2)}`);
    if (formData.equipment.selfServiceTotemGertec > 0)
      messageLines.push(`• Totem Auto Atendimento: ${formData.equipment.selfServiceTotemGertec} x R$ 3.890,00 = R$ ${(formData.equipment.selfServiceTotemGertec * 3890).toFixed(2)}`);
    if (formData.equipment.networkKit > 0)
      messageLines.push(`• Kit Rede: ${formData.equipment.networkKit} x R$ 550,00 = R$ ${(formData.equipment.networkKit * 550).toFixed(2)}`);
    if (formData.equipment.raspberryServer > 0)
      messageLines.push(`• Servidor Raspberry: ${formData.equipment.raspberryServer} x R$ 1.390,00 = R$ ${(formData.equipment.raspberryServer * 1390).toFixed(2)}`);

    messageLines.push("", `💳 *Total Geral: R$ ${totalGeral.toFixed(2)}*`);

    const fullMessage = encodeURIComponent(messageLines.join('\n'));
    const cleanedPhone = formData.clientInfo.phone.replace(/\D/g, '');
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
              <Typography>Cloud: R$ 64,10</Typography>
              {formData.subscription.fiscal && <Typography>Fiscal: R$ 73,00</Typography>}
              {formData.subscription.inventory && <Typography>Estoque: R$ 73,00</Typography>}
              {formData.subscription.financial && <Typography>Financeiro: R$ 73,00</Typography>}
              <Typography>PDVs: {formData.subscription.pdvCount} x R$ 15,00 = R$ {(formData.subscription.pdvCount * 15).toFixed(2)}</Typography>
              <Typography sx={{ fontWeight: 'bold', mt: 1 }}>Total: R$ {calculateMonthlyTotal().toFixed(2)}</Typography>
            </Grid>

            {/* Adicionais */}
            <Grid item xs={12}>
              
              <Typography variant="h6" sx={{ color: '#061349', fontWeight: 'bold', mb: 1 }}>Adicionais</Typography>
              {formData.additionals.legalLoyalty && <Typography>Fidelidade Legal: R$ 230,00</Typography>}
              {formData.additionals.delivery === 'basic' && <Typography>Delivery Legal Básico: R$ 199,00</Typography>}
              {formData.additionals.delivery === 'plus' && <Typography>Delivery Legal Plus: R$ 299,90</Typography>}
              {formData.additionals.selfServiceTerminals > 0 && (
                <Typography>Terminais Auto Atendimento: {formData.additionals.selfServiceTerminals} x R$ 150,00 = R$ {(formData.additionals.selfServiceTerminals * 150).toFixed(2)}</Typography>
              )}
            </Grid>

            {/* Equipamentos */}
            <Grid item xs={12}>
    
              <Typography variant="h6" sx={{ color: '#061349', fontWeight: 'bold', mb: 1 }}>Equipamentos</Typography>
              {formData.equipment.androidPdvGertec > 0 && <Typography>PDV Android Gertec: {formData.equipment.androidPdvGertec}  R$ 2.400,00 = R$ {(formData.equipment.androidPdvGertec * 2400).toFixed(2)}</Typography>}
              {formData.equipment.androidPdvSunmi > 0 && <Typography>PDV Android Sunmi: {formData.equipment.androidPdvSunmi}  R$ 2.350,00 = R$ {(formData.equipment.androidPdvSunmi * 2350).toFixed(2)}</Typography>}
              {formData.equipment.selfServiceTotemGertec > 0 && <Typography>Totem Auto Atendimento: {formData.equipment.selfServiceTotemGertec}  R$ 3.890,00 = R$ {(formData.equipment.selfServiceTotemGertec * 3890).toFixed(2)}</Typography>}
              {formData.equipment.networkKit > 0 && <Typography>Kit Rede: {formData.equipment.networkKit}  R$ 550,00 = R$ {(formData.equipment.networkKit * 550).toFixed(2)}</Typography>}
              {formData.equipment.raspberryServer > 0 && (
                <>
                  <Typography>Servidor Raspberry: {formData.equipment.raspberryServer} x R$ 1.390,00 = R$ {(formData.equipment.raspberryServer * 1390).toFixed(2)}</Typography>

                  {/* Melhoria: exibição de imagens */}
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
                    {formData.equipment.androidPdvGertec > 0 && (
                      <Box component="li" sx={{ textAlign: 'center' }}>
                        <img src={gs300} alt="PDV Android Gertec" style={{ width: 150 }} />
                        <Typography variant="body2">PDV Android Gertec</Typography>
                      </Box>
                    )}
                    {formData.equipment.androidPdvSunmi > 0 && (
                      <Box component="li" sx={{ textAlign: 'center' }}>
                        <img src= {pdvSunmi} alt="PDV Android Sunmi" style={{ width: 150 }} />
                        <Typography variant="body2">PDV Android Sunmi</Typography>
                      </Box>
                    )}
                    {formData.equipment.selfServiceTotemGertec > 0 && (
                      <Box component="li" sx={{ textAlign: 'center' }}>
                        <img src={totem} alt="Totem Auto Atendimento" style={{ width: 150 }} />
                        <Typography variant="body2">Totem Auto Atendimento</Typography>
                      </Box>
                    )}
                    {formData.equipment.networkKit > 0 && (
                      <Box component="li" sx={{ textAlign: 'center' }}>
                        <img src={rede} alt="Kit Rede" style={{ width: 150 }} />
                        <Typography variant="body2">Kit Rede</Typography>
                      </Box>
                    )}
                    {formData.equipment.raspberryServer > 0 && (
                      <Box component="li" sx={{ textAlign: 'center' }}>
                        <img src={raspberry} alt="Servidor Raspberry" style={{ width: 150 }} />
                        <Typography variant="body2">Servidor Raspberry</Typography>
                      </Box>
                    )}
                  </Box>
                </>
              )}
            </Grid>
          </Grid>
        </Box>
      </Box>

      {/* BOTÕES FORA DO PDF */}
      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 4 }}>
        <Button variant="contained" onClick={handleWhatsApp} sx={{ background: 'linear-gradient(to right, #0a1957, #1f2f91)', color: '#fff' }}>Enviar Orçamento no WhatsApp</Button>
        <Button variant="contained" onClick={() => toPDF()} sx={{ background: 'linear-gradient(to right, #0a1957, #1f2f91)', color: '#fff' }}>Baixar PDF</Button>
      </Box>
    </>
  );
};

export default Summary;
