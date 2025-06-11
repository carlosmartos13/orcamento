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
          scale: 2,
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff',
          width: elementRef.current.scrollWidth,
          height: elementRef.current.scrollHeight,
          logging: false,
        });
        
        const imgData = canvas.toDataURL('image/png');
        const imgWidth = pageWidth;
        const imgHeight = (canvas.height * pageWidth) / canvas.width;
        
        if (!isFirstPage) {
          pdf.addPage();
        }
        
        pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, Math.min(imgHeight, pageHeight));
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
        {logoBase64 && (
          <img 
            src={logoBase64} 
            alt="Logo SEATEC" 
            style={{ 
              height: '80px', 
              width: 'auto',
              objectFit: 'contain'
            }} 
          />
        )}
      </Box>
      
      {/* Título centralizado */}
      <Box sx={{ pr: 10 }}>
        <Typography variant="h4" sx={{ color: '#061349', fontWeight: 'bold' }}>
          Orçamento SEATEC | PDVLEGAL
        </Typography>
        <Typography variant="subtitle1" sx={{ color: '#666', mt: 1 }}>
          Sistema de Gestão Empresarial
        </Typography>
      </Box>
    </Box>
  );

  // Componente das informações do cliente reutilizável
  const ClientInfo = () => (
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
            width: '210mm',
            minHeight: '297mm',
            backgroundColor: '#ffffff', 
            padding: '20mm', 
            fontFamily: 'Arial, sans-serif', 
            color: '#000000',
            boxSizing: 'border-box'
          }}
        >
          <PDFHeader />
          <ClientInfo />

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
          <Paper elevation={0} sx={{ p: 3, backgroundColor: '#e8f4fd', border: '2px solid #1976d2' }}>
            <Typography variant="h5" sx={{ color: '#1976d2', fontWeight: 'bold', textAlign: 'center' }}>
              💰 TOTAL MENSALIDADE: R$ {formatCurrencyValue(monthlyTotal)}
            </Typography>
          </Paper>
        </Box>

        {/* PÁGINA 2 - EQUIPAMENTOS */}
        {equipmentTotal > 0 && (
          <Box 
            ref={page2Ref}
            sx={{ 
              width: '210mm',
              minHeight: '297mm',
              backgroundColor: '#ffffff', 
              padding: '20mm', 
              fontFamily: 'Arial, sans-serif', 
              color: '#000000',
              boxSizing: 'border-box'
            }}
          >
            <PDFHeader />
            <ClientInfo />

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
                      const imageBase64 = imagesBase64[key];
                      
                      if (equipmentItem && imageBase64) {
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
                                src={imageBase64} 
                                alt={equipmentItem.name}
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
            <Paper elevation={0} sx={{ p: 3, backgroundColor: '#fff8e1', border: '2px solid #f57c00' }}>
              <Typography variant="h5" sx={{ color: '#f57c00', fontWeight: 'bold', textAlign: 'center' }}>
                🛠️ TOTAL EQUIPAMENTOS: R$ {formatCurrencyValue(equipmentTotal)}
              </Typography>
            </Paper>
          </Box>
        )}

        {/* PÁGINA 3 - RESUMO FINANCEIRO */}
        <Box 
          ref={page3Ref}
          sx={{ 
            width: '210mm',
            minHeight: '297mm',
            backgroundColor: '#ffffff', 
            padding: '20mm', 
            fontFamily: 'Arial, sans-serif', 
            color: '#000000',
            boxSizing: 'border-box'
          }}
        >
          <PDFHeader />
          <ClientInfo />

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

        {/* PÁGINA 4 - RESUMO IMPLANTAÇÃO */}
        <Box 
          ref={page4Ref}
          sx={{ 
            width: '210mm',
            minHeight: '297mm',
            backgroundColor: '#ffffff', 
            padding: '20mm', 
            fontFamily: 'Arial, sans-serif', 
            color: '#000000',
            boxSizing: 'border-box'
          }}
        >
          <PDFHeader />
          <ClientInfo />

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