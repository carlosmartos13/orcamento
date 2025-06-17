// Utilitário para formatação de moeda brasileira
export const formatCurrency = (value: number): string => {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};

// Função para formatar apenas o valor numérico (sem R$)
export const formatCurrencyValue = (value: number): string => {
  return value.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};

// Função para formatar valores no WhatsApp (sem símbolo R$)
export const formatWhatsAppCurrency = (value: number): string => {
  return value.toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};