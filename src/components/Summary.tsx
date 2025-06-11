import { Box, Button, Grid, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Divider } from '@mui/material';
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

  // Função para criar linha da tabela
  const createTableRow = (name: string, description: string, price: number, quantity: number = 1, total?: number) => (
    <TableRow key={name}>
      <TableCell>
        <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
          {name}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem', mt: 0.5 }}>
          {description}
        </Typography>
      </TableCell>
      <TableCell align="center">
        {quantity > 1 ? `${quantity}x` : '1x'}
      </TableCell>
      <TableCell align="right">
        R$ {price.toFixed(2)}
      </TableCell>
      <TableCell align="right" sx={{ fontWeight: 'bold' }}>
        R$ {(total || price * quantity).toFixed(2)}
      </TableCell>
    </TableRow>
  );

  return (
    <>
      {/* CONTEÚDO DO PDF */}
      <Box
        ref={targetRef}
        sx={{ 
          backgroundColor: '#fff', 
          padding: 4, 
          fontFamily: 'Arial, sans-serif', 
          color: '#000',
          minHeight: '100vh'
        }}
      >
        <Box sx={{ maxWidth: '1000px', margin: '0 auto' }}>
          {/* Header com Logo */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <img src="/logo.png" alt="Logo SEATEC" style={{ height: 80, marginBottom: 16 }} />
            <Typography variant="h4" sx={{ color: '#061349', fontWeight: 'bold' }}>
              Orçamento Personalizado
            </Typography>
          </Box>

          {/* Informações do Cliente */}
          <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
            <Typography variant="h6" sx={{ color: '#061349', fontWeight: 'bold', mb: 2 }}>
              📋 Informações do Cliente
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography><strong>Nome:</strong> {formData.clientInfo.name}</Typography>
                <Typography><strong>Empresa:</strong> {formData.clientInfo.companyName}</Typography>
                <Typography><strong>CNPJ:</strong> {formData.clientInfo.cnpj}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography><strong>Telefone:</strong> {formData.clientInfo.phone}</Typography>
                <Typography><strong>Email:</strong> {formData.clientInfo.email}</Typography>
              </Grid>
            </Grid>
          </Paper>

          {/* Mensalidade */}
          <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
            <Typography variant="h6" sx={{ color: '#061349', fontWeight: 'bold', mb: 2 }}>
              💰 Assinatura Mensal
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                    <TableCell sx={{ fontWeight: 'bold' }}>Módulo / Descrição</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 'bold' }}>Qtd</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>Valor Unit.</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>Total</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {/* Cloud - Obrigatório */}
                  {createTableRow(
                    pricing.modules.cloud.name,
                    pricing.modules.cloud.description,
                    pricing.modules.cloud.price
                  )}
                  
                  {/* Módulos Opcionais */}
                  {formData.subscription.fiscal && createTableRow(
                    pricing.modules.fiscal.name,
                    pricing.modules.fiscal.description,
                    pricing.modules.fiscal.price
                  )}
                  
                  {formData.subscription.inventory && createTableRow(
                    pricing.modules.inventory.name,
                    pricing.modules.inventory.description,
                    pricing.modules.inventory.price
                  )}
                  
                  {formData.subscription.financial && createTableRow(
                    pricing.modules.financial.name,
                    pricing.modules.financial.description,
                    pricing.modules.financial.price
                  )}
                  
                  {/* PDVs */}
                  {formData.subscription.pdvCount > 1 && createTableRow(
                    pricing.modules.pdv.name + ' Adicional',
                    pricing.modules.pdv.description,
                    pricing.modules.pdv.price,
                    formData.subscription.pdvCount - 1
                  )}
                  
                  {/* Total da Mensalidade */}
                  <TableRow sx={{ backgroundColor: '#e3f2fd' }}>
                    <TableCell colSpan={3} sx={{ fontWeight: 'bold', fontSize: '1.1rem' }}>
                      TOTAL MENSALIDADE
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold', fontSize: '1.1rem', color: '#1976d2' }}>
                      R$ {monthlyTotal.toFixed(2)}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>

          {/* Módulos Adicionais */}
          {(formData.additionals.legalLoyalty || 
            formData.additionals.delivery !== 'none' || 
            formData.additionals.selfServiceTerminals > 0) && (
            <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
              <Typography variant="h6" sx={{ color: '#061349', fontWeight: 'bold', mb: 2 }}>
                📦 Módulos Adicionais
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                      <TableCell sx={{ fontWeight: 'bold' }}>Adicional / Descrição</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 'bold' }}>Qtd</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 'bold' }}>Valor Unit.</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 'bold' }}>Total</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {formData.additionals.legalLoyalty && createTableRow(
                      pricing.additionals.legalLoyalty.name,
                      pricing.additionals.legalLoyalty.description,
                      pricing.additionals.legalLoyalty.price
                    )}
                    
                    {formData.additionals.delivery === 'basic' && createTableRow(
                      pricing.additionals.deliveryBasic.name,
                      pricing.additionals.deliveryBasic.description,
                      pricing.additionals.deliveryBasic.price
                    )}
                    
                    {formData.additionals.delivery === 'plus' && createTableRow(
                      pricing.additionals.deliveryPlus.name,
                      pricing.additionals.deliveryPlus.description,
                      pricing.additionals.deliveryPlus.price
                    )}
                    
                    {formData.additionals.selfServiceTerminals > 0 && createTableRow(
                      pricing.additionals.selfServiceTerminal.name,
                      pricing.additionals.selfServiceTerminal.description,
                      pricing.additionals.selfServiceTerminal.price,
                      formData.additionals.selfServiceTerminals
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          )}

          {/* Equipamentos */}
          {equipmentTotal > 0 && (
            <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
              <Typography variant="h6" sx={{ color: '#061349', fontWeight: 'bold', mb: 2 }}>
                🛠️ Equipamentos
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                      <TableCell sx={{ fontWeight: 'bold' }}>Equipamento / Descrição</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 'bold' }}>Qtd</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 'bold' }}>Valor Unit.</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 'bold' }}>Total</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {Object.entries(formData.equipment).map(([key, quantity]) => {
                      if (quantity > 0) {
                        const equipmentItem = pricing.equipment[key as keyof typeof pricing.equipment];
                        if (equipmentItem) {
                          return createTableRow(
                            equipmentItem.name,
                            equipmentItem.description,
                            equipmentItem.price,
                            quantity
                          );
                        }
                      }
                      return null;
                    })}
                    
                    {/* Total dos Equipamentos */}
                    <TableRow sx={{ backgroundColor: '#fff3e0' }}>
                      <TableCell colSpan={3} sx={{ fontWeight: 'bold', fontSize: '1.1rem' }}>
                        TOTAL EQUIPAMENTOS
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 'bold', fontSize: '1.1rem', color: '#f57c00' }}>
                        R$ {equipmentTotal.toFixed(2)}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>

              {/* Galeria de Imagens dos Equipamentos */}
              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2 }}>
                  Equipamentos Selecionados:
                </Typography>
                <Grid container spacing={2}>
                  {Object.entries(formData.equipment).map(([key, quantity]) => {
                    if (quantity > 0) {
                      const equipmentItem = pricing.equipment[key as keyof typeof pricing.equipment];
                      if (equipmentItem && equipmentItem.image) {
                        return (
                          <Grid item xs={6} sm={4} md={3} key={key}>
                            <Box sx={{ textAlign: 'center', p: 1, border: '1px solid #e0e0e0', borderRadius: 2 }}>
                              <img 
                                src={equipmentItem.image} 
                                alt={equipmentItem.name} 
                                style={{ width: '100%', maxWidth: 120, height: 'auto', marginBottom: 8 }} 
                              />
                              <Typography variant="caption" display="block">
                                {equipmentItem.name}
                              </Typography>
                              <Typography variant="caption" color="primary" sx={{ fontWeight: 'bold' }}>
                                Qtd: {quantity}
                              </Typography>
                            </Box>
                          </Grid>
                        );
                      }
                    }
                    return null;
                  })}
                </Grid>
              </Box>
            </Paper>
          )}

          {/* Resumo Final */}
          <Paper elevation={3} sx={{ p: 4, backgroundColor: '#f8f9fa' }}>
            <Typography variant="h5" sx={{ color: '#061349', fontWeight: 'bold', textAlign: 'center', mb: 3 }}>
              💳 Resumo Financeiro
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <Box sx={{ textAlign: 'center', p: 2, backgroundColor: '#e3f2fd', borderRadius: 2 }}>
                  <Typography variant="h6" sx={{ color: '#1976d2', fontWeight: 'bold' }}>
                    Mensalidade
                  </Typography>
                  <Typography variant="h4" sx={{ color: '#1976d2', fontWeight: 'bold' }}>
                    R$ {monthlyTotal.toFixed(2)}
                  </Typography>
                </Box>
              </Grid>
              {equipmentTotal > 0 && (
                <Grid item xs={12} sm={6}>
                  <Box sx={{ textAlign: 'center', p: 2, backgroundColor: '#fff3e0', borderRadius: 2 }}>
                    <Typography variant="h6" sx={{ color: '#f57c00', fontWeight: 'bold' }}>
                      Equipamentos (Único)
                    </Typography>
                    <Typography variant="h4" sx={{ color: '#f57c00', fontWeight: 'bold' }}>
                      R$ {equipmentTotal.toFixed(2)}
                    </Typography>
                  </Box>
                </Grid>
              )}
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Box sx={{ textAlign: 'center', p: 3, backgroundColor: '#e8f5e8', borderRadius: 2 }}>
                  <Typography variant="h5" sx={{ color: '#2e7d32', fontWeight: 'bold' }}>
                    INVESTIMENTO TOTAL
                  </Typography>
                  <Typography variant="h3" sx={{ color: '#2e7d32', fontWeight: 'bold' }}>
                    R$ {(monthlyTotal + equipmentTotal).toFixed(2)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    {equipmentTotal > 0 ? `Mensalidade: R$ ${monthlyTotal.toFixed(2)} + Equipamentos: R$ ${equipmentTotal.toFixed(2)}` : 'Valor mensal'}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Box>
      </Box>

      {/* BOTÕES FORA DO PDF */}
      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 4, mb: 4 }}>
        <Button 
          variant="contained" 
          onClick={handleWhatsApp} 
          size="large"
          sx={{ 
            background: 'linear-gradient(45deg, #25D366 30%, #128C7E 90%)', 
            color: '#fff',
            px: 4,
            py: 1.5,
            fontSize: '1.1rem',
            '&:hover': {
              background: 'linear-gradient(45deg, #128C7E 30%, #25D366 90%)',
            }
          }}
        >
          📱 Enviar no WhatsApp
        </Button>
        <Button 
          variant="contained" 
          onClick={() => toPDF()} 
          size="large"
          sx={{ 
            background: 'linear-gradient(45deg, #0a1957 30%, #1f2f91 90%)', 
            color: '#fff',
            px: 4,
            py: 1.5,
            fontSize: '1.1rem',
            '&:hover': {
              background: 'linear-gradient(45deg, #1f2f91 30%, #0a1957 90%)',
            }
          }}
        >
          📄 Baixar PDF
        </Button>
      </Box>
    </>
  );
};

export default Summary;