export interface ClientInfo {
  name: string;
  companyName: string;
  cnpj: string;
  phone: string;
  email: string;
}

export interface MonthlySubscription {
  cloud: boolean;
  fiscal: boolean;
  fiscal2: boolean;
  inventory: boolean;
  financial: boolean;
  pdvCount: number;
}

export interface Additionals {
  legalLoyalty: boolean;
  delivery: 'none' | 'basic' | 'plus';
  selfServiceTerminals: number;
}

export interface Equipment {
  androidPdvGertec: number;
  androidPdvSunmi: number;
  selfServiceTotemGertec: number;
  networkKit: number;
  raspberryServer: number;
  elginM10Pro: number;
  tancaTp650: number;
  impressoraFiscal: number;
  leitorCodigoBarras: number;
  gaveta: number;
  elgini9: number;
  
}

export interface FormData {
  clientInfo: ClientInfo;
  subscription: MonthlySubscription;
  additionals: Additionals;
  equipment: Equipment;
}