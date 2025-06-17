import { pdf } from '@react-pdf/renderer';
import { FormData } from '../types';
import { PricingData } from '../hooks/usePricing';
import PDFDocument from '../components/PDFDocument';

export const generatePDF = async (formData: FormData, pricing: PricingData) => {
  try {
    // Criar o documento PDF usando react-pdf
    const blob = await pdf(<PDFDocument formData={formData} pricing={pricing} />).toBlob();
    
    // Criar URL para download
    const url = URL.createObjectURL(blob);
    
    // Criar link temporário para download
    const link = document.createElement('a');
    link.href = url;
    link.download = 'orcamento-seatec.pdf';
    document.body.appendChild(link);
    link.click();
    
    // Limpar
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
  } catch (error) {
    console.error('Erro ao gerar PDF:', error);
    throw error;
  }
};