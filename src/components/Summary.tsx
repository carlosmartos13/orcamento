import { Box, Button, Grid, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Divider } from '@mui/material';
import { FormData } from '../types';
import { usePricing } from '../hooks/usePricing';
import { calculateMonthlyTotal, calculateEquipmentTotal, generateWhatsAppMessage } from '../utils/calculations';
import { formatCurrencyValue } from '../utils/formatCurrency';
import { useState, useCallback, useEffect } from 'react';
import { equipmentImages } from '../assets/images';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface SummaryProps {
  formData: FormData;
  onEditStep: (step: number) => void;
}

const Summary = ({ formData }: SummaryProps) => {
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  
  const { pricing } = usePricing();
  
  const monthlyTotal = calculateMonthlyTotal(formData, pricing);
  const equipmentTotal = calculateEquipmentTotal(formData, pricing);

  const handleWhatsApp = () => {
    const message = generateWhatsAppMessage(formData, pricing, monthlyTotal, equipmentTotal);
    const fullMessage = encodeURIComponent(message);
    window.open(`https://api.whatsapp.com/send?&text=${fullMessage}`, '_blank');
  };

  // Pré-carrega todas as imagens incluindo o logo
  useEffect(() => {
    const preloadImages = async () => {
      const allImages = [...Object.values(equipmentImages), './logo.png'];
      
      const imagePromises = allImages.map((src) => {
        return new Promise<void>((resolve) => {
          const img = new Image();
          img.onload = () => resolve();
          img.onerror = () => resolve(); // Resolve mesmo com erro para não travar
          img.crossOrigin = 'anonymous';
          img.src = src;
        });
      });

      await Promise.all(imagePromises);
      setImagesLoaded(true);
    };

    preloadImages();
  }, []);

  // Função para gerar PDF usando html2canvas + jsPDF
  const handleGeneratePDF = useCallback(async () => {
    setIsGeneratingPDF(true);
    try {
      // Aguarda as imagens serem carregadas
      if (!imagesLoaded) {
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
      
      // Aguarda um pouco mais para garantir renderização
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Seleciona o elemento a ser convertido
      const element = document.getElementById('pdf-content');
      if (!element) {
        throw new Error('Elemento PDF não encontrado');
      }

      // Configurações do html2canvas
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        width: element.scrollWidth,
        height: element.scrollHeight
      });

      // Criar PDF
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 295; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      // Adicionar primeira página
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // Adicionar páginas adicionais se necessário
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      // Salvar PDF
      pdf.save('orcamento-seatec.pdf');
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      alert('Erro ao gerar PDF. Tente novamente.');
    } finally {
      setIsGeneratingPDF(false);
    }
  }, [imagesLoaded]);

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

  // Componente do Header reutilizável
  const PDFHeader = () => (
    <Box sx={{ position: 'relative', textAlign: 'center', mb: 4 }}>
      {/* Logo no canto direito */}
      <Box sx={{ 
        position: 'absolute', 
        top: 0, 
        right: 0,
        zIndex: 1
      }}>
        <img 
          src="./logo.png" 
          alt="Logo SEATEC" 
          crossOrigin="anonymous"
          style={{ 
            height: '80px', 
            width: 'auto',
            objectFit: 'contain'
          }} 
        />
      </Box>
      
      {/* Título centralizado */}
      <Box sx={{ pr: 10 }}> {/* Padding right para não sobrepor o logo */}
        <Typography variant="h4" sx={{ color: '#061349', fontWeight: 'bold' }}>
          Orçamento SEATEC | PDVLEGAL
        </Typography>
        <Typography variant="subtitle1" sx={{ color: '#666', mt: 1 }}>
          Sistema de Gestão Empresarial
        </Typography>
      </Box>
    </Box>
  );

  return (
    <>
      {/* CONTEÚDO DO PDF */}
      <Box
        id="pdf-content"
        sx={{ 
          backgroundColor: '#ffffff', 
          padding: 4, 
          fontFamily: 'Arial, sans-serif', 
          color: '#000000',
          minHeight: '100vh'
        }}
      >
        <Box sx={{ maxWidth: '1000px', margin: '0 auto' }}>
          {/* PRIMEIRA PÁGINA */}
          
          {/* Header com Logo */}
          <PDFHeader />

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
                  
                  {/* PDVs Adicionais (apenas se houver mais de 1) */}
                  {formData.subscription.pdvCount > 1 && createTableRow(
                    pricing.modules.pdv.name + ' Adicional',
                    pricing.modules.pdv.description,
                    pricing.modules.pdv.price,
                    formData.subscription.pdvCount - 1
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
              💰 TOTAL MENSALIDADE: R$ {formatCurrencyValue(monthlyTotal)}
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

              {/* TOTAL EQUIPAMENTOS */}
              <Paper elevation={0} sx={{ p: 3, mb: 4, backgroundColor: '#fff8e1', border: '2px solid #f57c00' }}>
                <Typography variant="h5" sx={{ color: '#f57c00', fontWeight: 'bold', textAlign: 'center' }}>
                  🛠️ TOTAL EQUIPAMENTOS: R$ {formatCurrencyValue(equipmentTotal)}
                </Typography>
              </Paper>
            </>
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