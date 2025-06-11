import { Box, Button, Grid, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Divider } from '@mui/material';
import { FormData } from '../types';
import { usePDF } from 'react-to-pdf';
import { usePricing } from '../hooks/usePricing';
import { calculateMonthlyTotal, calculateEquipmentTotal, generateWhatsAppMessage } from '../utils/calculations';
import { formatCurrencyValue } from '../utils/formatCurrency';
import { useState, useCallback, useEffect } from 'react';
import { equipmentImages } from '../assets/images';

interface SummaryProps {
  formData: FormData;
  onEditStep: (step: number) => void;
}

const Summary = ({ formData }: SummaryProps) => {
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  
  const { toPDF, targetRef } = usePDF({ 
    filename: 'orcamento-seatec.pdf',
    page: { 
      margin: 20,
      format: 'a4'
    }
  });
  
  const { pricing } = usePricing();
  
  const monthlyTotal = calculateMonthlyTotal(formData, pricing);
  const equipmentTotal = calculateEquipmentTotal(formData, pricing);

  const handleWhatsApp = () => {
    const message = generateWhatsAppMessage(formData, pricing, monthlyTotal, equipmentTotal);
    const fullMessage = encodeURIComponent(message);
    window.open(`https://api.whatsapp.com/send?&text=${fullMessage}`, '_blank');
  };

  // Pré-carrega todas as imagens
  useEffect(() => {
    const preloadImages = async () => {
      const imagePromises = Object.values(equipmentImages).map((src) => {
        return new Promise<void>((resolve) => {
          const img = new Image();
          img.onload = () => resolve();
          img.onerror = () => resolve(); // Resolve mesmo com erro para não travar
          img.src = src;
        });
      });

      await Promise.all(imagePromises);
      setImagesLoaded(true);
    };

    preloadImages();
  }, []);

  // Função para gerar PDF com aguardo das imagens
  const handleGeneratePDF = useCallback(async () => {
    setIsGeneratingPDF(true);
    try {
      // Aguarda as imagens serem carregadas
      if (!imagesLoaded) {
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
      
      // Aguarda um pouco mais para garantir renderização
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Gera o PDF
      await toPDF();
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
    } finally {
      setIsGeneratingPDF(false);
    }
  }, [imagesLoaded, toPDF]);

  // Função para criar linha da tabela
  const createTableRow = (name: string, description: string, price: number, quantity: number = 1, total?: number) => (
    <TableRow key={name}>
      <TableCell>
        <Typography variant="body1" sx={{ fontWeight: 'bold', color: '#000' }}>
          {name}
        </Typography>
        <Typography variant="body2" sx={{ fontSize: '0.85rem', mt: 0.5, color: '#555' }}>
          {description}
        </Typography>
      </TableCell>
      <TableCell align="center" sx={{ color: '#000' }}>
        {quantity > 1 ? `${quantity}x` : '1x'}
      </TableCell>
      <TableCell align="right" sx={{ color: '#000' }}>
        R$ {formatCurrencyValue(price)}
      </TableCell>
      <TableCell align="right" sx={{ fontWeight: 'bold', color: '#000' }}>
        R$ {formatCurrencyValue(total || price * quantity)}
      </TableCell>
    </TableRow>
  );

  return (
    <>
      {/* CONTEÚDO DO PDF */}
      <Box
        ref={targetRef}
        sx={{ 
          backgroundColor: '#ffffff', 
          padding: 4, 
          fontFamily: 'Arial, sans-serif', 
          color: '#000000',
          minHeight: '100vh'
        }}
      >
        <Box sx={{ maxWidth: '1000px', margin: '0 auto' }}>
          {/* Header com Logo */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography variant="h4" sx={{ color: '#061349', fontWeight: 'bold' }}>
              Orçamento Personalizado - SEATEC
            </Typography>
            <Typography variant="subtitle1" sx={{ color: '#666', mt: 1 }}>
              Sistema de Gestão Empresarial
            </Typography>
          </Box>

          {/* Informações do Cliente */}
          <Paper elevation={0} sx={{ p: 3, mb: 4, border: '1px solid #ddd', backgroundColor: '#fff' }}>
            <Typography variant="h6" sx={{ color: '#061349', fontWeight: 'bold', mb: 2 }}>
              📋 Informações do Cliente
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography sx={{ color: '#000' }}><strong>Nome:</strong> {formData.clientInfo.name}</Typography>
                <Typography sx={{ color: '#000' }}><strong>Empresa:</strong> {formData.clientInfo.companyName}</Typography>
                <Typography sx={{ color: '#000' }}><strong>CNPJ:</strong> {formData.clientInfo.cnpj}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography sx={{ color: '#000' }}><strong>Telefone:</strong> {formData.clientInfo.phone}</Typography>
                <Typography sx={{ color: '#000' }}><strong>Email:</strong> {formData.clientInfo.email}</Typography>
              </Grid>
            </Grid>
          </Paper>

          {/* Mensalidade */}
          <Paper elevation={0} sx={{ p: 3, mb: 4, border: '1px solid #ddd', backgroundColor: '#fff' }}>
            <Typography variant="h6" sx={{ color: '#061349', fontWeight: 'bold', mb: 2 }}>
              💰 Assinatura Mensal
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#f8f9fa' }}>
                    <TableCell sx={{ fontWeight: 'bold', color: '#000' }}>Módulo / Descrição</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 'bold', color: '#000' }}>Qtd</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold', color: '#000' }}>Valor Unit.</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold', color: '#000' }}>Total</TableCell>
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
                  <TableRow sx={{ backgroundColor: '#e8f4fd' }}>
                    <TableCell colSpan={3} sx={{ fontWeight: 'bold', fontSize: '1.1rem', color: '#000' }}>
                      TOTAL MENSALIDADE
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold', fontSize: '1.1rem', color: '#1976d2' }}>
                      R$ {formatCurrencyValue(monthlyTotal)}
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
            <Paper elevation={0} sx={{ p: 3, mb: 4, border: '1px solid #ddd', backgroundColor: '#fff' }}>
              <Typography variant="h6" sx={{ color: '#061349', fontWeight: 'bold', mb: 2 }}>
                📦 Módulos Adicionais
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: '#f8f9fa' }}>
                      <TableCell sx={{ fontWeight: 'bold', color: '#000' }}>Adicional / Descrição</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 'bold', color: '#000' }}>Qtd</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 'bold', color: '#000' }}>Valor Unit.</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 'bold', color: '#000' }}>Total</TableCell>
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
            <Paper elevation={0} sx={{ p: 3, mb: 4, border: '1px solid #ddd', backgroundColor: '#fff' }}>
              <Typography variant="h6" sx={{ color: '#061349', fontWeight: 'bold', mb: 2 }}>
                🛠️ Equipamentos
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: '#f8f9fa' }}>
                      <TableCell sx={{ fontWeight: 'bold', color: '#000' }}>Equipamento / Descrição</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 'bold', color: '#000' }}>Qtd</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 'bold', color: '#000' }}>Valor Unit.</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 'bold', color: '#000' }}>Total</TableCell>
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
                    <TableRow sx={{ backgroundColor: '#fff8e1' }}>
                      <TableCell colSpan={3} sx={{ fontWeight: 'bold', fontSize: '1.1rem', color: '#000' }}>
                        TOTAL EQUIPAMENTOS
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 'bold', fontSize: '1.1rem', color: '#f57c00' }}>
                        R$ {formatCurrencyValue(equipmentTotal)}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>

              {/* Galeria de Imagens dos Equipamentos */}
              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2, color: '#000' }}>
                  Equipamentos Selecionados:
                </Typography>
                <Grid container spacing={2}>
                  {Object.entries(formData.equipment).map(([key, quantity]) => {
                    if (quantity > 0) {
                      const equipmentItem = pricing.equipment[key as keyof typeof pricing.equipment];
                      const imageUrl = equipmentImages[key as keyof typeof equipmentImages];
                      
                      if (equipmentItem && imageUrl) {
                        return (
                          <Grid item xs={6} sm={4} md={3} key={key}>
                            <Box sx={{ 
                              textAlign: 'center', 
                              p: 2, 
                              border: '1px solid #e0e0e0', 
                              borderRadius: 2, 
                              backgroundColor: '#fafafa',
                              minHeight: '200px',
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}>
                              <img 
                                src={imageUrl} 
                                alt={equipmentItem.name}
                                crossOrigin="anonymous"
                                style={{ 
                                  width: '100%', 
                                  maxWidth: '120px', 
                                  height: 'auto',
                                  maxHeight: '100px',
                                  objectFit: 'contain',
                                  marginBottom: '12px',
                                  border: '1px solid #ddd',
                                  borderRadius: '4px',
                                  padding: '4px',
                                  backgroundColor: '#fff'
                                }} 
                              />
                              <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#000', mb: 1, fontSize: '0.8rem' }}>
                                {equipmentItem.name}
                              </Typography>
                              <Typography variant="caption" sx={{ color: '#666', display: 'block' }}>
                                Quantidade: {quantity}
                              </Typography>
                              <Typography variant="caption" sx={{ color: '#1976d2', fontWeight: 'bold' }}>
                                R$ {formatCurrencyValue(equipmentItem.price)}
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
          <Paper elevation={0} sx={{ p: 4, backgroundColor: '#f8f9fa', border: '1px solid #ddd' }}>
            <Typography variant="h5" sx={{ color: '#061349', fontWeight: 'bold', textAlign: 'center', mb: 3 }}>
              💳 Resumo Financeiro
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <Box sx={{ textAlign: 'center', p: 2, backgroundColor: '#e8f4fd', borderRadius: 2, border: '1px solid #ccc' }}>
                  <Typography variant="h6" sx={{ color: '#1976d2', fontWeight: 'bold' }}>
                    Mensalidade
                  </Typography>
                  <Typography variant="h4" sx={{ color: '#1976d2', fontWeight: 'bold' }}>
                    R$ {formatCurrencyValue(monthlyTotal)}
                  </Typography>
                </Box>
              </Grid>
              {equipmentTotal > 0 && (
                <Grid item xs={12} sm={6}>
                  <Box sx={{ textAlign: 'center', p: 2, backgroundColor: '#fff8e1', borderRadius: 2, border: '1px solid #ccc' }}>
                    <Typography variant="h6" sx={{ color: '#f57c00', fontWeight: 'bold' }}>
                      Equipamentos (Único)
                    </Typography>
                    <Typography variant="h4" sx={{ color: '#f57c00', fontWeight: 'bold' }}>
                      R$ {formatCurrencyValue(equipmentTotal)}
                    </Typography>
                  </Box>
                </Grid>
              )}
              <Grid item xs={12}>
                <Divider sx={{ my: 2, borderColor: '#ccc' }} />
                <Box sx={{ textAlign: 'center', p: 3, backgroundColor: '#e8f5e8', borderRadius: 2, border: '2px solid #4caf50' }}>
                  <Typography variant="h5" sx={{ color: '#2e7d32', fontWeight: 'bold' }}>
                    INVESTIMENTO TOTAL
                  </Typography>
                  <Typography variant="h3" sx={{ color: '#2e7d32', fontWeight: 'bold' }}>
                    R$ {formatCurrencyValue(monthlyTotal + equipmentTotal)}
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 1, color: '#555' }}>
                    {equipmentTotal > 0 ? `Mensalidade: R$ ${formatCurrencyValue(monthlyTotal)} + Equipamentos: R$ ${formatCurrencyValue(equipmentTotal)}` : 'Valor mensal'}
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
            backgroundColor: '#25D366',
            color: '#fff',
            px: 4,
            py: 1.5,
            fontSize: '1.1rem',
            '&:hover': {
              backgroundColor: '#128C7E',
            }
          }}
        >
          📱 Enviar no WhatsApp
        </Button>
        <Button 
          variant="contained" 
          onClick={handleGeneratePDF} 
          disabled={isGeneratingPDF}
          size="large"
          sx={{ 
            backgroundColor: '#1976d2',
            color: '#fff',
            px: 4,
            py: 1.5,
            fontSize: '1.1rem',
            '&:hover': {
              backgroundColor: '#1565c0',
            }
          }}
        >
          {isGeneratingPDF ? '⏳ Gerando PDF...' : '📄 Baixar PDF'}
        </Button>
      </Box>
    </>
  );
};

export default Summary;