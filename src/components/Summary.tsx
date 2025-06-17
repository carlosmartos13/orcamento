import { Box, Button, Grid, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Divider } from '@mui/material';
import { FormData } from '../types';
import { usePricing } from '../hooks/usePricing';
import { calculateMonthlyTotal, calculateEquipmentTotal, generateWhatsAppMessage } from '../utils/calculations';
import { formatCurrencyValue } from '../utils/formatCurrency';
import { useState, useCallback } from 'react';
import { equipmentImages } from '../assets/images';
import { generatePDF } from '../utils/pdfGenerator';
import modul from '../data/pricing.json'
import { ForkLeft } from '@mui/icons-material';

interface SummaryProps {
  formData: FormData;
  onEditStep: (step: number) => void;
}

const Summary = ({ formData }: SummaryProps) => {
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  
  const { pricing } = usePricing();
  
  const monthlyTotal = calculateMonthlyTotal(formData, pricing);
  const equipmentTotal = calculateEquipmentTotal(formData, pricing);

  const handleWhatsApp = () => {
    const message = generateWhatsAppMessage(formData, pricing, monthlyTotal, equipmentTotal);
    const fullMessage = encodeURIComponent(message);
    window.open(`https://api.whatsapp.com/send?&text=${fullMessage}`, '_blank');
  };

  // Função para gerar PDF usando react-pdf
  const handleGeneratePDF = useCallback(async () => {
    setIsGeneratingPDF(true);
    try {
      await generatePDF(formData, pricing);
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      alert('Erro ao gerar PDF. Tente novamente.');
    } finally {
      setIsGeneratingPDF(false);
    }
  }, [formData, pricing]);

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
        R${formatCurrencyValue(price)}
      </TableCell>
      <TableCell align="right" sx={{ fontWeight: 'bold', color: '#000' }}>
        R${formatCurrencyValue(total || price * quantity)}
      </TableCell>
    </TableRow>
  );

const totalGeral = monthlyTotal + equipmentTotal + modul.modules.implantacao.price;
const desconto = totalGeral * 0.05;
const valorComDesconto = totalGeral - desconto;
const valorParcela = totalGeral / 3;

  return (
    <>
      {/* CONTEÚDO VISUAL PARA O USUÁRIO */}
      <Box sx={{ backgroundColor: '#ffffff', color: '#000000', fontFamily: 'Arial, sans-serif' }}>
        
        {/* Header com Logo */}
        <Box sx={{ position: 'relative', textAlign: 'center', mb: 4 }}>
          {/* Logo no canto direito */}
          <Box sx={{ 
            position: 'absolute', 
            top: 30, 
            right: 0,
            zIndex: 1
          }}>
            <img 
              src="./logo.png" 
              alt="Logo SEATEC" 
              crossOrigin="anonymous"
              style={{ 
                height: '60px', 
                width: 'auto',
                objectFit: 'contain'
              }} 
            />
          </Box>
          
          {/* Título centralizado */}
          <Box sx={{ pr: 10 }}>
            <Typography variant="h4" align="left" sx={{ color: '#061349', fontWeight: 'bold', pt:5,}}>
              Orçamento SEATEC | PDVLEGAL
            </Typography>
            <Typography variant="subtitle1" align="left" sx={{ color: '#666', mt: 1 }}>
              Sistema de Gestão | ERP + PDV
            </Typography>
          </Box>
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
                {/* Módulos Opcionais 2 */}
                {formData.subscription.fiscal2 && createTableRow(
                  pricing.modules.fiscal2.name,
                  pricing.modules.fiscal2.description,
                  pricing.modules.fiscal2.price
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
                
                {/* PDVs Adicionais (apenas se houver mais de 1) */}
                {formData.subscription.pdvCount > 1 && createTableRow(
                  pricing.modules.pdv.name + ' Adicional',
                  pricing.modules.pdv.description,
                  pricing.modules.pdv.price,
                  formData.subscription.pdvCount 
                )}
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

        {/* TOTAL MENSALIDADE */}
        <Paper elevation={0} sx={{ p: 3, mb: 4, backgroundColor: '#e8f4fd', border: '2px solid #1976d2' }}>
          <Typography variant="h5" sx={{ color: '#1976d2', fontWeight: 'bold', textAlign: 'center' }}>
            💰 TOTAL MENSALIDADE: R${formatCurrencyValue(monthlyTotal)}
          </Typography>
        </Paper>

        {/* Equipamentos */}
        {equipmentTotal > 0 && (
          <>
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
                                R${formatCurrencyValue(equipmentItem.price)}
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

            {/* TOTAL EQUIPAMENTOS */}
            <Paper elevation={0} sx={{ p: 3, mb: 4, backgroundColor: '#fff8e1', border: '2px solid #f57c00' }}>
              <Typography variant="h5" sx={{ color: '#f57c00', fontWeight: 'bold', textAlign: 'center' }}>
                🛠️ TOTAL EQUIPAMENTOS: R${formatCurrencyValue(equipmentTotal)}
              </Typography>
            </Paper>
          </>
        )}

        {/* Resumo Final */}
        <Paper elevation={0} sx={{ p: 4, backgroundColor: '#f8f9fa', border: '1px solid #ddd' }}>
          <Typography variant="h5" sx={{ color: '#061349', fontWeight: 'bold', textAlign: 'center', mb: 4 }}>
            💳 Resumo Financeiro
          </Typography>
          
          {/* Componentes do Investimento */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={4}>
              <Box sx={{ 
                textAlign: 'center', 
                p: 3, 
                backgroundColor: '#e8f4fd', 
                borderRadius: 3, 
                border: '2px solid #1976d2',
                boxShadow: '0 4px 12px rgba(25, 118, 210, 0.15)'
              }}>
                <Typography  sx={{ color: '#1976d2', fontWeight: 'bold', mb: 1 }}>
                  💰 Mensalidade
                </Typography>
                <Typography variant="h4" sx={{ color: '#1976d2', fontWeight: 'bold' }}>
                  R${formatCurrencyValue(monthlyTotal)}
                </Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <Box sx={{ 
                textAlign: 'center', 
                p: 3, 
                backgroundColor: '#e8f5e8', 
                borderRadius: 3, 
                border: '2px solid #2e7d32',
                boxShadow: '0 4px 12px rgba(46, 125, 50, 0.15)'
              }}>
                <Typography  sx={{ color: '#2e7d32', fontWeight: 'bold', mb: 1 }}>
                  🎧 Implantação Online
                </Typography>
                <Typography variant="h4" sx={{ color: '#2e7d32', fontWeight: 'bold' }}>
                  R${formatCurrencyValue(modul.modules.implantacao.price)}
                </Typography>
                
              </Box>
              
            </Grid>
            

            {equipmentTotal > 0 && (
              <Grid item xs={12} sm={4}>
                <Box sx={{ 
                  textAlign: 'center', 
                  p: 3, 
                  backgroundColor: '#fff8e1', 
                  borderRadius: 3, 
                  border: '2px solid #f57c00',
                  boxShadow: '0 4px 12px rgba(245, 124, 0, 0.15)'
                }}>
                  <Typography  sx={{ color: '#f57c00', fontWeight: 'bold', mb: 1 }}>
                    🛠️ Equipamentos
                  </Typography>
                  <Typography variant="h4" sx={{ color: '#f57c00', fontWeight: 'bold' }}>
                    R${formatCurrencyValue(equipmentTotal)}
                  </Typography>
                </Box>
              </Grid>
            )}

          </Grid>
       

          <Divider sx={{ my: 4, borderColor: '#ccc', borderWidth: 2 }} />

          {/* INVESTIMENTO TOTAL */}
          <Box sx={{ 
            backgroundColor: 'linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 100%)', 
            borderRadius: 4, 
            p: 4,
            border: '3px solid #4caf50',
            boxShadow: '0 8px 24px rgba(76, 175, 80, 0.2)'
          }}>
            {/* Valor Total Original */}
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <Typography variant="h5" sx={{ color: '#666', fontWeight: 'bold', mb: 1 }}>
                💼 INVESTIMENTO TOTAL
              </Typography>
              <Typography 
                variant="h3" 
                sx={{ 
                  color: '#666', 
                  fontWeight: 'bold',
                  textDecoration: 'line-through',
                  opacity: 0.7
                }}
              >
                R${formatCurrencyValue(totalGeral)}
              </Typography>
            </Box>

            {/* Opções de Pagamento */}
            <Grid container spacing={3}>
              {/* Pagamento à Vista com Desconto */}
              <Grid item xs={12} md={6}>
                <Box sx={{ 
                  backgroundColor: '#e8f5e8', 
                  borderRadius: 3, 
                  p: 3,
                  border: '2px solid #4caf50',
                  textAlign: 'center',
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  {/* Badge de Desconto */}
                  <Box sx={{
                    position: 'absolute',
                    top: -10,
                    right: -10,
                    backgroundColor: '#ff5722',
                    color: '#fff',
                    borderRadius: '50%',
                    width: 60,
                    height: 60,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 'bold',
                    fontSize: '0.9rem',
                    transform: 'rotate(15deg)',
                    boxShadow: '0 4px 8px rgba(255, 87, 34, 0.3)'
                  }}>
                    5% OFF
                  </Box>

                  <Typography variant="h6" sx={{ color: '#2e7d32', fontWeight: 'bold', mb: 2 }}>
                    🤑 PAGAMENTO À VISTA
                  </Typography>
                  
                  <Typography variant="body2" sx={{ color: '#666', mb: 1 }}>
                    Desconto de 5%: -R${formatCurrencyValue(desconto)}
                  </Typography>
                  
                  <Typography 
                    variant="h3" 
                    sx={{ 
                      color: '#2e7d32', 
                      fontWeight: 'bold',
                      textShadow: '2px 2px 4px rgba(46, 125, 50, 0.2)'
                    }}
                  >
                    R${formatCurrencyValue(valorComDesconto)}
                  </Typography>
                  
                  <Typography variant="body2" sx={{ color: '#2e7d32', fontWeight: 'bold', mt: 1 }}>
                    💰 ECONOMIA DE R${formatCurrencyValue(desconto)}
                  </Typography>

                   
                </Box>
               
              </Grid>
              

              {/* Pagamento Parcelado */}
              <Grid item xs={12} md={6}>
                <Box sx={{ 
                  backgroundColor: '#e3f2fd', 
                  borderRadius: 3, 
                  p: 3,
                  border: '2px solid #2196f3',
                  textAlign: 'center'
                }}>
                  <Typography variant="h6" sx={{ color: '#1976d2', fontWeight: 'bold', mb: 2, paddingBottom:"15px" }}>
                    💳 PARCELADO SEM JUROS

                  </Typography>
                 
                  
                  <Typography variant="h4" sx={{ color: '#1976d2', fontWeight: 'bold', mb: 1 }}>
                    3x de R${formatCurrencyValue(valorParcela)}
                  </Typography>
                  
                  <Typography variant="body2" sx={{ color: '#666', mb: 1 }}>
                    Total: R${formatCurrencyValue(totalGeral)}
                  </Typography>
                  
                  <Typography variant="body2" sx={{ color: '#1976d2', fontWeight: 'bold' }}>
                    📅 Sem juros no cartão
                  </Typography>
                </Box>
                
              </Grid>
            </Grid>

            {/* Detalhamento */}
            <Box sx={{ mt: 3, textAlign: 'center' }}>
              <Typography variant="body2" sx={{ color: '#666', fontStyle: 'italic' }}>
                Mensalidade: R${formatCurrencyValue(monthlyTotal)} + Implantação: R${formatCurrencyValue(modul.modules.implantacao.price)}
                {equipmentTotal > 0 && ` + Equipamentos: R$${formatCurrencyValue(equipmentTotal)}`}
              </Typography>
            </Box>
          </Box>
          <Box> 
            <Typography variant="h6" sx={{ color: '#000', textAlign: 'center', mt: 10, mb:5,  fontWeight: 'bold'}}>
              Requisito Minimo de rede para melhor performance do sistema, recomendamos a estrutura com roteador próprio de qualidade, NÃO RECOMENDAMOS APENAS O USO DO MODEM DA OPERADORA!
                     
            </Typography>
            <img src={equipmentImages.redeD} alt="" style={{ 
                                  width: '100%', 
                                  maxWidth: '1020px', 
                                  height: 'auto',
                                  maxHeight: '1000px',
                                  objectFit: 'contain',
                                  marginBottom: '10',
                                 
                                  
                                 
                                 
                                  
                                }}  />
          </Box>
          
        </Paper>

        {/* Conteúdo da Implantação */}
        <Paper elevation={0} sx={{ p: 4, border: '1px solid #ddd', backgroundColor: '#fff', mt: 4 }}>
          <Typography variant="h4" sx={{ color: '#061349', fontWeight: 'bold', textAlign: 'center', mb: 4 }}>
            RESUMO IMPLANTAÇÃO
          </Typography>

          {/* Cardápio */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" sx={{ color: '#061349', fontWeight: 'bold', mb: 2 }}>
              📋 Cardápio
            </Typography>
            <Typography sx={{ color: '#000', mb: 1 }}>
              ☐ Importação de cardápio via planilha Excel
            </Typography>
            <Typography sx={{ color: '#000', mb: 2 }}>
              ☐ Cadastro de cardápio – Até 100 itens*
            </Typography>
            <Typography variant="body2" sx={{ color: '#666', fontStyle: 'italic' }}>
              *Em caso de modificadores ou itens extras como: queijo, tomate, leite condensado e outros, cada modificador contará como item no cardápio.
            </Typography>
          </Box>

          {/* Dados Fiscais */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" sx={{ color: '#061349', fontWeight: 'bold', mb: 2 }}>
              🧾 Dados para emissão Fiscal
            </Typography>
            <Typography sx={{ color: '#000', mb: 1 }}>
              1. Enviar o comprovante de credenciamento no Estado para emissão de NFC-e;
            </Typography>
            <Typography sx={{ color: '#000', mb: 1 }}>
              2. Informar o CRT (Código de Regime Tributário);
            </Typography>
            <Typography sx={{ color: '#000', mb: 1 }}>
              3. Enviar o CSC (Código de Segurança do Contribuinte) com o devido ID;
            </Typography>
            <Typography sx={{ color: '#000', mb: 1 }}>
              4. Informar alíquotas de tributação que incidirão nos produtos (ICMS/ISS, CFOP, CST, PIS/COFINS);
            </Typography>
            <Typography sx={{ color: '#000', mb: 1 }}>
              5. Enviar o Certificado Digital A1 em arquivo PFX e senha;
            </Typography>
            <Typography sx={{ color: '#000', mb: 1 }}>
              6. Enviar o Token do IBPT - https://deolhonoimposto.ibpt.org.br/Site/PassoPasso
            </Typography>
            <Typography sx={{ color: '#000', mb: 1 }}>
              7. Planilha com descrição, grupo, preço de venda, NCM e CEST dos produtos.
            </Typography>
          </Box>

          {/* Jornada do Cliente */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" sx={{ color: '#061349', fontWeight: 'bold', mb: 2 }}>
              🚀 Jornada do Cliente
            </Typography>
            <Typography sx={{ color: '#000', mb: 2 }}>
              Após o pagamento, faremos o faturamento de sua licença e, em até 1 dia útil um dos nossos Especialistas entrará em contato para conferência de dados e agendamento dos treinamentos.
            </Typography>
            <Typography sx={{ color: '#000', mb: 2 }}>
              Após a implantação, é só desfrutar de toda inovação e tecnologia que o PDV Legal levará para o seu negócio! 🤩
            </Typography>
            <Typography sx={{ color: '#000', fontWeight: 'bold' }}>
              Importante! Lembre-se de contar comigo em qualquer momento de nossa parceria. 😀
            </Typography>
          </Box>

          {/* Treinamento */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" sx={{ color: '#061349', fontWeight: 'bold', mb: 2 }}>
              💻 Treinamento
            </Typography>
            <Typography sx={{ color: '#000', mb: 2 }}>
              Para o treinamento é imprescindível o uso do computador ou notebook, além dos equipamentos sugeridos para infraestrutura em mãos.
            </Typography>
            <Typography sx={{ color: '#000' }}>
              Nossos treinamentos são realizados de forma remota, via Google Meet. Mas não se preocupe, minutos antes de iniciar te enviaremos o link de acesso e qualquer dúvida nossos Especialistas estarão prontos para ajudar.
            </Typography>
            <Typography sx={{ color: '#000' }}>
             {(modul.modules.implantacao.description)}
            </Typography>
                        


          </Box>

          {/* Horário e Atendimento */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" sx={{ color: '#061349', fontWeight: 'bold', mb: 2 }}>
              🕑 Horário e canais de atendimento
            </Typography>
            <Typography sx={{ color: '#000', mb: 1 }}>
              <strong>Telefone/WhatsApp:</strong> 11 4210-1779
            </Typography>
            <Typography sx={{ color: '#000', mb: 1 }}>
              <strong>E-mail:</strong> suporte@seatec.com.br
            </Typography>
            <Typography sx={{ color: '#000', mb: 1 }}>
              <strong>Suporte Emergencial:</strong> Segunda a Segunda: 8h às 23:59h
            </Typography>
            <Typography sx={{ color: '#000', mb: 1 }}>
              <strong>Treinamentos e Dúvidas:</strong> Seg a Sexta: 9h às 18h
            </Typography>
          </Box>

          {/* Mensagem Final */}
          <Box sx={{ textAlign: 'center', p: 3, backgroundColor: '#e8f5e8', borderRadius: 2, border: '2px solid #4caf50' }}>
            <Typography variant="h6" sx={{ color: '#2e7d32', fontWeight: 'bold' }}>
              Agradecemos a confiança e desejamos que este seja o início de uma parceria de sucesso! 💙
            </Typography>
          </Box>
        </Paper>
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