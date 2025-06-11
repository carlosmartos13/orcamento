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

  // Função para gerar PDF usando jsPDF diretamente
  const handleGeneratePDF = useCallback(async () => {
    setIsGeneratingPDF(true);
    
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = 210;
      const pageHeight = 297;
      const margin = 15;
      const contentWidth = pageWidth - (margin * 2);
      let currentY = margin;

      // Função para adicionar nova página
      const addNewPage = () => {
        pdf.addPage();
        currentY = margin;
        addHeader();
        addClientInfo();
        currentY += 10;
      };

      // Função para adicionar header
      const addHeader = () => {
        // Título
        pdf.setFontSize(20);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(6, 19, 73);
        pdf.text('Orçamento SEATEC | PDVLEGAL', margin, currentY + 10);
        
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(102, 102, 102);
        pdf.text('Sistema de Gestão Empresarial', margin, currentY + 18);

        // Logo (se disponível)
        if (logoBase64) {
          try {
            pdf.addImage(logoBase64, 'PNG', pageWidth - margin - 30, currentY, 25, 20);
          } catch (error) {
            console.log('Erro ao adicionar logo:', error);
          }
        }

        // Linha separadora
        pdf.setDrawColor(6, 19, 73);
        pdf.setLineWidth(1);
        pdf.line(margin, currentY + 25, pageWidth - margin, currentY + 25);
        
        currentY += 35;
      };

      // Função para adicionar informações do cliente
      const addClientInfo = () => {
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(6, 19, 73);
        pdf.text('📋 Informações do Cliente', margin, currentY);
        currentY += 8;

        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(0, 0, 0);
        
        const clientData = [
          `Nome: ${formData.clientInfo.name}`,
          `Empresa: ${formData.clientInfo.companyName}`,
          `CNPJ: ${formData.clientInfo.cnpj}`,
          `Telefone: ${formData.clientInfo.phone}`,
          `Email: ${formData.clientInfo.email}`
        ];

        clientData.forEach((line, index) => {
          if (index < 3) {
            pdf.text(line, margin, currentY + (index * 5));
          } else {
            pdf.text(line, margin + 90, currentY + ((index - 3) * 5));
          }
        });

        currentY += 20;
      };

      // Função para adicionar tabela
      const addTable = (title: string, headers: string[], rows: string[][], color: string) => {
        // Verificar se há espaço suficiente
        const tableHeight = 10 + (rows.length * 8) + 15;
        if (currentY + tableHeight > pageHeight - margin) {
          addNewPage();
        }

        // Título da seção
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(6, 19, 73);
        pdf.text(title, margin, currentY);
        currentY += 10;

        // Cabeçalho da tabela
        pdf.setFillColor(248, 249, 250);
        pdf.rect(margin, currentY, contentWidth, 8, 'F');
        
        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(0, 0, 0);
        
        const colWidths = [contentWidth * 0.5, contentWidth * 0.15, contentWidth * 0.175, contentWidth * 0.175];
        let xPos = margin;
        
        headers.forEach((header, index) => {
          pdf.text(header, xPos + 2, currentY + 5);
          xPos += colWidths[index];
        });
        
        currentY += 8;

        // Linhas da tabela
        pdf.setFont('helvetica', 'normal');
        rows.forEach((row) => {
          xPos = margin;
          row.forEach((cell, index) => {
            if (index === 0) {
              // Primeira coluna com quebra de linha se necessário
              const lines = pdf.splitTextToSize(cell, colWidths[index] - 4);
              lines.forEach((line: string, lineIndex: number) => {
                pdf.text(line, xPos + 2, currentY + 5 + (lineIndex * 4));
              });
            } else {
              pdf.text(cell, xPos + 2, currentY + 5);
            }
            xPos += colWidths[index];
          });
          currentY += 8;
        });

        currentY += 5;
      };

      // PÁGINA 1 - MENSALIDADE
      addHeader();
      addClientInfo();

      // Tabela de mensalidade
      const monthlyHeaders = ['Módulo / Descrição', 'Qtd', 'Valor Unit.', 'Total'];
      const monthlyRows: string[][] = [];

      // Cloud obrigatório
      monthlyRows.push([
        `${pricing.modules.cloud.name}\n${pricing.modules.cloud.description}`,
        '1x',
        `R$ ${formatCurrencyValue(pricing.modules.cloud.price)}`,
        `R$ ${formatCurrencyValue(pricing.modules.cloud.price)}`
      ]);

      // Módulos opcionais
      if (formData.subscription.fiscal) {
        monthlyRows.push([
          `${pricing.modules.fiscal.name}\n${pricing.modules.fiscal.description}`,
          '1x',
          `R$ ${formatCurrencyValue(pricing.modules.fiscal.price)}`,
          `R$ ${formatCurrencyValue(pricing.modules.fiscal.price)}`
        ]);
      }

      if (formData.subscription.inventory) {
        monthlyRows.push([
          `${pricing.modules.inventory.name}\n${pricing.modules.inventory.description}`,
          '1x',
          `R$ ${formatCurrencyValue(pricing.modules.inventory.price)}`,
          `R$ ${formatCurrencyValue(pricing.modules.inventory.price)}`
        ]);
      }

      if (formData.subscription.financial) {
        monthlyRows.push([
          `${pricing.modules.financial.name}\n${pricing.modules.financial.description}`,
          '1x',
          `R$ ${formatCurrencyValue(pricing.modules.financial.price)}`,
          `R$ ${formatCurrencyValue(pricing.modules.financial.price)}`
        ]);
      }

      if (formData.subscription.pdvCount > 1) {
        monthlyRows.push([
          `${pricing.modules.pdv.name} Adicional\n${pricing.modules.pdv.description}`,
          `${formData.subscription.pdvCount - 1}x`,
          `R$ ${formatCurrencyValue(pricing.modules.pdv.price)}`,
          `R$ ${formatCurrencyValue((formData.subscription.pdvCount - 1) * pricing.modules.pdv.price)}`
        ]);
      }

      addTable('💰 Assinatura Mensal', monthlyHeaders, monthlyRows, '#1976d2');

      // Adicionais (se houver)
      if (formData.additionals.legalLoyalty || 
          formData.additionals.delivery !== 'none' || 
          formData.additionals.selfServiceTerminals > 0) {
        
        const additionalsRows: string[][] = [];

        if (formData.additionals.legalLoyalty) {
          additionalsRows.push([
            `${pricing.additionals.legalLoyalty.name}\n${pricing.additionals.legalLoyalty.description}`,
            '1x',
            `R$ ${formatCurrencyValue(pricing.additionals.legalLoyalty.price)}`,
            `R$ ${formatCurrencyValue(pricing.additionals.legalLoyalty.price)}`
          ]);
        }

        if (formData.additionals.delivery === 'basic') {
          additionalsRows.push([
            `${pricing.additionals.deliveryBasic.name}\n${pricing.additionals.deliveryBasic.description}`,
            '1x',
            `R$ ${formatCurrencyValue(pricing.additionals.deliveryBasic.price)}`,
            `R$ ${formatCurrencyValue(pricing.additionals.deliveryBasic.price)}`
          ]);
        }

        if (formData.additionals.delivery === 'plus') {
          additionalsRows.push([
            `${pricing.additionals.deliveryPlus.name}\n${pricing.additionals.deliveryPlus.description}`,
            '1x',
            `R$ ${formatCurrencyValue(pricing.additionals.deliveryPlus.price)}`,
            `R$ ${formatCurrencyValue(pricing.additionals.deliveryPlus.price)}`
          ]);
        }

        if (formData.additionals.selfServiceTerminals > 0) {
          additionalsRows.push([
            `${pricing.additionals.selfServiceTerminal.name}\n${pricing.additionals.selfServiceTerminal.description}`,
            `${formData.additionals.selfServiceTerminals}x`,
            `R$ ${formatCurrencyValue(pricing.additionals.selfServiceTerminal.price)}`,
            `R$ ${formatCurrencyValue(formData.additionals.selfServiceTerminals * pricing.additionals.selfServiceTerminal.price)}`
          ]);
        }

        addTable('📦 Módulos Adicionais', monthlyHeaders, additionalsRows, '#f57c00');
      }

      // Total mensalidade
      pdf.setFillColor(232, 244, 253);
      pdf.rect(margin, currentY, contentWidth, 15, 'F');
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(25, 118, 210);
      pdf.text(`💰 TOTAL MENSALIDADE: R$ ${formatCurrencyValue(monthlyTotal)}`, margin + 10, currentY + 10);
      currentY += 20;

      // PÁGINA 2 - EQUIPAMENTOS (se houver)
      if (equipmentTotal > 0) {
        addNewPage();

        const equipmentRows: string[][] = [];
        Object.entries(formData.equipment).forEach(([key, quantity]) => {
          if (quantity > 0) {
            const equipmentItem = pricing.equipment[key as keyof typeof pricing.equipment];
            if (equipmentItem) {
              equipmentRows.push([
                `${equipmentItem.name}\n${equipmentItem.description}`,
                `${quantity}x`,
                `R$ ${formatCurrencyValue(equipmentItem.price)}`,
                `R$ ${formatCurrencyValue(quantity * equipmentItem.price)}`
              ]);
            }
          }
        });

        addTable('🛠️ Equipamentos', monthlyHeaders, equipmentRows, '#f57c00');

        // Total equipamentos
        pdf.setFillColor(255, 248, 225);
        pdf.rect(margin, currentY, contentWidth, 15, 'F');
        pdf.setFontSize(16);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(245, 124, 0);
        pdf.text(`🛠️ TOTAL EQUIPAMENTOS: R$ ${formatCurrencyValue(equipmentTotal)}`, margin + 10, currentY + 10);
        currentY += 20;
      }

      // PÁGINA 3 - RESUMO FINANCEIRO
      addNewPage();

      // Resumo financeiro
      pdf.setFontSize(18);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(6, 19, 73);
      pdf.text('💳 Resumo Financeiro', margin + (contentWidth / 2) - 40, currentY);
      currentY += 20;

      // Caixas de valores
      const boxWidth = contentWidth / 2 - 5;
      
      // Mensalidade
      pdf.setFillColor(232, 244, 253);
      pdf.rect(margin, currentY, boxWidth, 25, 'F');
      pdf.setFontSize(14);
      pdf.setTextColor(25, 118, 210);
      pdf.text('Mensalidade', margin + 10, currentY + 8);
      pdf.setFontSize(18);
      pdf.text(`R$ ${formatCurrencyValue(monthlyTotal)}`, margin + 10, currentY + 18);

      // Equipamentos (se houver)
      if (equipmentTotal > 0) {
        pdf.setFillColor(255, 248, 225);
        pdf.rect(margin + boxWidth + 10, currentY, boxWidth, 25, 'F');
        pdf.setFontSize(14);
        pdf.setTextColor(245, 124, 0);
        pdf.text('Equipamentos (Único)', margin + boxWidth + 20, currentY + 8);
        pdf.setFontSize(18);
        pdf.text(`R$ ${formatCurrencyValue(equipmentTotal)}`, margin + boxWidth + 20, currentY + 18);
      }

      currentY += 35;

      // Total geral
      pdf.setFillColor(232, 245, 232);
      pdf.rect(margin, currentY, contentWidth, 30, 'F');
      pdf.setFontSize(16);
      pdf.setTextColor(46, 125, 50);
      pdf.text('INVESTIMENTO TOTAL', margin + (contentWidth / 2) - 35, currentY + 10);
      pdf.setFontSize(24);
      pdf.text(`R$ ${formatCurrencyValue(monthlyTotal + equipmentTotal)}`, margin + (contentWidth / 2) - 40, currentY + 22);

      // PÁGINA 4 - RESUMO IMPLANTAÇÃO
      addNewPage();

      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(6, 19, 73);
      pdf.text('RESUMO IMPLANTAÇÃO', margin + (contentWidth / 2) - 40, currentY);
      currentY += 15;

      // Seções de implantação
      const sections = [
        {
          title: '📋 Cardápio',
          items: [
            '☐ Importação de cardápio via planilha Excel',
            '☐ Cadastro de cardápio – Até 100 itens*',
            '*Em caso de modificadores ou itens extras como: queijo, tomate, leite condensado e outros, cada modificador contará como item no cardápio.'
          ]
        },
        {
          title: '🧾 Dados para emissão Fiscal',
          items: [
            '1. Enviar o comprovante de credenciamento no Estado para emissão de NFC-e;',
            '2. Informar o CRT (Código de Regime Tributário);',
            '3. Enviar o CSC (Código de Segurança do Contribuinte) com o devido ID;',
            '4. Informar alíquotas de tributação que incidirão nos produtos (ICMS/ISS, CFOP, CST, PIS/COFINS);',
            '5. Enviar o Certificado Digital A1 em arquivo PFX e senha;',
            '6. Enviar o Token do IBPT - https://deolhonoimposto.ibpt.org.br/Site/PassoPasso',
            '7. Planilha com descrição, grupo, preço de venda, NCM e CEST dos produtos.'
          ]
        },
        {
          title: '🚀 Jornada do Cliente',
          items: [
            'Após o pagamento, faremos o faturamento de sua licença e, em até 1 dia útil um dos nossos Especialistas entrará em contato para conferência de dados e agendamento dos treinamentos.',
            'Após a implantação, é só desfrutar de toda inovação e tecnologia que o PDV Legal levará para o seu negócio! 🤩',
            'Importante! Lembre-se de contar comigo em qualquer momento de nossa parceria. 😀'
          ]
        },
        {
          title: '💻 Treinamento',
          items: [
            'Para o treinamento é imprescindível o uso do computador ou notebook, além dos equipamentos sugeridos para infraestrutura em mãos.',
            'Nossos treinamentos são realizados de forma remota, via Google Meet. Mas não se preocupe, minutos antes de iniciar te enviaremos o link de acesso e qualquer dúvida nossos Especialistas estarão prontos para ajudar.'
          ]
        },
        {
          title: '🕑 Horário e canais de atendimento',
          items: [
            'Telefone/WhatsApp: 11 4210-1779',
            'E-mail: suporte@seatec.com.br',
            'Suporte Emergencial: Segunda a Segunda: 8h às 23:59h',
            'Treinamentos e Dúvidas: Seg a Sexta: 9h às 18h'
          ]
        }
      ];

      sections.forEach((section) => {
        // Verificar se há espaço suficiente
        const sectionHeight = 8 + (section.items.length * 5) + 5;
        if (currentY + sectionHeight > pageHeight - margin - 20) {
          addNewPage();
        }

        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(6, 19, 73);
        pdf.text(section.title, margin, currentY);
        currentY += 8;

        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(0, 0, 0);

        section.items.forEach((item) => {
          const lines = pdf.splitTextToSize(item, contentWidth - 10);
          lines.forEach((line: string) => {
            pdf.text(line, margin + 5, currentY);
            currentY += 4;
          });
          currentY += 1;
        });

        currentY += 5;
      });

      // Mensagem final
      if (currentY > pageHeight - margin - 30) {
        addNewPage();
      }

      pdf.setFillColor(232, 245, 232);
      pdf.rect(margin, currentY, contentWidth, 20, 'F');
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(46, 125, 50);
      const finalMessage = 'Agradecemos a confiança e desejamos que este seja o início de uma parceria de sucesso! 💙';
      const finalLines = pdf.splitTextToSize(finalMessage, contentWidth - 20);
      finalLines.forEach((line: string, index: number) => {
        pdf.text(line, margin + 10, currentY + 8 + (index * 5));
      });

      // Salvar o PDF
      pdf.save('orcamento-seatec.pdf');
      
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
    } finally {
      setIsGeneratingPDF(false);
    }
  }, [formData, pricing, monthlyTotal, equipmentTotal, logoBase64]);

  return (
    <>
      {/* VISUALIZAÇÃO NA TELA */}
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

        {/* Detalhes do orçamento */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                📋 Informações do Cliente
              </Typography>
              <Typography><strong>Nome:</strong> {formData.clientInfo.name}</Typography>
              <Typography><strong>Empresa:</strong> {formData.clientInfo.companyName}</Typography>
              <Typography><strong>CNPJ:</strong> {formData.clientInfo.cnpj}</Typography>
              <Typography><strong>Telefone:</strong> {formData.clientInfo.phone}</Typography>
              <Typography><strong>Email:</strong> {formData.clientInfo.email}</Typography>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                💰 Módulos Selecionados
              </Typography>
              <Typography>✅ {pricing.modules.cloud.name}: R$ {formatCurrencyValue(pricing.modules.cloud.price)}</Typography>
              {formData.subscription.fiscal && (
                <Typography>✅ {pricing.modules.fiscal.name}: R$ {formatCurrencyValue(pricing.modules.fiscal.price)}</Typography>
              )}
              {formData.subscription.inventory && (
                <Typography>✅ {pricing.modules.inventory.name}: R$ {formatCurrencyValue(pricing.modules.inventory.price)}</Typography>
              )}
              {formData.subscription.financial && (
                <Typography>✅ {pricing.modules.financial.name}: R$ {formatCurrencyValue(pricing.modules.financial.price)}</Typography>
              )}
              {formData.subscription.pdvCount > 1 && (
                <Typography>✅ PDVs Adicionais: {formData.subscription.pdvCount - 1} x R$ {formatCurrencyValue(pricing.modules.pdv.price)}</Typography>
              )}
            </Paper>
          </Grid>

          {equipmentTotal > 0 && (
            <Grid item xs={12}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  🛠️ Equipamentos Selecionados
                </Typography>
                <Grid container spacing={2}>
                  {Object.entries(formData.equipment).map(([key, quantity]) => {
                    if (quantity > 0) {
                      const equipmentItem = pricing.equipment[key as keyof typeof pricing.equipment];
                      const imageUrl = equipmentImages[key as keyof typeof equipmentImages];
                      
                      if (equipmentItem) {
                        return (
                          <Grid item xs={12} sm={6} md={4} key={key}>
                            <Box sx={{ 
                              textAlign: 'center', 
                              p: 2, 
                              border: '1px solid #e0e0e0', 
                              borderRadius: 2,
                              height: '200px',
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}>
                              {imageUrl && (
                                <img 
                                  src={imageUrl} 
                                  alt={equipmentItem.name}
                                  style={{ 
                                    width: '100%', 
                                    maxWidth: '120px', 
                                    height: 'auto',
                                    maxHeight: '100px',
                                    objectFit: 'contain',
                                    marginBottom: '12px'
                                  }} 
                                />
                              )}
                              <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
                                {equipmentItem.name}
                              </Typography>
                              <Typography variant="caption" sx={{ display: 'block' }}>
                                Quantidade: {quantity}
                              </Typography>
                              <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 'bold' }}>
                                R$ {formatCurrencyValue(equipmentItem.price)} cada
                              </Typography>
                            </Box>
                          </Grid>
                        );
                      }
                    }
                    return null;
                  })}
                </Grid>
              </Paper>
            </Grid>
          )}
        </Grid>
      </Box>

      {/* BOTÕES */}
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