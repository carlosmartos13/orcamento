import { Box, Button, Grid, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Divider } from '@mui/material';
import { FormData } from '../types';
import { usePricing } from '../hooks/usePricing';
import { calculateMonthlyTotal, calculateEquipmentTotal, generateWhatsAppMessage } from '../utils/calculations';
import { formatCurrencyValue } from '../utils/formatCurrency';
import { useState, useCallback, useEffect } from 'react';
import { equipmentImages } from '../assets/images';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import pricingData from '../data/pricing.json';

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
  const implantacaoPrice = pricingData.modules.implantacao.price;

  const handleWhatsApp = () => {
    const message = generateWhatsAppMessage(formData, pricing, monthlyTotal, equipmentTotal);
    const fullMessage = encodeURIComponent(message);
    window.open(`https://api.whatsapp.com/send?&text=${fullMessage}`, '_blank');
  };

  // Pré-carrega todas as imagens incluindo o logo
  useEffect(() => {
    const preloadImages = async () => {
      try {
        // Lista de todas as imagens necessárias
        const logoUrl = `${window.location.origin}/logo.png`;
        const allImages = [logoUrl, ...Object.values(equipmentImages)];
        
        const imagePromises = allImages.map((src) => {
          return new Promise<void>((resolve) => {
            const img = new Image();
            img.onload = () => {
              console.log(`Imagem carregada: ${src}`);
              resolve();
            };
            img.onerror = (error) => {
              console.warn(`Erro ao carregar imagem: ${src}`, error);
              resolve(); // Resolve mesmo com erro para não travar
            };
            img.crossOrigin = 'anonymous';
            img.src = src;
          });
        });

        await Promise.all(imagePromises);
        console.log('Todas as imagens foram pré-carregadas');
        setImagesLoaded(true);
      } catch (error) {
        console.error('Erro no pré-carregamento das imagens:', error);
        setImagesLoaded(true); // Define como true mesmo com erro
      }
    };

    preloadImages();
  }, []);

  // Função para gerar PDF usando html2canvas + jsPDF
  const handleGeneratePDF = useCallback(async () => {
    setIsGeneratingPDF(true);
    try {
      console.log('Iniciando geração do PDF...');
      
      // Aguarda as imagens serem carregadas
      if (!imagesLoaded) {
        console.log('Aguardando carregamento das imagens...');
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
      
      // Aguarda um pouco mais para garantir renderização
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm

      // Array com os IDs das páginas
      const pageIds = ['pdf-page-1', 'pdf-page-2', 'pdf-page-3', 'pdf-page-4', 'pdf-page-5'];
      
      for (let i = 0; i < pageIds.length; i++) {
        const element = document.getElementById(pageIds[i]);
        
        // Pula páginas que não existem (como página 2 se não há equipamentos)
        if (!element) {
          console.log(`Página ${pageIds[i]} não encontrada, pulando...`);
          continue;
        }
        
        console.log(`Processando página ${i + 1}: ${pageIds[i]}`);
        
        // Adiciona nova página (exceto para a primeira)
        if (i > 0) {
          pdf.addPage();
        }

        try {
          // Captura a página
          const canvas = await html2canvas(element, {
            scale: 1.5, // Reduzido de 2 para 1.5
            useCORS: true,
            allowTaint: false,
            backgroundColor: '#ffffff',
            logging: false,
            width: element.scrollWidth,
            height: element.scrollHeight,
            onclone: (clonedDoc) => {
              // Remove imagens problemáticas do clone se necessário
              const images = clonedDoc.querySelectorAll('img');
              images.forEach(img => {
                if (img.src && !img.complete) {
                  img.style.display = 'none';
                }
              });
            }
          });

          const imgData = canvas.toDataURL('image/jpeg', 0.8); // Usar JPEG com qualidade 0.8
          const imgWidth = pageWidth;
          const imgHeight = (canvas.height * pageWidth) / canvas.width;

          // Se a imagem for maior que a página, ajusta para caber
          if (imgHeight > pageHeight) {
            const ratio = pageHeight / imgHeight;
            pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth * ratio, pageHeight);
          } else {
            pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, imgHeight);
          }
          
          console.log(`Página ${i + 1} processada com sucesso`);
        } catch (pageError) {
          console.error(`Erro ao processar página ${i + 1}:`, pageError);
          // Continua para a próxima página em caso de erro
        }
      }

      // Salvar PDF
      console.log('Salvando PDF...');
      pdf.save('orcamento-seatec.pdf');
      console.log('PDF gerado com sucesso!');
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      alert(`Erro ao gerar PDF: ${error.message || 'Erro desconhecido'}. Tente novamente.`);
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
          src={`${window.location.origin}/logo.png`}
          alt="Logo SEATEC" 
          crossOrigin="anonymous"
          style={{ 
            height: '80px', 
            width: 'auto',
            objectFit: 'contain'
          }}
          onError={(e) => {
            console.warn('Erro ao carregar logo:', e);
            e.currentTarget.style.display = 'none';
          }}
        />
      </Box>
      
      {/* Título centralizado */}
      <Box sx={{ pr: 10 }}> {/* Padding right para não sobrepor o logo */}
        <Typography variant="h4" sx={{ color: '#061349', fontWeight: 'bold' }}>
          Orçamento SEATEC | PDVLEGAL
        </Typography>
        <Typography variant="subtitle1" sx={{ color: '#666', mt: 1 }}>
          Sistema de Gestão | ERP + PDV
        </Typography>
      </Box>
    </Box>
  );

  return (
    <>
      {/* CONTEÚDO DO PDF - POSICIONADO FORA DA TELA */}
      <Box sx={{ position: 'absolute', left: '-9999px', top: '-9999px', zIndex: -1 }}>
        
        {/* PÁGINA 1 - MENSALIDADES */}
        <Box
          id="pdf-page-1"
          sx={{ 
            backgroundColor: '#ffffff', 
            padding: 4, 
            fontFamily: 'Arial, sans-serif', 
            color: '#000000',
            minHeight: '297mm',
            width: '210mm',
            pageBreakAfter: 'always'
          }}
        >
          <Box sx={{ maxWidth: '1000px', margin: '0 auto' }}>
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
                    
                    {/* PDVs */}
                    {createTableRow(
                      pricing.modules.pdv.name,
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
                💰 TOTAL MENSALIDADE: R$ {formatCurrencyValue(monthlyTotal)}
              </Typography>
            </Paper>
          </Box>
        </Box>

        {/* PÁGINA 2 - EQUIPAMENTOS (apenas se houver equipamentos) */}
        {equipmentTotal > 0 && (
          <Box
            id="pdf-page-2"
            sx={{ 
              backgroundColor: '#ffffff', 
              padding: 4, 
              fontFamily: 'Arial, sans-serif', 
              color: '#000000',
              minHeight: '297mm',
              width: '210mm',
              pageBreakAfter: 'always'
            }}
          >
            <Box sx={{ maxWidth: '1000px', margin: '0 auto' }}>
              {/* Header com Logo */}
              <PDFHeader />

              {/* Equipamentos */}
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
                                  onError={(e) => {
                                    console.warn(`Erro ao carregar imagem do equipamento: ${imageUrl}`);
                                    e.currentTarget.style.display = 'none';
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
            </Box>
          </Box>
        )}

        {/* PÁGINA 3 - RESUMO FINANCEIRO */}
        <Box
          id="pdf-page-3"
          sx={{ 
            backgroundColor: '#ffffff', 
            padding: 4, 
            fontFamily: 'Arial, sans-serif', 
            color: '#000000',
            minHeight: '297mm',
            width: '210mm',
            pageBreakAfter: 'always'
          }}
        >
          <Box sx={{ maxWidth: '1000px', margin: '0 auto' }}>
            {/* Header com Logo */}
            <PDFHeader />

            {/* Resumo Final */}
            <Paper elevation={0} sx={{ p: 4, backgroundColor: '#f8f9fa', border: '1px solid #ddd' }}>
              <Typography variant="h5" sx={{ color: '#061349', fontWeight: 'bold', textAlign: 'center', mb: 3 }}>
                💳 Resumo Financeiro
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={4}>
                  <Box sx={{ textAlign: 'center', p: 2, backgroundColor: '#e8f4fd', borderRadius: 2, border: '1px solid #ccc' }}>
                    <Typography variant="h6" sx={{ color: '#1976d2', fontWeight: 'bold' }}>
                      Mensalidade
                    </Typography>
                    <Typography variant="h4" sx={{ color: '#1976d2', fontWeight: 'bold' }}>
                      R$ {formatCurrencyValue(monthlyTotal)}
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={12} sm={4}>
                  <Box sx={{ textAlign: 'center', p: 2, backgroundColor: '#e8f5e8', borderRadius: 2, border: '1px solid #ccc' }}>
                    <Typography variant="h6" sx={{ color: '#2e7d32', fontWeight: 'bold' }}>
                      Implantação Online
                    </Typography>
                    <Typography variant="h4" sx={{ color: '#2e7d32', fontWeight: 'bold' }}>
                      R$ {formatCurrencyValue(implantacaoPrice)}
                    </Typography>
                  </Box>
                </Grid>
                {equipmentTotal > 0 && (
                  <Grid item xs={12} sm={4}>
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
                      R$ {formatCurrencyValue(monthlyTotal + equipmentTotal + implantacaoPrice)}
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 1, color: '#555' }}>
                      Mensalidade: R$ {formatCurrencyValue(monthlyTotal)} + Implantação: R$ {formatCurrencyValue(implantacaoPrice)} {equipmentTotal > 0 ? `+ Equipamentos: R$ ${formatCurrencyValue(equipmentTotal)}` : ''}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          </Box>
        </Box>

        {/* PÁGINA 4 - RESUMO IMPLANTAÇÃO */}
        <Box
          id="pdf-page-4"
          sx={{ 
            backgroundColor: '#ffffff', 
            padding: 4, 
            fontFamily: 'Arial, sans-serif', 
            color: '#000000',
            minHeight: '297mm',
            width: '210mm',
            pageBreakAfter: 'always'
          }}
        >
          <Box sx={{ maxWidth: '1000px', margin: '0 auto' }}>
            {/* Header com Logo */}
            <PDFHeader />

            {/* Conteúdo da Implantação */}
            <Paper elevation={0} sx={{ p: 4, border: '1px solid #ddd', backgroundColor: '#fff' }}>
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
            </Paper>
          </Box>
        </Box>

        {/* PÁGINA 5 - TREINAMENTO E SUPORTE */}
        <Box
          id="pdf-page-5"
          sx={{ 
            backgroundColor: '#ffffff', 
            padding: 4, 
            fontFamily: 'Arial, sans-serif', 
            color: '#000000',
            minHeight: '297mm',
            width: '210mm'
          }}
        >
          <Box sx={{ maxWidth: '1000px', margin: '0 auto' }}>
            {/* Header com Logo */}
            <PDFHeader />

            <Paper elevation={0} sx={{ p: 4, border: '1px solid #ddd', backgroundColor: '#fff' }}>
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
              <Box sx={{ textAlign: 'center', p: 3, backgroundColor: '#e8f5e8', borderRadius: 2, border: '2px solid #4caf50', mt: 6 }}>
                <Typography variant="h6" sx={{ color: '#2e7d32', fontWeight: 'bold' }}>
                  Agradecemos a confiança e desejamos que este seja o início de uma parceria de sucesso! 💙
                </Typography>
              </Box>
            </Paper>
          </Box>
        </Box>
      </Box>

      {/* RESUMO VISÍVEL NA TELA */}
      <Box sx={{ maxWidth: '1000px', margin: '0 auto' }}>
        {/* Resumo Final Simplificado para a tela */}
        <Paper elevation={0} sx={{ p: 4, backgroundColor: '#f8f9fa', border: '1px solid #ddd' }}>
          <Typography variant="h5" sx={{ color: '#061349', fontWeight: 'bold', textAlign: 'center', mb: 3 }}>
            💳 Resumo Financeiro
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={4}>
              <Box sx={{ textAlign: 'center', p: 2, backgroundColor: '#e8f4fd', borderRadius: 2, border: '1px solid #ccc' }}>
                <Typography variant="h6" sx={{ color: '#1976d2', fontWeight: 'bold' }}>
                  Mensalidade
                </Typography>
                <Typography variant="h4" sx={{ color: '#1976d2', fontWeight: 'bold' }}>
                  R$ {formatCurrencyValue(monthlyTotal)}
                </Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <Box sx={{ textAlign: 'center', p: 2, backgroundColor: '#e8f5e8', borderRadius: 2, border: '1px solid #ccc' }}>
                <Typography variant="h6" sx={{ color: '#2e7d32', fontWeight: 'bold' }}>
                  Implantação Online
                </Typography>
                <Typography variant="h4" sx={{ color: '#2e7d32', fontWeight: 'bold' }}>
                  R$ {formatCurrencyValue(implantacaoPrice)}
                </Typography>
              </Box>
            </Grid>
            {equipmentTotal > 0 && (
              <Grid item xs={12} sm={4}>
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
                  R$ {formatCurrencyValue(monthlyTotal + equipmentTotal + implantacaoPrice)}
                </Typography>
                <Typography variant="body2" sx={{ mt: 1, color: '#555' }}>
                  Mensalidade: R$ {formatCurrencyValue(monthlyTotal)} + Implantação: R$ {formatCurrencyValue(implantacaoPrice)} {equipmentTotal > 0 ? `+ Equipamentos: R$ ${formatCurrencyValue(equipmentTotal)}` : ''}
                </Typography>
              </Box>
            </Grid>
          </Grid>
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