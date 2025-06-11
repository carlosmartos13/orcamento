import { FormData } from '../types';
import { PricingData } from '../hooks/usePricing';

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

  // PDVs adicionais
  total += formData.subscription.pdvCount * pricing.modules.pdv.price;

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
  return (
    formData.equipment.androidPdvGertec * pricing.equipment.androidPdvGertec.price +
    formData.equipment.androidPdvSunmi * pricing.equipment.androidPdvSunmi.price +
    formData.equipment.selfServiceTotemGertec * pricing.equipment.selfServiceTotemGertec.price +
    formData.equipment.networkKit * pricing.equipment.networkKit.price +
    formData.equipment.raspberryServer * pricing.equipment.raspberryServer.price
  );
};

export const generateWhatsAppMessage = (
  formData: FormData, 
  pricing: PricingData,
  monthlyTotal: number,
  equipmentTotal: number
): string => {
  const totalGeral = monthlyTotal + equipmentTotal;

  const messageLines = [
    "🏠 *Orçamento SEATEC*",
    "",
    "👤 *Cliente:*",
    `Nome: ${formData.clientInfo.name}`,
    `Empresa: ${formData.clientInfo.companyName}`,
    `CNPJ: ${formData.clientInfo.cnpj}`,
    `Telefone: ${formData.clientInfo.phone}`,
    `Email: ${formData.clientInfo.email}`,
    "",
    `💰 *Mensalidade: R$ ${monthlyTotal.toFixed(2)}*`,
    `✅ ${pricing.modules.cloud.name}: R$ ${pricing.modules.cloud.price.toFixed(2)}`,
    formData.subscription.fiscal ? `✅ ${pricing.modules.fiscal.name}: R$ ${pricing.modules.fiscal.price.toFixed(2)}` : `❌ ${pricing.modules.fiscal.name}`,
    formData.subscription.inventory ? `✅ ${pricing.modules.inventory.name}: R$ ${pricing.modules.inventory.price.toFixed(2)}` : `❌ ${pricing.modules.inventory.name}`,
    formData.subscription.financial ? `✅ ${pricing.modules.financial.name}: R$ ${pricing.modules.financial.price.toFixed(2)}` : `❌ ${pricing.modules.financial.name}`,
    `✅ PDVs: ${formData.subscription.pdvCount} x R$ ${pricing.modules.pdv.price.toFixed(2)} = R$ ${(formData.subscription.pdvCount * pricing.modules.pdv.price).toFixed(2)}`,
    "",
    "📦 *Adicionais:*",
    formData.additionals.legalLoyalty ? `✅ ${pricing.additionals.legalLoyalty.name}: R$ ${pricing.additionals.legalLoyalty.price.toFixed(2)}` : `❌ ${pricing.additionals.legalLoyalty.name}`,
    formData.additionals.delivery === "none"
      ? "❌ Delivery Legal"
      : formData.additionals.delivery === "basic"
        ? `✅ ${pricing.additionals.deliveryBasic.name}: R$ ${pricing.additionals.deliveryBasic.price.toFixed(2)}`
        : `✅ ${pricing.additionals.deliveryPlus.name}: R$ ${pricing.additionals.deliveryPlus.price.toFixed(2)}`,
    formData.additionals.selfServiceTerminals > 0
      ? `✅ ${pricing.additionals.selfServiceTerminal.name}: ${formData.additionals.selfServiceTerminals} x R$ ${pricing.additionals.selfServiceTerminal.price.toFixed(2)} = R$ ${(formData.additionals.selfServiceTerminals * pricing.additionals.selfServiceTerminal.price).toFixed(2)}`
      : `❌ ${pricing.additionals.selfServiceTerminal.name}`,
    "",
    `🛠 *Equipamentos: R$ ${equipmentTotal.toFixed(2)}*`,
  ];

  // Adicionar equipamentos selecionados
  Object.entries(formData.equipment).forEach(([key, quantity]) => {
    if (quantity > 0) {
      const equipmentItem = pricing.equipment[key as keyof typeof pricing.equipment];
      if (equipmentItem) {
        messageLines.push(`• ${equipmentItem.name}: ${quantity} x R$ ${equipmentItem.price.toFixed(2)} = R$ ${(quantity * equipmentItem.price).toFixed(2)}`);
      }
    }
  });

  messageLines.push("", `💳 *Total Geral: R$ ${totalGeral.toFixed(2)}*`);

  return messageLines.join('\n');
};