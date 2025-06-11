import { useState, useEffect } from 'react';
import pricingData from '../data/pricing.json';

export interface PricingItem {
  name: string;
  price: number;
  image?: string;
  description: string;
  required?: boolean;
}

export interface PricingData {
  modules: Record<string, PricingItem>;
  additionals: Record<string, PricingItem>;
  equipment: Record<string, PricingItem>;
}

export const usePricing = () => {
  const [pricing, setPricing] = useState<PricingData>(pricingData);

  // Função para atualizar preços dinamicamente se necessário
  const updatePrice = (category: keyof PricingData, itemKey: string, newPrice: number) => {
    setPricing(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [itemKey]: {
          ...prev[category][itemKey],
          price: newPrice
        }
      }
    }));
  };

  // Função para adicionar novo item
  const addItem = (category: keyof PricingData, itemKey: string, item: PricingItem) => {
    setPricing(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [itemKey]: item
      }
    }));
  };

  // Função para remover item
  const removeItem = (category: keyof PricingData, itemKey: string) => {
    setPricing(prev => {
      const newCategory = { ...prev[category] };
      delete newCategory[itemKey];
      return {
        ...prev,
        [category]: newCategory
      };
    });
  };

  return {
    pricing,
    updatePrice,
    addItem,
    removeItem
  };
};