import { FormData } from '../types';
import { PricingData } from '../hooks/usePricing';
import { formatWhatsAppCurrency } from './formatCurrency';

export const calculateMonthlyTotal = (formData: FormData, pricing: PricingData): number => {
  let total = 0;

  // Módulos obrigatórios
  total += pricing.modules.cloud.price;

  // Módulos opcionais
  if (formData.subscription.fiscal) {
    total += pricing.modules.fiscal.price;
  }
  if (formData.subscription.inventory) {
    total += pricing.modules.inventory.price;
  }
  if (formData.subscription.financial) {
    total += pricing.modules.financial.price;
  }

  // PDVs adicionais (apenas os adicionais, não todos)
  if (formData.subscription.pdvCount > 1) {
    total += (formData.subscription.pdvCount - 1) * pricing.modules.pdv.price;
  }

  // Adicionais
  if (formData.additionals.legalLoyalty) {
    total += pricing.additionals.legalLoyalty.price;
  }
  if (formData.additionals.delivery === 'basic') {
    total += pricing.additionals.deliveryBasic.price;
  }
  if (formData.additionals.delivery === 'plus') {
    total += pricing.additionals.deliveryPlus.price;
  }
  total += formData.additionals.selfServiceTerminals * pricing.additionals.selfServiceTerminal.price;

  return total;
};

export const calculateEquipmentTotal = (formData: FormData, pricing: PricingData): number => {
  let total = 0;
  
  // Soma todos os equipamentos selecionados
  Object.entries(formData.equipment).forEach(([key, quantity]) => {
    if (quantity > 0) {
      const equipmentItem = pricing.equipment[key as keyof typeof pricing.equipment];
      if (equipmentItem) {
        total += quantity * equipmentItem.price;
      }
    }
  });

  return total;
};

export const generateWhatsAppMessage = (
  formData: FormData, 
  pricing: PricingData,
  monthlyTotal: number,
  equipmentTotal: number
): string => {
  const totalGeral = monthlyTotal + equipmentTotal;

  const messageLines = [
    "🏠 *Orçamento SEATEC | PDVLEGAL*",
    "",
    "👤 *Cliente:*",
    `Nome: ${formData.clientInfo.name}`,
    `Empresa: ${formData.clientInfo.companyName}`,
    `CNPJ: ${formData.clientInfo.cnpj}`,
    `Telefone: ${formData.clientInfo.phone}`,
    `Email: ${formData.clientInfo.email}`,
    "",
    `💰 *Mensalidade: R$ ${formatWhatsAppCurrency(monthlyTotal)}*`,
    `✅ ${pricing.modules.cloud.name}: R$ ${formatWhatsAppCurrency(pricing.modules.cloud.price)}`,
    formData.subscription.fiscal ? `✅ ${pricing.modules.fiscal.name}: R$ ${formatWhatsAppCurrency(pricing.modules.fiscal.price)}` : `❌ ${pricing.modules.fiscal.name}`,
    formData.subscription.inventory ? `✅ ${pricing.modules.inventory.name}: R$ ${formatWhatsAppCurrency(pricing.modules.inventory.price)}` : `❌ ${pricing.modules.inventory.name}`,
    formData.subscription.financial ? `✅ ${pricing.modules.financial.name}: R$ ${formatWhatsAppCurrency(pricing.modules.financial.price)}` : `❌ ${pricing.modules.financial.name}`,
    formData.subscription.pdvCount > 1 ? `✅ PDVs Adicionais: ${formData.subscription.pdvCount - 1} x R$ ${formatWhatsAppCurrency(pricing.modules.pdv.price)} = R$ ${formatWhatsAppCurrency((formData.subscription.pdvCount - 1) * pricing.modules.pdv.price)}` : `✅ PDV: 1 (incluído no Cloud)`,
    "",
    "📦 *Adicionais:*",
    formData.additionals.legalLoyalty ? `✅ ${pricing.additionals.legalLoyalty.name}: R$ ${formatWhatsAppCurrency(pricing.additionals.legalLoyalty.price)}` : `❌ ${pricing.additionals.legalLoyalty.name}`,
    formData.additionals.delivery === "none"
      ? "❌ Delivery Legal"
      : formData.additionals.delivery === "basic"
        ? `✅ ${pricing.additionals.deliveryBasic.name}: R$ ${formatWhatsAppCurrency(pricing.additionals.deliveryBasic.price)}`
        : `✅ ${pricing.additionals.deliveryPlus.name}: R$ ${formatWhatsAppCurrency(pricing.additionals.deliveryPlus.price)}`,
    formData.additionals.selfServiceTerminals > 0
      ? `✅ ${pricing.additionals.selfServiceTerminal.name}: ${formData.additionals.selfServiceTerminals} x R$ ${formatWhatsAppCurrency(pricing.additionals.selfServiceTerminal.price)} = R$ ${formatWhatsAppCurrency(formData.additionals.selfServiceTerminals * pricing.additionals.selfServiceTerminal.price)}`
      : `❌ ${pricing.additionals.selfServiceTerminal.name}`,
    "",
    `🛠 *Equipamentos: R$ ${formatWhatsAppCurrency(equipmentTotal)}*`,
  ];

  // Adicionar equipamentos selecionados
  Object.entries(formData.equipment).forEach(([key, quantity]) => {
    if (quantity > 0) {
      const equipmentItem = pricing.equipment[key as keyof typeof pricing.equipment];
      if (equipmentItem) {
        messageLines.push(`✅ ${quantity} ${equipmentItem.name}: R$ ${formatWhatsAppCurrency(equipmentItem.price)} cada`);
      }
    }
  });

  messageLines.push("", `💳 *Total Geral: R$ ${formatWhatsAppCurrency(totalGeral)}*`);

  // Adicionar informações de implantação
  messageLines.push(
    "",
    "📋 *RESUMO IMPLANTAÇÃO*",
    "",
    "📋 *Cardápio*",
    "☐ Importação de cardápio via planilha Excel",
    "☐ Cadastro de cardápio – Até 100 itens*",
    "*Em caso de modificadores ou itens extras como: queijo, tomate, leite condensado e outros, cada modificador contará como item no cardápio.",
    "",
    "🧾 *Dados para emissão Fiscal*",
    "1. Enviar o comprovante de credenciamento no Estado para emissão de NFC-e;",
    "2. Informar o CRT (Código de Regime Tributário);",
    "3. Enviar o CSC (Código de Segurança do Contribuinte) com o devido ID;",
    "4. Informar alíquotas de tributação que incidirão nos produtos (ICMS/ISS, CFOP, CST, PIS/COFINS);",
    "5. Enviar o Certificado Digital A1 em arquivo PFX e senha;",
    "6. Enviar o Token do IBPT - https://deolhonoimposto.ibpt.org.br/Site/PassoPasso",
    "7. Planilha com descrição, grupo, preço de venda, NCM e CEST dos produtos.",
    "",
    "🚀 *Jornada do Cliente*",
    "Após o pagamento, faremos o faturamento de sua licença e, em até 1 dia útil um dos nossos Especialistas entrará em contato para conferência de dados e agendamento dos treinamentos.",
    "Após a implantação, é só desfrutar de toda inovação e tecnologia que o PDV Legal levará para o seu negócio! 🤩",
    "Importante! Lembre-se de contar comigo em qualquer momento de nossa parceria. 😀",
    "",
    "💻 *Treinamento*",
    "Para o treinamento é imprescindível o uso do computador ou notebook, além dos equipamentos sugeridos para infraestrutura em mãos.",
    "Nossos treinamentos são realizados de forma remota, via Google Meet. Mas não se preocupe, minutos antes de iniciar te enviaremos o link de acesso e qualquer dúvida nossos Especialistas estarão prontos para ajudar.",
    "",
    "🕑 *Horário e canais de atendimento*",
    "Telefone/WhatsApp: 11 4210-1779",
    "E-mail: suporte@seatec.com.br",
    "",
    "Suporte Emergencial: Segunda a Segunda: 8h às 23:59h",
    "Treinamentos e Duvidas Seg a Sexta: 9h ás 18h",
    "",
    "Agradecemos a confiança e desejamos que este seja o início de uma parceria de sucesso! 💙"
  );

  return messageLines.join('\n');
};