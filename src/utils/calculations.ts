import { FormData } from '../types';
import { PricingData } from '../hooks/usePricing';
import { formatWhatsAppCurrency } from './formatCurrency';
 let totalPDV = 0;

export const calculateMonthlyTotal = (formData: FormData, pricing: PricingData): number => {
  let total = 0;
 
  

  // Módulos obrigatórios
  total += pricing.modules.cloud.price;

  // Módulos opcionais
  if (formData.subscription.fiscal) {
    total += pricing.modules.fiscal.price;
  }
  if (formData.subscription.fiscal2) {
    total += pricing.modules.fiscal2.price;
  }
  if (formData.subscription.inventory) {
    total += pricing.modules.inventory.price;
  }
  if (formData.subscription.financial) {
    total += pricing.modules.financial.price;
  }

/* PDVs 
    if (formData.subscription.pdvCount > 1 && formData.subscription.pdvCount <= 2) {
      totalPDV = pricing.modules.pdv1.price;
      total += totalPDV
    } 
    if(formData.subscription.pdvCount > 3 && formData.subscription.pdvCount <= 5) {
      totalPDV = pricing.modules.pdv2.price;
      total += totalPDV
    }
    if(formData.subscription.pdvCount > 5 && formData.subscription.pdvCount <= 10) {
      totalPDV = pricing.modules.pdv3.price;
      total += totalPDV

  }
*/

   if(formData.subscription.pdvCount > 1) {
    total += (formData.subscription.pdvCount) * pricing.modules.pdv.price;
   
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
  equipmentTotal: number,
 

 
  
): string => {
  
  const totalGeral = monthlyTotal + equipmentTotal + pricing.modules.implantacao.price;
  const desconto = totalGeral*0.05;

  const messageLines = [
    "🏠 *Orçamento SEATEC | PDVLEGAL*",
    "",
    `Nome: ${formData.clientInfo.name}`,
    `Empresa: ${formData.clientInfo.companyName}`,
    `CNPJ: ${formData.clientInfo.cnpj}`,
    `Telefone: ${formData.clientInfo.phone}`,
    `Email: ${formData.clientInfo.email}`,
    "",
    `💰 *Mensalidade: R$ ${formatWhatsAppCurrency(monthlyTotal)}*`,
    `✅ ${pricing.modules.cloud.name}: R$ ${formatWhatsAppCurrency(pricing.modules.cloud.price)}`,
   // formData.subscription.fiscal2 ? `✅ ${pricing.modules.fiscal2.name}: R$ ${formatWhatsAppCurrency(pricing.modules.fiscal2.price)}` : `❌ ${pricing.modules.fiscal2.name}`,
    formData.subscription.fiscal ? `✅ ${pricing.modules.fiscal.name}: R$ ${formatWhatsAppCurrency(pricing.modules.fiscal.price)}` : `❌ ${pricing.modules.fiscal.name}`,
    formData.subscription.inventory ? `✅ ${pricing.modules.inventory.name}: R$ ${formatWhatsAppCurrency(pricing.modules.inventory.price)}` : `❌ ${pricing.modules.inventory.name}`,
    formData.subscription.financial ? `✅ ${pricing.modules.financial.name}: R$ ${formatWhatsAppCurrency(pricing.modules.financial.price)}` : `❌ ${pricing.modules.financial.name}`,
    formData.subscription.pdvCount > 1 ? `✅ PDVs Adicionais: ${formData.subscription.pdvCount } x R$ ${formatWhatsAppCurrency(pricing.modules.pdv.price)} = R$ ${formatWhatsAppCurrency((formData.subscription.pdvCount ) * pricing.modules.pdv.price)}` : `✅ PDV: 1`,

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
    `🎧*Implantação Online: R$ ${formatWhatsAppCurrency(pricing.modules.implantacao.price)}*`,
    `${(pricing.modules.implantacao.description)}`,
    "",
    `🛠 *Equipamentos: R$ ${formatWhatsAppCurrency(equipmentTotal)}*`,
       
  ];

  // Adicionar equipamentos selecionados
  Object.entries(formData.equipment).forEach(([key, quantity]) => {
    if (quantity > 0) {
      const equipmentItem = pricing.equipment[key as keyof typeof pricing.equipment];
      if (equipmentItem) {
        messageLines.push(`✅ ${quantity} ${equipmentItem.name}: R$ ${formatWhatsAppCurrency(equipmentItem.price)}`);
      }
    }
  });
  messageLines.push("", `🤑 *5% de deconto no pagamento a vista: R$ ${formatWhatsAppCurrency(totalGeral-desconto)}* \n OU`);

  messageLines.push(`💳  3 x sem juros no cartão no valor de ${formatWhatsAppCurrency(totalGeral/3)} \n      *Total do investimento: R$ ${formatWhatsAppCurrency(totalGeral)}*`);

  
  return messageLines.join('\n');
};