import { Box, Button, Grid, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Divider } from '@mui/material';
import { FormData } from '../types';
import { usePricing } from '../hooks/usePricing';
import { calculateMonthlyTotal, calculateEquipmentTotal, generateWhatsAppMessage } from '../utils/calculations';
import { formatCurrencyValue } from '../utils/formatCurrency';
import { useState, useCallback, useRef, useEffect } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

// Importações diretas das imagens
import gs300 from '../assets/gs300.png';
import d2 from '../assets/d2.jpg';
import totem from '../assets/totem.png';
import rede from '../assets/rede.png';
import raspberryServer from '../assets/raspberryServer.jpeg';

interface SummaryProps {
  formData: FormData;
  onEditStep: (step: number) => void;
}

const Summary = ({ formData }: SummaryProps) => {
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [imagesBase64, setImagesBase64] = useState<Record<string, string>>({});
  const [logoBase64, setLogoBase64] = useState<string>('');
  
  const page1Ref = useRef<HTMLDivElement>(null);
  const page2Ref = useRef<HTMLDivElement>(null);
  const page3Ref = useRef<HTMLDivElement>(null);
  const page4Ref = useRef<HTMLDivElement>(null);
  
  const { pricing } = usePricing();
  
  const monthlyTotal = calculateMonthlyTotal(formData, pricing);
  const equipmentTotal = calculateEquipmentTotal(formData, pricing);

  // Mapeamento das imagens
  const equipmentImages = {
    androidPdvGertec: gs300,
    androidPdvSunmi: d2,
    selfServiceTotemGertec: totem,
    networkKit: rede,
    raspberryServer: raspberryServer,
    'Elgin M10 Pro': raspberryServer,
    'Tanca tp-650': raspberryServer,
  };

  // Função para converter imagem para base64
  const imageToBase64 = (src: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = img.width;
        canvas.height = img.height;
        ctx?.drawImage(img, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      };
      img.onerror = reject;
      img.src = src;
    });
  };

  // Carregar todas as imagens como base64 quando o componente monta
  useEffect(() => {
    const loadImages = async () => {
      try {
        // Carregar logo
        const logoB64 = await imageToBase64('/logo.png');
        setLogoBase64(logoB64);

        // Carregar imagens dos equipamentos
        const imagePromises = Object.entries(equipmentImages).map(async ([key, src]) => {
          const base64 = await imageToBase64(src);
          return [key, base64];
        });

        const results = await Promise.all(imagePromises);
        const imagesMap = Object.fromEntries(results);
        setImagesBase64(imagesMap);
      } catch (error) {
        console.error('Erro ao carregar imagens:', error);
      }
    };

    loadImages();
  }, []);

  const handleWhatsApp = () => {
    const message = generateWhatsAppMessage(formData, pricing, monthlyTotal, equipmentTotal);
    const fullMessage = encodeURIComponent(message);
    window.open(`https://api.whatsapp.com/send?&text=${fullMessage}`, '_blank');
  };

  // Função para gerar PDF com múltiplas páginas
  const handleGeneratePDF = useCallback(async () => {
    setIsGeneratingPDF(true);
    
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = 210;
      const pageHeight = 297;
      
      // Função para capturar e adicionar página
      const addPageToPDF = async (elementRef: React.RefObject<HTMLDivElement>, isFirstPage = false) => {
        if (!elementRef.current) return;
        
        const canvas = await html2canvas(elementRef.current, {
          scale: 1.5, // Reduzido de 2 para 1.5
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff',
          width: elementRef.current.offsetWidth, // Usar offsetWidth em vez de scrollWidth
          height: elementRef.current.offsetHeight, // Usar offsetHeight em vez de scrollHeight
          logging: false,
          foreignObjectRendering: true, // Melhor renderização de elementos
        });
        
        const imgData = canvas.toDataURL('image/png');
        
        // Calcular dimensões mantendo proporção
        const canvasRatio = canvas.width / canvas.height;
        const pageRatio = pageWidth / pageHeight;
        
        let imgWidth, imgHeight;
        
        if (canvasRatio > pageRatio) {
          // Canvas é mais largo que a página
          imgWidth = pageWidth;
          imgHeight = pageWidth / canvasRatio;
        } else {
          // Canvas é mais alto que a página
          imgHeight = pageHeight;
          imgWidth = pageHeight * canvasRatio;
        }
        
        // Centralizar na página
        const x = (pageWidth - imgWidth) / 2;
        const y = (pageHeight - imgHeight) / 2;
        
        if (!isFirstPage) {
          pdf.addPage();
        }
        
        pdf.addImage(imgData, 'PNG', x, y, imgWidth, imgHeight);
      };

      // Adicionar páginas sequencialmente
      if (page1Ref.current) {
        await addPageToPDF(page1Ref, true);
      }
      
      if (equipmentTotal > 0 && page2Ref.current) {
        await addPageToPDF(page2Ref);
      }
      
      if (page3Ref.current) {
        await addPageToPDF(page3Ref);
      }
      
      if (page4Ref.current) {
        await addPageToPDF(page4Ref);
      }

      // Salvar o PDF
      pdf.save('orcamento-seatec.pdf');
      
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
    } finally {
      setIsGeneratingPDF(false);
    }
  }, [equipmentTotal]);

  // Função para criar linha da tabela
  const createTableRow = (name: string, description: string, price: number, quantity: number = 1, total?: number) => (
    <TableRow key={name}>
      <TableCell>
        <Typography variant="body1" sx={{ fontWeight: 'bold', color: '#000', fontSize: '14px' }}>
          {name}
        </Typography>
        <Typography variant="body2" sx={{ fontSize: '12px', mt: 0.5, color: '#555' }}>
          {description}
        </Typography>
      </TableCell>
      <TableCell align="center" sx={{ color: '#000', fontSize: '14px' }}>
        {quantity > 1 ? `${quantity}x` : '1x'}
      </TableCell>
      <TableCell align="right" sx={{ color: '#000', fontSize: '14px' }}>
        R$ {formatCurrencyValue(price)}
      </TableCell>
      <TableCell align="right" sx={{ fontWeight: 'bold', color: '#000', fontSize: '14px' }}>
        R$ {formatCurrencyValue(total || price * quantity)}
      </TableCell>
    </TableRow>
  );

  // Componente do Header reutilizável
  const PDFHeader = () => (
    <Box sx={{ position: 'relative', textAlign: 'center', mb: 3, height: '100px' }}>
      {/* Logo no canto direito */}
      <Box sx={{ 
        position: 'absolute', 
        top: 0, 
        right: 0,
        zIndex: 1,
        width: '100px',
        height: '80px'
      }}>
        {logoBase64 && (
          <img 
            src={logoBase64} 
            alt="Logo SEATEC" 
            style={{ 
              width: '100%',
              height: '100%',
              objectFit: 'contain'
            }} 
          />
        )}
      </Box>
      
      {/* Título centralizado */}
      <Box sx={{ pr: 12, pt: 1 }}>
        <Typography variant="h4" sx={{ color: '#061349', fontWeight: 'bold', fontSize: '24px' }}>
          Orçamento SEATEC | PDVLEGAL
        </Typography>
        <Typography variant="subtitle1" sx={{ color: '#666', mt: 1, fontSize: '16px' }}>
          Sistema de Gestão Empresarial
        </Typography>
      </Box>
    </Box>
  );

  // Componente das informações do cliente reutilizável
  const ClientInfo = () => (
    <Paper elevation={0} sx={{ p: 2, mb: 3, border: '1px solid #ddd', backgroundColor: '#fff' }}>
      <Typography variant="h6" sx={{ color: '#061349', fontWeight: 'bold', mb: 2, fontSize: '16px' }}>
        📋 Informações do Cliente
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <Typography sx={{ color: '#000', fontSize: '14px', mb: 0.5 }}><strong>Nome:</strong> {formData.clientInfo.name}</Typography>
          <Typography sx={{ color: '#000', fontSize: '14px', mb: 0.5 }}><strong>Empresa:</strong> {formData.clientInfo.companyName}</Typography>
          <Typography sx={{ color: '#000', fontSize: '14px', mb: 0.5 }}><strong>CNPJ:</strong> {formData.clientInfo.cnpj}</Typography>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Typography sx={{ color: '#000', fontSize: '14px', mb: 0.5 }}><strong>Telefone:</strong> {formData.clientInfo.phone}</Typography>
          <Typography sx={{ color: '#000', fontSize: '14px', mb: 0.5 }}><strong>Email:</strong> {formData.clientInfo.email}</Typography>
        </Grid>
      </Grid>
    </Paper>
  );

  return (
    <>
      {/* VISUALIZAÇÃO NA TELA - SEM REPETIR DADOS DO CLIENTE */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Resumo do Orçamento
        </Typography>
        
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            💰 Total Mensal: R$ {formatCurrencyValue(monthlyTotal)}
          </Typography>
          {equipmentTotal > 0 && (
            <Typography variant="h6" gutterBottom>
              🛠️ Total Equipamentos: R$ {formatCurrencyValue(equipmentTotal)}
            </Typography>
          )}
          <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
            💳 Total Geral: R$ {formatCurrencyValue(monthlyTotal + equipmentTotal)}
          </Typography>
        </Paper>
      </Box>

      {/* CONTEÚDO DO PDF - OCULTO NA TELA */}
      <Box sx={{ position: 'absolute', left: '-9999px', top: '-9999px' }}>
        
        {/* PÁGINA 1 - MENSALIDADE */}
        <Box 
          ref={page1Ref}
          sx={{ 
            width: '794px', // Largura A4 em pixels (210mm)
            minHeight: '1123px', // Altura A4 em pixels (297mm)
            backgroundColor: '#ffffff', 
            padding: '40px', 
            fontFamily: 'Arial, sans-serif', 
            color: '#000000',
            boxSizing: 'border-box'
          }}
        >
          <PDFHeader />
          <ClientInfo />

          {/* Mensalidade */}
          <Paper elevation={0} sx={{ p: 2, mb: 3, border: '1px solid #ddd', backgroundColor: '#fff' }}>
            <Typography variant="h6" sx={{ color: '#061349', fontWeight: 'bold', mb: 2, fontSize: '16px' }}>
              💰 Assinatura Mensal
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#f8f9fa' }}>
                    <TableCell sx={{ fontWeight: 'bold', color: '#000', fontSize: '12px' }}>Módulo / Descrição</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 'bold', color: '#000', fontSize: '12px' }}>Qtd</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold', color: '#000', fontSize: '12px' }}>Valor Unit.</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold', color: '#000', fontSize: '12px' }}>Total</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {createTableRow(
                    pricing.modules.cloud.name,
                    pricing.modules.cloud.description,
                    pricing.modules.cloud.price
                  )}
                  
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
            <Paper elevation={0} sx={{ p: 2, mb: 3, border: '1px solid #ddd', backgroundColor: '#fff' }}>
              <Typography variant="h6" sx={{ color: '#061349', fontWeight: 'bold', mb: 2, fontSize: '16px' }}>
                📦 Módulos Adicionais
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ backgroundColor: '#f8f9fa' }}>
                      <TableCell sx={{ fontWeight: 'bold', color: '#000', fontSize: '12px' }}>Adicional / Descrição</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 'bold', color: '#000', fontSize: '12px' }}>Qtd</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 'bold', color: '#000', fontSize: '12px' }}>Valor Unit.</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 'bold', color: '#000', fontSize: '12px' }}>Total</TableCell>
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
          <Paper elevation={0} sx={{ p: 2, backgroundColor: '#e8f4fd', border: '2px solid #1976d2' }}>
            <Typography variant="h5" sx={{ color: '#1976d2', fontWeight: 'bold', textAlign: 'center', fontSize: '18px' }}>
              💰 TOTAL MENSALIDADE: R$ {formatCurrencyValue(monthlyTotal)}
            </Typography>
          </Paper>
        </Box>

        {/* PÁGINA 2 - EQUIPAMENTOS */}
        {equipmentTotal > 0 && (
          <Box 
            ref={page2Ref}
            sx={{ 
              width: '794px',
              minHeight: '1123px',
              backgroundColor: '#ffffff', 
              padding: '40px', 
              fontFamily: 'Arial, sans-serif', 
              color: '#000000',
              boxSizing: 'border-box'
            }}
          >
            <PDFHeader />
            <ClientInfo />

            <Paper elevation={0} sx={{ p: 2, mb: 3, border: '1px solid #ddd', backgroundColor: '#fff' }}>
              <Typography variant="h6" sx={{ color: '#061349', fontWeight: 'bold', mb: 2, fontSize: '16px' }}>
                🛠️ Equipamentos
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ backgroundColor: '#f8f9fa' }}>
                      <TableCell sx={{ fontWeight: 'bold', color: '#000', fontSize: '12px' }}>Equipamento / Descrição</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 'bold', color: '#000', fontSize: '12px' }}>Qtd</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 'bold', color: '#000', fontSize: '12px' }}>Valor Unit.</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 'bold', color: '#000', fontSize: '12px' }}>Total</TableCell>
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
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2, color: '#000', fontSize: '14px' }}>
                  Equipamentos Selecionados:
                </Typography>
                <Grid container spacing={1}>
                  {Object.entries(formData.equipment).map(([key, quantity]) => {
                    if (quantity > 0) {
                      const equipmentItem = pricing.equipment[key as keyof typeof pricing.equipment];
                      const imageBase64 = imagesBase64[key];
                      
                      if (equipmentItem && imageBase64) {
                        return (
                          <Grid item xs={6} sm={4} md={3} key={key}>
                            <Box sx={{ 
                              textAlign: 'center', 
                              p: 1, 
                              border: '1px solid #e0e0e0', 
                              borderRadius: 1, 
                              backgroundColor: '#fafafa',
                              minHeight: '140px',
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}>
                              <Box sx={{ 
                                width: '80px', 
                                height: '60px', 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center',
                                mb: 1
                              }}>
                                <img 
                                  src={imageBase64} 
                                  alt={equipmentItem.name}
                                  style={{ 
                                    maxWidth: '100%', 
                                    maxHeight: '100%',
                                    objectFit: 'contain',
                                    border: '1px solid #ddd',
                                    borderRadius: '4px',
                                    padding: '2px',
                                    backgroundColor: '#fff'
                                  }} 
                                />
                              </Box>
                              <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#000', mb: 0.5, fontSize: '10px', lineHeight: 1.2 }}>
                                {equipmentItem.name}
                              </Typography>
                              <Typography variant="caption" sx={{ color: '#666', display: 'block', fontSize: '9px' }}>
                                Qtd: {quantity}
                              </Typography>
                              <Typography variant="caption" sx={{ color: '#1976d2', fontWeight: 'bold', fontSize: '9px' }}>
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
            <Paper elevation={0} sx={{ p: 2, backgroundColor: '#fff8e1', border: '2px solid #f57c00' }}>
              <Typography variant="h5" sx={{ color: '#f57c00', fontWeight: 'bold', textAlign: 'center', fontSize: '18px' }}>
                🛠️ TOTAL EQUIPAMENTOS: R$ {formatCurrencyValue(equipmentTotal)}
              </Typography>
            </Paper>
          </Box>
        )}

        {/* PÁGINA 3 - RESUMO FINANCEIRO */}
        <Box 
          ref={page3Ref}
          sx={{ 
            width: '794px',
            minHeight: '1123px',
            backgroundColor: '#ffffff', 
            padding: '40px', 
            fontFamily: 'Arial, sans-serif', 
            color: '#000000',
            boxSizing: 'border-box'
          }}
        >
          <PDFHeader />
          <ClientInfo />

          <Paper elevation={0} sx={{ p: 3, backgroundColor: '#f8f9fa', border: '1px solid #ddd' }}>
            <Typography variant="h5" sx={{ color: '#061349', fontWeight: 'bold', textAlign: 'center', mb: 3, fontSize: '20px' }}>
              💳 Resumo Financeiro
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <Box sx={{ textAlign: 'center', p: 2, backgroundColor: '#e8f4fd', borderRadius: 2, border: '1px solid #ccc' }}>
                  <Typography variant="h6" sx={{ color: '#1976d2', fontWeight: 'bold', fontSize: '16px' }}>
                    Mensalidade
                  </Typography>
                  <Typography variant="h4" sx={{ color: '#1976d2', fontWeight: 'bold', fontSize: '24px' }}>
                    R$ {formatCurrencyValue(monthlyTotal)}
                  </Typography>
                </Box>
              </Grid>
              {equipmentTotal > 0 && (
                <Grid item xs={12} sm={6}>
                  <Box sx={{ textAlign: 'center', p: 2, backgroundColor: '#fff8e1', borderRadius: 2, border: '1px solid #ccc' }}>
                    <Typography variant="h6" sx={{ color: '#f57c00', fontWeight: 'bold', fontSize: '16px' }}>
                      Equipamentos (Único)
                    </Typography>
                    <Typography variant="h4" sx={{ color: '#f57c00', fontWeight: 'bold', fontSize: '24px' }}>
                      R$ {formatCurrencyValue(equipmentTotal)}
                    </Typography>
                  </Box>
                </Grid>
              )}
              <Grid item xs={12}>
                <Divider sx={{ my: 2, borderColor: '#ccc' }} />
                <Box sx={{ textAlign: 'center', p: 3, backgroundColor: '#e8f5e8', borderRadius: 2, border: '2px solid #4caf50' }}>
                  <Typography variant="h5" sx={{ color: '#2e7d32', fontWeight: 'bold', fontSize: '18px' }}>
                    INVESTIMENTO TOTAL
                  </Typography>
                  <Typography variant="h3" sx={{ color: '#2e7d32', fontWeight: 'bold', fontSize: '28px' }}>
                    R$ {formatCurrencyValue(monthlyTotal + equipmentTotal)}
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 1, color: '#555', fontSize: '12px' }}>
                    {equipmentTotal > 0 ? `Mensalidade: R$ ${formatCurrencyValue(monthlyTotal)} + Equipamentos: R$ ${formatCurrencyValue(equipmentTotal)}` : 'Valor mensal'}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Box>

        {/* PÁGINA 4 - RESUMO IMPLANTAÇÃO */}
        <Box 
          ref={page4Ref}
          sx={{ 
            width: '794px',
            minHeight: '1123px',
            backgroundColor: '#ffffff', 
            padding: '40px', 
            fontFamily: 'Arial, sans-serif', 
            color: '#000000',
            boxSizing: 'border-box'
          }}
        >
          <PDFHeader />
          <ClientInfo />

          <Paper elevation={0} sx={{ p: 3, border: '1px solid #ddd', backgroundColor: '#fff' }}>
            <Typography variant="h4" sx={{ color: '#061349', fontWeight: 'bold', textAlign: 'center', mb: 3, fontSize: '20px' }}>
              RESUMO IMPLANTAÇÃO
            </Typography>

            {/* Cardápio */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" sx={{ color: '#061349', fontWeight: 'bold', mb: 1, fontSize: '16px' }}>
                📋 Cardápio
              </Typography>
              <Typography sx={{ color: '#000', mb: 0.5, fontSize: '14px' }}>
                ☐ Importação de cardápio via planilha Excel
              </Typography>
              <Typography sx={{ color: '#000', mb: 1, fontSize: '14px' }}>
                ☐ Cadastro de cardápio – Até 100 itens*
              </Typography>
              <Typography variant="body2" sx={{ color: '#666', fontStyle: 'italic', fontSize: '12px' }}>
                *Em caso de modificadores ou itens extras como: queijo, tomate, leite condensado e outros, cada modificador contará como item no cardápio.
              </Typography>
            </Box>

            {/* Dados Fiscais */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" sx={{ color: '#061349', fontWeight: 'bold', mb: 1, fontSize: '16px' }}>
                🧾 Dados para emissão Fiscal
              </Typography>
              <Typography sx={{ color: '#000', mb: 0.5, fontSize: '14px' }}>
                1. Enviar o comprovante de credenciamento no Estado para emissão de NFC-e;
              </Typography>
              <Typography sx={{ color: '#000', mb: 0.5, fontSize: '14px' }}>
                2. Informar o CRT (Código de Regime Tributário);
              </Typography>
              <Typography sx={{ color: '#000', mb: 0.5, fontSize: '14px' }}>
                3. Enviar o CSC (Código de Segurança do Contribuinte) com o devido ID;
              </Typography>
              <Typography sx={{ color: '#000', mb: 0.5, fontSize: '14px' }}>
                4. Informar alíquotas de tributação que incidirão nos produtos (ICMS/ISS, CFOP, CST, PIS/COFINS);
              </Typography>
              <Typography sx={{ color: '#000', mb: 0.5, fontSize: '14px' }}>
                5. Enviar o Certificado Digital A1 em arquivo PFX e senha;
              </Typography>
              <Typography sx={{ color: '#000', mb: 0.5, fontSize: '14px' }}>
                6. Enviar o Token do IBPT - https://deolhonoimposto.ibpt.org.br/Site/PassoPasso
              </Typography>
              <Typography sx={{ color: '#000', mb: 0.5, fontSize: '14px' }}>
                7. Planilha com descrição, grupo, preço de venda, NCM e CEST dos produtos.
              </Typography>
            </Box>

            {/* Jornada do Cliente */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" sx={{ color: '#061349', fontWeight: 'bold', mb: 1, fontSize: '16px' }}>
                🚀 Jornada do Cliente
              </Typography>
              <Typography sx={{ color: '#000', mb: 1, fontSize: '14px' }}>
                Após o pagamento, faremos o faturamento de sua licença e, em até 1 dia útil um dos nossos Especialistas entrará em contato para conferência de dados e agendamento dos treinamentos.
              </Typography>
              <Typography sx={{ color: '#000', mb: 1, fontSize: '14px' }}>
                Após a implantação, é só desfrutar de toda inovação e tecnologia que o PDV Legal levará para o seu negócio! 🤩
              </Typography>
              <Typography sx={{ color: '#000', fontWeight: 'bold', fontSize: '14px' }}>
                Importante! Lembre-se de contar comigo em qualquer momento de nossa parceria. 😀
              </Typography>
            </Box>

            {/* Treinamento */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" sx={{ color: '#061349', fontWeight: 'bold', mb: 1, fontSize: '16px' }}>
                💻 Treinamento
              </Typography>
              <Typography sx={{ color: '#000', mb: 1, fontSize: '14px' }}>
                Para o treinamento é imprescindível o uso do computador ou notebook, além dos equipamentos sugeridos para infraestrutura em mãos.
              </Typography>
              <Typography sx={{ color: '#000', fontSize: '14px' }}>
                Nossos treinamentos são realizados de forma remota, via Google Meet. Mas não se preocupe, minutos antes de iniciar te enviaremos o link de acesso e qualquer dúvida nossos Especialistas estarão prontos para ajudar.
              </Typography>
            </Box>

            {/* Horário e Atendimento */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" sx={{ color: '#061349', fontWeight: 'bold', mb: 1, fontSize: '16px' }}>
                🕑 Horário e canais de atendimento
              </Typography>
              <Typography sx={{ color: '#000', mb: 0.5, fontSize: '14px' }}>
                <strong>Telefone/WhatsApp:</strong> 11 4210-1779
              </Typography>
              <Typography sx={{ color: '#000', mb: 0.5, fontSize: '14px' }}>
                <strong>E-mail:</strong> suporte@seatec.com.br
              </Typography>
              <Typography sx={{ color: '#000', mb: 0.5, fontSize: '14px' }}>
                <strong>Suporte Emergencial:</strong> Segunda a Segunda: 8h às 23:59h
              </Typography>
              <Typography sx={{ color: '#000', mb: 0.5, fontSize: '14px' }}>
                <strong>Treinamentos e Dúvidas:</strong> Seg a Sexta: 9h às 18h
              </Typography>
            </Box>

            {/* Mensagem Final */}
            <Box sx={{ textAlign: 'center', p: 2, backgroundColor: '#e8f5e8', borderRadius: 2, border: '2px solid #4caf50' }}>
              <Typography variant="h6" sx={{ color: '#2e7d32', fontWeight: 'bold', fontSize: '16px' }}>
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
          disabled={isGeneratingPDF || Object.keys(imagesBase64).length === 0 || !logoBase64}
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
          {isGeneratingPDF ? '⏳ Gerando PDF...' : 
           Object.keys(imagesBase64).length === 0 || !logoBase64 ? '📄 Carregando imagens...' : 
           '📄 Baixar PDF'}
        </Button>
      </Box>
    </>
  );
};

export default Summary;